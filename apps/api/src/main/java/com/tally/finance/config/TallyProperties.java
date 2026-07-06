package com.tally.finance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "tally")
public record TallyProperties(
        JwtProperties jwt,
        GoogleProperties google,
        PlaidProperties plaid,
        CorsProperties cors
) {
    public record JwtProperties(
            String secret,
            String algorithm,
            int accessTokenExpireMinutes,
            int refreshTokenExpireDays
    ) {}

    public record GoogleProperties(String clientId) {}

    public record PlaidProperties(
            String env,
            String clientId,
            String secret,
            String tokenEncryptionKey
    ) {}

    public record CorsProperties(String allowedOrigins) {}
}
