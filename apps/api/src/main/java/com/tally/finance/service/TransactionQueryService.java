package com.tally.finance.service;

import com.tally.finance.api.DtoMapper;
import com.tally.finance.api.dto.PaginatedResponse;
import com.tally.finance.api.dto.TransactionDto;
import com.tally.finance.domain.Account;
import com.tally.finance.domain.Transaction;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TransactionQueryService {

    private final EntityManager entityManager;

    public TransactionQueryService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public PaginatedResponse<TransactionDto> listTransactions(
            String userId,
            String accountId,
            String categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            int page,
            int pageSize
    ) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Transaction> countRoot = countQuery.from(Transaction.class);
        Join<Transaction, Account> countAccount = countRoot.join("account");
        List<Predicate> predicates = buildPredicates(
                cb, countRoot, countAccount, userId, accountId, categoryId, startDate, endDate, search
        );
        countQuery.select(cb.count(countRoot));
        countQuery.where(predicates.toArray(Predicate[]::new));
        int total = entityManager.createQuery(countQuery).getSingleResult().intValue();

        CriteriaQuery<Transaction> dataQuery = cb.createQuery(Transaction.class);
        Root<Transaction> root = dataQuery.from(Transaction.class);
        Join<Transaction, Account> account = root.join("account");
        List<Predicate> dataPredicates = buildPredicates(
                cb, root, account, userId, accountId, categoryId, startDate, endDate, search
        );
        dataQuery.select(root);
        dataQuery.where(dataPredicates.toArray(Predicate[]::new));
        dataQuery.orderBy(cb.desc(root.get("date")), cb.desc(root.get("createdAt")));

        List<Transaction> transactions = entityManager.createQuery(dataQuery)
                .setFirstResult((page - 1) * pageSize)
                .setMaxResults(pageSize)
                .getResultList();

        List<TransactionDto> data = transactions.stream().map(DtoMapper::toTransactionDto).toList();
        int offset = (page - 1) * pageSize;
        return new PaginatedResponse<>(data, total, page, pageSize, offset + pageSize < total);
    }

    private List<Predicate> buildPredicates(
            CriteriaBuilder cb,
            Root<Transaction> root,
            Join<Transaction, Account> account,
            String userId,
            String accountId,
            String categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String search
    ) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(account.get("user").get("id"), userId));

        if (accountId != null && !accountId.isBlank()) {
            predicates.add(cb.equal(root.get("account").get("id"), accountId));
        }
        if (categoryId != null && !categoryId.isBlank()) {
            predicates.add(cb.equal(root.get("categoryId"), categoryId));
        }
        if (startDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("date"), startDate));
        }
        if (endDate != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("date"), endDate));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("merchantName")), pattern)
            ));
        }

        return predicates;
    }
}
