package com.burnouttracker.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateEscalationRequest {
    private String alert_id;
    private String student_id;
    private String alert_type;
    private String trigger_reason;
    private double burnout_score;
    private double recent_mood_avg;
    private String escalation_reason;
}
