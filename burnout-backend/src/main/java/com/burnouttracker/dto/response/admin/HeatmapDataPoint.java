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
public class HeatmapDataPoint implements Serializable {

    private static final long serialVersionUID = 1L;

    private String department;
    private String week;
    private String weekLabel;
    private Double avgScore;
    private Integer studentCount;
}
