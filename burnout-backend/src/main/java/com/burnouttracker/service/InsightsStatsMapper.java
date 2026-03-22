package com.burnouttracker.service;

import com.burnouttracker.dto.InsightsOverviewDTO;
import com.burnouttracker.dto.InsightsOverviewDTO.MoodTrendDTO;
import com.burnouttracker.dto.InsightsOverviewDTO.SleepDataDTO;
import com.burnouttracker.dto.InsightsOverviewDTO.DayInsightDTO;
import com.burnouttracker.dto.InsightsOverviewDTO.StressDistributionDTO;
import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.model.enums.StressLevel;
import org.springframework.stereotype.Component;

import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class InsightsStatsMapper {

    public List<MoodTrendDTO> buildMoodTrend(List<MoodEntry> entries, List<BurnoutScore> scores) {
        return entries.stream()
            .filter(e -> e.getCreatedAt() != null)
            .map(entry -> {
                int bScore = scores.stream()
                    .filter(s -> s.getCreatedAt() != null)
                    .filter(s -> Math.abs(java.time.Duration.between(s.getCreatedAt(), entry.getCreatedAt()).toMinutes()) < 60)
                    .findFirst()
                    .map(s -> s.getScore() != null ? s.getScore().intValue() : 0)
                    .orElse(0);
                    
                return MoodTrendDTO.builder()
                    .date(entry.getCreatedAt().toLocalDate().toString())
                    .dayLabel(entry.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .mood(entry.getMoodScore())
                    .burnoutScore(bScore)
                    .build();
            })
            .sorted(Comparator.comparing(MoodTrendDTO::getDate))
            .collect(Collectors.toList());
    }

    public List<SleepDataDTO> buildSleepData(List<MoodEntry> entries) {
        return entries.stream()
            .filter(e -> e.getCreatedAt() != null)
            .map(entry -> SleepDataDTO.builder()
                .date(entry.getCreatedAt().toLocalDate().toString())
                .dayLabel(entry.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                .hours(entry.getSleepHours() != null ? entry.getSleepHours().doubleValue() : 0.0)
                .quality("good") 
                .build())
            .sorted(Comparator.comparing(SleepDataDTO::getDate))
            .collect(Collectors.toList());
    }

    public StressDistributionDTO buildStressDistribution(List<MoodEntry> entries) {
        int low = (int) entries.stream().filter(e -> e.getStressLevel() == StressLevel.LOW).count();
        int medium = (int) entries.stream().filter(e -> e.getStressLevel() == StressLevel.MEDIUM).count();
        int high = (int) entries.stream().filter(e -> e.getStressLevel() == StressLevel.HIGH).count();
        return StressDistributionDTO.builder().low(low).medium(medium).high(high).build();
    }

    public DayInsightDTO mapToDayInsight(MoodEntry entry) {
        if (entry == null || entry.getCreatedAt() == null) return null;
        return DayInsightDTO.builder()
            .date(entry.getCreatedAt().toLocalDate().toString())
            .mood(entry.getMoodScore())
            .sleepHours(entry.getSleepHours() != null ? entry.getSleepHours().doubleValue() : 0.0)
            .stressLevel(entry.getStressLevel() == StressLevel.LOW ? 1 : (entry.getStressLevel() == StressLevel.MEDIUM ? 2 : 3))
            .notes(entry.getNote())
            .build();
    }
}
