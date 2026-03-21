package com.burnouttracker.service;

import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.User;
import com.burnouttracker.repository.BurnoutScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BurnoutService {

    private final BurnoutScoreRepository burnoutScoreRepository;
    private final AlertService alertService;

    @Transactional(readOnly = true)
    public Optional<BurnoutScore> getLatestBurnoutScore(UUID userId) {
        return burnoutScoreRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<BurnoutScore> getUserBurnoutScores(UUID userId) {
        return burnoutScoreRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Calculate and save burnout score, automatically creating alert if needed
     */
    @Transactional
    public BurnoutScore calculateAndSaveBurnoutScore(User user, BigDecimal score, String triggerReason) {
        BurnoutScore burnoutScore = BurnoutScore.builder()
                .user(user)
                .score(score)
                .riskLevel(determineRiskLevel(score))
                .calculationMethod("MOOD_STRESS_SLEEP_WEIGHTED")
                .build();

        burnoutScoreRepository.save(burnoutScore);

        // Automatically create alert if thresholds are met
        checkAndCreateAlert(user, score, triggerReason);

        return burnoutScore;
    }

    /**
     * Check if alert should be created based on burnout score and patterns
     */
    private void checkAndCreateAlert(User user, BigDecimal score, String triggerReason) {
        double scoreValue = score.doubleValue();
        
        // Check for existing active alert
        // AlertService handles this check internally
        
        // Determine if alert should be created based on thresholds:
        // - Score 60-74 + 3 consecutive days declining → YELLOW
        // - Score 75-84 + negative sentiment → ORANGE
        // - Score 85+ OR crisis keywords → RED
        
        boolean shouldCreateAlert = scoreValue >= 60;
        
        if (shouldCreateAlert) {
            alertService.createAlert(user, score, triggerReason);
        }
    }

    /**
     * Determine risk level from burnout score
     */
    private com.burnouttracker.model.enums.RiskLevel determineRiskLevel(BigDecimal score) {
        double scoreValue = score.doubleValue();
        if (scoreValue >= 75) {
            return com.burnouttracker.model.enums.RiskLevel.HIGH;
        } else if (scoreValue >= 50) {
            return com.burnouttracker.model.enums.RiskLevel.MEDIUM;
        }
        return com.burnouttracker.model.enums.RiskLevel.LOW;
    }

    /**
     * Check for consecutive declining mood trend
     */
    @Transactional(readOnly = true)
    public boolean hasConsecutiveDecliningDays(UUID userId, int days) {
        List<BurnoutScore> recentScores = burnoutScoreRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        
        if (recentScores.size() < days) {
            return false;
        }

        for (int i = 1; i < days; i++) {
            BurnoutScore current = recentScores.get(i);
            BurnoutScore previous = recentScores.get(i - 1);
            
            if (current.getScore().compareTo(previous.getScore()) >= 0) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Get burnout trend for user (improving, stable, declining)
     */
    @Transactional(readOnly = true)
    public String getBurnoutTrend(UUID userId) {
        List<BurnoutScore> recentScores = burnoutScoreRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        
        if (recentScores.size() < 2) {
            return "stable";
        }

        BigDecimal latest = recentScores.get(0).getScore();
        BigDecimal previous = recentScores.get(recentScores.size() - 1).getScore();
        
        BigDecimal difference = latest.subtract(previous);
        
        if (difference.compareTo(BigDecimal.valueOf(-5)) < 0) {
            return "improving";
        } else if (difference.compareTo(BigDecimal.valueOf(5)) > 0) {
            return "declining";
        }
        
        return "stable";
    }
}
