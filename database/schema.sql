-- ==========================================================================
-- GAMEZONE — MYSQL 8.0 DATABASE SCHEMA MIGRATION SCRIPT
-- ==========================================================================

CREATE DATABASE IF NOT EXISTS gamezone_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gamezone_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Games Table
CREATE TABLE IF NOT EXISTS games (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_game_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Game Sessions Table
CREATE TABLE IF NOT EXISTS game_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    session_token VARCHAR(100) NOT NULL UNIQUE,
    started_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    completed_at DATETIME(6) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    INDEX idx_session_user_status (user_id, status),
    INDEX idx_session_token (session_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Scores Table
CREATE TABLE IF NOT EXISTS scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    game_session_id BIGINT NOT NULL UNIQUE,
    score INT NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    achieved_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    validation_status VARCHAR(20) NOT NULL DEFAULT 'VALID',
    CONSTRAINT fk_score_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_score_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    CONSTRAINT fk_score_session FOREIGN KEY (game_session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    INDEX idx_score_game_score (game_id, score DESC, achieved_at ASC),
    INDEX idx_score_user_game (user_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Initial 5 Arcade Games
INSERT INTO games (name, slug, description, active) VALUES
('Snake Game', 'snake', 'Classic retro snake game. Navigate, eat food, grow longer and avoid wall collisions.', TRUE),
('2D Car Racing', 'car-racing', 'Endless top-down highway speed driver. Dodge traffic and stay alive for max distance.', TRUE),
('Tic-Tac-Toe', 'tic-tac-toe', 'Tactical 3x3 grid battle. Play vs smart AI computer or local multiplayer friend.', TRUE),
('Memory Match', 'memory-match', 'Memory training card match puzzle. Uncover pairs in shortest duration and minimal moves.', TRUE),
('Rock-Paper-Scissors', 'rock-paper-scissors', 'Best-of-5 classic decision match. Outsmart the computer opponent to claim victory.', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
