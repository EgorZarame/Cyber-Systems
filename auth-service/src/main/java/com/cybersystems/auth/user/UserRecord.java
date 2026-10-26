package com.cybersystems.auth.user;

import java.util.UUID;

public record UserRecord(UUID id, String login, String passwordHash) {
}
