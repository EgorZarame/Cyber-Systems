package com.cybersystems.data.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "player_profiles")
public class PlayerProfile {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(name = "current_level_id", nullable = false, length = 10)
    private String currentLevelId;

    protected PlayerProfile() {
    }

    public PlayerProfile(UUID userId, String nickname, String currentLevelId) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.nickname = nickname;
        this.currentLevelId = currentLevelId;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getCurrentLevelId() {
        return currentLevelId;
    }

    public void setCurrentLevelId(String currentLevelId) {
        this.currentLevelId = currentLevelId;
    }
}
