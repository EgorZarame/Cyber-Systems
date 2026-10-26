package com.cybersystems.data.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(min = 3, max = 50) String login,
        @NotBlank @Size(max = 100) String passwordHash) {
}
