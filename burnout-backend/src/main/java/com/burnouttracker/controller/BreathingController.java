package com.burnouttracker.controller;

import com.burnouttracker.model.BreathingSession;
import com.burnouttracker.model.User;
import com.burnouttracker.repository.BreathingSessionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/breathing")
public class BreathingController {

    private final BreathingSessionRepository breathingSessionRepository;

    public BreathingController(BreathingSessionRepository breathingSessionRepository) {
        this.breathingSessionRepository = breathingSessionRepository;
    }

    @GetMapping("/exercise")
    public ResponseEntity<Map<String, Object>> getBreathingExercise() {
        Map<String, Object> exercise = Map.of(
            "name", "Box Breathing",
            "duration", 240,
            "steps", new String[] {
                "Inhale for 4 seconds",
                "Hold for 4 seconds",
                "Exhale for 4 seconds",
                "Hold for 4 seconds"
            }
        );
        return ResponseEntity.ok(exercise);
    }

    @PostMapping("/session")
    public ResponseEntity<?> saveSession(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> sessionData) {
        
        if (!(userDetails instanceof User)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid user principal type"));
        }
        
        User user = (User) userDetails;
        
        try {
            BreathingSession session = BreathingSession.builder()
                .user(user)
                .exerciseName((String) sessionData.get("exerciseName"))
                .duration(parseNumber(sessionData.get("duration")))
                .preStressLevel(parseNumber(sessionData.get("preStressLevel")))
                .postStressLevel(parseNumber(sessionData.get("postStressLevel")))
                .build();
                
            return ResponseEntity.ok(breathingSessionRepository.save(session));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error saving session: " + e.getMessage()));
        }
    }

    private Integer parseNumber(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
