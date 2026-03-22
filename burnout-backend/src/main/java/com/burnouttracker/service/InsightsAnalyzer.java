package com.burnouttracker.service;

import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.MoodEntry;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class InsightsAnalyzer {

    public double calculateAverageBurnout(List<BurnoutScore> scores) {
        return scores.stream()
            .filter(s -> s.getScore() != null)
            .mapToDouble(s -> s.getScore().doubleValue())
            .average()
            .orElse(0.0);
    }

    public int calculateBurnoutChange(double currentAvg, double previousAvg) {
        return (int) (currentAvg - previousAvg);
    }

    public MoodEntry findBestDay(List<MoodEntry> entries) {
        return entries.stream()
            .filter(e -> e.getMoodScore() != null)
            .max(Comparator.comparingInt(MoodEntry::getMoodScore))
            .orElse(null);
    }

    public MoodEntry findWorstDay(List<MoodEntry> entries) {
        return entries.stream()
            .filter(e -> e.getMoodScore() != null)
            .min(Comparator.comparingInt(MoodEntry::getMoodScore))
            .orElse(null);
    }
}
