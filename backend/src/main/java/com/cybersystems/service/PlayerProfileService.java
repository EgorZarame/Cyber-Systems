package com.cybersystems.service;

import com.cybersystems.domain.PlayerProfile;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

/**
 * Сервис работы с профилем игрока.
 * Использует репозиторий и каталог уровней, сам не знает,
 * где и как именно хранятся данные — только бизнес-логика.
 */
@Service
public class PlayerProfileService implements PlayerProfileServiceContract {

    private final LevelCatalogService levelCatalog;
    private final InMemoryPlayerProfileRepository profileRepository;

    public PlayerProfileService(LevelCatalogService levelCatalog,
                                InMemoryPlayerProfileRepository profileRepository) {
        this.levelCatalog = levelCatalog;
        this.profileRepository = profileRepository;
    }

    @PostConstruct
    public void initDemoProfile() {
        // Для курсовой можно хранить одного "текущего" игрока
        if (profileRepository.findSingleProfile().isEmpty()) {
            profileRepository.createNew("Интерн", "1.1");
        }
    }

    @Override
    public PlayerProfile getSingleProfile() {
        // Возвращаем любой единственный профиль (в демо – первый)
        return profileRepository.findSingleProfile().orElse(null);
    }

    @Override
    public PlayerProfile updateProgress(String levelId) {
        if (!levelCatalog.exists(levelId)) {
            throw new IllegalArgumentException("Уровень с id=" + levelId + " не найден");
        }
        PlayerProfile profile = getSingleProfile();
        if (profile == null) {
            profile = profileRepository.createNew("Интерн", levelId);
        } else {
            profile.setCurrentLevelId(levelId);
            profileRepository.save(profile);
        }
        return profile;
    }

    @Override
    public PlayerProfile updateNickname(String nickname) {
        PlayerProfile profile = getSingleProfile();
        if (profile == null) {
            profile = profileRepository.createNew(nickname, "1.1");
        } else {
            profile.setNickname(nickname);
            profileRepository.save(profile);
        }
        return profile;
    }
}

