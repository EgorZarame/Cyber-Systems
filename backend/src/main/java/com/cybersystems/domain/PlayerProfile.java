package com.cybersystems.domain;

public class PlayerProfile {

    private final String id;
    private String nickname;
    private String currentLevelId;

    public PlayerProfile(String id, String nickname, String currentLevelId) {
        this.id = id;
        this.nickname = nickname;
        this.currentLevelId = currentLevelId;
    }

    public String getId() {
        return id;
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


