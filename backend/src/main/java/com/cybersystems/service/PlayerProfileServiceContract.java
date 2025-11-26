package com.cybersystems.service;

import com.cybersystems.domain.PlayerProfile;

/**
 * Контракт сервиса работы с профилем игрока.
 * Отдельный интерфейс подчёркивает инверсию зависимостей.
 */
public interface PlayerProfileServiceContract {

    PlayerProfile getSingleProfile();

    PlayerProfile updateProgress(String levelId);

    PlayerProfile updateNickname(String nickname);
}


