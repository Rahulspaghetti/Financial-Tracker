package com.tally.finance.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.tally.finance.config.TallyProperties;
import com.tally.finance.domain.User;
import com.tally.finance.repository.UserRepository;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final TallyProperties properties;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            TallyProperties properties,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(String email, String firstName, String lastName, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setName(user.getFirstName() + " " + user.getLastName());
        user.setPasswordHash(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User authenticateWithPassword(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return user;
    }

    @Transactional
    public User authenticateGoogle(String idTokenString) {
        GoogleIdToken idToken = verifyGoogleToken(idTokenString);
        GoogleIdToken.Payload payload = idToken.getPayload();

        String googleId = payload.getSubject();
        String email = payload.getEmail() != null ? payload.getEmail().trim().toLowerCase() : null;
        String name = payload.get("name") != null
                ? (String) payload.get("name")
                : email.split("@")[0];
        String avatarUrl = payload.get("picture") != null ? (String) payload.get("picture") : null;

        User user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmail(email))
                .orElseGet(() -> {
                    User created = new User();
                    created.setEmail(email);
                    created.setGoogleId(googleId);
                    created.setName(name);
                    created.setAvatarUrl(avatarUrl);
                    return created;
                });

        user.setGoogleId(googleId);
        user.setName(name);
        user.setAvatarUrl(avatarUrl);
        if (user.getEmail() == null) {
            user.setEmail(email);
        }

        return userRepository.save(user);
    }

    private GoogleIdToken verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(properties.google().clientId()))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }
            return idToken;
        } catch (GeneralSecurityException | IOException ex) {
            throw new IllegalArgumentException("Invalid Google token: " + ex.getMessage(), ex);
        }
    }
}
