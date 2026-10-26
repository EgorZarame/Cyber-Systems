package com.cybersystems.auth;

import com.cybersystems.auth.jwt.JwtService;
import com.cybersystems.auth.jwt.TokenClaims;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-unit-test-secret-1234";

    @Test
    void tokenRoundTrip() {
        JwtService jwt = new JwtService(SECRET, 1);
        UUID id = UUID.randomUUID();

        Optional<TokenClaims> claims = jwt.parse(jwt.issue(id, "egor"));

        assertThat(claims).contains(new TokenClaims(id, "egor"));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        String token = new JwtService("another-secret-another-secret-12345", 1).issue(UUID.randomUUID(), "x");

        assertThat(new JwtService(SECRET, 1).parse(token)).isEmpty();
    }

    @Test
    void garbageIsRejected() {
        assertThat(new JwtService(SECRET, 1).parse("not-a-token")).isEmpty();
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService jwt = new JwtService(SECRET, -1);

        assertThat(jwt.parse(jwt.issue(UUID.randomUUID(), "x"))).isEmpty();
    }

    @Test
    void shortSecretIsNotAllowed() {
        assertThatThrownBy(() -> new JwtService("short", 1)).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new JwtService("", 1)).isInstanceOf(IllegalStateException.class);
    }
}
