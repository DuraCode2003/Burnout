package com.burnouttracker.dto.response.counselor;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Alert response DTO for counselor dashboard
 * Privacy-controlled: student identity only shown if anonymize_data = false
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private UUID id;
    private String tier;              // Matched to frontend "tier"
    private String alertType;           // Keep for backward compatibility
    private String alertTypeLabel;
    private String status;
    @JsonProperty("isUrgent")
    private boolean isUrgent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime contactedAt;
    private String counselorNote;
    private String timeAgo;
    private Long responseTimeRemaining; // in seconds

    private StudentInfoDTO student;
    private List<AlertTriggerDTO> triggers;
    private List<AlertActionDTO> actions;
    private List<CounselorNoteDTO> notes;
    private RiskIndicatorsDTO riskIndicators;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInfoDTO implements Serializable {
        private String id;
        private String anonymousId;
        @JsonProperty("isAnonymous")
        private boolean isAnonymous;
        private String name;
        private String email;
        private String department;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertActionDTO implements Serializable {
        private String id;
        private String actionType;
        private LocalDateTime timestamp;
        private String counselorId;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CounselorNoteDTO implements Serializable {
        private String id;
        private String content;
        private String counselorId;
        private String counselorName;
        private LocalDateTime timestamp;
        private boolean isPrivate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertTriggerDTO implements Serializable {
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
    public static class RiskIndicatorsDTO implements Serializable {
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
}
