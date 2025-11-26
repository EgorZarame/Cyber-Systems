package com.cybersystems.api.dto;

import com.cybersystems.domain.PlayerProfile;

public class PlayerProfileDto {

    private String id;
    private String nickname;
    private String currentLevelId;

    public PlayerProfileDto() {
    }

    public PlayerProfileDto(String id, String nickname, String currentLevelId) {
        this.id = id;
        this.nickname = nickname;
        this.currentLevelId = currentLevelId;
    }

    public static PlayerProfileDto fromDomain(PlayerProfile profile) {
        return new PlayerProfileDto(
                profile.getId(),
                profile.getNickname(),
                profile.getCurrentLevelId()
        );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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


