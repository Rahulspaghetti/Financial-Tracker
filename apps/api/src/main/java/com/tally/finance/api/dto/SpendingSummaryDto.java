package com.tally.finance.api.dto;

import java.util.List;

public record SpendingSummaryDto(
        String period,
        double totalSpend,
        double totalIncome,
        double netCashFlow,
        double spendDelta,
        double incomeDelta,
        List<CategorySpendDto> byCategory,
        List<DailyTotalDto> dailyTotals
) {}
