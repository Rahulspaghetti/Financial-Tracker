package com.tally.finance.api;

import com.tally.finance.api.dto.ExchangeTokenRequest;
import com.tally.finance.api.dto.ExchangeTokenResponse;
import com.tally.finance.api.dto.LinkTokenResponse;
import com.tally.finance.api.dto.SyncResponse;
import com.tally.finance.domain.PlaidItem;
import com.tally.finance.domain.User;
import com.tally.finance.repository.AccountRepository;
import com.tally.finance.security.UserPrincipal;
import com.tally.finance.service.PlaidService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/plaid")
public class PlaidController {

    private final PlaidService plaidService;
    private final AccountRepository accountRepository;
    private final CurrentUserResolver currentUserResolver;

    public PlaidController(
            PlaidService plaidService,
            AccountRepository accountRepository,
            CurrentUserResolver currentUserResolver
    ) {
        this.plaidService = plaidService;
        this.accountRepository = accountRepository;
        this.currentUserResolver = currentUserResolver;
    }

    @PostMapping("/link-token")
    @ResponseStatus(HttpStatus.CREATED)
    public LinkTokenResponse createLinkToken(@AuthenticationPrincipal UserPrincipal principal) {
        if (!plaidService.isConfigured()) {
            throw new ApiException(503, "Plaid is not configured");
        }
        User user = currentUserResolver.requireUser(principal);
        try {
            PlaidService.LinkTokenResult result = plaidService.createLinkToken(user.getId());
            return new LinkTokenResponse(result.linkToken(), result.expiration());
        } catch (IOException ex) {
            throw new ApiException(502, "Failed to create Plaid link token: " + ex.getMessage());
        }
    }

    @PostMapping("/exchange")
    @ResponseStatus(HttpStatus.CREATED)
    public ExchangeTokenResponse exchange(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ExchangeTokenRequest body
    ) {
        User user = currentUserResolver.requireUser(principal);
        try {
            PlaidItem item = plaidService.exchangePublicToken(
                    user,
                    body.publicToken(),
                    body.institutionId(),
                    body.institutionName()
            );
            List<String> accountIds = accountRepository.findByPlaidItemId(item.getId()).stream()
                    .map(account -> account.getId())
                    .toList();
            return new ExchangeTokenResponse(accountIds);
        } catch (IOException ex) {
            throw new ApiException(502, "Failed to exchange Plaid token: " + ex.getMessage());
        }
    }

    @PostMapping("/sync")
    public SyncResponse sync(@AuthenticationPrincipal UserPrincipal principal) {
        User user = currentUserResolver.requireUser(principal);
        try {
            int count = plaidService.syncAllUserItems(user.getId());
            return new SyncResponse(count);
        } catch (IOException ex) {
            throw new ApiException(502, "Failed to sync transactions: " + ex.getMessage());
        }
    }

    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disconnect(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String itemId
    ) {
        User user = currentUserResolver.requireUser(principal);
        try {
            plaidService.removePlaidItem(user.getId(), itemId);
        } catch (IOException ex) {
            throw new ApiException(502, "Failed to disconnect item: " + ex.getMessage());
        }
    }
}
