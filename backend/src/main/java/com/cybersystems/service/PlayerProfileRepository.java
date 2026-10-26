package com.cybersystems.service;

import java.util.List;
import java.util.Optional;

import com.cybersystems.domain.PlayerProfile;

/**
 * Репозиторий профилей игрока.
 * Выделен как отдельный слой, чтобы можно было легко
 * заменить хранение без изменения сервисов. Сейчас данные лежат в data-service.
 */
public interface PlayerProfileRepository {

    Optional<PlayerProfile> findByUserId(String userId);

    PlayerProfile updateNickname(String profileId, String nickname);

    PlayerProfile updateCurrentLevel(String profileId, String levelId);

    void saveAttempt(String profileId, String levelId, String program, boolean success);

    List<String> findCompletedLevelIds(String profileId);
}
