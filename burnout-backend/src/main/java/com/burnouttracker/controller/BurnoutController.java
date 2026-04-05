package com.burnouttracker.controller;

import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.User;
import com.burnouttracker.service.BurnoutService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/burnout")
public class BurnoutController {

    private final BurnoutService burnoutService;
    private final com.burnouttracker.service.MoodService moodService;

    private final com.burnouttracker.service.AlertService alertService;

    public BurnoutController(BurnoutService burnoutService, 
                             com.burnouttracker.service.MoodService moodService,
                             com.burnouttracker.service.AlertService alertService) {
        this.burnoutService = burnoutService;
        this.moodService = moodService;
        this.alertService = alertService;
    }

    @GetMapping("/active-alert")
    public ResponseEntity<?> getActiveAlert(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return ResponseEntity.ok(alertService.getLatestActiveAlertForUser(user.getId()));
    }

    @GetMapping("/score")
    public ResponseEntity<?> getLatestBurnoutScore(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = (User) userDetails;
        
        Optional<BurnoutScore> scoreOpt = burnoutService.getLatestBurnoutScore(user.getId());
        int currentStreak = moodService.calculateCurrentStreak(user.getId());
        
        // Check if checked in today
        List<com.burnouttracker.model.MoodEntry> entries = moodService.getUserMoodEntries(user.getId());
        boolean hasCheckedInToday = !entries.isEmpty() && 
            entries.get(0).getCreatedAt().toLocalDate().equals(java.time.LocalDate.now());

        if (scoreOpt.isPresent()) {
            BurnoutScore score = scoreOpt.get();
            return ResponseEntity.ok(java.util.Map.of(
                "overallScore", score.getScore(),
                "riskLevel", score.getRiskLevel().name().toLowerCase(),
                "trend", "stable",
                "previousScore", 0,
                "hasCheckedInToday", hasCheckedInToday,
                "streak", java.util.Map.of("current", currentStreak, "longest", currentStreak) // Simplified longest
            ));
        }
        
        return ResponseEntity.ok(java.util.Map.of(
            "overallScore", 0,
            "riskLevel", "low",
            "trend", "stable",
            "previousScore", 0,
            "hasCheckedInToday", hasCheckedInToday,
            "streak", java.util.Map.of("current", currentStreak, "longest", currentStreak)
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<List<BurnoutScore>> getBurnoutHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = (User) userDetails;
        
        List<BurnoutScore> scores = burnoutService.getUserBurnoutScores(user.getId());
        return ResponseEntity.ok(scores);
    }
}
