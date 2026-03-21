CREATE TABLE IF NOT EXISTS breathing_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    exercise_name VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,
    pre_stress_level INTEGER NOT NULL,
    post_stress_level INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_breathing FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_breathing_user ON breathing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_breathing_created_at ON breathing_sessions(created_at);
