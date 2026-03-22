package com.burnouttracker.dto.response.counselor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

/**
 * Resolution statistics for history page
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolutionStatsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Total number of resolved alerts in the period
     */
    private long totalResolved;

    /**
     * Count of resolved alerts by type
     * Keys: "RED", "ORANGE", "YELLOW"
     */
    private Map<String, Long> resolvedByType;

    /**
     * Average resolution time in hours
     */
    private double avgResolutionHours;

    /**
     * Fastest resolution time in hours
     */
    private double fastestResolutionHours;

    /**
     * Slowest resolution time in hours
     */
    private double slowestResolutionHours;
}
