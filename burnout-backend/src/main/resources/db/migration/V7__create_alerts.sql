-- V7__create_alerts.sql
-- Create alerts table for counselor dashboard

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(10) NOT NULL,
    status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE',
    trigger_reason TEXT,
    burnout_score DECIMAL(5,2),
    risk_level VARCHAR(10),
    counselor_id UUID REFERENCES users(id),
    counselor_note TEXT,
    contacted_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_counselor ON alerts(counselor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved_at ON alerts(resolved_at DESC) WHERE resolved_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON TABLE alerts IS 'Alert records for counselor dashboard - triggered by burnout risk detection';
COMMENT ON COLUMN alerts.alert_type IS 'Alert severity: YELLOW (monitoring), ORANGE (needs attention), RED (urgent)';
COMMENT ON COLUMN alerts.status IS 'Alert lifecycle: ACTIVE, ACKNOWLEDGED, RESOLVED, ESCALATED';
COMMENT ON COLUMN alerts.counselor_note IS 'Chronological log of counselor actions and notes';
