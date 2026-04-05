package com.burnouttracker.model;

import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Alert entity for counselor dashboard
 * Tracks student burnout risk alerts with privacy-preserving student references
 */
@Entity
@Table(name = "alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Alert {

    @Id
    @Column(columnDefinition = "UUID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    /**
     * Student user ID (not a @ManyToOne join to keep queries simple)
     * Student identity is shown based on consent.anonymize_data setting
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    /**
     * Alert severity tier
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 10)
    private AlertType alertType;

    /**
     * Alert lifecycle status
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private AlertStatus status = AlertStatus.ACTIVE;

    /**
     * Plain English explanation of what triggered this alert
     */
    @Column(name = "trigger_reason", nullable = false, columnDefinition = "TEXT")
    private String triggerReason;

    /**
     * Burnout score at time of alert creation
     */
    @Column(name = "burnout_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal burnoutScore;

    /**
     * Risk level at time of alert: LOW, MEDIUM, HIGH, CRITICAL
     */
    @Column(name = "risk_level", nullable = false, length = 10)
    private String riskLevel;

    /**
     * Assigned counselor (NULL until acknowledged)
     */
    @Column(name = "counselor_id")
    private UUID counselorId;

    /**
     * Chronological log of counselor actions and internal notes
     * Student never sees this content
     */
    @Column(name = "counselor_note", columnDefinition = "TEXT")
    private String counselorNote;

    /**
     * Timestamp when counselor contacted the student
     */
    @Column(name = "contacted_at")
    private LocalDateTime contactedAt;

    /**
     * Timestamp when alert was resolved
     */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    /**
     * Alert creation timestamp
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Last update timestamp (auto-updated by trigger)
     */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Whether the student has explicitly requested human support
     */
    @Column(name = "support_requested")
    @Builder.Default
    private Boolean supportRequested = false;

    /**
     * Check if this alert is urgent (RED type)
     */
    public boolean isUrgent() {
        return alertType == AlertType.RED;
    }

    /**
     * Check if alert requires response within 2 hours
     */
    public boolean requiresUrgentResponse() {
        return alertType == AlertType.RED && status == AlertStatus.ACTIVE;
    }

    /**
     * Check if alert is in terminal state (no more actions needed)
     */
    public boolean isTerminal() {
        return status.isTerminal();
    }
}
