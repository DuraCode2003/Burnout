CREATE TABLE IF NOT EXISTS burnout_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(10) NOT NULL,
    calculation_method VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_burnout_scores_user_id ON burnout_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_burnout_scores_created_at ON burnout_scores(created_at);
CREATE INDEX IF NOT EXISTS idx_burnout_scores_risk_level ON burnout_scores(risk_level);
