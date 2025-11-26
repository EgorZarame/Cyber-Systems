package com.cybersystems.domain;

/**
 * Простой DTO-объект уровня, который можно безопасно
 * отдавать на фронтенд (отделён от внутренней иерархии).
 */
public class Level {

    private final String id;
    private final String department;
    private final String name;
    private final int orderIndex;
    private final LevelDifficulty difficulty;

    public Level(String id, String department, String name, int orderIndex, LevelDifficulty difficulty) {
        this.id = id;
        this.department = department;
        this.name = name;
        this.orderIndex = orderIndex;
        this.difficulty = difficulty;
    }

    public String getId() {
        return id;
    }

    public String getDepartment() {
        return department;
    }

    public String getName() {
        return name;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public LevelDifficulty getDifficulty() {
        return difficulty;
    }
}

