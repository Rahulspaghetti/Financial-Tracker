package com.tally.finance.repository;

import com.tally.finance.domain.PlaidItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlaidItemRepository extends JpaRepository<PlaidItem, String> {
    List<PlaidItem> findByUser_Id(String userId);
    Optional<PlaidItem> findByIdAndUser_Id(String id, String userId);
}
