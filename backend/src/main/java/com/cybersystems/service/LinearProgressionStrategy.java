package com.cybersystems.service;

import com.cybersystems.domain.LevelInfo;
import com.cybersystems.domain.PlayerProfile;
import org.springframework.stereotype.Component;

import java.util.Comparator;

/**
 * Простая реализация стратегии прогресса:
 * уровни идут линейно по orderIndex.
 */
@Component
public class LinearProgressionStrategy implements ProgressionStrategy {

    @Override
    public LevelInfo getNextLevel(PlayerProfile profile, LevelCatalogService catalog) {
        if (profile == null || profile.getCurrentLevelId() == null) {
            return catalog.getAllLevels().stream()
                    .min(Comparator.comparingInt(LevelInfo::getOrderIndex))
                    .orElse(null);
        }

        LevelInfo current = catalog.getById(profile.getCurrentLevelId());
        if (current == null) {
            return null;
        }

        return catalog.getAllLevels().stream()
                .filter(l -> l.getOrderIndex() > current.getOrderIndex())
                .min(Comparator.comparingInt(LevelInfo::getOrderIndex))
                .orElse(null);
    }
}


