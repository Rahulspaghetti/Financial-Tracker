package com.tally.finance.api;

import com.tally.finance.api.dto.AccountDto;
import com.tally.finance.api.dto.TransactionDto;
import com.tally.finance.api.dto.UserDto;
import com.tally.finance.domain.Account;
import com.tally.finance.domain.Transaction;
import com.tally.finance.domain.User;

public final class DtoMapper {

    private DtoMapper() {}

    public static UserDto toUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getAvatarUrl(),
                user.getCreatedAt()
        );
    }

    public static AccountDto toAccountDto(Account account) {
        return new AccountDto(
                account.getId(),
                account.getPlaidAccountId(),
                account.getName(),
                account.getOfficialName(),
                account.getType(),
                account.getSubtype(),
                account.getBalanceCurrent().doubleValue(),
                account.getBalanceAvailable() != null ? account.getBalanceAvailable().doubleValue() : null,
                account.getCurrencyCode(),
                account.getInstitutionName(),
                account.getInstitutionLogo(),
                account.getPlaidItem().getId(),
                account.getLastSyncedAt()
        );
    }

    public static TransactionDto toTransactionDto(Transaction transaction) {
        return new TransactionDto(
                transaction.getId(),
                transaction.getPlaidTransactionId(),
                transaction.getAccount().getId(),
                transaction.getAmount().doubleValue(),
                transaction.getType(),
                transaction.getName(),
                transaction.getMerchantName(),
                transaction.getCategory(),
                transaction.getCategoryId(),
                transaction.getDate(),
                transaction.isPending(),
                transaction.getNotes(),
                transaction.getLogoUrl(),
                transaction.getCreatedAt()
        );
    }
}
