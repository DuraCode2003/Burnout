package com.burnouttracker.service;

import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.DailyTip;
import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.model.User;
import com.burnouttracker.repository.BurnoutScoreRepository;
import com.burnouttracker.repository.DailyTipRepository;
import com.burnouttracker.repository.MoodEntryRepository;
import com.burnouttracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyTipService {
    private final DailyTipRepository dailyTipRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;

    @Value("${ai.service.api-key:burnout-internal-secure-key-2026}")
    private String internalApiKey;

    public DailyTip getTodayTip(UUID userId) {
        // 1. Try to find a personalized tip for today
        Optional<DailyTip> personalized = dailyTipRepository.findByUserIdAndDisplayDate(userId, LocalDate.now());
        if (personalized.isPresent()) {
            return personalized.get();
        }

        // 2. Generate new personalized tip via Luma AI
        try {
            return generateAndSavePersonalizedTip(userId);
        } catch (Exception e) {
            log.error("Failed to generate personalized tip for user {}: {}", userId, e.getMessage());
            // 3. Fallback to global tip or static fallback
            return dailyTipRepository.findByDisplayDateAndUserIdIsNull(LocalDate.now())
                .orElse(getFallbackTip());
        }
    }

    private DailyTip generateAndSavePersonalizedTip(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        BurnoutScore latestScore = burnoutScoreRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
            .orElse(null);
        
        List<MoodEntry> recentMoods = moodEntryRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5));
        String moodTrend = recentMoods.isEmpty() ? "No recent data" : 
            recentMoods.stream()
                .map(m -> String.valueOf(m.getMoodScore()))
                .collect(Collectors.joining(", "));

        // Call AI Service
        Map<String, Object> request = new HashMap<>();
        request.put("user_id", userId.toString());
        request.put("student_name", user.getName());
        request.put("burnout_score", latestScore != null ? latestScore.getScore() : 0.0);
        request.put("risk_level", latestScore != null ? latestScore.getRiskLevel().toString() : "LOW");
        request.put("mood_trend", moodTrend);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Key", internalApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(
            aiServiceUrl + "/ai/agent/generate-tip",
            entity,
            Map.class
        );

        if (response != null && Boolean.TRUE.equals(response.get("success"))) {
            DailyTip tip = DailyTip.builder()
                .content((String) response.get("tip"))
                .category((String) response.get("category"))
                .userId(userId)
                .displayDate(LocalDate.now())
                .build();
            
            return dailyTipRepository.save(tip);
        }

        throw new RuntimeException("AI Service returned unsuccessful response");
    }

    public DailyTip getFallbackTip() {
        return DailyTip.builder()
            .content("Take a deep breath and stay focused on your goals. Luma is here for you.")
            .category("Mindfulness")
            .displayDate(LocalDate.now())
            .build();
    }
}
