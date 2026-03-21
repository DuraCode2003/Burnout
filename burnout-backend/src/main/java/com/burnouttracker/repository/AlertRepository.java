package com.burnouttracker.repository;

import com.burnouttracker.model.Alert;
import com.burnouttracker.model.enums.AlertStatus;
import com.burnouttracker.model.enums.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    /**
     * Find all alerts with a specific status, ordered by creation date descending
     */
    List<Alert> findByStatusOrderByCreatedAtDesc(AlertStatus status);

    /**
     * Find alerts by type and status
     */
    List<Alert> findByAlertTypeAndStatus(AlertType type, AlertStatus status);

    /**
     * Find all alerts for a specific user
     */
    List<Alert> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Count alerts by status
     */
    long countByStatus(AlertStatus status);

    /**
     * Find active alerts by type with custom query for performance
     */
    @Query("SELECT a FROM Alert a WHERE a.alertType = :type AND a.status = 'ACTIVE' ORDER BY a.createdAt DESC")
    List<Alert> findActiveAlertsByType(@Param("type") AlertType type);

    /**
     * Find all active alerts ordered by urgency (RED first, then ORANGE, then YELLOW)
     */
    @Query("""
        SELECT a FROM Alert a 
        WHERE a.status = 'ACTIVE' 
        ORDER BY 
            CASE a.alertType 
                WHEN 'RED' THEN 0 
                WHEN 'ORANGE' THEN 1 
                WHEN 'YELLOW' THEN 2 
            END,
            a.createdAt DESC
    """)
    List<Alert> findAllActiveAlertsOrderedByUrgency();

    /**
     * Count active alerts by type
     */
    long countByAlertTypeAndStatus(AlertType type, AlertStatus status);

    /**
     * Find resolved alerts with pagination
     */
    @Query("SELECT a FROM Alert a WHERE a.status = 'RESOLVED' ORDER BY a.resolvedAt DESC")
    Page<Alert> findResolvedAlerts(Pageable pageable);

    /**
     * Count resolved alerts today
     */
    @Query("""
        SELECT COUNT(a) FROM Alert a 
        WHERE a.status = 'RESOLVED' 
        AND a.resolvedAt >= CURRENT_DATE
    """)
    long countResolvedToday();

    /**
     * Calculate average resolution time in hours
     */
    @Query("""
        SELECT AVG(CAST(TIMESTAMPDIFF(HOUR, a.createdAt, a.resolvedAt) AS double)) 
        FROM Alert a 
        WHERE a.status = 'RESOLVED' AND a.resolvedAt IS NOT NULL
    """)
    Double getAverageResolutionHours();

    /**
     * Check if user has an active alert
     */
    @Query("SELECT COUNT(a) > 0 FROM Alert a WHERE a.user.id = :userId AND a.status = 'ACTIVE'")
    boolean hasActiveAlert(@Param("userId") UUID userId);

    /**
     * Find alerts created in date range
     */
    @Query("""
        SELECT a FROM Alert a 
        WHERE a.createdAt BETWEEN :start AND :end 
        ORDER BY a.createdAt DESC
    """)
    List<Alert> findAlertsInDateRange(
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    /**
     * Count urgent active alerts (RED type)
     */
    @Query("SELECT COUNT(a) FROM Alert a WHERE a.alertType = 'RED' AND a.status = 'ACTIVE'")
    long countUrgentActiveAlerts();

    /**
     * Find alerts assigned to a specific counselor
     */
    @Query("SELECT a FROM Alert a WHERE a.counselorId = :counselorId AND a.status IN ('ACTIVE', 'ACKNOWLEDGED')")
    List<Alert> findByCounselorId(@Param("counselorId") UUID counselorId);
}
