package com.cybersystems.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/** Проверяет токен, который выдал auth-service: подпись и срок действия. Возвращает id пользователя. */
@Component
public class JwtVerifier {

    private static final int MIN_SECRET_LENGTH = 32;

    private final SecretKey key;

    public JwtVerifier(@Value("${jwt.secret:}") String secret) {
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JWT_SECRET не задан или короче " + MIN_SECRET_LENGTH + " символов");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Optional<String> userIdFrom(String token) {
        try {
            String subject = Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(token).getPayload().getSubject();
            return Optional.ofNullable(subject);
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
