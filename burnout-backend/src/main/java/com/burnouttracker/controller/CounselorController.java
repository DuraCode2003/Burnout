package com.burnouttracker.controller;

import com.burnouttracker.dto.request.counselor.*;
import com.burnouttracker.dto.response.counselor.AlertResponseDTO;
import com.burnouttracker.dto.response.counselor.CounselorStatsDTO;
import com.burnouttracker.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/counselor")
@PreAuthorize("hasRole('COUNSELOR')")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CounselorController {

    private final AlertService alertService;

    public CounselorController(AlertService alertService) {
        this.alertService = alertService;
    }

    /**
     * GET /api/counselor/alerts
     * Returns all active alerts ordered by urgency (RED first)
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<AlertResponseDTO>> getActiveAlerts() {
        List<AlertResponseDTO> alerts = alertService.getActiveAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * GET /api/counselor/alerts/{id}
     * Returns full alert details
     */
    @GetMapping("/alerts/{id}")
    public ResponseEntity<AlertResponseDTO> getAlertById(@PathVariable UUID id) {
        AlertResponseDTO alert = alertService.getAlertById(id);
        return ResponseEntity.ok(alert);
    }

    /**
     * PUT /api/counselor/alerts/{id}/resolve
     * Mark alert as resolved
     */
    @PutMapping("/alerts/{id}/resolve")
    public ResponseEntity<AlertResponseDTO> resolveAlert(
            @PathVariable UUID id,
            @RequestBody(required = false) @Valid ResolveAlertRequest request) {
        
        ResolveAlertRequest req = request != null ? request : new ResolveAlertRequest();
        AlertResponseDTO alert = alertService.resolveAlert(id, req);
        return ResponseEntity.ok(alert);
    }

    /**
     * PUT /api/counselor/alerts/{id}/escalate
     * Escalate alert to senior counselor
     */
    @PutMapping("/alerts/{id}/escalate")
    public ResponseEntity<AlertResponseDTO> escalateAlert(
            @PathVariable UUID id,
            @RequestBody @Valid EscalateAlertRequest request) {
        
        AlertResponseDTO alert = alertService.escalateAlert(id, request);
        return ResponseEntity.ok(alert);
    }

    /**
     * POST /api/counselor/alerts/{id}/note
     * Add counselor note to alert
     */
    @PostMapping("/alerts/{id}/note")
    public ResponseEntity<AlertResponseDTO> addNote(
            @PathVariable UUID id,
            @RequestBody @Valid AddNoteRequest request) {
        
        AlertResponseDTO alert = alertService.addNote(id, request);
        return ResponseEntity.ok(alert);
    }

    /**
     * POST /api/counselor/alerts/{id}/contact
     * Log that counselor contacted the student
     */
    @PostMapping("/alerts/{id}/contact")
    public ResponseEntity<AlertResponseDTO> logContact(
            @PathVariable UUID id,
            @RequestBody @Valid ContactStudentRequest request) {
        
        AlertResponseDTO alert = alertService.logContact(id, request);
        return ResponseEntity.ok(alert);
    }

    /**
     * POST /api/counselor/alerts/{id}/claim
     * Claim/assign alert to current counselor
     */
    @PostMapping("/alerts/{id}/claim")
    public ResponseEntity<AlertResponseDTO> claimAlert(@PathVariable UUID id) {
        AlertResponseDTO alert = alertService.claimAlert(id);
        return ResponseEntity.ok(alert);
    }

    /**
     * GET /api/counselor/stats
     * Returns counselor overview statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<CounselorStatsDTO> getCounselorStats() {
        CounselorStatsDTO stats = alertService.getCounselorStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/counselor/resolved
     * Returns resolved alerts with pagination
     */
    @GetMapping("/resolved")
    public ResponseEntity<Page<AlertResponseDTO>> getResolvedAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<AlertResponseDTO> alerts = alertService.getResolvedAlerts(page, size);
        return ResponseEntity.ok(alerts);
    }

    /**
     * GET /api/counselor/crisis-resources
     * Returns crisis resources for display to students
     */
    @GetMapping("/crisis-resources")
    public ResponseEntity<CrisisResourcesDTO> getCrisisResources() {
        CrisisResourcesDTO resources = getCrisisResourcesDTO();
        return ResponseEntity.ok(resources);
    }

    /**
     * GET /api/counselor/message-templates
     * Returns available message templates for check-ins
     */
    @GetMapping("/message-templates")
    public ResponseEntity<List<MessageTemplateDTO>> getMessageTemplates() {
        List<MessageTemplateDTO> templates = getMessageTemplatesDTO();
        return ResponseEntity.ok(templates);
    }

    // ========================================================================
    // Helper Methods for Static Data
    // ========================================================================

    private CrisisResourcesDTO getCrisisResourcesDTO() {
        return CrisisResourcesDTO.builder()
                .national(List.of(
                        CrisisResourcesDTO.CrisisResourceDTO.builder()
                                .id("1")
                                .name("National Suicide Prevention Lifeline")
                                .type("HOTLINE")
                                .phone("988")
                                .description("24/7 crisis support and suicide prevention")
                                .available24_7(true)
                                .languages(List.of("English", "Spanish"))
                                .build(),
                        CrisisResourcesDTO.CrisisResourceDTO.builder()
                                .id("2")
                                .name("Crisis Text Line")
                                .type("CHAT")
                                .url("https://www.crisistextline.org")
                                .description("Text HOME to 741741 for free crisis counseling")
                                .available24_7(true)
                                .languages(List.of("English", "Spanish"))
                                .build()
                ))
                .campus(List.of(
                        CrisisResourcesDTO.CrisisResourceDTO.builder()
                                .id("3")
                                .name("University Counseling Center")
                                .type("IN_PERSON")
                                .phone("(555) 123-4567")
                                .description("Free confidential counseling for students")
                                .available24_7(false)
                                .languages(List.of("English"))
                                .build()
                ))
                .online(List.of(
                        CrisisResourcesDTO.CrisisResourceDTO.builder()
                                .id("4")
                                .name("Talkspace")
                                .type("ONLINE")
                                .url("https://www.talkspace.com")
                                .description("Online therapy and counseling")
                                .available24_7(true)
                                .languages(List.of("English"))
                                .build()
                ))
                .build();
    }

    private List<MessageTemplateDTO> getMessageTemplatesDTO() {
        return List.of(
                MessageTemplateDTO.builder()
                        .id("1")
                        .name("Gentle Check-in")
                        .subject("Thinking of you")
                        .body("Hi there, I noticed you've been going through a tough time lately. I wanted to check in and see how you're doing. Remember, you're not alone and support is available whenever you're ready.")
                        .tier("YELLOW")
                        .build(),
                MessageTemplateDTO.builder()
                        .id("2")
                        .name("Supportive Outreach")
                        .subject("Here for you")
                        .body("Hello, I'm reaching out because I care about your wellbeing. I've noticed some patterns that suggest you might be struggling. Would you be open to having a conversation? I'm here to listen and support you.")
                        .tier("ORANGE")
                        .build(),
                MessageTemplateDTO.builder()
                        .id("3")
                        .name("Urgent Support")
                        .subject("Immediate support available")
                        .body("Hi, I'm reaching out because I'm concerned about your wellbeing. It's important that we talk soon. Please know that support is available right now. You can reach the crisis line at 988 or come to the counseling center. I'm here for you.")
                        .tier("RED")
                        .build()
        );
    }

    // ========================================================================
    // Inner DTO Classes for Response
    // ========================================================================

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class CrisisResourcesDTO {
        private List<CrisisResourceDTO> national;
        private List<CrisisResourceDTO> campus;
        private List<CrisisResourceDTO> online;

        @lombok.Data
        @lombok.Builder
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class CrisisResourceDTO {
            private String id;
            private String name;
            private String type;
            private String phone;
            private String url;
            private String description;
            private boolean available24_7;
            private List<String> languages;
        }
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MessageTemplateDTO {
        private String id;
        private String name;
        private String subject;
        private String body;
        private String tier;
    }
}
