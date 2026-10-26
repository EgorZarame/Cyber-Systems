package com.cybersystems.auth.service;

import java.util.UUID;

public record AuthResult(String token, UUID userId, String login) {
}
