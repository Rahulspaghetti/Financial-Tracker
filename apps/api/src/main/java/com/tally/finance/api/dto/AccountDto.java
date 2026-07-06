package com.tally.finance.api.dto;

import java.time.Instant;

public record AccountDto(
        String id,
        String plaidAccountId,
        String name,
        String officialName,
        String type,
        String subtype,
        double balanceCurrent,
        Double balanceAvailable,
        String currencyCode,
        String institutionName,
        String institutionLogo,
        String plaidItemId,
        Instant lastSyncedAt
) {}
