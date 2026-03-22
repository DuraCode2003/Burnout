package com.burnouttracker.repository;

import com.burnouttracker.model.Alert;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Alert entity
 * Provides queries for counselor dashboard alert queue and history
 */
@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID>, JpaSpecificationExecutor<Alert> {

    /**
     * Find all alerts with a specific status, ordered by creation date descending
     */
    List<Alert> findByStatusOrderByCreatedAtDesc(AlertStatus status);

    /**
     * Find active alerts sorted by urgency (RED first, then ORANGE, then YELLOW)
     * Used for counselor alert queue display
     */
    @Query("""
        SELECT a FROM Alert a 
        WHERE a.status IN :statuses 
        ORDER BY 
          CASE a.alertType 
            WHEN 'RED' THEN 1 
            WHEN 'ORANGE' THEN 2 
            WHEN 'YELLOW' THEN 3 
          END ASC,
          a.createdAt DESC
    """)
    List<Alert> findByStatusInOrderByAlertTypeSeverityDescCreatedAtDesc(
        @Param("statuses") List<AlertStatus> statuses
    );

    /**
     * Find all alerts for a specific user (student)
     */
    List<Alert> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Find the single active alert for a user (if exists)
     */
    @Query("""
        SELECT a FROM Alert a 
        WHERE a.userId = :userId AND a.status = 'ACTIVE'
        ORDER BY a.createdAt DESC
    """)
    Optional<Alert> findActiveAlertByUserId(@Param("userId") UUID userId);

    /**
     * Count alerts by status
     */
    long countByStatus(AlertStatus status);

    /**
     * Count alerts by type and status
     */
    long countByAlertTypeAndStatus(AlertType type, AlertStatus status);

    /**
     * Find alerts resolved after a specific date (for "resolved today" count)
     */
    List<Alert> findByStatusAndResolvedAtAfter(AlertStatus status, LocalDateTime after);

    /**
     * Find resolved alerts with pagination for history view
     */
    @Query("""
        SELECT a FROM Alert a 
        WHERE a.status = 'RESOLVED' 
        ORDER BY a.resolvedAt DESC
    """)
    Page<Alert> findByStatusOrderByResolvedAtDesc(AlertStatus status, Pageable pageable);

    /**
     * Check if user has an active alert (prevent duplicate alerts)
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Alert a 
        WHERE a.userId = :userId AND a.status = 'ACTIVE'
    """)
    boolean existsActiveAlertForUser(@Param("userId") UUID userId);

    /**
     * Find the most recent YELLOW alert for a user (for 7-day cooldown check)
     */
    @Query("""
        SELECT a FROM Alert a 
        WHERE a.userId = :userId AND a.alertType = 'YELLOW'
        ORDER BY a.createdAt DESC
    """)
    Optional<Alert> findMostRecentYellowAlertByUserId(@Param("userId") UUID userId);

    /**
     * Count distinct users with active alerts (for stats)
     */
    @Query("""
        SELECT COUNT(DISTINCT a.userId) FROM Alert a 
        WHERE a.status = 'ACTIVE'
    """)
    long countDistinctUsersWithActiveAlerts();

    /**
     * Calculate average resolution time in hours for resolved alerts
     */
    @Query("""
        SELECT AVG(CAST(TIMESTAMPDIFF(HOUR, a.createdAt, a.resolvedAt) AS double)) 
        FROM Alert a 
        WHERE a.status = 'RESOLVED' AND a.resolvedAt IS NOT NULL
    """)
    Double getAverageResolutionHours();

    /**
     * Find alerts resolved in the last N days for stats
     */
    @Query("""
        SELECT a FROM Alert a 
        WHERE a.status = 'RESOLVED' 
        AND a.resolvedAt >= :since
        ORDER BY a.resolvedAt DESC
    """)
    List<Alert> findResolvedAlertsSince(@Param("since") LocalDateTime since, Pageable pageable);
}
