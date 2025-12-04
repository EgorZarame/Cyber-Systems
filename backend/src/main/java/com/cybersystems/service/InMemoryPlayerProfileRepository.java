package com.cybersystems.service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.cybersystems.domain.PlayerProfile;

/**
 * Простая in-memory реализация репозитория профилей.
 * Для курсового проекта этого достаточно, но интерфейс
 * позволяет в будущем заменить реализацию на работу с БД.
 */
@Repository
public class InMemoryPlayerProfileRepository implements PlayerProfileRepository {

    private final Map<String, PlayerProfile> storage = new ConcurrentHashMap<>();

    @Override
    public Optional<PlayerProfile> findSingleProfile() {
        return storage.values().stream().findFirst();
    }

    @Override
    public PlayerProfile save(PlayerProfile profile) {
        storage.put(profile.getId(), profile);
        return profile;
    }

    /**
     * Вспомогательный метод, чтобы создать новый профиль
     * с уникальным идентификатором.
     */
    public PlayerProfile createNew(String nickname, String levelId) {
        String id = UUID.randomUUID().toString();
        PlayerProfile profile = new PlayerProfile(id, nickname, levelId);
        save(profile);
        return profile;
    }
}


