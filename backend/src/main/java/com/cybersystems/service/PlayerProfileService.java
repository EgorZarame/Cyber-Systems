package com.cybersystems.service;

import com.cybersystems.domain.PlayerProfile;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PlayerProfileService implements PlayerProfileServiceContract {

    private final LevelCatalogService levelCatalog;
    private final Map<String, PlayerProfile> profiles = new ConcurrentHashMap<>();

    public PlayerProfileService(LevelCatalogService levelCatalog) {
        this.levelCatalog = levelCatalog;
    }

    @PostConstruct
    public void initDemoProfile() {
        // Для курсовой можно хранить одного "текущего" игрока
        String id = UUID.randomUUID().toString();
        PlayerProfile profile = new PlayerProfile(id, "Интерн", "1.1");
        profiles.put(id, profile);
    }

    @Override
    public PlayerProfile getSingleProfile() {
        // Возвращаем любой единственный профиль (в демо – первый)
        return profiles.values().stream().findFirst().orElse(null);
    }

    @Override
    public PlayerProfile updateProgress(String levelId) {
        if (!levelCatalog.exists(levelId)) {
            throw new IllegalArgumentException("Уровень с id=" + levelId + " не найден");
        }
        PlayerProfile profile = getSingleProfile();
        if (profile == null) {
            String id = UUID.randomUUID().toString();
            profile = new PlayerProfile(id, "Интерн", levelId);
            profiles.put(id, profile);
        } else {
            profile.setCurrentLevelId(levelId);
        }
        return profile;
    }

    @Override
    public PlayerProfile updateNickname(String nickname) {
        PlayerProfile profile = getSingleProfile();
        if (profile == null) {
            String id = UUID.randomUUID().toString();
            profile = new PlayerProfile(id, nickname, "1.1");
            profiles.put(id, profile);
        } else {
            profile.setNickname(nickname);
        }
        return profile;
    }
}

