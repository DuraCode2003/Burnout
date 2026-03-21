package com.burnouttracker.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyTrendDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String weekLabel;
    private Double avgBurnoutScore;
    private Double avgMoodScore;
    private Double avgSleepHours;
    private Long checkinCount;
}
