package com.tally.finance.api.dto;

import java.time.Instant;
import java.time.LocalDate;

public record TransactionDto(
        String id,
        String plaidTransactionId,
        String accountId,
        double amount,
        String type,
        String name,
        String merchantName,
        String category,
        String categoryId,
        LocalDate date,
        boolean pending,
        String notes,
        String logoUrl,
        Instant createdAt
) {}
