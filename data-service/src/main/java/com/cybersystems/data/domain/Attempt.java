package com.cybersystems.data.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

/** Одна попытка пройти уровень. Из этих записей потом берёт данные ИИ-помощник. */
@Entity
@Table(name = "attempts")
public class Attempt {

    @Id
    private UUID id;

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Column(name = "level_id", nullable = false, length = 10)
    private String levelId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String program;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected Attempt() {
    }

    public Attempt(UUID profileId, String levelId, String program, boolean success) {
        this.id = UUID.randomUUID();
        this.profileId = profileId;
        this.levelId = levelId;
        this.program = program;
        this.success = success;
        this.createdAt = LocalDateTime.now();
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

    public String getProgram() {
        return program;
    }

    public boolean isSuccess() {
        return success;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
