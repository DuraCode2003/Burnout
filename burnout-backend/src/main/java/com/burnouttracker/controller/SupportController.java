package com.burnouttracker.controller;

import com.burnouttracker.model.ChatMessage;
import com.burnouttracker.model.SupportSession;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.SenderType;
import com.burnouttracker.service.SupportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/request")
    public ResponseEntity<SupportSession> requestSupport(
            @AuthenticationPrincipal User user,
            @RequestBody SupportRequestDTO request) {
        return ResponseEntity.ok(supportService.requestSupport(user.getId(), request.getAlertId(), request.isAnonymous()));
    }

    @PostMapping("/join/{sessionId}")
    public ResponseEntity<SupportSession> joinSession(
            @AuthenticationPrincipal User user,
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(supportService.joinSession(sessionId, user.getId()));
    }

    @PostMapping("/reveal/{sessionId}")
    public ResponseEntity<SupportSession> revealIdentity(
            @AuthenticationPrincipal User user,
            @PathVariable UUID sessionId) {
        // In a real app, verify user owns the session
        return ResponseEntity.ok(supportService.revealIdentity(sessionId));
    }

    @GetMapping("/messages/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(supportService.getChatHistory(sessionId));
    }

    @PostMapping("/active/{alertId}")
    public ResponseEntity<SupportSession> initiateSession(
            @AuthenticationPrincipal User user,
            @PathVariable UUID alertId) {
        try {
            return ResponseEntity.ok(supportService.initiateSupport(alertId, user.getId()));
        } catch (IllegalStateException e) {
            // Session already exists — return the existing one
            SupportSession existing = supportService.getActiveSessionForAlert(alertId);
            return ResponseEntity.ok(existing);
        }
    }

    @GetMapping("/active/{alertId}")
    public ResponseEntity<SupportSession> getActiveSession(@PathVariable UUID alertId) {
        SupportSession session = supportService.getActiveSessionForAlert(alertId);
        // Return 204 No Content (not 404) when there's no active session.
        // This is expected behaviour, not an error — returning 404 causes axios to throw.
        return session != null ? ResponseEntity.ok(session) : ResponseEntity.noContent().build();
    }

    @PostMapping("/send/{sessionId}")
    public ResponseEntity<ChatMessage> sendMessage(
            @AuthenticationPrincipal User user,
            @PathVariable UUID sessionId,
            @RequestBody MessageRequestDTO request) {
        
        SenderType type = user.getRole().name().equals("COUNSELOR") ? SenderType.COUNSELOR : SenderType.STUDENT;
        return ResponseEntity.ok(supportService.sendMessage(sessionId, user.getId(), type, request.getContent()));
    }

    @Data
    public static class SupportRequestDTO {
        private UUID alertId;
        private boolean isAnonymous;
    }

    @Data
    public static class MessageRequestDTO {
        private String content;
    }
}
