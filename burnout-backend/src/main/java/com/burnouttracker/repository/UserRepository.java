package com.burnouttracker.repository;

import com.burnouttracker.model.User;
import com.burnouttracker.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    long countByRoleAndIsActiveTrue(@Param("role") Role role);

    @Query("SELECT COUNT(DISTINCT m.user.id) FROM MoodEntry m WHERE m.user.role = 'STUDENT' AND m.createdAt >= :startDate")
    long countDistinctActiveThisWeek(@Param("startDate") LocalDateTime startDate);

    @Query("""
        SELECT 
            u.department,
            COUNT(DISTINCT u.id),
            COALESCE(AVG(b.score), 0),
            COUNT(DISTINCT CASE WHEN b.riskLevel = 'HIGH' THEN b.id END),
            COUNT(DISTINCT CASE WHEN b.riskLevel = 'MEDIUM' THEN b.id END),
            COUNT(DISTINCT CASE WHEN b.riskLevel = 'LOW' THEN b.id END),
            COUNT(DISTINCT CASE WHEN m.createdAt >= :weekAgo THEN m.user.id END)
        FROM User u
        LEFT JOIN BurnoutScore b ON u.id = b.user.id
        LEFT JOIN MoodEntry m ON u.id = m.user.id
        WHERE u.role = com.burnouttracker.model.enums.Role.STUDENT AND u.isActive = true
        GROUP BY u.department
        ORDER BY COUNT(DISTINCT u.id) DESC
    """)
    List<Object[]> getDepartmentAggregateStats(@Param("weekAgo") LocalDateTime weekAgo);

    @Query("SELECT u.department, COUNT(u) FROM User u WHERE u.role = 'STUDENT' AND u.isActive = true GROUP BY u.department")
    List<Object[]> countStudentsByDepartment();
}
