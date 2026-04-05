package com.burnouttracker.service;

import com.burnouttracker.dto.request.CounselorAiSummaryRequest;
import com.burnouttracker.dto.response.counselor.CounselorAiSummaryResponse;
import com.burnouttracker.model.Alert;
import com.burnouttracker.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiCounselorService {

    private final RestTemplate restTemplate;
    private final AlertRepository alertRepository;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${ai.service.api-key}")
    private String internalApiKey;

    public CounselorAiSummaryResponse getSummaryForAlert(UUID alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElse(null);
        
        if (alert == null) {
            return CounselorAiSummaryResponse.builder()
                    .success(false)
                    .summary("Alert not found.")
                    .build();
        }

        try {
            CounselorAiSummaryRequest request = CounselorAiSummaryRequest.builder()
                    .alert_id(alert.getId().toString())
                    .student_id(alert.getUserId().toString())
                    .alert_type(alert.getAlertType().toString())
                    .trigger_reason(alert.getTriggerReason())
                    .burnout_score(alert.getBurnoutScore() != null ? alert.getBurnoutScore().doubleValue() : 0.0)
                    .recent_mood_avg(0.0) // Fallback since this is not in the entity yet
                    .build();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-Key", internalApiKey);

            HttpEntity<CounselorAiSummaryRequest> entity = new HttpEntity<>(request, headers);

            String url = aiServiceUrl + "/ai/agent/generate-summary";
            log.debug("Calling AI Service at: {}", url);

            return restTemplate.postForObject(url, entity, CounselorAiSummaryResponse.class);
        } catch (Exception e) {
            log.error("Failed to generate AI summary for alert {}: {}", alertId, e.getMessage());
            return CounselorAiSummaryResponse.builder()
                    .success(false)
                    .summary("AI service is currently unavailable. Please continue with manual triage.")
                    .build();
        }
    }

    public CounselorAiSummaryResponse getResolutionDraft(UUID alertId) {
        Alert alert = alertRepository.findById(alertId).orElse(null);
        if (alert == null) return CounselorAiSummaryResponse.builder().success(false).summary("Alert not found").build();

        try {
            CounselorAiSummaryRequest request = buildRequest(alert);
            HttpEntity<CounselorAiSummaryRequest> entity = new HttpEntity<>(request, getHeaders());
            String url = aiServiceUrl + "/ai/agent/draft-resolution";
            return restTemplate.postForObject(url, entity, CounselorAiSummaryResponse.class);
        } catch (Exception e) {
            log.error("Failed to draft resolution: {}", e.getMessage());
            return CounselorAiSummaryResponse.builder().success(false).summary("Drafting service unavailable").build();
        }
    }

    public CounselorAiSummaryResponse getEscalationReport(UUID alertId, String reason) {
        Alert alert = alertRepository.findById(alertId).orElse(null);
        if (alert == null) return CounselorAiSummaryResponse.builder().success(false).summary("Alert not found").build();

        try {
            com.burnouttracker.dto.request.GenerateEscalationRequest request = com.burnouttracker.dto.request.GenerateEscalationRequest.builder()
                    .alert_id(alert.getId().toString())
                    .student_id(alert.getUserId().toString())
                    .alert_type(alert.getAlertType().toString())
                    .trigger_reason(alert.getTriggerReason())
                    .burnout_score(alert.getBurnoutScore().doubleValue())
                    .recent_mood_avg(0.0)
                    .escalation_reason(reason)
                    .build();

            HttpEntity<com.burnouttracker.dto.request.GenerateEscalationRequest> entity = new HttpEntity<>(request, getHeaders());
            String url = aiServiceUrl + "/ai/agent/draft-escalation";
            return restTemplate.postForObject(url, entity, CounselorAiSummaryResponse.class);
        } catch (Exception e) {
            log.error("Failed to draft escalation: {}", e.getMessage());
            return CounselorAiSummaryResponse.builder().success(false).summary("Escalation draft unavailable").build();
        }
    }

    private CounselorAiSummaryRequest buildRequest(Alert alert) {
        return CounselorAiSummaryRequest.builder()
                .alert_id(alert.getId().toString())
                .student_id(alert.getUserId().toString())
                .alert_type(alert.getAlertType().toString())
                .trigger_reason(alert.getTriggerReason())
                .burnout_score(alert.getBurnoutScore().doubleValue())
                .recent_mood_avg(0.0)
                .build();
    }

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Internal-Key", internalApiKey);
        return headers;
    }
}
