package com.burnouttracker.dto.request;

import lombok.Data;

@Data
public class SupportRequestDto {
    private String reason;
    private String urgency; // e.g. "LOW", "MEDIUM", "HIGH"
}
