package com.burnouttracker.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "breathing_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BreathingSession {

    @Id
    @Column(columnDefinition = "UUID")
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String exerciseName;

    @Column(nullable = false)
    private Integer duration;

    @Column(nullable = false)
    private Integer preStressLevel;

    @Column(nullable = false)
    private Integer postStressLevel;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
