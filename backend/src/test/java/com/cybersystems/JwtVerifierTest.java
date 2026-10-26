package com.cybersystems;

import com.cybersystems.security.JwtVerifier;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtVerifierTest {

    private final JwtVerifier verifier = new JwtVerifier(TestTokens.SECRET);

    @Test
    void validTokenGivesUserId() {
        assertThat(verifier.userIdFrom(TestTokens.forUser("user-1"))).contains("user-1");
    }

    @Test
    void tokenWithOtherSecretIsRejected() {
        String token = TestTokens.sign("user-1", "another-secret-another-secret-12345", System.currentTimeMillis() + 60_000);

        assertThat(verifier.userIdFrom(token)).isEmpty();
    }

    @Test
    void expiredTokenIsRejected() {
        String token = TestTokens.sign("user-1", TestTokens.SECRET, System.currentTimeMillis() - 60_000);

        assertThat(verifier.userIdFrom(token)).isEmpty();
    }

    @Test
    void garbageIsRejected() {
        assertThat(verifier.userIdFrom("abc")).isEmpty();
    }

    @Test
    void shortSecretFailsOnStart() {
        assertThatThrownBy(() -> new JwtVerifier("short")).isInstanceOf(IllegalStateException.class);
    }
}
