package com.cybersystems.service;

import com.cybersystems.domain.LevelInfo;
import com.cybersystems.domain.PlayerProfile;

/**
 * Стратегия прогресса — отдельный объект,
 * который решает, какой уровень будет следующим.
 */
public interface ProgressionStrategy {

    LevelInfo getNextLevel(PlayerProfile profile, LevelCatalogService catalog);
}


