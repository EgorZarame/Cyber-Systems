package com.cybersystems.service;

import com.cybersystems.domain.LevelInfo;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Реализация каталога уровней, использующая фабрику для создания экземпляров.
 */
@Component
public class LevelCatalog implements LevelCatalogService {

    private final Map<String, LevelInfo> levels = new LinkedHashMap<>();

    public LevelCatalog(LevelFactory levelFactory) {
        // Инициализация каталога через фабрику — пример паттерна Factory
        register(levelFactory.createLevel("1.1"));
        register(levelFactory.createLevel("1.2"));
        register(levelFactory.createLevel("1.3"));
        register(levelFactory.createLevel("1.boss"));

        register(levelFactory.createLevel("2.1"));
        register(levelFactory.createLevel("2.2"));
        register(levelFactory.createLevel("2.3"));
        register(levelFactory.createLevel("2.boss"));

        register(levelFactory.createLevel("3.1"));
        register(levelFactory.createLevel("3.2"));
        register(levelFactory.createLevel("3.3"));
        register(levelFactory.createLevel("3.boss"));
    }

    private void register(LevelInfo level) {
        levels.put(level.getId(), level);
    }

    @Override
    public List<LevelInfo> getAllLevels() {
        return List.copyOf(levels.values());
    }

    @Override
    public LevelInfo getById(String id) {
        return levels.get(id);
    }

    @Override
    public boolean exists(String id) {
        return levels.containsKey(id);
    }
}

