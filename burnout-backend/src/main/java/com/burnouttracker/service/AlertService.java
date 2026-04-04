package com.burnouttracker.service;

import com.burnouttracker.dto.response.counselor.AlertResponseDTO;
import com.burnouttracker.dto.response.counselor.CounselorStatsDTO;
import com.burnouttracker.dto.response.counselor.ResolutionStatsDTO;
import com.burnouttracker.exception.ResourceNotFoundException;
import com.burnouttracker.model.Alert;
import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import com.burnouttracker.model.enums.RiskLevel;
import com.burnouttracker.repository.AlertRepository;
import com.burnouttracker.repository.BurnoutScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final BurnoutScoreRepository burnoutScoreRepository;
    private final AlertStatsHelper statsHelper;
    private final AlertSpecificationBuilder specBuilder;

    @Transactional(readOnly = true)
    public List<AlertResponseDTO> getActiveAlerts() {
        Specification<Alert> spec = specBuilder.buildDynamicQueueFilters(List.of(AlertStatus.ACTIVE), null, null);
        List<Alert> alerts = alertRepository.findAll(spec);
        return alerts.stream().map(statsHelper::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public Alert createAlert(User user, java.math.BigDecimal burnoutScore, String triggerReason) {
        if (!alertRepository.findByStatusInOrderByAlertTypeSeverityDescCreatedAtDesc(List.of(AlertStatus.ACTIVE))
                .stream().filter(a -> a.getUserId().equals(user.getId())).findAny().isEmpty()) {
            return null;
        }

        AlertType alertType = statsHelper.determineAlertType(burnoutScore, triggerReason);
        String riskLevel = statsHelper.determineRiskLevel(burnoutScore);

        Alert alert = Alert.builder()
                .userId(user.getId())
                .alertType(alertType)
                .status(AlertStatus.ACTIVE)
                .triggerReason(triggerReason)
                .burnoutScore(burnoutScore)
                .riskLevel(riskLevel)
                .build();

        return alertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public AlertResponseDTO getAlertById(UUID id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        return statsHelper.mapToDTO(alert);
    }

    @Transactional
    public AlertResponseDTO resolveAlert(UUID alertId, String note, UUID counselorId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + alertId));
        if (alert.getStatus().isTerminal()) throw new IllegalStateException("Alert is already resolved or escalated");
        
        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setCounselorId(counselorId);
        alert.setCounselorNote(statsHelper.appendNote(alert.getCounselorNote(), note));
        
        log.info("Alert {} resolved by counselor {}", alertId, counselorId);
        return statsHelper.mapToDTO(alertRepository.save(alert));
    }

    @Transactional
    public List<AlertResponseDTO> bulkResolveAlerts(List<UUID> alertIds, String note, UUID counselorId) {
        List<Alert> alerts = alertRepository.findAllById(alertIds).stream()
                .filter(alert -> !alert.getStatus().isTerminal())
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        alerts.forEach(alert -> {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedAt(now);
            alert.setCounselorId(counselorId);
            alert.setCounselorNote(statsHelper.appendNote(alert.getCounselorNote(), note));
            log.info("Alert {} bulk-resolved by counselor {}", alert.getId(), counselorId);
        });

        List<Alert> savedAlerts = alertRepository.saveAll(alerts);
        return savedAlerts.stream().map(statsHelper::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public AlertResponseDTO escalateAlert(UUID alertId, String reason, UUID counselorId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + alertId));
        if (alert.getStatus().isTerminal()) throw new IllegalStateException("Alert is already resolved or escalated");
        
        alert.setStatus(AlertStatus.ESCALATED);
        alert.setCounselorId(counselorId);
        String escalationNote = String.format("[%s] Alert escalated by counselor %s: %s", 
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), counselorId, reason);
        alert.setCounselorNote(statsHelper.appendNote(alert.getCounselorNote(), escalationNote));
        
        log.info("Alert {} escalated by counselor {}", alertId, counselorId);
        return statsHelper.mapToDTO(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponseDTO addNote(UUID alertId, String note) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + alertId));
        String timestampedNote = String.format("[%s] %s", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), note);
        alert.setCounselorNote(statsHelper.appendNote(alert.getCounselorNote(), timestampedNote));
        return statsHelper.mapToDTO(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponseDTO logContact(UUID alertId, String contactMethod) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + alertId));
        alert.setContactedAt(LocalDateTime.now());
        String contactNote = String.format("[%s] Counselor contacted student via %s", 
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), contactMethod);
        alert.setCounselorNote(statsHelper.appendNote(alert.getCounselorNote(), contactNote));
        return statsHelper.mapToDTO(alertRepository.save(alert));
    }

    @Transactional(readOnly = true)
    public CounselorStatsDTO getCounselorStats() {
        return statsHelper.buildStatsDTO();
    }

    @Transactional
    public AlertResponseDTO createManualAlert(UUID studentId, String reason, String urgency) {
        BurnoutScore recentScore = burnoutScoreRepository.findTopByUserIdOrderByCreatedAtDesc(studentId).orElse(null);
        java.math.BigDecimal score = recentScore != null ? recentScore.getScore() : java.math.BigDecimal.valueOf(50.0);
        String riskLevel = recentScore != null ? recentScore.getRiskLevel().name() : RiskLevel.MEDIUM.name();
        
        AlertType type = "HIGH".equalsIgnoreCase(urgency) ? AlertType.ORANGE : AlertType.YELLOW;
        String fullReason = "Student Requested Support: " + reason;

        Alert alert = Alert.builder()
                .userId(studentId)
                .alertType(type)
                .status(AlertStatus.ACTIVE)
                .triggerReason(fullReason)
                .burnoutScore(score)
                .riskLevel(riskLevel)
                .build();
                
        Alert savedAlert = alertRepository.save(alert);
        return statsHelper.mapToDTO(savedAlert);
    }

    @Transactional(readOnly = true)
    public Page<AlertResponseDTO> getResolvedAlerts(int page, int size) {
        return alertRepository.findByStatusOrderByResolvedAtDesc(AlertStatus.RESOLVED, PageRequest.of(page, size))
                .map(statsHelper::mapToDTO);
    }

    @Transactional(readOnly = true)
    public ResolutionStatsDTO getResolutionStats(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Alert> resolvedAlerts = alertRepository.findResolvedAlertsSince(since, PageRequest.of(0, 1000));
        long totalResolved = resolvedAlerts.size();
        
        Map<String, Long> resolvedByType = resolvedAlerts.stream()
                .collect(Collectors.groupingBy(a -> a.getAlertType().name(), Collectors.counting()));
                
        List<Double> resolutionHours = resolvedAlerts.stream()
                .filter(a -> a.getResolvedAt() != null && a.getCreatedAt() != null)
                .map(a -> (double) java.time.Duration.between(a.getCreatedAt(), a.getResolvedAt()).toHours())
                .sorted().toList();
                
        double avgHours = resolutionHours.isEmpty() ? 0.0 : 
                resolutionHours.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                
        return ResolutionStatsDTO.builder()
                .totalResolved(totalResolved)
                .resolvedByType(resolvedByType)
                .avgResolutionHours(avgHours)
                .fastestResolutionHours(resolutionHours.isEmpty() ? 0.0 : resolutionHours.get(0))
                .slowestResolutionHours(resolutionHours.isEmpty() ? 0.0 : resolutionHours.get(resolutionHours.size() - 1))
                .build();
    }
}
