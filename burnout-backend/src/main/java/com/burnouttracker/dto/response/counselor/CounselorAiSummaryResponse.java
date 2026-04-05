package com.burnouttracker.dto.response.counselor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounselorAiSummaryResponse {
    private boolean success;
    private String summary;
}
