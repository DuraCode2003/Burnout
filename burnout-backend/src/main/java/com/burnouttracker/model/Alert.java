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

@Entity
@Table(name = "alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @Column(columnDefinition = "UUID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private AlertStatus status = AlertStatus.ACTIVE;

    @Column(name = "trigger_reason", length = 500)
    private String triggerReason;

    @Column(name = "burnout_score", precision = 5, scale = 2)
    private BigDecimal burnoutScore;

    @Column(name = "risk_level", length = 10)
    private String riskLevel;

    @Column(name = "counselor_id")
    private UUID counselorId;

    @Column(name = "counselor_note", columnDefinition = "TEXT")
    private String counselorNote;

    @Column(name = "contacted_at")
    private LocalDateTime contactedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Check if this alert is urgent (RED type or escalated)
     */
    public boolean isUrgent() {
        return alertType == AlertType.RED || status == AlertStatus.ESCALATED;
    }

    /**
     * Check if alert requires response within 2 hours (RED alerts)
     */
    public boolean requiresUrgentResponse() {
        return alertType == AlertType.RED && status == AlertStatus.ACTIVE;
    }
}
