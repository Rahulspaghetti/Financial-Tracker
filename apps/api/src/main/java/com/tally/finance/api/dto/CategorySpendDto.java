package com.tally.finance.api.dto;

public record CategorySpendDto(
        String category,
        double amount,
        double percentage,
        int transactionCount
) {}
