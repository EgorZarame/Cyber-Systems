package com.cybersystems.data.web.dto;

import com.cybersystems.data.domain.LevelProgress;

import java.time.LocalDateTime;

public record CompletedLevelDto(String levelId, LocalDateTime completedAt) {

    public static CompletedLevelDto from(LevelProgress p) {
        return new CompletedLevelDto(p.getLevelId(), p.getCompletedAt());
    }
}
