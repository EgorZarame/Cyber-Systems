package com.cybersystems.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class HintRequest {

    @NotBlank
    private String levelId;

    @NotNull
    @Size(max = 100)
    private List<Object> program;

    public String getLevelId() {
        return levelId;
    }

    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }

    public List<Object> getProgram() {
        return program;
    }

    public void setProgram(List<Object> program) {
        this.program = program;
    }
}
