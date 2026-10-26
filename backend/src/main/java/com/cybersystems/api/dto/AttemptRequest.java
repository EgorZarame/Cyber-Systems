package com.cybersystems.api.dto;

import jakarta.validation.constraints.NotBlank;

public class AttemptRequest {

    @NotBlank
    private String levelId;

    @NotBlank
    private String program;

    private boolean success;

    public String getLevelId() {
        return levelId;
    }

    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
