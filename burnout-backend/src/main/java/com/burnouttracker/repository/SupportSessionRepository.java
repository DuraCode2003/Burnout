package com.burnouttracker.repository;

import com.burnouttracker.model.SupportSession;
import com.burnouttracker.model.enums.SupportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupportSessionRepository extends JpaRepository<SupportSession, UUID> {
    Optional<SupportSession> findByAlertIdAndStatusIn(UUID alertId, java.util.List<SupportStatus> statuses);
    Optional<SupportSession> findByStudentIdAndStatusIn(UUID studentId, java.util.List<SupportStatus> statuses);
}
