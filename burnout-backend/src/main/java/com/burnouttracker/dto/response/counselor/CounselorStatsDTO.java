package com.burnouttracker.dto.response.counselor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Counselor dashboard statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorStatsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private AlertQueueStats queue;
    private CounselorMetrics metrics;
    private long totalStudentsMonitored;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertQueueStats implements Serializable {
        private long total;
        private long red;
        private long orange;
        private long yellow;
        private long urgent;
        private long assignedToMe;
        private long unassigned;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CounselorMetrics implements Serializable {
        private long alertsResolved;
        private double avgResponseTime;
        private long studentsContacted;
        private long escalationsMade;
    }
}
