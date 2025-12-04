package com.cybersystems.service;

import java.util.Optional;

import com.cybersystems.domain.PlayerProfile;

/**
 * Репозиторий профилей игрока.
 * Выделен как отдельный слой, чтобы можно было легко
 * заменить хранение (память, файл, БД) без изменения сервисов.
 */
public interface PlayerProfileRepository {

    Optional<PlayerProfile> findSingleProfile();

    PlayerProfile save(PlayerProfile profile);
}


