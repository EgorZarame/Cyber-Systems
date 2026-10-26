package com.cybersystems.service;

import com.cybersystems.domain.PlayerProfile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;

/** Профили игроков лежат в data-service, сюда мы ходим к нему по HTTP. */
@Repository
public class DataServiceProfileRepository implements PlayerProfileRepository {

    private record ProfileJson(String id, String userId, String nickname, String currentLevelId) {
        PlayerProfile toDomain() {
            return new PlayerProfile(id, nickname, currentLevelId);
        }
    }

    private record CompletedJson(String levelId) {
    }

    private record AttemptJson(String levelId) {
    }

    private final RestClient client;

    public DataServiceProfileRepository(RestClient.Builder builder,
                                        @Value("${data-service.url}") String baseUrl,
                                        @Value("${internal.token:}") String internalToken) {
        RestClient.Builder b = builder.baseUrl(baseUrl);
        if (!internalToken.isBlank()) {
            b.defaultHeader("X-Internal-Token", internalToken);
        }
        this.client = b.build();
    }

    @Override
    public Optional<PlayerProfile> findByUserId(String userId) {
        return call(() -> {
            ProfileJson json = client.get()
                    .uri("/internal/profiles/by-user/{id}", userId)
                    .retrieve()
                    .onStatus(s -> s.value() == HttpStatus.NOT_FOUND.value(), (req, res) -> { })
                    .body(ProfileJson.class);
            return Optional.ofNullable(json).filter(j -> j.id() != null).map(ProfileJson::toDomain);
        });
    }

    @Override
    public PlayerProfile updateNickname(String profileId, String nickname) {
        return call(() -> client.put()
                .uri("/internal/profiles/{id}/nickname", profileId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("nickname", nickname))
                .retrieve()
                .body(ProfileJson.class).toDomain());
    }

    @Override
    public PlayerProfile updateCurrentLevel(String profileId, String levelId) {
        return call(() -> client.put()
                .uri("/internal/profiles/{id}/current-level", profileId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("levelId", levelId))
                .retrieve()
                .body(ProfileJson.class).toDomain());
    }

    @Override
    public void saveAttempt(String profileId, String levelId, String program, boolean success) {
        call(() -> client.post()
                .uri("/internal/profiles/{id}/attempts", profileId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("levelId", levelId, "program", program, "success", success))
                .retrieve()
                .toBodilessEntity());
    }

    @Override
    public List<String> findCompletedLevelIds(String profileId) {
        return call(() -> {
            CompletedJson[] items = client.get()
                    .uri("/internal/profiles/{id}/completed-levels", profileId)
                    .retrieve()
                    .body(CompletedJson[].class);
            return items == null ? List.<String>of() : java.util.Arrays.stream(items).map(CompletedJson::levelId).toList();
        });
    }

    @Override
    public int countAttempts(String profileId, String levelId) {
        return call(() -> {
            AttemptJson[] items = client.get()
                    .uri("/internal/profiles/{id}/attempts?levelId={level}&limit=50", profileId, levelId)
                    .retrieve()
                    .body(AttemptJson[].class);
            return items == null ? 0 : items.length;
        });
    }

    private <T> T call(Supplier<T> action) {
        try {
            return action.get();
        } catch (RestClientException e) {
            throw new DataServiceUnavailableException("data-service не отвечает", e);
        }
    }
}
