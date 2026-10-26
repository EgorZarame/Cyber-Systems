package com.cybersystems;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Делает токены такие же, как у auth-service, чтобы проверять защиту API. */
public final class TestTokens {

    public static final String SECRET = "game-test-secret-game-test-secret-123";

    private TestTokens() {
    }

    public static String forUser(String userId) {
        return sign(userId, SECRET, System.currentTimeMillis() + 3_600_000);
    }

    public static String sign(String userId, String secret, long expiresAtMillis) {
        return Jwts.builder()
                .subject(userId)
                .expiration(new Date(expiresAtMillis))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}
