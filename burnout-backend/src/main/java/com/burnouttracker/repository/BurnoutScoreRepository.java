package com.burnouttracker.repository;

import com.burnouttracker.model.BurnoutScore;
import com.burnouttracker.model.enums.RiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BurnoutScoreRepository extends JpaRepository<BurnoutScore, UUID> {

    Optional<BurnoutScore> findTopByUserIdOrderByCreatedAtDesc(UUID userId);

    List<BurnoutScore> findTop5ByUserIdOrderByCreatedAtDesc(UUID userId);

    List<BurnoutScore> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<BurnoutScore> findByUserIdAndCreatedAtBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    List<BurnoutScore> findByRiskLevel(RiskLevel riskLevel);

    @Query("""
        SELECT b.score, b.riskLevel
        FROM BurnoutScore b
        WHERE b.id IN (
            SELECT MAX(b2.id)
            FROM BurnoutScore b2
            WHERE b2.user.role = 'STUDENT'
            GROUP BY b2.user.id
        )
    """)
    List<Object[]> getLatestBurnoutStatsPerUser();

    @Query("""
        SELECT b.riskLevel, COUNT(b)
        FROM BurnoutScore b
        WHERE b.id IN (
            SELECT MAX(b2.id)
            FROM BurnoutScore b2
            WHERE b2.user.role = 'STUDENT'
            GROUP BY b2.user.id
        )
        GROUP BY b.riskLevel
    """)
    List<Object[]> getLatestRiskDistribution();

    @Query("""
        SELECT AVG(b.score)
        FROM BurnoutScore b
        WHERE b.user.role = 'STUDENT'
        AND b.createdAt BETWEEN :startDate AND :endDate
    """)
    Double getWeeklyAverageBurnout(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT b.riskLevel, COUNT(b)
        FROM BurnoutScore b
        WHERE b.user.role = 'STUDENT'
        AND b.createdAt BETWEEN :startDate AND :endDate
        GROUP BY b.riskLevel
    """)
    List<Object[]> getRiskDistributionInRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(b.score) FROM BurnoutScore b WHERE b.user.role = 'STUDENT'")
    Double getOverallAverageBurnout();

    @Query("""
        SELECT u.department, AVG(b.score)
        FROM User u
        JOIN BurnoutScore b ON u.id = b.user.id
        WHERE u.role = 'STUDENT' AND u.isActive = true
        GROUP BY u.department
    """)
    List<Object[]> getAverageBurnoutByDepartment();

    @Query("""
        SELECT u.department, AVG(b.score), COUNT(DISTINCT u.id)
        FROM User u
        JOIN BurnoutScore b ON u.id = b.user.id
        WHERE u.role = 'STUDENT' AND u.isActive = true
        AND b.createdAt BETWEEN :startDate AND :endDate
        GROUP BY u.department
    """)
    List<Object[]> getDepartmentScoresInRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
