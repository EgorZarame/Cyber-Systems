package com.cybersystems.domain;

public class DronesLevel extends AbstractLevel {

    public DronesLevel(String id, String name, int orderIndex, LevelDifficulty difficulty) {
        super(id, name, orderIndex, difficulty);
    }

    @Override
    public LevelType getType() {
        return LevelType.DRONES;
    }
}


