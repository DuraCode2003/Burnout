package com.burnouttracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalateAlertRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Escalation reason is required")
    private String reason;
    
    private String priority;
}
