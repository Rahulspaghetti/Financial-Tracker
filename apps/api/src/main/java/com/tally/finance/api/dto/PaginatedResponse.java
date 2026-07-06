package com.tally.finance.api.dto;

import java.util.List;

public record PaginatedResponse<T>(
        List<T> data,
        int total,
        int page,
        int pageSize,
        boolean hasNextPage
) {}
