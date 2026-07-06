package com.tally.finance.api;

import com.tally.finance.api.dto.SubscriptionDto;
import com.tally.finance.security.UserPrincipal;
import com.tally.finance.service.SubscriptionService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final CurrentUserResolver currentUserResolver;

    public SubscriptionController(
            SubscriptionService subscriptionService,
            CurrentUserResolver currentUserResolver
    ) {
        this.subscriptionService = subscriptionService;
        this.currentUserResolver = currentUserResolver;
    }

    @GetMapping
    public List<SubscriptionDto> listSubscriptions(@AuthenticationPrincipal UserPrincipal principal) {
        String userId = currentUserResolver.requireUser(principal).getId();
        return subscriptionService.detectSubscriptions(userId);
    }
}
