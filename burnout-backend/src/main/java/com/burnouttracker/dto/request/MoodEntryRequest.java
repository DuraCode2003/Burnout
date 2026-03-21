package com.burnouttracker.dto.request;

import com.burnouttracker.model.enums.StressLevel;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoodEntryRequest {

    @NotNull(message = "Mood score is required")
    @Min(value = 1, message = "Mood score must be between 1 and 10")
    @Max(value = 10, message = "Mood score must be between 1 and 10")
    private Integer mood;

    @NotNull(message = "Stress level is required")
    private Integer stressLevel;

    @NotNull(message = "Sleep hours is required")
    @DecimalMin(value = "0.0", message = "Sleep hours must be between 0 and 24")
    @DecimalMax(value = "24.0", message = "Sleep hours must be between 0 and 24")
    private BigDecimal sleepHours;

    private String note;
}
