package com.burnouttracker.repository;

import com.burnouttracker.model.BreathingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BreathingSessionRepository extends JpaRepository<BreathingSession, UUID> {
    List<BreathingSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
