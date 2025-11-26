package com.cybersystems.api.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateProgressRequest {

    @NotBlank
    private String levelId;

    public String getLevelId() {
        return levelId;
    }

    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }
}


