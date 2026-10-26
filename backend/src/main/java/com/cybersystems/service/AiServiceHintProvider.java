package com.cybersystems.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Component
public class AiServiceHintProvider implements HintProvider {

    private final RestClient client;

    public AiServiceHintProvider(RestClient.Builder builder,
                                 @Value("${ai-service.url}") String baseUrl,
                                 @Value("${internal.token:}") String internalToken) {
        RestClient.Builder b = builder.baseUrl(baseUrl);
        if (!internalToken.isBlank()) {
            b.defaultHeader("X-Internal-Token", internalToken);
        }
        this.client = b.build();
    }

    @Override
    public Map<String, Object> hint(String levelId, List<Object> program, int attempts) {
        try {
            return client.post()
                    .uri("/internal/hint")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("levelId", levelId, "program", program, "attempts", attempts))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new IllegalArgumentException("Не удалось разобрать программу для подсказки");
                    })
                    .body(new ParameterizedTypeReference<Map<String, Object>>() { });
        } catch (RestClientException e) {
            throw new AiServiceUnavailableException("ai-service не отвечает", e);
        }
    }
}
