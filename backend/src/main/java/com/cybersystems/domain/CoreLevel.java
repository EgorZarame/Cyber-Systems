package com.cybersystems.domain;

public class CoreLevel extends AbstractLevel {

    public CoreLevel(String id, String name, int orderIndex, LevelDifficulty difficulty) {
        super(id, name, orderIndex, difficulty);
    }

    @Override
    public LevelType getType() {
        return LevelType.CORE;
    }
}


