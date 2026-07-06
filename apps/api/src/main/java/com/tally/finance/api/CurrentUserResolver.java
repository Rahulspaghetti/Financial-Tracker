package com.tally.finance.api;

import com.tally.finance.domain.User;
import com.tally.finance.repository.UserRepository;
import com.tally.finance.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserResolver {

    private final UserRepository userRepository;

    public CurrentUserResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ApiException(401, "Could not validate credentials");
        }
        return userRepository.findById(principal.userId())
                .orElseThrow(() -> new ApiException(401, "Could not validate credentials"));
    }
}
