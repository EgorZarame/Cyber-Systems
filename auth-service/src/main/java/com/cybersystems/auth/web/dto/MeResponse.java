package com.cybersystems.auth.web.dto;

import java.util.UUID;

public record MeResponse(UUID userId, String login) {
}
