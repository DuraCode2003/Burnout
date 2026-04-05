package com.burnouttracker.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "daily_tips")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTip {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false)
    private String category;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "display_date")
    private java.time.LocalDate displayDate;
}
