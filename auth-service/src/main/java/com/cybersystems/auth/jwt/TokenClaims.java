package com.cybersystems.auth.jwt;

import java.util.UUID;

public record TokenClaims(UUID userId, String login) {
}
