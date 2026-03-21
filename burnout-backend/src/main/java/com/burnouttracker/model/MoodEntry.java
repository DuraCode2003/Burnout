package com.burnouttracker.model;

import com.burnouttracker.model.enums.StressLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "mood_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoodEntry {

    @Id
    @Column(columnDefinition = "UUID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer moodScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StressLevel stressLevel;

    @Column(nullable = false, precision = 4, scale = 1)
    private BigDecimal sleepHours;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(precision = 4, scale = 3)
    private BigDecimal sentimentScore;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;
}
