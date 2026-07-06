package com.tally.finance.api;

import com.tally.finance.api.dto.UserDto;
import com.tally.finance.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final CurrentUserResolver currentUserResolver;

    public UserController(CurrentUserResolver currentUserResolver) {
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping("/me")
    public UserDto getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return DtoMapper.toUserDto(currentUserResolver.requireUser(principal));
    }
}
