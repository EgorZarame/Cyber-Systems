package com.cybersystems.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Требует токен на всех методах /api, кроме списка уровней.
 * Id пользователя из токена кладём в атрибут запроса, контроллеры берут его оттуда.
 */
@Component
public class AuthFilter extends OncePerRequestFilter {

    public static final String USER_ID = "userId";

    private final JwtVerifier verifier;

    public AuthFilter(JwtVerifier verifier) {
        this.verifier = verifier;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean preflight = "OPTIONS".equalsIgnoreCase(request.getMethod());
        boolean publicLevels = "GET".equalsIgnoreCase(request.getMethod()) && path.equals("/api/levels");
        return preflight || publicLevels || !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        Optional<String> userId = (header != null && header.startsWith("Bearer "))
                ? verifier.userIdFrom(header.substring(7))
                : Optional.empty();
        if (userId.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Нужно войти\"}");
            return;
        }
        request.setAttribute(USER_ID, userId.get());
        chain.doFilter(request, response);
    }
}
