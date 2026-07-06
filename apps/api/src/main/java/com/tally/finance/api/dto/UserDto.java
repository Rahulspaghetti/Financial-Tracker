package com.tally.finance.api.dto;

import java.time.Instant;

public record UserDto(
        String id,
        String email,
        String name,
        String avatarUrl,
        Instant createdAt
) {}
