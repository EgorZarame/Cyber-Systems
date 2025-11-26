package com.cybersystems.domain;

/**
 * Базовый абстрактный класс уровня.
 * Здесь сосредоточено общее поведение и поля.
 */
public abstract class AbstractLevel implements LevelInfo {

    private final String id;
    private final String name;
    private final int orderIndex;
    private final LevelDifficulty difficulty;

    protected AbstractLevel(String id, String name, int orderIndex, LevelDifficulty difficulty) {
        this.id = id;
        this.name = name;
        this.orderIndex = orderIndex;
        this.difficulty = difficulty;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public int getOrderIndex() {
        return orderIndex;
    }

    @Override
    public LevelDifficulty getDifficulty() {
        return difficulty;
    }
}


