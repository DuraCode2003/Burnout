package com.burnouttracker.service;

import com.burnouttracker.model.Alert;
import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.ConsentRecord;
import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import com.burnouttracker.repository.AlertRepository;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.ConsentRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertTriggerService {

    private final AlertRepository alertRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final ConsentRepository consentRepository;
    private final AlertRuleEvaluator ruleEvaluator;

    @Transactional
    public void evaluateAndTriggerAlert(UUID userId) {
        ConsentRecord consent = consentRepository.findByUserId(userId).orElse(null);
        if (consent == null || !Boolean.TRUE.equals(consent.getHasConsented())) {
            log.debug("User {} has not consented - skipping alert evaluation", userId);
            return;
        }

        if (alertRepository.existsActiveAlertForUser(userId)) {
            log.debug("User {} already has active alert - skipping", userId);
            return;
        }

        BurnoutScore latestScore = burnoutScoreRepository.findTopByUserIdOrderByCreatedAtDesc(userId).orElse(null);
        if (latestScore == null) {
            log.debug("No burnout score for user {} - skipping", userId);
            return;
        }

        List<MoodEntry> last7Days = moodEntryRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 7));
        if (last7Days.isEmpty()) {
            log.debug("No mood entries for user {} - skipping", userId);
            return;
        }

        double scoreValue = latestScore.getScore().doubleValue();
        String riskLevel = latestScore.getRiskLevel().name();

        if (ruleEvaluator.shouldTriggerRed(scoreValue, riskLevel, last7Days)) {
            String triggerReason = ruleEvaluator.buildRedTriggerReason(scoreValue, last7Days);
            createAlert(userId, AlertType.RED, triggerReason, latestScore.getScore(), riskLevel);
            return;
        }

        if (ruleEvaluator.shouldTriggerOrange(scoreValue, riskLevel, last7Days)) {
            String triggerReason = String.format("3-day declining mood trend with burnout score %.1f", scoreValue);
            createAlert(userId, AlertType.ORANGE, triggerReason, latestScore.getScore(), riskLevel);
            return;
        }

        Optional<Alert> recentYellow = alertRepository.findMostRecentYellowAlertByUserId(userId);
        if (ruleEvaluator.shouldTriggerYellow(scoreValue, last7Days, recentYellow)) {
            double avgMood = ruleEvaluator.calculateAvgMood(last7Days);
            String triggerReason = String.format("Sub-baseline mood pattern: avg %.1f/10 over 5 days", avgMood);
            createAlert(userId, AlertType.YELLOW, triggerReason, latestScore.getScore(), riskLevel);
        }
    }

    private void createAlert(UUID userId, AlertType type, String reason, BigDecimal score, String riskLevel) {
        Alert alert = Alert.builder()
            .userId(userId)
            .alertType(type)
            .status(AlertStatus.ACTIVE)
            .triggerReason(reason)
            .burnoutScore(score)
            .riskLevel(riskLevel)
            .build();
        alertRepository.save(alert);
        log.info("Created {} alert for user {}: {}", type, userId, reason);
    }
}
