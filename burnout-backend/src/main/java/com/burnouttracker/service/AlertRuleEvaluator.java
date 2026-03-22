package com.burnouttracker.service;

import com.burnouttracker.model.Alert;
import com.burnouttracker.model.MoodEntry;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class AlertRuleEvaluator {

    private static final List<String> CRISIS_KEYWORDS = Arrays.asList(
        "can't go on", "give up", "hopeless", "no point",
        "end it", "don't want to be here", "harm myself"
    );

    public boolean shouldTriggerRed(double score, String riskLevel, List<MoodEntry> entries) {
        if (score >= 85) return true;

        if ("HIGH".equals(riskLevel) && !entries.isEmpty()) {
            double last3Avg = entries.stream().limit(3).mapToDouble(MoodEntry::getMoodScore).average().orElse(10);
            if (last3Avg < 3.0) return true;
        }

        if (!entries.isEmpty()) {
            String latestNote = entries.get(0).getNote();
            if (latestNote != null && containsCrisisKeywords(latestNote)) return true;
        }

        return false;
    }

    public boolean shouldTriggerOrange(double score, String riskLevel, List<MoodEntry> entries) {
        if (score < 70) return false;
        if (!"HIGH".equals(riskLevel) && !"MEDIUM".equals(riskLevel)) return false;
        return isConsecutiveDecline(entries.stream().limit(3).toList());
    }

    public boolean shouldTriggerYellow(double score, List<MoodEntry> entries, Optional<Alert> recentYellow) {
        if (score < 60) return false;
        double avgMood5 = entries.stream().limit(5).mapToDouble(MoodEntry::getMoodScore).average().orElse(10);
        if (avgMood5 >= 4.0) return false;

        if (recentYellow.isPresent()) {
            LocalDateTime yellowCreatedAt = recentYellow.get().getCreatedAt();
            if (java.time.Duration.between(yellowCreatedAt, LocalDateTime.now()).toDays() < 7) {
                return false;
            }
        }
        return true;
    }

    public String buildRedTriggerReason(double score, List<MoodEntry> entries) {
        StringBuilder reason = new StringBuilder();
        reason.append(String.format("Burnout score %.1f", score));

        double last3Avg = entries.stream().limit(3).mapToDouble(MoodEntry::getMoodScore).average().orElse(0);
        if (last3Avg < 3.0) {
            reason.append(", severe mood decline (avg ").append(String.format("%.1f", last3Avg)).append("/10 last 3 days)");
        }

        if (!entries.isEmpty()) {
            String latestNote = entries.get(0).getNote();
            if (latestNote != null && containsCrisisKeywords(latestNote)) {
                reason.append(", crisis keywords detected in note");
            }
        }

        return reason.toString();
    }

    public double calculateAvgMood(List<MoodEntry> entries) {
        return entries.stream().limit(5).mapToDouble(MoodEntry::getMoodScore).average().orElse(0);
    }

    private boolean isConsecutiveDecline(List<MoodEntry> entries) {
        if (entries.size() < 3) return false;
        for (int i = 1; i < entries.size(); i++) {
            if (entries.get(i).getMoodScore() >= entries.get(i - 1).getMoodScore()) {
                return false;
            }
        }
        return true;
    }

    private boolean containsCrisisKeywords(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        return CRISIS_KEYWORDS.stream().anyMatch(lower::contains);
    }
}
