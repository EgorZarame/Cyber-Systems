package com.cybersystems.data.repository;

import com.cybersystems.data.domain.LevelProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LevelProgressRepository extends JpaRepository<LevelProgress, UUID> {

    List<LevelProgress> findByProfileIdOrderByCompletedAt(UUID profileId);

    boolean existsByProfileIdAndLevelId(UUID profileId, String levelId);
}
