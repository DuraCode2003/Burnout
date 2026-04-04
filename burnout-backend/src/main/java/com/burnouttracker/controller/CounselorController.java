package com.burnouttracker.controller;

import com.burnouttracker.dto.request.ContactStudentRequest;
import com.burnouttracker.dto.request.EscalateAlertRequest;
import com.burnouttracker.dto.request.AddNoteRequest;
import com.burnouttracker.dto.request.BulkResolveRequest;
import com.burnouttracker.dto.request.ResolveAlertRequest;
import com.burnouttracker.dto.response.counselor.AlertResponseDTO;
import com.burnouttracker.dto.response.counselor.CounselorStatsDTO;
import com.burnouttracker.dto.response.counselor.ResolutionStatsDTO;
import com.burnouttracker.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/counselor")
@PreAuthorize("hasRole('COUNSELOR')")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CounselorController {

    private final AlertService alertService;

    @GetMapping("/alerts")
    public ResponseEntity<List<AlertResponseDTO>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    @GetMapping("/alerts/{id}")
    public ResponseEntity<AlertResponseDTO> getAlertById(@PathVariable UUID id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PutMapping("/alerts/{id}/resolve")
    public ResponseEntity<AlertResponseDTO> resolveAlert(@PathVariable UUID id, @RequestBody @Valid ResolveAlertRequest request) {
        return ResponseEntity.ok(alertService.resolveAlert(id, request.getResolutionNotes(), getCurrentCounselorId()));
    }

    @PutMapping("/alerts/bulk-resolve")
    public ResponseEntity<List<AlertResponseDTO>> bulkResolveAlerts(@RequestBody @Valid BulkResolveRequest request) {
        return ResponseEntity.ok(alertService.bulkResolveAlerts(request.getAlertIds(), request.getResolutionNotes(), getCurrentCounselorId()));
    }

    @PutMapping("/alerts/{id}/escalate")
    public ResponseEntity<AlertResponseDTO> escalateAlert(@PathVariable UUID id, @RequestBody @Valid EscalateAlertRequest request) {
        return ResponseEntity.ok(alertService.escalateAlert(id, request.getReason(), getCurrentCounselorId()));
    }

    @PostMapping("/alerts/{id}/note")
    public ResponseEntity<AlertResponseDTO> addNote(@PathVariable UUID id, @RequestBody @Valid AddNoteRequest request) {
        return ResponseEntity.ok(alertService.addNote(id, request.getNote()));
    }

    @PostMapping("/alerts/{id}/contact")
    public ResponseEntity<AlertResponseDTO> logContact(@PathVariable UUID id, @RequestBody @Valid ContactStudentRequest request) {
        return ResponseEntity.ok(alertService.logContact(id, request.getContactMethod()));
    }

    @GetMapping("/stats")
    public ResponseEntity<CounselorStatsDTO> getCounselorStats() {
        return ResponseEntity.ok(alertService.getCounselorStats());
    }

    @GetMapping("/resolved")
    public ResponseEntity<Page<AlertResponseDTO>> getResolvedAlerts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(alertService.getResolvedAlerts(page, size));
    }

    @GetMapping("/resolution-stats")
    public ResponseEntity<ResolutionStatsDTO> getResolutionStats(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(alertService.getResolutionStats(days));
    }

    private UUID getCurrentCounselorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            return UUID.fromString(auth.getName());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
