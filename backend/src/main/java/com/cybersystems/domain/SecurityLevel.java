package com.cybersystems.domain;

public class SecurityLevel extends AbstractLevel {

    public SecurityLevel(String id, String name, int orderIndex, LevelDifficulty difficulty) {
        super(id, name, orderIndex, difficulty);
    }

    @Override
    public LevelType getType() {
        return LevelType.SECURITY;
    }
}


