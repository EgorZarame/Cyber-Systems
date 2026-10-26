package com.cybersystems.data.repository;

import com.cybersystems.data.domain.Attempt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AttemptRepository extends JpaRepository<Attempt, UUID> {

    List<Attempt> findByProfileIdOrderByCreatedAtDesc(UUID profileId, Pageable page);

    List<Attempt> findByProfileIdAndLevelIdOrderByCreatedAtDesc(UUID profileId, String levelId, Pageable page);
}
