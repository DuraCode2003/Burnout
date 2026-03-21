package com.burnouttracker.service;

import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.repository.MoodEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BaselineService {

    private final MoodEntryRepository moodEntryRepository;

    public BaselineService(MoodEntryRepository moodEntryRepository) {
        this.moodEntryRepository = moodEntryRepository;
    }

    @Transactional(readOnly = true)
    public double calculateBaselineMood(UUID userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<MoodEntry> entries = moodEntryRepository.findByUserIdAndCreatedAtBetween(
            userId, thirtyDaysAgo, LocalDateTime.now()
        );

        if (entries.isEmpty()) {
            return 5.0; // Default baseline
        }

        return entries.stream()
            .mapToInt(MoodEntry::getMoodScore)
            .average()
            .orElse(5.0);
    }

    @Transactional(readOnly = true)
    public double calculateBaselineStress(UUID userId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<MoodEntry> entries = moodEntryRepository.findByUserIdAndCreatedAtBetween(
            userId, thirtyDaysAgo, LocalDateTime.now()
        );

        if (entries.isEmpty()) {
            return 2.0; // Default baseline (LOW-MEDIUM)
        }

        return entries.stream()
            .mapToInt(entry -> {
                switch (entry.getStressLevel()) {
                    case LOW: return 1;
                    case MEDIUM: return 2;
                    case HIGH: return 3;
                    default: return 2;
                }
            })
            .average()
            .orElse(2.0);
    }
}
