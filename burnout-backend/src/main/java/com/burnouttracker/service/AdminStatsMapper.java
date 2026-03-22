package com.burnouttracker.service;

import com.burnouttracker.dto.response.admin.DepartmentStatsDTO;
import com.burnouttracker.dto.response.admin.WeeklyTrendDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class AdminStatsMapper {

    private static final DateTimeFormatter WEEK_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d");

    public DepartmentStatsDTO mapToDepartmentStatsDTO(Object[] row) {
        String department = row[0] != null ? row[0].toString() : "Unassigned";
        Long studentCount = ((Number) row[1]).longValue();
        Double avgBurnout = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
        Long highRisk = ((Number) row[3]).longValue();
        Long mediumRisk = ((Number) row[4]).longValue();
        Long lowRisk = ((Number) row[5]).longValue();
        Long activeCount = row[6] != null ? ((Number) row[6]).longValue() : 0L;

        String dominantRisk = determineDominantRisk(highRisk, mediumRisk, lowRisk);
        double checkinRate = studentCount > 0 ? round((activeCount * 100.0) / studentCount, 2) : 0.0;
        String trend = determineTrend(avgBurnout);

        return DepartmentStatsDTO.builder()
                .department(department)
                .studentCount(studentCount)
                .avgBurnoutScore(round(avgBurnout, 2))
                .riskLevel(dominantRisk)
                .checkinRate(checkinRate)
                .trend(trend)
                .build();
    }

    public WeeklyTrendDTO mapToWeeklyTrendDTO(LocalDate weekStart, LocalDate weekEnd, Double avgScore) {
        return WeeklyTrendDTO.builder()
                .weekLabel(weekStart.format(WEEK_LABEL_FORMATTER) + " - " + weekEnd.format(WEEK_LABEL_FORMATTER))
                .avgBurnoutScore(round(avgScore, 2))
                .build();
    }

    private String determineDominantRisk(Long high, Long medium, Long low) {
        if (high > 0 && high >= medium && high >= low) return "HIGH";
        if (medium > 0 && medium >= low) return "MEDIUM";
        return "LOW";
    }

    private String determineTrend(Double score) {
        if (score > 75) return "up";
        if (score < 40) return "down";
        return "stable";
    }

    public double round(double value, int places) {
        if (places < 0) throw new IllegalArgumentException();
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
