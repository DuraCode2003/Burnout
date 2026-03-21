package com.burnouttracker.service;

import com.burnouttracker.dto.request.counselor.*;
import com.burnouttracker.dto.response.counselor.AlertResponseDTO;
import com.burnouttracker.dto.response.counselor.CounselorStatsDTO;
import com.burnouttracker.model.Alert;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import com.burnouttracker.repository.AlertRepository;
import com.burnouttracker.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    /**
     * Get all active alerts ordered by urgency
     */
    @Transactional(readOnly = true)
    public List<AlertResponseDTO> getActiveAlerts() {
        List<Alert> alerts = alertRepository.findAllActiveAlertsOrderedByUrgency();
        return alerts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get alert by ID with full details
     */
    @Transactional(readOnly = true)
    public AlertResponseDTO getAlertById(UUID id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + id));
        return convertToDTO(alert);
    }

    /**
     * Resolve an alert
     */
    @Transactional
    public AlertResponseDTO resolveAlert(UUID id, ResolveAlertRequest request) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + id));

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        
        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            String noteEntry = String.format("[%s] RESOLVED: %s\n", timestamp, request.getResolutionNotes());
            alert.setCounselorNote(appendNote(alert.getCounselorNote(), noteEntry));
        }

        Alert saved = alertRepository.save(alert);
        return convertToDTO(saved);
    }

    /**
     * Escalate an alert to senior counselor
     */
    @Transactional
    public AlertResponseDTO escalateAlert(UUID id, EscalateAlertRequest request) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + id));

        alert.setStatus(AlertStatus.ESCALATED);
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        String noteEntry = String.format("[%s] ESCALATED (%s): %s\n", 
                timestamp, request.getPriority(), request.getReason());
        alert.setCounselorNote(appendNote(alert.getCounselorNote(), noteEntry));

        Alert saved = alertRepository.save(alert);
        return convertToDTO(saved);
    }

    /**
     * Add a note to an alert
     */
    @Transactional
    public AlertResponseDTO addNote(UUID id, AddNoteRequest request) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + id));

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        String visibility = request.getIsInternal() != null && request.getIsInternal() ? "INTERNAL" : "VISIBLE";
        String noteEntry = String.format("[%s] NOTE (%s): %s\n", timestamp, visibility, request.getNote());
        alert.setCounselorNote(appendNote(alert.getCounselorNote(), noteEntry));

        Alert saved = alertRepository.save(alert);
        return convertToDTO(saved);
    }

    /**
     * Get counselor stats overview
     */
    @Transactional(readOnly = true)
    public CounselorStatsDTO getCounselorStats() {
        long totalActive = alertRepository.countByStatus(AlertStatus.ACTIVE);
        long redCount = alertRepository.countByAlertTypeAndStatus(AlertType.RED, AlertStatus.ACTIVE);
        long orangeCount = alertRepository.countByAlertTypeAndStatus(AlertType.ORANGE, AlertStatus.ACTIVE);
        long yellowCount = alertRepository.countByAlertTypeAndStatus(AlertType.YELLOW, AlertStatus.ACTIVE);
        long urgentCount = alertRepository.countUrgentActiveAlerts();
        long resolvedToday = alertRepository.countResolvedToday();
        Double avgResolutionHours = alertRepository.getAverageResolutionHours();

        CounselorStatsDTO.AlertQueueStatsDTO queueStats = CounselorStatsDTO.AlertQueueStatsDTO.builder()
                .total(totalActive)
                .red(redCount)
                .orange(orangeCount)
                .yellow(yellowCount)
                .urgent(urgentCount)
                .assignedToMe(0L)
                .unassigned(totalActive)
                .build();

        CounselorStatsDTO.CounselorMetricsDTO metrics = CounselorStatsDTO.CounselorMetricsDTO.builder()
                .alertsResolved(resolvedToday)
                .avgResponseTime(avgResolutionHours != null ? avgResolutionHours : 0.0)
                .studentsContacted(0L)
                .escalationsMade(0L)
                .responseTimeSLA(100.0)
                .build();

        return CounselorStatsDTO.builder()
                .queue(queueStats)
                .metrics(metrics)
                .lastUpdated(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    /**
     * Get resolved alerts with pagination
     */
    @Transactional(readOnly = true)
    public Page<AlertResponseDTO> getResolvedAlerts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Alert> resolvedPage = alertRepository.findResolvedAlerts(pageable);
        return resolvedPage.map(this::convertToDTO);
    }

    /**
     * Log that counselor contacted the student
     */
    @Transactional
    public AlertResponseDTO logContact(UUID id, ContactStudentRequest request) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + id));

        alert.setContactedAt(LocalDateTime.now());
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        String noteEntry = String.format("[%s] CONTACT (%s): %s\n", 
                timestamp, 
                request.getContactMethod(),
                request.getNotes() != null ? request.getNotes() : "No notes");
        alert.setCounselorNote(appendNote(alert.getCounselorNote(), noteEntry));

        Alert saved = alertRepository.save(alert);
        return convertToDTO(saved);
    }

    /**
     * Acknowledge/claim an alert
     */
    @Transactional
    public AlertResponseDTO claimAlert(UUID id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found: " + id));

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User counselor = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new EntityNotFoundException("Counselor not found"));

        alert.setCounselorId(counselor.getId());
        alert.setStatus(AlertStatus.ACKNOWLEDGED);

        Alert saved = alertRepository.save(alert);
        return convertToDTO(saved);
    }

    /**
     * Create an alert automatically from burnout assessment
     */
    @Transactional
    public Alert createAlert(User user, BigDecimal burnoutScore, String triggerReason) {
        // Don't create if user already has an active alert
        if (alertRepository.hasActiveAlert(user.getId())) {
            return null;
        }

        AlertType alertType = determineAlertType(burnoutScore, triggerReason);
        String riskLevel = determineRiskLevel(burnoutScore);

        Alert alert = Alert.builder()
                .user(user)
                .alertType(alertType)
                .status(AlertStatus.ACTIVE)
                .triggerReason(triggerReason)
                .burnoutScore(burnoutScore)
                .riskLevel(riskLevel)
                .build();

        return alertRepository.save(alert);
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    private AlertResponseDTO convertToDTO(Alert alert) {
        User user = alert.getUser();
        boolean anonymizeData = user.getConsentRecord() != null && 
                Boolean.TRUE.equals(user.getConsentRecord().getAnonymizeData());
        
        return AlertResponseDTO.fromEntity(alert, user, anonymizeData);
    }

    private AlertType determineAlertType(BigDecimal score, String reason) {
        double scoreValue = score.doubleValue();
        String lowerReason = reason != null ? reason.toLowerCase() : "";

        // RED: Score 85+ OR crisis keywords
        if (scoreValue >= 85 || lowerReason.contains("crisis") || lowerReason.contains("urgent")) {
            return AlertType.RED;
        }

        // ORANGE: Score 75-84 + negative sentiment
        if (scoreValue >= 75 && (lowerReason.contains("negative") || lowerReason.contains("decline"))) {
            return AlertType.ORANGE;
        }

        // YELLOW: Score 60-74 + 3 consecutive days declining
        if (scoreValue >= 60) {
            return AlertType.YELLOW;
        }

        return AlertType.YELLOW;
    }

    private String determineRiskLevel(BigDecimal score) {
        double scoreValue = score.doubleValue();
        if (scoreValue >= 75) return "HIGH";
        if (scoreValue >= 50) return "MEDIUM";
        return "LOW";
    }

    private String appendNote(String existingNotes, String newNote) {
        if (existingNotes == null || existingNotes.isBlank()) {
            return newNote;
        }
        return existingNotes + newNote;
    }
}
