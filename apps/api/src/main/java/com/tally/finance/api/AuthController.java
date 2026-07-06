package com.tally.finance.api;

import com.tally.finance.api.dto.GoogleAuthRequest;
import com.tally.finance.api.dto.LoginRequest;
import com.tally.finance.api.dto.RefreshRequest;
import com.tally.finance.api.dto.RegisterRequest;
import com.tally.finance.api.dto.TokenResponse;
import com.tally.finance.domain.User;
import com.tally.finance.repository.UserRepository;
import com.tally.finance.security.JwtService;
import com.tally.finance.service.AuthService;
import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, JwtService jwtService, UserRepository userRepository) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public TokenResponse register(@Valid @RequestBody RegisterRequest body) {
        try {
            User user = authService.register(
                    body.email(),
                    body.firstName(),
                    body.lastName(),
                    body.password()
            );
            return issueTokens(user);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(409, ex.getMessage());
        }
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest body) {
        try {
            User user = authService.authenticateWithPassword(body.email(), body.password());
            return issueTokens(user);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(401, ex.getMessage());
        }
    }

    @PostMapping("/google")
    public TokenResponse googleAuth(@Valid @RequestBody GoogleAuthRequest body) {
        try {
            User user = authService.authenticateGoogle(body.idToken());
            return issueTokens(user);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(401, "Invalid Google token: " + ex.getMessage());
        }
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest body) {
        try {
            String userId = jwtService.verifyRefreshToken(body.refreshToken());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ApiException(401, "User not found"));
            return issueTokens(user);
        } catch (JwtException ex) {
            throw new ApiException(401, "Invalid or expired refresh token");
        }
    }

    private TokenResponse issueTokens(User user) {
        return new TokenResponse(
                jwtService.createAccessToken(user.getId()),
                jwtService.createRefreshToken(user.getId()),
                jwtService.accessTokenExpiresInSeconds()
        );
    }
}
