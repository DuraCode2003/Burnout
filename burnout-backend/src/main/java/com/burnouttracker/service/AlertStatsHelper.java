package com.burnouttracker.service;

import com.burnouttracker.dto.response.counselor.AlertResponseDTO;
import com.burnouttracker.dto.response.counselor.CounselorStatsDTO;
import com.burnouttracker.exception.ResourceNotFoundException;
import com.burnouttracker.model.Alert;
import com.burnouttracker.model.ConsentRecord;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import com.burnouttracker.repository.AlertRepository;
import com.burnouttracker.repository.ConsentRepository;
import com.burnouttracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AlertStatsHelper {

    private final UserRepository userRepository;
    private final ConsentRepository consentRepository;
    private final AlertRepository alertRepository;

    public CounselorStatsDTO buildStatsDTO() {
        long activeAlerts = alertRepository.countByStatus(AlertStatus.ACTIVE);
        long redAlerts = alertRepository.countByAlertTypeAndStatus(AlertType.RED, AlertStatus.ACTIVE);
        long orangeAlerts = alertRepository.countByAlertTypeAndStatus(AlertType.ORANGE, AlertStatus.ACTIVE);
        long yellowAlerts = alertRepository.countByAlertTypeAndStatus(AlertType.YELLOW, AlertStatus.ACTIVE);
        
        LocalDateTime midnight = LocalDate.now().atStartOfDay();
        long resolvedToday = alertRepository.findByStatusAndResolvedAtAfter(AlertStatus.RESOLVED, midnight).size();
        Double avgHours = alertRepository.getAverageResolutionHours();
        long totalStudentsMonitored = alertRepository.countDistinctUsersWithActiveAlerts();

        return CounselorStatsDTO.builder()
                .queue(CounselorStatsDTO.AlertQueueStats.builder()
                        .total(activeAlerts)
                        .red(redAlerts)
                        .orange(orangeAlerts)
                        .yellow(yellowAlerts)
                        .urgent(redAlerts)
                        .assignedToMe(0)
                        .unassigned(activeAlerts)
                        .build())
                .metrics(CounselorStatsDTO.CounselorMetrics.builder()
                        .alertsResolved(resolvedToday)
                        .avgResponseTime(avgHours != null ? avgHours : 0.0)
                        .studentsContacted(0)
                        .escalationsMade(0)
                        .build())
                .totalStudentsMonitored(totalStudentsMonitored)
                .build();
    }

    public AlertResponseDTO mapToDTO(Alert alert) {
        User user = userRepository.findById(alert.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + alert.getUserId()));
            
        ConsentRecord consent = consentRepository.findByUserId(user.getId()).orElse(null);
        boolean isAnonymized = consent != null && Boolean.TRUE.equals(consent.getAnonymizeData());
        
        AlertResponseDTO.StudentInfoDTO studentInfo = AlertResponseDTO.StudentInfoDTO.builder()
                .id(user.getId().toString())
                .anonymousId("Student #" + generateAnonymousId(user.getId()))
                .isAnonymous(isAnonymized)
                .name(isAnonymized ? null : user.getName())
                .email(isAnonymized ? null : user.getEmail())
                .department(user.getDepartment())
                .build();

        AlertResponseDTO.AlertTriggerDTO trigger = AlertResponseDTO.AlertTriggerDTO.builder()
                .description(alert.getTriggerReason())
                .detectedAt(alert.getCreatedAt())
                .severity(alert.getAlertType().getSeverity())
                .pattern(alert.getTriggerReason().contains("mood") ? "MOOD_DECLINE" : "PERSISTENT_LOW_MOOD")
                .daysPersisting(7)
                .build();

        long responseTimeRemaining = 0;
        if (alert.getAlertType() == AlertType.RED && alert.getStatus() == AlertStatus.ACTIVE) {
            long secondsSinceCreated = java.time.Duration.between(alert.getCreatedAt(), LocalDateTime.now()).getSeconds();
            responseTimeRemaining = Math.max(0, 7200 - secondsSinceCreated);
        }

        AlertResponseDTO.RiskIndicatorsDTO riskIndicators = AlertResponseDTO.RiskIndicatorsDTO.builder()
                .burnoutScore(alert.getBurnoutScore().doubleValue())
                .currentRiskLevel(alert.getRiskLevel())
                .moodTrend("declining")
                .energyTrend("stable")
                .stressLevel(alert.getAlertType() == AlertType.RED ? 8 : 6)
                .sleepQuality(alert.getAlertType() == AlertType.RED ? 3 : 5)
                .avgSleepHours(alert.getAlertType() == AlertType.RED ? 5.4 : 6.5)
                .checkInStreak(3)
                .build();

        return AlertResponseDTO.builder()
                .id(alert.getId())
                .student(studentInfo)
                .tier(alert.getAlertType().name()) // Fix for frontend RiskBadge crash
                .alertType(alert.getAlertType().name())
                .status(alert.getStatus().name())
                .createdAt(alert.getCreatedAt())
                .resolvedAt(alert.getResolvedAt())
                .triggers(List.of(trigger))
                .actions(List.of()) // Provide empty list instead of null to prevent frontend array crashes
                .notes(List.of())   // Provide empty list instead of null
                .riskIndicators(riskIndicators)
                .counselorNote(alert.getCounselorNote())
                .responseTimeRemaining(responseTimeRemaining)
                .build();
    }

    public AlertType determineAlertType(java.math.BigDecimal score, String reason) {
        double scoreValue = score.doubleValue();
        String lowerReason = reason != null ? reason.toLowerCase() : "";
        if (scoreValue >= 85 || lowerReason.contains("crisis") || lowerReason.contains("urgent")) return AlertType.RED;
        if (scoreValue >= 75 && (lowerReason.contains("negative") || lowerReason.contains("decline"))) return AlertType.ORANGE;
        return AlertType.YELLOW;
    }

    public String determineRiskLevel(java.math.BigDecimal score) {
        double scoreValue = score.doubleValue();
        if (scoreValue >= 75) return "HIGH";
        if (scoreValue >= 50) return "MEDIUM";
        return "LOW";
    }

    public String appendNote(String existingNotes, String newNote) {
        if (existingNotes == null || existingNotes.isBlank()) return newNote;
        return existingNotes + "\n---\n" + newNote;
    }

    private String generateAnonymousId(UUID userId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(userId.toString().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                String hex = Integer.toHexString(0xff & hash[i]);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            return userId.toString().substring(0, 8).toUpperCase();
        }
    }
}
