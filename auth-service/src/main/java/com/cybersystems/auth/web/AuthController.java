package com.cybersystems.auth.web;

import com.cybersystems.auth.jwt.JwtService;
import com.cybersystems.auth.jwt.TokenClaims;
import com.cybersystems.auth.service.AuthResult;
import com.cybersystems.auth.service.AuthService;
import com.cybersystems.auth.service.BadCredentialsException;
import com.cybersystems.auth.web.dto.Credentials;
import com.cybersystems.auth.web.dto.MeResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final JwtService jwt;

    public AuthController(AuthService auth, JwtService jwt) {
        this.auth = auth;
        this.jwt = jwt;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResult register(@Valid @RequestBody Credentials body) {
        return auth.register(body.login(), body.password());
    }

    @PostMapping("/login")
    public AuthResult login(@Valid @RequestBody Credentials body) {
        return auth.login(body.login(), body.password());
    }

    @GetMapping("/me")
    public MeResponse me(@RequestHeader(value = "Authorization", required = false) String header) {
        if (header == null || !header.startsWith("Bearer ")) {
            throw new BadCredentialsException();
        }
        TokenClaims claims = jwt.parse(header.substring(7)).orElseThrow(BadCredentialsException::new);
        return new MeResponse(claims.userId(), claims.login());
    }
}
