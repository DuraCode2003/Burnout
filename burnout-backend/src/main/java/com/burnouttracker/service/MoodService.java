package com.burnouttracker.service;

import com.burnouttracker.dto.request.MoodEntryRequest;
import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.RiskLevel;
import com.burnouttracker.model.enums.StressLevel;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import com.burnouttracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class MoodService {

    private final MoodEntryRepository moodEntryRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final UserRepository userRepository;
    private final AlertTriggerService alertTriggerService;

    public MoodService(MoodEntryRepository moodEntryRepository,
                      BurnoutScoreRepository burnoutScoreRepository,
                      UserRepository userRepository,
                      AlertTriggerService alertTriggerService) {
        this.moodEntryRepository = moodEntryRepository;
        this.burnoutScoreRepository = burnoutScoreRepository;
        this.userRepository = userRepository;
        this.alertTriggerService = alertTriggerService;
    }

    @Transactional
    public MoodEntry createMoodEntry(UUID userId, MoodEntryRequest request) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Map Integer stress level to Enum
        StressLevel stressEnum = StressLevel.MEDIUM;
        if (request.getStressLevel() <= 3) stressEnum = StressLevel.LOW;
        else if (request.getStressLevel() >= 8) stressEnum = StressLevel.HIGH;

        MoodEntry entry = MoodEntry.builder()
            .user(user)
            .moodScore(request.getMood())
            .stressLevel(stressEnum)
            .sleepHours(request.getSleepHours())
            .note(request.getNote())
            .build();

        MoodEntry savedEntry = moodEntryRepository.save(entry);
        
        // Calculate Burnout Score
        calculateAndSaveBurnoutScore(user, request, stressEnum);
        
        // Trigger alert evaluation if thresholds are met
        alertTriggerService.evaluateAndTriggerAlert(userId);
        
        return savedEntry;
    }

    private void calculateAndSaveBurnoutScore(User user, MoodEntryRequest request, StressLevel stressEnum) {
        // Simple logic: 100 - (mood*5) + (stress*10) - (sleep*2)
        int stressVal = 0;
        if (stressEnum == StressLevel.LOW) stressVal = 10;
        else if (stressEnum == StressLevel.MEDIUM) stressVal = 20;
        else if (stressEnum == StressLevel.HIGH) stressVal = 30;
        
        double rawScore = 100.0 - (request.getMood() * 5.0) + stressVal - (request.getSleepHours().doubleValue() * 2.0);
        
        // Clamp 0-100
        double finalScore = Math.max(0, Math.min(100, rawScore));
        
        RiskLevel risk;
        if (finalScore < 30) risk = RiskLevel.LOW;
        else if (finalScore < 70) risk = RiskLevel.MEDIUM;
        else risk = RiskLevel.HIGH;
        
        BurnoutScore score = BurnoutScore.builder()
            .user(user)
            .score(BigDecimal.valueOf(finalScore))
            .riskLevel(risk)
            .calculationMethod("weighted_v1")
            .build();
            
        burnoutScoreRepository.save(score);
    }

    @Transactional(readOnly = true)
    public List<MoodEntry> getUserMoodEntries(UUID userId) {
        return moodEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public int calculateCurrentStreak(UUID userId) {
        List<MoodEntry> entries = moodEntryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (entries.isEmpty()) return 0;
        
        int streak = 0;
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate currentDay = today;
        
        // Loop backwards from today
        for (MoodEntry entry : entries) {
            java.time.LocalDate entryDate = entry.getCreatedAt().toLocalDate();
            
            if (entryDate.equals(currentDay)) {
                streak++;
                currentDay = currentDay.minusDays(1);
            } else if (entryDate.isBefore(currentDay)) {
                // Gap found
                break;
            }
            // If entryDate is after currentDay (multiple entries same day), we just skip to next entry
        }
        
        // If they haven't checked in today but did yesterday, currentDay will be today-1
        // and streak will be > 0. If they haven't checked in for 2+ days, streak is 0.
        if (streak == 0) {
            // Check if they checked in yesterday
            currentDay = today.minusDays(1);
            for (MoodEntry entry : entries) {
                if (entry.getCreatedAt().toLocalDate().equals(currentDay)) {
                    streak++;
                    currentDay = currentDay.minusDays(1);
                } else if (entry.getCreatedAt().toLocalDate().isBefore(currentDay)) {
                    break;
                }
            }
        }
        
        return streak;
    }
}
