package com.tally.finance.service;

import com.tally.finance.api.dto.CategorySpendDto;
import com.tally.finance.api.dto.DailyTotalDto;
import com.tally.finance.api.dto.SpendingSummaryDto;
import com.tally.finance.domain.Account;
import com.tally.finance.domain.Transaction;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TransactionAnalyticsService {

    private final EntityManager entityManager;

    public TransactionAnalyticsService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public SpendingSummaryDto getSpendingSummary(String userId, String period) {
        PeriodBounds bounds = periodBounds(period, LocalDate.now());

        double totalSpend = sumInRange(userId, bounds.start(), bounds.end(), true, false);
        double totalIncome = sumInRange(userId, bounds.start(), bounds.end(), false, true);
        double priorSpend = sumInRange(userId, bounds.priorStart(), bounds.priorEnd(), true, false);
        double priorIncome = sumInRange(userId, bounds.priorStart(), bounds.priorEnd(), false, true);

        List<CategorySpendDto> byCategory = buildCategoryBreakdown(userId, bounds.start(), bounds.end(), totalSpend);
        List<DailyTotalDto> dailyTotals = buildDailyTotals(userId, bounds.start(), bounds.end());

        return new SpendingSummaryDto(
                period,
                totalSpend,
                totalIncome,
                totalIncome - totalSpend,
                delta(totalSpend, priorSpend),
                delta(totalIncome, priorIncome),
                byCategory,
                dailyTotals
        );
    }

    private List<CategorySpendDto> buildCategoryBreakdown(
            String userId,
            LocalDate start,
            LocalDate end,
            double totalSpend
    ) {
        var query = entityManager.createQuery("""
                SELECT COALESCE(t.category, 'OTHER'), SUM(t.amount), COUNT(t.id)
                FROM Transaction t
                JOIN t.account a
                WHERE a.user.id = :userId
                  AND t.date >= :start
                  AND t.date <= :end
                  AND t.amount > 0
                  AND t.pending = false
                GROUP BY COALESCE(t.category, 'OTHER')
                ORDER BY SUM(t.amount) DESC
                """, Object[].class);
        query.setParameter("userId", userId);
        query.setParameter("start", start);
        query.setParameter("end", end);

        List<CategorySpendDto> byCategory = new ArrayList<>();
        double otherAmount = 0;
        int otherCount = 0;
        int topN = 8;
        int index = 0;

        for (Object[] row : query.getResultList()) {
            double amount = ((BigDecimal) row[1]).doubleValue();
            int count = ((Long) row[2]).intValue();
            String category = (String) row[0];

            if (index < topN) {
                byCategory.add(new CategorySpendDto(
                        category,
                        amount,
                        totalSpend > 0 ? amount / totalSpend : 0,
                        count
                ));
            } else {
                otherAmount += amount;
                otherCount += count;
            }
            index++;
        }

        if (otherAmount > 0) {
            byCategory.add(new CategorySpendDto(
                    "OTHER",
                    otherAmount,
                    totalSpend > 0 ? otherAmount / totalSpend : 0,
                    otherCount
            ));
        }

        return byCategory;
    }

    private List<DailyTotalDto> buildDailyTotals(String userId, LocalDate start, LocalDate end) {
        var query = entityManager.createQuery("""
                SELECT t.date,
                       COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0),
                       COALESCE(SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END), 0)
                FROM Transaction t
                JOIN t.account a
                WHERE a.user.id = :userId
                  AND t.date >= :start
                  AND t.date <= :end
                  AND t.pending = false
                GROUP BY t.date
                ORDER BY t.date
                """, Object[].class);
        query.setParameter("userId", userId);
        query.setParameter("start", start);
        query.setParameter("end", end);

        List<DailyTotalDto> dailyTotals = new ArrayList<>();
        for (Object[] row : query.getResultList()) {
            dailyTotals.add(new DailyTotalDto(
                    ((LocalDate) row[0]).toString(),
                    ((BigDecimal) row[1]).doubleValue(),
                    ((BigDecimal) row[2]).doubleValue()
            ));
        }
        return dailyTotals;
    }

    private double sumInRange(
            String userId,
            LocalDate start,
            LocalDate end,
            boolean expenseOnly,
            boolean incomeOnly
    ) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<BigDecimal> cq = cb.createQuery(BigDecimal.class);
        Root<Transaction> tx = cq.from(Transaction.class);
        Join<Transaction, Account> account = tx.join("account");

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(account.get("user").get("id"), userId));
        predicates.add(cb.greaterThanOrEqualTo(tx.get("date"), start));
        predicates.add(cb.lessThanOrEqualTo(tx.get("date"), end));
        predicates.add(cb.isFalse(tx.get("pending")));

        if (expenseOnly) {
            predicates.add(cb.greaterThan(tx.get("amount"), BigDecimal.ZERO));
        }
        if (incomeOnly) {
            predicates.add(cb.lessThan(tx.get("amount"), BigDecimal.ZERO));
        }

        cq.select(cb.coalesce(cb.sum(cb.abs(tx.get("amount"))), BigDecimal.ZERO));
        cq.where(predicates.toArray(Predicate[]::new));

        BigDecimal result = entityManager.createQuery(cq).getSingleResult();
        return result.doubleValue();
    }

    private static double delta(double current, double previous) {
        if (previous == 0) {
            return current == 0 ? 0.0 : 1.0;
        }
        return (current - previous) / previous;
    }

    private static PeriodBounds periodBounds(String period, LocalDate today) {
        LocalDate start;
        LocalDate end = today;
        LocalDate priorStart;
        LocalDate priorEnd;

        switch (period) {
            case "week" -> {
                start = today.minusDays(today.getDayOfWeek().getValue() - 1L);
                priorEnd = start.minusDays(1);
                priorStart = priorEnd.minusDays(6);
            }
            case "quarter" -> {
                int quarterMonth = ((today.getMonthValue() - 1) / 3) * 3 + 1;
                start = LocalDate.of(today.getYear(), quarterMonth, 1);
                priorStart = quarterMonth > 1
                        ? LocalDate.of(today.getYear(), quarterMonth - 3, 1)
                        : LocalDate.of(today.getYear() - 1, 10, 1);
                priorEnd = start.minusDays(1);
            }
            case "year" -> {
                start = LocalDate.of(today.getYear(), 1, 1);
                priorStart = LocalDate.of(today.getYear() - 1, 1, 1);
                priorEnd = LocalDate.of(today.getYear() - 1, 12, 31);
            }
            default -> {
                start = LocalDate.of(today.getYear(), today.getMonth(), 1);
                if (today.getMonthValue() == 1) {
                    priorStart = LocalDate.of(today.getYear() - 1, 12, 1);
                    priorEnd = LocalDate.of(today.getYear() - 1, 12, 31);
                } else {
                    priorStart = LocalDate.of(today.getYear(), today.getMonthValue() - 1, 1);
                    priorEnd = start.minusDays(1);
                }
            }
        }

        return new PeriodBounds(start, end, priorStart, priorEnd);
    }

    private record PeriodBounds(LocalDate start, LocalDate end, LocalDate priorStart, LocalDate priorEnd) {}
}
