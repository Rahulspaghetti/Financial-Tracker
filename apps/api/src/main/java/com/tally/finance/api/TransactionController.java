package com.tally.finance.api;

import com.tally.finance.api.dto.PaginatedResponse;
import com.tally.finance.api.dto.SpendingSummaryDto;
import com.tally.finance.api.dto.TransactionDto;
import com.tally.finance.security.UserPrincipal;
import com.tally.finance.service.TransactionAnalyticsService;
import com.tally.finance.service.TransactionQueryService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionQueryService transactionQueryService;
    private final TransactionAnalyticsService transactionAnalyticsService;
    private final CurrentUserResolver currentUserResolver;

    public TransactionController(
            TransactionQueryService transactionQueryService,
            TransactionAnalyticsService transactionAnalyticsService,
            CurrentUserResolver currentUserResolver
    ) {
        this.transactionQueryService = transactionQueryService;
        this.transactionAnalyticsService = transactionAnalyticsService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    public PaginatedResponse<TransactionDto> listTransactions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "25") int pageSize
    ) {
        String userId = currentUserResolver.requireUser(principal).getId();
        int safePage = Math.max(page, 1);
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);
        return transactionQueryService.listTransactions(
                userId, accountId, categoryId, startDate, endDate, search, safePage, safePageSize
        );
    }

    @GetMapping("/summary")
    public SpendingSummaryDto getSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "month") String period
    ) {
        if (!period.matches("week|month|quarter|year")) {
            throw new ApiException(400, "Invalid period");
        }
        String userId = currentUserResolver.requireUser(principal).getId();
        return transactionAnalyticsService.getSpendingSummary(userId, period);
    }
}
