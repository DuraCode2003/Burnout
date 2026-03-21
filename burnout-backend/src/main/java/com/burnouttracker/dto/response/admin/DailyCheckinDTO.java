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
public class DailyCheckinDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String date;
    private Long checkinCount;
    private Double participationPercent;
}
