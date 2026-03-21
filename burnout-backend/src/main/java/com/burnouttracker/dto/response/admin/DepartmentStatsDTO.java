package com.burnouttracker.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentStatsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String department;
    private Long studentCount;
    private Double avgBurnoutScore;
    private String riskLevel;
    private Double checkinRate;
    private String trend;
}
