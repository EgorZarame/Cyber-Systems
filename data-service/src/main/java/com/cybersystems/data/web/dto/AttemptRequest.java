package com.cybersystems.data.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AttemptRequest(
        @NotBlank @Size(max = 10) String levelId,
        @NotBlank String program,
        boolean success) {
}
