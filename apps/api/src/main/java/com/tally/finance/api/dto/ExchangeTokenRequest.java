package com.tally.finance.api.dto;

public record ExchangeTokenRequest(
        String publicToken,
        String institutionId,
        String institutionName
) {}
