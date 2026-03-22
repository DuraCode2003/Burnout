package com.burnouttracker.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Alert severity tiers for counselor dashboard
 */
@Getter
@AllArgsConstructor
public enum AlertType {
    YELLOW(1, "Monitor", "Sub-baseline mood/energy detected. Automated breathing exercise suggested."),
    ORANGE(2, "Priority", "Consistent downward trend with negative sentiment. Counselor check-in recommended."),
    RED(3, "Urgent", "High risk indicators or crisis keywords. Immediate attention required.");

    private final int severity;
    private final String label;
    private final String description;

    /**
     * Check if this alert type requires urgent response (within 2 hours)
     */
    public boolean isUrgent() {
        return this == RED;
    }
}
