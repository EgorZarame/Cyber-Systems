package com.cybersystems.data.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LevelRequest(@NotBlank @Size(max = 10) String levelId) {
}
