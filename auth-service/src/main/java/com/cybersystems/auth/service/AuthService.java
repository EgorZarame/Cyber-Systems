package com.cybersystems.auth.service;

import com.cybersystems.auth.jwt.JwtService;
import com.cybersystems.auth.user.UserDirectory;
import com.cybersystems.auth.user.UserRecord;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserDirectory users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    // нужен, чтобы вход с несуществующим логином занимал столько же времени, сколько с существующим
    private final String dummyHash;

    public AuthService(UserDirectory users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.dummyHash = encoder.encode("dummy-password");
    }

    public AuthResult register(String login, String password) {
        UserRecord user = users.create(login, encoder.encode(password));
        return new AuthResult(jwt.issue(user.id(), user.login()), user.id(), user.login());
    }

    public AuthResult login(String login, String password) {
        UserRecord user = users.findByLogin(login).orElse(null);
        String hash = user != null ? user.passwordHash() : dummyHash;
        boolean ok = encoder.matches(password, hash);
        if (user == null || !ok) {
            throw new BadCredentialsException();
        }
        return new AuthResult(jwt.issue(user.id(), user.login()), user.id(), user.login());
    }
}
