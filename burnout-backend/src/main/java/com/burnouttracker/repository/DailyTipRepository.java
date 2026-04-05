package com.burnouttracker.repository;

import com.burnouttracker.model.DailyTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;

@Repository
public interface DailyTipRepository extends JpaRepository<DailyTip, UUID> {
    Optional<DailyTip> findByUserIdAndDisplayDate(UUID userId, LocalDate date);
    Optional<DailyTip> findByDisplayDateAndUserIdIsNull(LocalDate date);
}
