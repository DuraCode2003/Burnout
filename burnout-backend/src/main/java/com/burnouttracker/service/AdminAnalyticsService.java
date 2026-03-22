package com.burnouttracker.service;

import com.burnouttracker.model.enums.RiskLevel;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final BurnoutScoreRepository burnoutScoreRepository;
    private final MoodEntryRepository moodEntryRepository;

    public Map<String, Object> getLatestBurnoutStats() {
        List<Object[]> results = burnoutScoreRepository.getLatestBurnoutStatsPerUser();
        
        double sum = 0;
        long count = 0;
        long highCount = 0;
        long mediumCount = 0;
        long lowCount = 0;

        for (Object[] row : results) {
            double score = ((Number) row[0]).doubleValue();
            String riskLevelStr = row[1].toString();
            
            sum += score;
            count++;

            RiskLevel riskLevel = RiskLevel.valueOf(riskLevelStr);
            switch (riskLevel) {
                case HIGH -> highCount++;
                case MEDIUM -> mediumCount++;
                case LOW -> lowCount++;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("avgScore", count > 0 ? (sum / count) : 0.0);
        stats.put("highCount", highCount);
        stats.put("mediumCount", mediumCount);
        stats.put("lowCount", lowCount);
        
        return stats;
    }

    public Map<String, Double> getMoodStatsForPeriod(LocalDateTime since) {
        Map<String, Double> stats = new HashMap<>();
        
        Double avgMood = moodEntryRepository.getAverageMoodForPeriod(since);
        Double avgSleep = moodEntryRepository.getAverageSleepForPeriod(since);
        
        stats.put("avgMood", avgMood != null ? avgMood : 0.0);
        stats.put("avgSleep", avgSleep != null ? avgSleep : 0.0);
        
        return stats;
    }

    public Map<String, Long> getCurrentRiskDistribution() {
        List<Object[]> rawScores = burnoutScoreRepository.getLatestRiskDistribution();
        Map<String, Long> dist = new HashMap<>();
        dist.put("high", 0L);
        dist.put("medium", 0L);
        dist.put("low", 0L);
        
        for (Object[] row : rawScores) {
            if (row[0] == null) continue;
            String riskLevel = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            
            if (RiskLevel.HIGH.name().equals(riskLevel)) {
                dist.put("high", dist.get("high") + count);
            } else if (RiskLevel.MEDIUM.name().equals(riskLevel)) {
                dist.put("medium", dist.get("medium") + count);
            } else if (RiskLevel.LOW.name().equals(riskLevel)) {
                dist.put("low", dist.get("low") + count);
            }
        }
        
        return dist;
    }

    public Map<String, Double> getMoodStatsForPeriodInRange(LocalDateTime startDate, LocalDateTime endDate) {
        Double avgMood = moodEntryRepository.getAverageMoodInRange(startDate, endDate);
        Double avgSleep = moodEntryRepository.getAverageSleepInRange(startDate, endDate);

        Map<String, Double> stats = new HashMap<>();
        stats.put("avgMood", avgMood != null ? avgMood : 0.0);
        stats.put("avgSleep", avgSleep != null ? avgSleep : 0.0);
        return stats;
    }

    public Map<String, Long> getWeeklyRiskDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = burnoutScoreRepository.getRiskDistributionInRange(startDate, endDate);
        
        Map<String, Long> distribution = new HashMap<>();
        distribution.put("high", 0L);
        distribution.put("medium", 0L);
        distribution.put("low", 0L);

        for (Object[] row : results) {
            if (row[0] == null) continue;
            String riskLevel = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            distribution.put(riskLevel.toLowerCase(), count);
        }

        return distribution;
    }
}
