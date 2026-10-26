CREATE TABLE users (
    id            UUID         PRIMARY KEY,
    login         VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    created_at    TIMESTAMP    NOT NULL
);

CREATE TABLE player_profiles (
    id               UUID        PRIMARY KEY,
    user_id          UUID        NOT NULL UNIQUE REFERENCES users (id),
    nickname         VARCHAR(50) NOT NULL,
    current_level_id VARCHAR(10) NOT NULL
);

CREATE TABLE level_progress (
    id           UUID        PRIMARY KEY,
    profile_id   UUID        NOT NULL REFERENCES player_profiles (id),
    level_id     VARCHAR(10) NOT NULL,
    completed_at TIMESTAMP   NOT NULL,
    CONSTRAINT uq_progress_profile_level UNIQUE (profile_id, level_id)
);

CREATE TABLE attempts (
    id         UUID        PRIMARY KEY,
    profile_id UUID        NOT NULL REFERENCES player_profiles (id),
    level_id   VARCHAR(10) NOT NULL,
    program    TEXT        NOT NULL,
    success    BOOLEAN     NOT NULL,
    created_at TIMESTAMP   NOT NULL
);

CREATE INDEX idx_attempts_profile_level ON attempts (profile_id, level_id, created_at);
