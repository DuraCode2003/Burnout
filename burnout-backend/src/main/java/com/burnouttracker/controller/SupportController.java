package com.burnouttracker.controller;

import com.burnouttracker.dto.request.SupportRequestDto;
import com.burnouttracker.dto.response.counselor.AlertResponseDTO;
import com.burnouttracker.model.User;
import com.burnouttracker.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
public class SupportController {

    private final AlertService alertService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AlertResponseDTO> requestSupport(
            @RequestBody SupportRequestDto request,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        
        AlertResponseDTO alert = alertService.createManualAlert(
                user.getId(), 
                request.getReason(), 
                request.getUrgency()
        );
        
        return ResponseEntity.ok(alert);
    }
}
