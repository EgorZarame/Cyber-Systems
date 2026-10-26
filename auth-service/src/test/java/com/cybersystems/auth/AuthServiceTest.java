package com.cybersystems.auth;

import com.cybersystems.auth.jwt.JwtService;
import com.cybersystems.auth.service.AuthResult;
import com.cybersystems.auth.service.AuthService;
import com.cybersystems.auth.service.BadCredentialsException;
import com.cybersystems.auth.user.LoginTakenException;
import com.cybersystems.auth.user.UserDirectory;
import com.cybersystems.auth.user.UserRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthServiceTest {

    /** Простая замена data-service: пользователи лежат в map. */
    static class FakeDirectory implements UserDirectory {
        final Map<String, UserRecord> users = new HashMap<>();

        @Override
        public Optional<UserRecord> findByLogin(String login) {
            return Optional.ofNullable(users.get(login));
        }

        @Override
        public UserRecord create(String login, String passwordHash) {
            if (users.containsKey(login)) {
                throw new LoginTakenException(login);
            }
            UserRecord user = new UserRecord(UUID.randomUUID(), login, passwordHash);
            users.put(login, user);
            return user;
        }
    }

    FakeDirectory directory;
    JwtService jwt;
    AuthService auth;

    @BeforeEach
    void setUp() {
        directory = new FakeDirectory();
        jwt = new JwtService("unit-test-secret-unit-test-secret-1234", 1);
        auth = new AuthService(directory, new BCryptPasswordEncoder(4), jwt);
    }

    @Test
    void registerStoresHashNotPassword() {
        AuthResult result = auth.register("egor", "secret123");

        assertThat(directory.users.get("egor").passwordHash()).isNotEqualTo("secret123").startsWith("$2");
        assertThat(jwt.parse(result.token())).isPresent();
    }

    @Test
    void secondRegistrationWithSameLoginFails() {
        auth.register("egor", "secret123");

        assertThatThrownBy(() -> auth.register("egor", "other-pass")).isInstanceOf(LoginTakenException.class);
    }

    @Test
    void loginWithRightPasswordGivesToken() {
        AuthResult registered = auth.register("egor", "secret123");

        AuthResult logged = auth.login("egor", "secret123");

        assertThat(logged.userId()).isEqualTo(registered.userId());
        assertThat(jwt.parse(logged.token())).isPresent();
    }

    @Test
    void wrongPasswordAndUnknownLoginLookTheSame() {
        auth.register("egor", "secret123");

        assertThatThrownBy(() -> auth.login("egor", "wrong-pass")).isInstanceOf(BadCredentialsException.class);
        assertThatThrownBy(() -> auth.login("nobody", "secret123")).isInstanceOf(BadCredentialsException.class);
    }
}
