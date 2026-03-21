package com.burnouttracker.controller;

import com.burnouttracker.dto.request.MoodEntryRequest;
import com.burnouttracker.model.MoodEntry;
import com.burnouttracker.model.User;
import com.burnouttracker.service.MoodService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mood")
public class MoodController {

    private final MoodService moodService;

    public MoodController(MoodService moodService) {
        this.moodService = moodService;
    }

    @PostMapping
    public ResponseEntity<MoodEntry> createMoodEntry(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MoodEntryRequest request) {
        
        User user = (User) userDetails;
        
        MoodEntry entry = moodService.createMoodEntry(user.getId(), request);
        return ResponseEntity.ok(entry);
    }

    @GetMapping
    public ResponseEntity<List<MoodEntry>> getUserMoodEntries(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = (User) userDetails;
        
        List<MoodEntry> entries = moodService.getUserMoodEntries(user.getId());
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/history")
    public ResponseEntity<List<java.util.Map<String, Object>>> getMoodHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(name = "days", defaultValue = "7") int days) {
        
        User user = (User) userDetails;
        List<MoodEntry> entries = moodService.getUserMoodEntries(user.getId());
        
        List<java.util.Map<String, Object>> history = new java.util.ArrayList<>();
        java.util.Set<String> processedDates = new java.util.HashSet<>();
        
        for (MoodEntry entry : entries) {
            String dateStr = entry.getCreatedAt().toLocalDate().toString();
            // Since entries are ordered by CreatedAt DESC, the first one we see is the latest for that date
            if (!processedDates.contains(dateStr)) {
                processedDates.add(dateStr);
                
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("date", dateStr);
                map.put("mood", entry.getMoodScore());
                
                int stressScore = 5;
                if (entry.getStressLevel() != null) {
                    switch(entry.getStressLevel()) {
                        case LOW: stressScore = 2; break;
                        case MEDIUM: stressScore = 5; break;
                        case HIGH: stressScore = 8; break;
                    }
                }
                map.put("stress", stressScore);
                history.add(map);
            }
            if (history.size() >= days) break;
        }
        
        // Return in chronological order for the chart
        java.util.Collections.reverse(history);
        return ResponseEntity.ok(history);
    }
}
