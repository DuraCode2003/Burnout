package com.burnouttracker.dto.response;

import com.burnouttracker.model.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BurnoutScoreResponse {

    private UUID id;
    private BigDecimal score;
    private RiskLevel riskLevel;
    private String calculationMethod;
    private LocalDateTime createdAt;
}
