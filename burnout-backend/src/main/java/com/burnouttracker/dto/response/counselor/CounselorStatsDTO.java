package com.burnouttracker.dto.response.counselor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorStatsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private AlertQueueStatsDTO queue;
    private CounselorMetricsDTO metrics;
    private String lastUpdated;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertQueueStatsDTO {
        private Long total;
        private Long red;
        private Long orange;
        private Long yellow;
        private Long urgent;
        private Long assignedToMe;
        private Long unassigned;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CounselorMetricsDTO {
        private Long alertsResolved;
        private Double avgResponseTime;
        private Long studentsContacted;
        private Long escalationsMade;
        private Double responseTimeSLA;
    }
}
