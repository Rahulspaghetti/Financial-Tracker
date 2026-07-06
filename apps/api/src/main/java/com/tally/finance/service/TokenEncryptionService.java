package com.tally.finance.service;

import com.macasaet.fernet.Key;
import com.macasaet.fernet.StringValidator;
import com.macasaet.fernet.Token;
import com.tally.finance.config.TallyProperties;
import java.time.Duration;
import java.time.temporal.TemporalAmount;
import org.springframework.stereotype.Service;

@Service
public class TokenEncryptionService {

    private final TallyProperties properties;
    private Key key;

    public TokenEncryptionService(TallyProperties properties) {
        this.properties = properties;
    }

    public String encrypt(String plaintext) {
        return Token.generate(requireKey(), plaintext).serialise();
    }

    public String decrypt(String ciphertext) {
        try {
            return Token.fromString(ciphertext).validateAndDecrypt(requireKey(), NO_TTL);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Failed to decrypt token", ex);
        }
    }

    private Key requireKey() {
        if (key == null) {
            String encryptionKey = properties.plaid().tokenEncryptionKey();
            if (encryptionKey == null || encryptionKey.isBlank()) {
                throw new IllegalStateException("PLAID_TOKEN_ENCRYPTION_KEY is not configured");
            }
            key = new Key(encryptionKey);
        }
        return key;
    }

    private static final StringValidator NO_TTL = new StringValidator() {
        @Override
        public TemporalAmount getTimeToLive() {
            return Duration.ZERO;
        }
    };
}
