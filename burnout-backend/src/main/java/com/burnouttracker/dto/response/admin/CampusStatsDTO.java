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
public class CampusStatsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long totalStudents;
    private Long activeThisWeek;
    private Double checkinRatePercent;
    private Double avgBurnoutScore;
    private Double avgMoodScore;
    private Double avgSleepHours;
    private Long highRiskCount;
    private Long mediumRiskCount;
    private Long lowRiskCount;
    private Double trendVsLastWeek;
}
