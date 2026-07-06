package com.tally.finance.api;

import com.tally.finance.api.dto.AccountDto;
import com.tally.finance.repository.AccountRepository;
import com.tally.finance.security.UserPrincipal;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountRepository accountRepository;
    private final CurrentUserResolver currentUserResolver;

    public AccountController(AccountRepository accountRepository, CurrentUserResolver currentUserResolver) {
        this.accountRepository = accountRepository;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    public List<AccountDto> listAccounts(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = currentUserResolver.requireUser(principal).getId();
        return accountRepository.findByUser_IdOrderByInstitutionNameAscNameAsc(userId).stream()
                .map(DtoMapper::toAccountDto)
                .toList();
    }
}
