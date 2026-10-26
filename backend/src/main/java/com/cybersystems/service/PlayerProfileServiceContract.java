package com.cybersystems.service;

import java.util.List;

import com.cybersystems.domain.PlayerProfile;

/**
 * Контракт сервиса работы с профилем игрока.
 * Отдельный интерфейс подчёркивает инверсию зависимостей.
 * Все методы работают с профилем конкретного пользователя (id берётся из токена).
 */
public interface PlayerProfileServiceContract {

    PlayerProfile getProfile(String userId);

    PlayerProfile updateProgress(String userId, String levelId);

    PlayerProfile updateNickname(String userId, String nickname);

    void recordAttempt(String userId, String levelId, String program, boolean success);

    List<String> getCompletedLevelIds(String userId);
}
