package com.tally.finance.repository;

import com.tally.finance.domain.Account;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, String> {
    List<Account> findByUser_IdOrderByInstitutionNameAscNameAsc(String userId);
    List<Account> findByPlaidItemId(String plaidItemId);
    Optional<Account> findByPlaidAccountId(String plaidAccountId);
}
