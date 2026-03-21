package com.burnouttracker.repository;

import com.burnouttracker.model.ConsentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentRepository extends JpaRepository<ConsentRecord, UUID> {

    Optional<ConsentRecord> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
