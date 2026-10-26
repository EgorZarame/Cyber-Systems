package com.cybersystems.data.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "level_progress")
public class LevelProgress {

    @Id
    private UUID id;

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Column(name = "level_id", nullable = false, length = 10)
    private String levelId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    protected LevelProgress() {
    }

    public LevelProgress(UUID profileId, String levelId) {
        this.id = UUID.randomUUID();
        this.profileId = profileId;
        this.levelId = levelId;
        this.completedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getProfileId() {
        return profileId;
    }

    public String getLevelId() {
        return levelId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
}
