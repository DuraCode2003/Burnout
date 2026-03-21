package com.burnouttracker.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskDistributionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long high;
    private Long medium;
    private Long low;
    private Double highPercent;
    private Double mediumPercent;
    private Double lowPercent;
    private List<WeeklyRiskHistoryDTO> weeklyHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyRiskHistoryDTO implements Serializable {
        private static final long serialVersionUID = 1L;
        private String week;
        private Long high;
        private Long medium;
        private Long low;
    }
}
