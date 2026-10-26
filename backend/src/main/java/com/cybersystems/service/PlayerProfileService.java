package com.cybersystems.service;

import com.cybersystems.domain.PlayerProfile;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Сервис работы с профилем игрока.
 * Использует репозиторий и каталог уровней, сам не знает,
 * где и как именно хранятся данные — только бизнес-логика.
 */
@Service
public class PlayerProfileService implements PlayerProfileServiceContract {

    private final LevelCatalogService levelCatalog;
    private final PlayerProfileRepository profileRepository;

    public PlayerProfileService(LevelCatalogService levelCatalog,
                                PlayerProfileRepository profileRepository) {
        this.levelCatalog = levelCatalog;
        this.profileRepository = profileRepository;
    }

    @Override
    public PlayerProfile getProfile(String userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException(userId));
    }

    @Override
    public PlayerProfile updateProgress(String userId, String levelId) {
        checkLevelExists(levelId);
        PlayerProfile profile = getProfile(userId);
        return profileRepository.updateCurrentLevel(profile.getId(), levelId);
    }

    @Override
    public PlayerProfile updateNickname(String userId, String nickname) {
        PlayerProfile profile = getProfile(userId);
        return profileRepository.updateNickname(profile.getId(), nickname);
    }

    @Override
    public void recordAttempt(String userId, String levelId, String program, boolean success) {
        checkLevelExists(levelId);
        PlayerProfile profile = getProfile(userId);
        profileRepository.saveAttempt(profile.getId(), levelId, program, success);
    }

    @Override
    public List<String> getCompletedLevelIds(String userId) {
        return profileRepository.findCompletedLevelIds(getProfile(userId).getId());
    }

    @Override
    public int countAttempts(String userId, String levelId) {
        return profileRepository.countAttempts(getProfile(userId).getId(), levelId);
    }

    private void checkLevelExists(String levelId) {
        if (!levelCatalog.exists(levelId)) {
            throw new IllegalArgumentException("Уровень с id=" + levelId + " не найден");
        }
    }
}
