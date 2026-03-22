package com.burnouttracker.dto.request.counselor;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}
