package com.burnouttracker.model.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Alert lifecycle status
 */
@Getter
@AllArgsConstructor
public enum AlertStatus {
    ACTIVE("Active"),
    ACKNOWLEDGED("Acknowledged"),
    RESOLVED("Resolved"),
    ESCALATED("Escalated");

    private final String displayLabel;

    /**
     * Check if this status is terminal (no further actions needed)
     */
    public boolean isTerminal() {
        return this == RESOLVED || this == ESCALATED;
    }
}
