CREATE DATABASE IF NOT EXISTS echo;

USE echo;


-- ============================================
-- Users
-- ============================================

CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,

    avatar VARCHAR(255) NULL,
    bio TEXT NULL,

    streak INT UNSIGNED NOT NULL DEFAULT 0,
    last_streak_cycle_id VARCHAR(100) NULL,

    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
);


-- ============================================
-- Echo Cycles
-- ============================================

CREATE TABLE echo_cycles (
    id VARCHAR(100) PRIMARY KEY,

    started_at TIMESTAMP(3) NOT NULL,
    ends_at TIMESTAMP(3) NOT NULL,

    previous_cycle_id VARCHAR(100) NULL,

    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX idx_echo_cycles_started_at (started_at),
    INDEX idx_echo_cycles_ends_at (ends_at),

    CONSTRAINT fk_echo_cycles_previous_cycle
        FOREIGN KEY (previous_cycle_id)
        REFERENCES echo_cycles(id)
        ON DELETE SET NULL
);


-- ============================================
-- Memories / Echoes
-- ============================================

CREATE TABLE memories (
    id BIGINT UNSIGNED PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,
    cycle_id VARCHAR(100) NOT NULL,

    song_id BIGINT UNSIGNED NULL,
    song_title VARCHAR(255) NULL,
    song_artist VARCHAR(255) NULL,

    mood VARCHAR(100) NULL,
    caption TEXT NULL,
    location VARCHAR(255) NULL,

    image_url VARCHAR(500) NULL,

    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT fk_memories_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_memories_cycle
        FOREIGN KEY (cycle_id)
        REFERENCES echo_cycles(id)
        ON DELETE CASCADE,

    INDEX idx_memories_user_id (user_id),
    INDEX idx_memories_cycle_id (cycle_id),
    INDEX idx_memories_created_at (created_at),
    INDEX idx_memories_user_cycle (user_id, cycle_id)
);


-- ============================================
-- Likes
-- ============================================

CREATE TABLE memory_likes (
    memory_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (memory_id, user_id),

    CONSTRAINT fk_memory_likes_memory
        FOREIGN KEY (memory_id)
        REFERENCES memories(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_memory_likes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_memory_likes_user_id (user_id)
);


-- ============================================
-- Comments
-- ============================================

CREATE TABLE memory_comments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,

    memory_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    content TEXT NOT NULL,

    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT fk_memory_comments_memory
        FOREIGN KEY (memory_id)
        REFERENCES memories(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_memory_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_memory_comments_memory_id (memory_id),
    INDEX idx_memory_comments_user_id (user_id),
    INDEX idx_memory_comments_created_at (created_at)
);


-- ============================================
-- User's last streak cycle
-- ============================================

ALTER TABLE users
ADD CONSTRAINT fk_users_last_streak_cycle
    FOREIGN KEY (last_streak_cycle_id)
    REFERENCES echo_cycles(id)
    ON DELETE SET NULL;