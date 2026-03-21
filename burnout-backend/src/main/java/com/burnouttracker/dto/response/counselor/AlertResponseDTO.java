package com.burnouttracker.dto.response.counselor;

import com.burnouttracker.model.Alert;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponseDTO {

    private UUID id;
    private StudentInfoDTO student;
    private AlertType tier;
    private AlertStatus status;
    private List<AlertTriggerDTO> triggers;
    private RiskIndicatorsDTO riskIndicators;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID assignedTo;
    private String assignedToName;
    private List<CounselorNoteDTO> notes;
    private List<AlertActionDTO> actions;
    private boolean isUrgent;
    private Long responseTimeRemaining;

    /**
     * Convert Alert entity to DTO with privacy-preserving student info
     */
    public static AlertResponseDTO fromEntity(Alert alert, User user, boolean anonymizeData) {
        StudentInfoDTO studentInfo;
        
        if (anonymizeData) {
            // Privacy-first: generate anonymous ID
            String anonymousId = "Student #" + user.getId().toString()
                    .substring(0, 4)
                    .toUpperCase()
                    .replaceAll("-", "")
                    .substring(0, 4);
            
            studentInfo = StudentInfoDTO.builder()
                    .id(user.getId())
                    .anonymousId(anonymousId)
                    .isAnonymous(true)
                    .department(user.getDepartment())
                    .build();
        } else {
            // Student has consented to show identity
            studentInfo = StudentInfoDTO.builder()
                    .id(user.getId())
                    .anonymousId("Student #" + user.getId().toString()
                            .substring(0, 4)
                            .toUpperCase()
                            .replaceAll("-", "")
                            .substring(0, 4))
                    .isAnonymous(false)
                    .name(user.getName())
                    .email(user.getEmail())
                    .department(user.getDepartment())
                    .build();
        }

        return AlertResponseDTO.builder()
                .id(alert.getId())
                .student(studentInfo)
                .tier(alert.getAlertType())
                .status(alert.getStatus())
                .triggers(buildTriggers(alert))
                .riskIndicators(buildRiskIndicators(alert, user))
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .assignedTo(alert.getCounselorId())
                .isUrgent(alert.isUrgent())
                .responseTimeRemaining(calculateResponseTimeRemaining(alert))
                .notes(new ArrayList<>())
                .actions(new ArrayList<>())
                .build();
    }

    private static List<AlertTriggerDTO> buildTriggers(Alert alert) {
        List<AlertTriggerDTO> triggers = new ArrayList<>();
        
        if (alert.getTriggerReason() != null) {
            triggers.add(AlertTriggerDTO.builder()
                    .pattern(detectPatternFromReason(alert.getTriggerReason()))
                    .detectedAt(alert.getCreatedAt())
                    .severity(calculateSeverity(alert))
                    .description(alert.getTriggerReason())
                    .build());
        }
        
        return triggers;
    }

    private static String detectPatternFromReason(String reason) {
        String lowerReason = reason.toLowerCase();
        if (lowerReason.contains("mood") || lowerReason.contains("decline")) {
            return "MOOD_DECLINE";
        } else if (lowerReason.contains("crisis") || lowerReason.contains("urgent")) {
            return "CRISIS_KEYWORDS";
        } else if (lowerReason.contains("workload") || lowerReason.contains("stress")) {
            return "HIGH_WORKLOAD";
        } else if (lowerReason.contains("sleep")) {
            return "SLEEP_DISTURBANCE";
        } else if (lowerReason.contains("negative") || lowerReason.contains("sentiment")) {
            return "NEGATIVE_SENTIMENT";
        }
        return "PERSISTENT_LOW_MOOD";
    }

    private static int calculateSeverity(Alert alert) {
        if (alert.getAlertType() == AlertType.RED) return 9;
        if (alert.getAlertType() == AlertType.ORANGE) return 6;
        return 4;
    }

    private static RiskIndicatorsDTO buildRiskIndicators(Alert alert, User user) {
        return RiskIndicatorsDTO.builder()
                .currentRiskLevel(alert.getRiskLevel() != null ? alert.getRiskLevel() : "MEDIUM")
                .burnoutScore(alert.getBurnoutScore() != null ? alert.getBurnoutScore().doubleValue() : 50.0)
                .moodTrend("stable")
                .energyTrend("stable")
                .stressLevel(5)
                .sleepQuality(4)
                .avgSleepHours(6.5)
                .checkInStreak(3)
                .lastCheckIn(LocalDateTime.now().minusDays(1))
                .build();
    }

    private static Long calculateResponseTimeRemaining(Alert alert) {
        if (alert.getAlertType() != AlertType.RED || alert.getStatus() != AlertStatus.ACTIVE) {
            return null;
        }
        
        LocalDateTime createdAt = alert.getCreatedAt();
        LocalDateTime deadline = createdAt.plusHours(2);
        LocalDateTime now = LocalDateTime.now();
        
        long remainingSeconds = java.time.Duration.between(now, deadline).getSeconds();
        return remainingSeconds > 0 ? remainingSeconds : -1;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInfoDTO {
        private UUID id;
        private String anonymousId;
        private boolean isAnonymous;
        private String name;
        private String email;
        private String department;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertTriggerDTO {
        private String pattern;
        private LocalDateTime detectedAt;
        private int severity;
        private String description;
        private Integer daysPersisting;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskIndicatorsDTO {
        private String currentRiskLevel;
        private Double burnoutScore;
        private String moodTrend;
        private String energyTrend;
        private Integer stressLevel;
        private Integer sleepQuality;
        private Double avgSleepHours;
        private Integer checkInStreak;
        private LocalDateTime lastCheckIn;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CounselorNoteDTO {
        private UUID id;
        private UUID counselorId;
        private String counselorName;
        private String content;
        private boolean isInternal;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertActionDTO {
        private UUID id;
        private String actionType;
        private UUID performedBy;
        private String performedByName;
        private LocalDateTime timestamp;
        private String notes;
    }
}
