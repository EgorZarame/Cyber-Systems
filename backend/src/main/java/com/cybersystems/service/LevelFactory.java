package com.cybersystems.service;

import com.cybersystems.domain.LevelInfo;

/**
 * Фабрика уровней — точка расширения для создания разных типов уровней.
 */
public interface LevelFactory {

    LevelInfo createLevel(String id);
}


