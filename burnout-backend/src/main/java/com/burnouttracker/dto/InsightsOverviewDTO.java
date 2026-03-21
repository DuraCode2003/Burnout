package com.burnouttracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightsOverviewDTO {
    private Integer avgBurnoutScore;
    private Integer burnoutChange;
    private Integer checkInStreak;
    private Integer streakChange;
    private Integer totalCheckIns;
    
    private List<MoodTrendDTO> moodTrend;
    private List<SleepDataDTO> sleepData;
    private StressDistributionDTO stressDistribution;
    
    private DayInsightDTO bestDay;
    private DayInsightDTO worstDay;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoodTrendDTO {
        private String date;
        private String dayLabel;
        private Integer mood;
        private Integer burnoutScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SleepDataDTO {
        private String date;
        private String dayLabel;
        private Double hours;
        private String quality;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StressDistributionDTO {
        private Integer low;
        private Integer medium;
        private Integer high;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayInsightDTO {
        private String date;
        private Integer mood;
        private Double sleepHours;
        private Integer stressLevel;
        private String notes;
    }
}
