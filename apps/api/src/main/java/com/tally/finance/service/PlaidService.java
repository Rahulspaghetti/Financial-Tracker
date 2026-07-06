package com.tally.finance.service;

import com.plaid.client.ApiClient;
import com.plaid.client.model.*;
import com.plaid.client.request.PlaidApi;
import com.tally.finance.config.TallyProperties;
import com.tally.finance.domain.Account;
import com.tally.finance.domain.PlaidItem;
import com.tally.finance.domain.Transaction;
import com.tally.finance.domain.User;
import com.tally.finance.repository.AccountRepository;
import com.tally.finance.repository.PlaidItemRepository;
import com.tally.finance.repository.TransactionRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlaidService {

    private final TallyProperties properties;
    private final TokenEncryptionService encryptionService;
    private final PlaidItemRepository plaidItemRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public PlaidService(
            TallyProperties properties,
            TokenEncryptionService encryptionService,
            PlaidItemRepository plaidItemRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        this.properties = properties;
        this.encryptionService = encryptionService;
        this.plaidItemRepository = plaidItemRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    public LinkTokenResult createLinkToken(String userId) throws IOException {
        PlaidApi client = plaidClient();
        LinkTokenCreateRequest request = new LinkTokenCreateRequest()
                .user(new LinkTokenCreateRequestUser().clientUserId(userId))
                .clientName("Tally")
                .products(List.of(Products.TRANSACTIONS))
                .countryCodes(List.of(CountryCode.US))
                .language("en");

        LinkTokenCreateResponse response = client.linkTokenCreate(request).execute().body();
        if (response == null) {
            throw new IOException("Empty Plaid link token response");
        }
        return new LinkTokenResult(response.getLinkToken(), response.getExpiration().toString());
    }

    @Transactional
    public PlaidItem exchangePublicToken(
            User user,
            String publicToken,
            String institutionId,
            String institutionName
    ) throws IOException {
        PlaidApi client = plaidClient();
        ItemPublicTokenExchangeRequest exchangeRequest =
                new ItemPublicTokenExchangeRequest().publicToken(publicToken);
        ItemPublicTokenExchangeResponse exchangeResponse =
                client.itemPublicTokenExchange(exchangeRequest).execute().body();
        if (exchangeResponse == null) {
            throw new IOException("Empty Plaid exchange response");
        }

        String accessToken = exchangeResponse.getAccessToken();
        String plaidItemId = exchangeResponse.getItemId();

        PlaidItem item = new PlaidItem();
        item.setUser(user);
        item.setPlaidItemId(plaidItemId);
        item.setAccessTokenEncrypted(encryptionService.encrypt(accessToken));
        item.setInstitutionId(institutionId);
        item.setInstitutionName(institutionName);
        item = plaidItemRepository.save(item);

        upsertAccounts(client, item, accessToken, institutionName);
        syncTransactionsForItem(item);
        return item;
    }

    @Transactional
    public int syncAllUserItems(String userId) throws IOException {
        List<PlaidItem> items = plaidItemRepository.findByUser_Id(userId);
        int total = 0;
        for (PlaidItem item : items) {
            // Incremental sync only — uses stored cursor; does not re-pull full history.
            total += syncTransactionsForItem(item);
        }
        return total;
    }

    @Transactional
    public void removePlaidItem(String userId, String itemId) throws IOException {
        PlaidItem item = plaidItemRepository.findByIdAndUser_Id(itemId, userId).orElse(null);
        if (item == null) {
            return;
        }

        try {
            String accessToken = encryptionService.decrypt(item.getAccessTokenEncrypted());
            plaidClient().itemRemove(new ItemRemoveRequest().accessToken(accessToken)).execute();
        } catch (Exception ignored) {
            // Item may already be removed on Plaid side
        }

        plaidItemRepository.delete(item);
    }

    @Transactional
    public int syncTransactionsForItem(PlaidItem item) throws IOException {
        PlaidApi client = plaidClient();
        String accessToken = encryptionService.decrypt(item.getAccessTokenEncrypted());
        String cursor = item.getCursor();
        int addedCount = 0;
        boolean hasMore = true;

        Map<String, Account> accountMap = new HashMap<>();
        for (Account account : accountRepository.findByPlaidItemId(item.getId())) {
            accountMap.put(account.getPlaidAccountId(), account);
        }

        while (hasMore) {
            TransactionsSyncRequest request = new TransactionsSyncRequest()
                    .accessToken(accessToken)
                    .cursor(cursor);
            TransactionsSyncResponse syncData = client.transactionsSync(request).execute().body();
            if (syncData == null) {
                break;
            }

            for (com.plaid.client.model.Transaction plaidTx : syncData.getAdded()) {
                Account account = accountMap.get(plaidTx.getAccountId());
                if (account != null) {
                    upsertTransaction(account, plaidTx);
                    addedCount++;
                }
            }

            for (com.plaid.client.model.Transaction plaidTx : syncData.getModified()) {
                Account account = accountMap.get(plaidTx.getAccountId());
                if (account != null) {
                    upsertTransaction(account, plaidTx);
                }
            }

            for (RemovedTransaction removed : syncData.getRemoved()) {
                if (removed.getTransactionId() != null) {
                    transactionRepository.findByPlaidTransactionId(removed.getTransactionId())
                            .ifPresent(transactionRepository::delete);
                }
            }

            cursor = syncData.getNextCursor();
            hasMore = Boolean.TRUE.equals(syncData.getHasMore());
        }

        item.setCursor(cursor);
        item.setLastSyncedAt(Instant.now());
        plaidItemRepository.save(item);
        return addedCount;
    }

    private void upsertAccounts(
            PlaidApi client,
            PlaidItem item,
            String accessToken,
            String institutionName
    ) throws IOException {
        AccountsGetResponse response =
                client.accountsGet(new AccountsGetRequest().accessToken(accessToken)).execute().body();
        if (response == null) {
            return;
        }

        Instant now = Instant.now();
        for (AccountBase acct : response.getAccounts()) {
            var existing = accountRepository.findByPlaidAccountId(acct.getAccountId());
            Account account = existing.orElseGet(Account::new);

            AccountBalance balances = acct.getBalances();
            BigDecimal current = balances.getCurrent() != null
                    ? BigDecimal.valueOf(balances.getCurrent())
                    : BigDecimal.ZERO;
            BigDecimal available = balances.getAvailable() != null
                    ? BigDecimal.valueOf(balances.getAvailable())
                    : null;

            if (existing.isEmpty()) {
                account.setPlaidAccountId(acct.getAccountId());
                account.setUser(item.getUser());
                account.setPlaidItem(item);
                account.setName(Objects.toString(acct.getName(), "Account"));
            } else {
                account.setName(Objects.toString(acct.getName(), account.getName()));
            }

            account.setOfficialName(acct.getOfficialName());
            account.setType(acct.getType() != null ? acct.getType().getValue() : "other");
            account.setSubtype(acct.getSubtype() != null ? String.valueOf(acct.getSubtype()) : null);
            account.setBalanceCurrent(current);
            account.setBalanceAvailable(available);
            account.setInstitutionName(institutionName);
            account.setLastSyncedAt(now);
            accountRepository.save(account);
        }
    }

    private void upsertTransaction(Account account, com.plaid.client.model.Transaction plaidTx) {
        String plaidTransactionId = plaidTx.getTransactionId();
        var existing = transactionRepository.findByPlaidTransactionId(plaidTransactionId);
        Transaction tx = existing.orElseGet(Transaction::new);

        double amountValue = plaidTx.getAmount() != null ? plaidTx.getAmount() : 0.0;
        String txType = amountValue > 0 ? "debit" : "credit";

        String category = null;
        if (plaidTx.getPersonalFinanceCategory() != null
                && plaidTx.getPersonalFinanceCategory().getPrimary() != null) {
            category = plaidTx.getPersonalFinanceCategory().getPrimary();
        } else if (plaidTx.getCategory() != null && !plaidTx.getCategory().isEmpty()) {
            category = plaidTx.getCategory().get(0);
        }

        LocalDate txDate = plaidTx.getDate();
        if (txDate == null && plaidTx.getAuthorizedDate() != null) {
            txDate = plaidTx.getAuthorizedDate();
        }

        if (existing.isEmpty()) {
            tx.setPlaidTransactionId(plaidTransactionId);
        }
        tx.setAccount(account);
        tx.setAmount(BigDecimal.valueOf(amountValue));
        tx.setType(txType);
        tx.setName(Objects.toString(plaidTx.getName(), "Transaction"));
        tx.setMerchantName(plaidTx.getMerchantName() != null ? plaidTx.getMerchantName() : tx.getName());
        tx.setCategory(category);
        tx.setDate(txDate);
        tx.setPending(Boolean.TRUE.equals(plaidTx.getPending()));
        tx.setLogoUrl(plaidTx.getLogoUrl());
        transactionRepository.save(tx);
    }

    private PlaidApi plaidClient() {
        Map<String, String> apiKeys = new HashMap<>();
        apiKeys.put("clientId", properties.plaid().clientId());
        apiKeys.put("secret", properties.plaid().secret());

        ApiClient apiClient = new ApiClient(apiKeys);
        apiClient.setPlaidAdapter(switch (properties.plaid().env()) {
            case "production" -> ApiClient.Production;
            default -> ApiClient.Sandbox;
        });
        return apiClient.createService(PlaidApi.class);
    }

    public boolean isConfigured() {
        return properties.plaid().clientId() != null && !properties.plaid().clientId().isBlank()
                && properties.plaid().secret() != null && !properties.plaid().secret().isBlank();
    }

    public record LinkTokenResult(String linkToken, String expiration) {}
}
