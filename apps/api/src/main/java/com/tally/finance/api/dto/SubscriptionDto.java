package com.tally.finance.api.dto;

public record SubscriptionDto(
        String merchantName,
        double amount,
        String frequency,
        String lastChargeDate,
        String nextEstimatedDate,
        String category,
        String logoUrl,
        boolean isActive
) {}
