USE echo;

CREATE TABLE IF NOT EXISTS user_spotify_oauth_states (
    user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    state VARCHAR(128) NOT NULL,
    code_verifier VARCHAR(256) NOT NULL,
    expires_at TIMESTAMP(3) NOT NULL,
    consumed_at TIMESTAMP(3) NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE KEY uq_user_spotify_oauth_states_state (state),
    INDEX idx_user_spotify_oauth_states_expires_at (expires_at),

    CONSTRAINT fk_user_spotify_oauth_states_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_spotify_connections (
    user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    refresh_token_encrypted TEXT NOT NULL,
    spotify_user_id VARCHAR(128) NULL,
    scope VARCHAR(512) NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
        ON UPDATE CURRENT_TIMESTAMP(3),

    CONSTRAINT fk_user_spotify_connections_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
