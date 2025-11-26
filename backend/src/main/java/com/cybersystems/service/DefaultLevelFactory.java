package com.cybersystems.service;

import com.cybersystems.domain.*;
import org.springframework.stereotype.Component;

/**
 * Конкретная фабрика, знающая как создавать уровни
 * конкретных отделов (дроны, безопасность, ядро).
 */
@Component
public class DefaultLevelFactory implements LevelFactory {

    @Override
    public LevelInfo createLevel(String id) {
        return switch (id) {
            // Отдел дронов
            case "1.1" -> new DronesLevel("1.1", "Первые шаги", 1, LevelDifficulty.EASY);
            case "1.2" -> new DronesLevel("1.2", "Маршрут доставки", 2, LevelDifficulty.MEDIUM);
            case "1.3" -> new DronesLevel("1.3", "Оптимизация пути", 3, LevelDifficulty.MEDIUM);
            case "1.boss" -> new DronesLevel("1.boss", "Кризис почтовых дронов", 4, LevelDifficulty.BOSS);

            // Охранные системы
            case "2.1" -> new SecurityLevel("2.1", "Периметр", 5, LevelDifficulty.EASY);
            case "2.2" -> new SecurityLevel("2.2", "Датчики", 6, LevelDifficulty.MEDIUM);
            case "2.3" -> new SecurityLevel("2.3", "Лазеры", 7, LevelDifficulty.MEDIUM);
            case "2.boss" -> new SecurityLevel("2.boss", "Босс отдела безопасности", 8, LevelDifficulty.BOSS);

            // Центральное ядро
            case "3.1" -> new CoreLevel("3.1", "Подсистемы", 9, LevelDifficulty.MEDIUM);
            case "3.2" -> new CoreLevel("3.2", "Нагрузочное тестирование", 10, LevelDifficulty.HARD);
            case "3.3" -> new CoreLevel("3.3", "Финальный рубеж", 11, LevelDifficulty.HARD);
            case "3.boss" -> new CoreLevel("3.boss", "Спасение ядра ИИ", 12, LevelDifficulty.BOSS);

            default -> throw new IllegalArgumentException("Неизвестный уровень: " + id);
        };
    }
}


