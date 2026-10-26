package com.cybersystems.auth.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;
import java.util.Optional;

@Component
public class HttpUserDirectory implements UserDirectory {

    private final RestClient client;

    public HttpUserDirectory(RestClient.Builder builder,
                             @Value("${data-service.url}") String baseUrl,
                             @Value("${internal.token:}") String internalToken) {
        RestClient.Builder b = builder.baseUrl(baseUrl);
        if (!internalToken.isBlank()) {
            b.defaultHeader("X-Internal-Token", internalToken);
        }
        this.client = b.build();
    }

    @Override
    public Optional<UserRecord> findByLogin(String login) {
        try {
            UserRecord user = client.get()
                    .uri("/internal/users/by-login/{login}", login)
                    .retrieve()
                    .onStatus(status -> status.value() == HttpStatus.NOT_FOUND.value(), (req, res) -> { })
                    .body(UserRecord.class);
            return Optional.ofNullable(user).filter(u -> u.id() != null);
        } catch (RestClientException e) {
            throw new DataServiceUnavailableException("data-service не отвечает", e);
        }
    }

    @Override
    public UserRecord create(String login, String passwordHash) {
        try {
            return client.post()
                    .uri("/internal/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("login", login, "passwordHash", passwordHash))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        if (res.getStatusCode().value() == HttpStatus.CONFLICT.value()) {
                            throw new LoginTakenException(login);
                        }
                        throw new IllegalArgumentException("data-service отклонил данные: " + res.getStatusCode());
                    })
                    .body(UserRecord.class);
        } catch (LoginTakenException | IllegalArgumentException e) {
            throw e;
        } catch (RestClientException e) {
            throw new DataServiceUnavailableException("data-service не отвечает", e);
        }
    }
}
