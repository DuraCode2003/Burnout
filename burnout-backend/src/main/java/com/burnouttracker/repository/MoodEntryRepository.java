package com.burnouttracker.repository;

import com.burnouttracker.model.MoodEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MoodEntryRepository extends JpaRepository<MoodEntry, UUID> {

    List<MoodEntry> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<MoodEntry> findByUserIdOrderByCreatedAtDesc(UUID userId, org.springframework.data.domain.Pageable pageable);

    List<MoodEntry> findByUserIdAndCreatedAtBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    long countByUserIdAndCreatedAtBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT AVG(m.moodScore) FROM MoodEntry m WHERE m.user.role = 'STUDENT' AND m.createdAt >= :startDate")
    Double getAverageMoodForPeriod(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT AVG(m.sleepHours) FROM MoodEntry m WHERE m.user.role = 'STUDENT' AND m.createdAt >= :startDate")
    Double getAverageSleepForPeriod(@Param("startDate") LocalDateTime startDate);

    @Query("""
        SELECT AVG(m.moodScore)
        FROM MoodEntry m
        WHERE m.user.role = 'STUDENT'
        AND m.createdAt BETWEEN :startDate AND :endDate
    """)
    Double getAverageMoodInRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT AVG(m.sleepHours)
        FROM MoodEntry m
        WHERE m.user.role = 'STUDENT'
        AND m.createdAt BETWEEN :startDate AND :endDate
    """)
    Double getAverageSleepInRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT COUNT(m)
        FROM MoodEntry m
        WHERE m.user.role = 'STUDENT'
        AND m.createdAt BETWEEN :startDate AND :endDate
    """)
    Long countCheckinsInRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT DATE(m.createdAt), COUNT(m)
        FROM MoodEntry m
        WHERE m.user.role = 'STUDENT'
        AND m.createdAt >= :startDate
        GROUP BY DATE(m.createdAt)
        ORDER BY DATE(m.createdAt) DESC
    """)
    List<Object[]> getDailyCheckinCounts(@Param("startDate") LocalDateTime startDate);

    @Query("""
        SELECT YEAR(m.createdAt), WEEK(m.createdAt), AVG(m.moodScore), AVG(m.sleepHours), COUNT(m)
        FROM MoodEntry m
        WHERE m.user.role = 'STUDENT'
        AND m.createdAt >= :startDate
        GROUP BY YEAR(m.createdAt), WEEK(m.createdAt)
        ORDER BY YEAR(m.createdAt), WEEK(m.createdAt)
    """)
    List<Object[]> getWeeklyMoodTrends(@Param("startDate") LocalDateTime startDate);
}
