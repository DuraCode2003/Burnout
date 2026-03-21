package com.burnouttracker.service;

import com.burnouttracker.dto.InsightsOverviewDTO;
import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.model.enums.StressLevel;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsightsService {

    private final MoodEntryRepository moodEntryRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final MoodService moodService;

    @Transactional(readOnly = true)
    public InsightsOverviewDTO getInsightsOverview(UUID userId, int periodDays) {
        log.info("Fetching insights for user: {} with period: {} days", userId, periodDays);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusDays(periodDays);
        LocalDateTime previousPeriodStart = now.minusDays(periodDays * 2);

        List<MoodEntry> currentEntries = moodEntryRepository.findByUserIdAndCreatedAtBetween(userId, startDate, now);
        List<BurnoutScore> currentScores = burnoutScoreRepository.findByUserIdAndCreatedAtBetween(userId, startDate, now);
        
        List<MoodEntry> previousEntries = moodEntryRepository.findByUserIdAndCreatedAtBetween(userId, previousPeriodStart, startDate);
        List<BurnoutScore> previousScores = burnoutScoreRepository.findByUserIdAndCreatedAtBetween(userId, previousPeriodStart, startDate);

        log.debug("Found {} current entries and {} current scores", currentEntries.size(), currentScores.size());

        // Calculate averages
        double currentAvgBurnout = currentScores.stream()
            .filter(s -> s.getScore() != null)
            .mapToDouble(s -> s.getScore().doubleValue())
            .average()
            .orElse(0.0);
            
        double previousAvgBurnout = previousScores.stream()
            .filter(s -> s.getScore() != null)
            .mapToDouble(s -> s.getScore().doubleValue())
            .average()
            .orElse(0.0);
            
        int burnoutChange = (int) (currentAvgBurnout - previousAvgBurnout);

        int currentStreak = 0;
        try {
            currentStreak = moodService.calculateCurrentStreak(userId);
        } catch (Exception e) {
            log.error("Error calculating streak for user {}: {}", userId, e.getMessage());
        }
        
        // Simplified streak change (could be improved if we track historical streaks)
        int streakChange = currentEntries.size(); 

        // Mood Trend
        List<InsightsOverviewDTO.MoodTrendDTO> moodTrend = currentEntries.stream()
            .filter(e -> e.getCreatedAt() != null)
            .map(entry -> {
                // Find corresponding burnout score near this entry time
                int bScore = currentScores.stream()
                    .filter(s -> s.getCreatedAt() != null)
                    .filter(s -> Math.abs(java.time.Duration.between(s.getCreatedAt(), entry.getCreatedAt()).toMinutes()) < 60)
                    .findFirst()
                    .map(s -> s.getScore() != null ? s.getScore().intValue() : 0)
                    .orElse(0);
                    
                return InsightsOverviewDTO.MoodTrendDTO.builder()
                    .date(entry.getCreatedAt().toLocalDate().toString())
                    .dayLabel(entry.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .mood(entry.getMoodScore())
                    .burnoutScore(bScore)
                    .build();
            })
            .sorted(Comparator.comparing(InsightsOverviewDTO.MoodTrendDTO::getDate))
            .collect(Collectors.toList());

        // Sleep Data
        List<InsightsOverviewDTO.SleepDataDTO> sleepData = currentEntries.stream()
            .filter(e -> e.getCreatedAt() != null)
            .map(entry -> InsightsOverviewDTO.SleepDataDTO.builder()
                .date(entry.getCreatedAt().toLocalDate().toString())
                .dayLabel(entry.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                .hours(entry.getSleepHours() != null ? entry.getSleepHours().doubleValue() : 0.0)
                .quality("good") // Simplified
                .build())
            .sorted(Comparator.comparing(InsightsOverviewDTO.SleepDataDTO::getDate))
            .collect(Collectors.toList());

        // Stress Distribution
        int low = (int) currentEntries.stream().filter(e -> e.getStressLevel() == StressLevel.LOW).count();
        int medium = (int) currentEntries.stream().filter(e -> e.getStressLevel() == StressLevel.MEDIUM).count();
        int high = (int) currentEntries.stream().filter(e -> e.getStressLevel() == StressLevel.HIGH).count();

        // Best/Worst Days
        MoodEntry bestEntry = currentEntries.stream()
            .filter(e -> e.getMoodScore() != null)
            .max(Comparator.comparingInt(MoodEntry::getMoodScore))
            .orElse(null);
        MoodEntry worstEntry = currentEntries.stream()
            .filter(e -> e.getMoodScore() != null)
            .min(Comparator.comparingInt(MoodEntry::getMoodScore))
            .orElse(null);

        return InsightsOverviewDTO.builder()
            .avgBurnoutScore((int) currentAvgBurnout)
            .burnoutChange(burnoutChange)
            .checkInStreak(currentStreak)
            .streakChange(streakChange)
            .totalCheckIns(currentEntries.size())
            .moodTrend(moodTrend)
            .sleepData(sleepData)
            .stressDistribution(InsightsOverviewDTO.StressDistributionDTO.builder()
                .low(low).medium(medium).high(high).build())
            .bestDay(mapToDayInsight(bestEntry))
            .worstDay(mapToDayInsight(worstEntry))
            .build();
    }

    private InsightsOverviewDTO.DayInsightDTO mapToDayInsight(MoodEntry entry) {
        if (entry == null || entry.getCreatedAt() == null) return null;
        return InsightsOverviewDTO.DayInsightDTO.builder()
            .date(entry.getCreatedAt().toLocalDate().toString())
            .mood(entry.getMoodScore())
            .sleepHours(entry.getSleepHours() != null ? entry.getSleepHours().doubleValue() : 0.0)
            .stressLevel(entry.getStressLevel() == StressLevel.LOW ? 1 : (entry.getStressLevel() == StressLevel.MEDIUM ? 2 : 3))
            .notes(entry.getNote())
            .build();
    }
}
