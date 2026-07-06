package com.tally.finance.security;

import com.tally.finance.config.TallyProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final TallyProperties.JwtProperties jwtProperties;
    private final SecretKey key;

    public JwtService(TallyProperties properties) {
        this.jwtProperties = properties.jwt();
        this.key = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(String userId) {
        return createToken(userId, "access", jwtProperties.accessTokenExpireMinutes(), ChronoUnit.MINUTES);
    }

    public String createRefreshToken(String userId) {
        return createToken(userId, "refresh", jwtProperties.refreshTokenExpireDays(), ChronoUnit.DAYS);
    }

    public int accessTokenExpiresInSeconds() {
        return jwtProperties.accessTokenExpireMinutes() * 60;
    }

    public String verifyAccessToken(String token) {
        Claims claims = parseClaims(token);
        if (!"access".equals(claims.get("type", String.class))) {
            throw new JwtException("Not an access token");
        }
        return requireSubject(claims);
    }

    public String verifyRefreshToken(String token) {
        Claims claims = parseClaims(token);
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new JwtException("Not a refresh token");
        }
        return requireSubject(claims);
    }

    private String createToken(String userId, String type, int amount, ChronoUnit unit) {
        Instant now = Instant.now();
        Instant expiry = now.plus(amount, unit);
        return Jwts.builder()
                .subject(userId)
                .claim("type", type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String requireSubject(Claims claims) {
        String sub = claims.getSubject();
        if (sub == null || sub.isBlank()) {
            throw new JwtException("Missing subject claim");
        }
        return sub;
    }
}
