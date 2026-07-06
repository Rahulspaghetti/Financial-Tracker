package com.tally.finance.service;

import com.tally.finance.api.dto.SubscriptionDto;
import com.tally.finance.domain.Transaction;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionService {

    private static final Pattern TRAILING_HASH = Pattern.compile("\\s+#\\d+$");
    private static final Pattern TRAILING_DIGITS = Pattern.compile("\\s+\\d{4,}$");

    private final EntityManager entityManager;

    public SubscriptionService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<SubscriptionDto> detectSubscriptions(String userId) {
        LocalDate lookback = LocalDate.now().minusDays(365);

        var query = entityManager.createQuery("""
                SELECT t FROM Transaction t
                JOIN t.account a
                WHERE a.user.id = :userId
                  AND t.date >= :lookback
                  AND t.amount > 0
                  AND t.pending = false
                  AND t.merchantName IS NOT NULL
                ORDER BY t.merchantName, t.date
                """, Transaction.class);
        query.setParameter("userId", userId);
        query.setParameter("lookback", lookback);

        Map<String, List<Transaction>> groups = new HashMap<>();
        for (Transaction tx : query.getResultList()) {
            String key = normalizeMerchant(tx.getMerchantName());
            groups.computeIfAbsent(key, ignored -> new ArrayList<>()).add(tx);
        }

        List<SubscriptionDto> subscriptions = new ArrayList<>();

        for (Map.Entry<String, List<Transaction>> entry : groups.entrySet()) {
            List<Transaction> txs = entry.getValue();
            if (txs.size() < 2) {
                continue;
            }

            List<Double> amounts = txs.stream().map(tx -> tx.getAmount().doubleValue()).toList();
            double median = median(amounts);
            List<Transaction> filtered = txs.stream()
                    .filter(tx -> {
                        double amount = tx.getAmount().doubleValue();
                        return amount >= median * 0.9 && amount <= median * 1.1;
                    })
                    .toList();

            if (filtered.size() < 2) {
                continue;
            }

            List<LocalDate> dates = filtered.stream()
                    .map(Transaction::getDate)
                    .sorted()
                    .toList();
            List<Integer> gaps = new ArrayList<>();
            for (int i = 1; i < dates.size(); i++) {
                gaps.add((int) ChronoUnit.DAYS.between(dates.get(i - 1), dates.get(i)));
            }

            String frequency = detectFrequency(gaps);
            if (frequency == null) {
                continue;
            }

            Transaction lastTx = filtered.get(filtered.size() - 1);
            double avgAmount = filtered.stream()
                    .mapToDouble(tx -> tx.getAmount().doubleValue())
                    .average()
                    .orElse(0);

            LocalDate nextDate = switch (frequency) {
                case "monthly" -> lastTx.getDate().plusDays(30);
                case "annual" -> lastTx.getDate().plusDays(365);
                default -> lastTx.getDate().plusDays(7);
            };

            int daysSince = (int) ChronoUnit.DAYS.between(lastTx.getDate(), LocalDate.now());
            boolean isActive = daysSince <= ("monthly".equals(frequency) ? 35 : 400);

            subscriptions.add(new SubscriptionDto(
                    lastTx.getMerchantName() != null ? lastTx.getMerchantName() : entry.getKey(),
                    Math.round(avgAmount * 100.0) / 100.0,
                    frequency,
                    lastTx.getDate().toString(),
                    nextDate.toString(),
                    lastTx.getCategory(),
                    lastTx.getLogoUrl(),
                    isActive
            ));
        }

        subscriptions.sort(Comparator.comparingDouble(SubscriptionDto::amount).reversed());
        return subscriptions;
    }

    private static String normalizeMerchant(String name) {
        if (name == null || name.isBlank()) {
            return "unknown";
        }
        String normalized = name.toLowerCase().trim();
        normalized = TRAILING_HASH.matcher(normalized).replaceAll("");
        normalized = TRAILING_DIGITS.matcher(normalized).replaceAll("");
        return normalized;
    }

    private static String detectFrequency(List<Integer> gaps) {
        if (gaps.isEmpty()) {
            return null;
        }
        double avg = gaps.stream().mapToInt(Integer::intValue).average().orElse(0);
        if (avg >= 25 && avg <= 35) {
            return "monthly";
        }
        if (avg >= 350 && avg <= 380) {
            return "annual";
        }
        if (avg >= 6 && avg <= 8) {
            return "weekly";
        }
        return null;
    }

    private static double median(List<Double> values) {
        List<Double> sorted = values.stream().sorted().toList();
        int mid = sorted.size() / 2;
        if (sorted.size() % 2 == 0) {
            return (sorted.get(mid - 1) + sorted.get(mid)) / 2.0;
        }
        return sorted.get(mid);
    }
}
