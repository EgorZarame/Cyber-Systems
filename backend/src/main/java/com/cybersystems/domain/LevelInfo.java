package com.cybersystems.domain;

/**
 * Интерфейс описания уровня.
 * Можно расширять разными реализациями для отделов/типов уровней.
 */
public interface LevelInfo {

    String getId();

    LevelType getType();

    String getName();

    int getOrderIndex();

    LevelDifficulty getDifficulty();
}


