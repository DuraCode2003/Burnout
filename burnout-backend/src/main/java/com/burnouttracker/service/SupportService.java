package com.burnouttracker.service;

import com.burnouttracker.model.Alert;
import com.burnouttracker.model.ChatMessage;
import com.burnouttracker.model.SupportSession;
import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.SenderType;
import com.burnouttracker.model.enums.SupportStatus;
import com.burnouttracker.repository.AlertRepository;
import com.burnouttracker.repository.ChatMessageRepository;
import com.burnouttracker.repository.SupportSessionRepository;
import com.burnouttracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SupportService {

    private final SupportSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public SupportSession requestSupport(UUID userId, UUID alertId, boolean isAnonymous) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check for existing active session
        sessionRepository.findByAlertIdAndStatusIn(alertId, List.of(SupportStatus.PENDING, SupportStatus.ACTIVE))
                .ifPresent(s -> { throw new IllegalStateException("Support already requested for this alert"); });

        SupportSession session = SupportSession.builder()
                .student(user)
                .alert(alert)
                .isAnonymous(isAnonymous)
                .status(SupportStatus.PENDING)
                .build();

        alert.setSupportRequested(true);
        alertRepository.save(alert);

        SupportSession savedSession = sessionRepository.save(session);
        
        // Notify counselors on the real-time queue
        messagingTemplate.convertAndSend("/topic/counselor/alerts", "SUPPORT_REQUESTED:" + alertId);
        
        return savedSession;
    }

    @Transactional
    public SupportSession joinSession(UUID sessionId, UUID counselorId) {
        SupportSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        User counselor = userRepository.findById(counselorId)
                .orElseThrow(() -> new RuntimeException("Counselor not found"));

        session.setCounselor(counselor);
        session.setStatus(SupportStatus.ACTIVE);
        session.setStartedAt(LocalDateTime.now());

        SupportSession saved = sessionRepository.save(session);
        
        // Notify student that a counselor has joined
        sendSystemMessage(saved, "A counselor has joined the session. You are now connected.");
        
        return saved;
    }

    @Transactional
    public ChatMessage sendMessage(UUID sessionId, UUID senderId, SenderType senderType, String content) {
        SupportSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        ChatMessage message = ChatMessage.builder()
                .session(session)
                .senderId(senderId)
                .senderType(senderType)
                .content(content)
                .build();

        ChatMessage saved = messageRepository.save(message);
        
        // Broadcast message to session topic
        messagingTemplate.convertAndSend("/topic/support/" + sessionId, saved);
        
        return saved;
    }

    @Transactional
    public SupportSession revealIdentity(UUID sessionId) {
        SupportSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setIsAnonymous(false);
        SupportSession saved = sessionRepository.save(session);
        
        sendSystemMessage(saved, "Student has chosen to reveal their identity.");
        
        return saved;
    }

    private void sendSystemMessage(SupportSession session, String content) {
        ChatMessage systemMsg = ChatMessage.builder()
                .session(session)
                .senderId(UUID.fromString("00000000-0000-0000-0000-000000000000")) // System ID
                .senderType(SenderType.SYSTEM)
                .content(content)
                .build();
        
        ChatMessage saved = messageRepository.save(systemMsg);
        messagingTemplate.convertAndSend("/topic/support/" + session.getId(), saved);
    }

    public List<ChatMessage> getChatHistory(UUID sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }
    
    public SupportSession getActiveSessionForAlert(UUID alertId) {
        return sessionRepository.findByAlertIdAndStatusIn(alertId, List.of(SupportStatus.PENDING, SupportStatus.ACTIVE))
                .map(this::initializeSessionAssociations)
                .orElse(null);
    }

    private SupportSession initializeSessionAssociations(SupportSession session) {
        // Force initialization of lazy relationships for JSON serialization
        if (session.getStudent() != null) session.getStudent().getName();
        if (session.getCounselor() != null) session.getCounselor().getName();
        if (session.getAlert() != null) session.getAlert().getRiskLevel();
        return session;
    }

    @Transactional
    public SupportSession initiateSupport(UUID alertId, UUID counselorId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        User counselor = userRepository.findById(counselorId)
                .orElseThrow(() -> new RuntimeException("Counselor not found"));

        // Check for existing active/pending session
        sessionRepository.findByAlertIdAndStatusIn(alertId, List.of(SupportStatus.PENDING, SupportStatus.ACTIVE))
                .ifPresent(s -> { throw new IllegalStateException("A support session already exists for this alert"); });

        // Look up the student from the alert's userId
        User student = userRepository.findById(alert.getUserId())
                .orElseThrow(() -> new RuntimeException("Student not found for alert"));

        // Create an ACTIVE session immediately (counselor-initiated)
        SupportSession session = SupportSession.builder()
                .student(student)
                .counselor(counselor)
                .alert(alert)
                .isAnonymous(false)
                .status(SupportStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .build();

        alert.setSupportRequested(true);
        alertRepository.save(alert);

        SupportSession saved = sessionRepository.save(session);
        initializeSessionAssociations(saved);

        // Welcome message
        sendSystemMessage(saved, "A counselor has started a live chat session with you. You can now chat securely.");

        // Notify counselor dashboard
        messagingTemplate.convertAndSend("/topic/counselor/alerts", "SUPPORT_INITIATED:" + alertId);

        log.info("Counselor {} initiated live chat for alert {}", counselorId, alertId);
        return saved;
    }
}
