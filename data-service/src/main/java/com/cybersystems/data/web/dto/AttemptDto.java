package com.cybersystems.data.web.dto;

import com.cybersystems.data.domain.Attempt;

import java.time.LocalDateTime;
import java.util.UUID;

public record AttemptDto(UUID id, String levelId, String program, boolean success, LocalDateTime createdAt) {

    public static AttemptDto from(Attempt a) {
        return new AttemptDto(a.getId(), a.getLevelId(), a.getProgram(), a.isSuccess(), a.getCreatedAt());
    }
}
