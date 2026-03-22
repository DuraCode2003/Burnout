package com.burnouttracker.service;

import com.burnouttracker.dto.InsightsOverviewDTO;
import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsightsService {

    private final MoodEntryRepository moodEntryRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final MoodService moodService;
    private final InsightsStatsMapper mapper;
    private final InsightsAnalyzer analyzer;

    @Transactional(readOnly = true)
    public InsightsOverviewDTO getInsightsOverview(UUID userId, int periodDays) {
        log.info("Fetching insights for user: {} with period: {} days", userId, periodDays);
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusDays(periodDays);
        LocalDateTime previousPeriodStart = now.minusDays(periodDays * 2);

        List<MoodEntry> currentEntries = moodEntryRepository.findByUserIdAndCreatedAtBetween(userId, startDate, now);
        List<BurnoutScore> currentScores = burnoutScoreRepository.findByUserIdAndCreatedAtBetween(userId, startDate, now);
        
        List<BurnoutScore> previousScores = burnoutScoreRepository.findByUserIdAndCreatedAtBetween(userId, previousPeriodStart, startDate);

        double currentAvgBurnout = analyzer.calculateAverageBurnout(currentScores);
        double previousAvgBurnout = analyzer.calculateAverageBurnout(previousScores);
        int burnoutChange = analyzer.calculateBurnoutChange(currentAvgBurnout, previousAvgBurnout);

        int currentStreak = 0;
        try {
            currentStreak = moodService.calculateCurrentStreak(userId);
        } catch (Exception e) {
            log.error("Error calculating streak for user {}: {}", userId, e.getMessage());
        }

        MoodEntry bestEntry = analyzer.findBestDay(currentEntries);
        MoodEntry worstEntry = analyzer.findWorstDay(currentEntries);

        return InsightsOverviewDTO.builder()
            .avgBurnoutScore((int) currentAvgBurnout)
            .burnoutChange(burnoutChange)
            .checkInStreak(currentStreak)
            .streakChange(currentEntries.size())
            .totalCheckIns(currentEntries.size())
            .moodTrend(mapper.buildMoodTrend(currentEntries, currentScores))
            .sleepData(mapper.buildSleepData(currentEntries))
            .stressDistribution(mapper.buildStressDistribution(currentEntries))
            .bestDay(mapper.mapToDayInsight(bestEntry))
            .worstDay(mapper.mapToDayInsight(worstEntry))
            .build();
    }
}
