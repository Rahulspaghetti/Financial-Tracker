package com.tally.finance.api.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        int expiresIn
) {
    public TokenResponse(String accessToken, String refreshToken, int expiresIn) {
        this(accessToken, refreshToken, "bearer", expiresIn);
    }
}
