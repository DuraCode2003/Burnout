package com.burnouttracker.dto.request.counselor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalateAlertRequest {

    @NotBlank(message = "Escalation reason is required")
    private String reason;

    @NotNull(message = "Priority is required")
    private String priority; // "HIGH" or "URGENT"
}
