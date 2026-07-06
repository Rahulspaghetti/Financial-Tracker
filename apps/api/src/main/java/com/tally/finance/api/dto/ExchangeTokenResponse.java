package com.tally.finance.api.dto;

import java.util.List;

public record ExchangeTokenResponse(List<String> accountIds, String message) {
    public ExchangeTokenResponse(List<String> accountIds) {
        this(accountIds, "Accounts connected successfully");
    }
}
