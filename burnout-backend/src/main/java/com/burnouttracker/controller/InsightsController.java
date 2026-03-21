package com.burnouttracker.controller;

import com.burnouttracker.dto.InsightsOverviewDTO;
import com.burnouttracker.model.User;
import com.burnouttracker.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(name = "period", defaultValue = "7") int period) {
        
        if (!(userDetails instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid user principal type"));
        }
        
        User user = (User) userDetails;
        return ResponseEntity.ok(insightsService.getInsightsOverview(user.getId(), period));
    }
}
