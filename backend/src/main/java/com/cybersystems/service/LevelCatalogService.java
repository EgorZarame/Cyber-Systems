package com.cybersystems.service;

import com.cybersystems.domain.LevelInfo;

import java.util.List;

/**
 * Интерфейс-контракт каталога уровней.
 */
public interface LevelCatalogService {

    List<LevelInfo> getAllLevels();

    LevelInfo getById(String id);

    boolean exists(String id);
}


