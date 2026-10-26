package com.cybersystems;

import com.cybersystems.domain.LevelInfo;
import com.cybersystems.domain.PlayerProfile;
import com.cybersystems.service.DefaultLevelFactory;
import com.cybersystems.service.LevelCatalog;
import com.cybersystems.service.LinearProgressionStrategy;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LevelsAndProgressionTest {

    private final LevelCatalog catalog = new LevelCatalog(new DefaultLevelFactory());
    private final LinearProgressionStrategy strategy = new LinearProgressionStrategy();

    @Test
    void catalogHasAllTwelveLevels() {
        assertThat(catalog.getAllLevels()).hasSize(12);
        assertThat(catalog.exists("2.3")).isTrue();
        assertThat(catalog.exists("9.9")).isFalse();
        assertThat(catalog.getById("1.1").getId()).isEqualTo("1.1");
    }

    @Test
    void nextLevelGoesInOrder() {
        LevelInfo next = strategy.getNextLevel(new PlayerProfile("p", "n", "1.1"), catalog);

        assertThat(next.getId()).isEqualTo("1.2");
    }

    @Test
    void noNextLevelAfterTheLast() {
        assertThat(strategy.getNextLevel(new PlayerProfile("p", "n", "3.boss"), catalog)).isNull();
    }

    @Test
    void withoutProfileTheFirstLevelIsGiven() {
        assertThat(strategy.getNextLevel(null, catalog).getId()).isEqualTo("1.1");
    }

    @Test
    void unknownCurrentLevelGivesNothing() {
        assertThat(strategy.getNextLevel(new PlayerProfile("p", "n", "7.7"), catalog)).isNull();
    }
}
