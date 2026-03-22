-- V5__create_alerts.sql
-- Create alerts table for counselor dashboard
-- Privacy-focused: student identity only shown if anonymize_data = false

-- Main alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Student reference (FK to users)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Alert classification
    alert_type VARCHAR(10) NOT NULL CHECK (alert_type IN ('YELLOW', 'ORANGE', 'RED')),
    status VARCHAR(15) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED')),
    
    -- Alert details
    trigger_reason TEXT NOT NULL,
    burnout_score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    
    -- Counselor assignment (nullable until acknowledged)
    counselor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Counselor notes (internal only, student never sees)
    counselor_note TEXT,
    
    -- Timestamps for tracking
    contacted_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit table for tracking status changes
CREATE TABLE alerts_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    old_status VARCHAR(15),
    new_status VARCHAR(15) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    note TEXT
);

-- Indexes for query performance
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_counselor_id ON alerts(counselor_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Partial index for fast ACTIVE alert queue queries (most common query)
CREATE INDEX idx_alerts_active ON alerts(id, alert_type, created_at) 
    WHERE status = 'ACTIVE';

-- Index for resolved alerts history queries
CREATE INDEX idx_alerts_resolved ON alerts(resolved_at DESC, user_id) 
    WHERE resolved_at IS NOT NULL;

-- Index for audit trail queries
CREATE INDEX idx_alerts_audit_alert_id ON alerts_audit(alert_id, changed_at DESC);
CREATE INDEX idx_alerts_audit_changed_by ON alerts_audit(changed_by, changed_at DESC);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_alerts_updated_at();

-- Trigger to auto-insert audit record on status change
CREATE OR REPLACE FUNCTION log_alert_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO alerts_audit (alert_id, old_status, new_status, changed_by, changed_at, note)
        VALUES (NEW.id, OLD.status, NEW.status, NEW.counselor_id, NOW(), 
                CASE 
                    WHEN NEW.status = 'RESOLVED' THEN 'Alert resolved'
                    WHEN NEW.status = 'ESCALATED' THEN 'Alert escalated to senior counselor'
                    WHEN NEW.status = 'ACKNOWLEDGED' THEN 'Alert acknowledged by counselor'
                    ELSE NULL
                END);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_alerts_status_change
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION log_alert_status_change();

-- Add comments for documentation
COMMENT ON TABLE alerts IS 'Alert records for counselor dashboard - triggered by burnout risk detection';
COMMENT ON TABLE alerts_audit IS 'Audit trail for alert status changes - tracks all transitions';
COMMENT ON COLUMN alerts.alert_type IS 'Alert severity: YELLOW (monitoring), ORANGE (needs attention), RED (urgent)';
COMMENT ON COLUMN alerts.status IS 'Alert lifecycle: ACTIVE, ACKNOWLEDGED, RESOLVED, ESCALATED';
COMMENT ON COLUMN alerts.counselor_note IS 'Chronological log of counselor actions and internal notes';
COMMENT ON COLUMN alerts.user_id IS 'Student user ID - identity shown based on consent.anonymize_data';
COMMENT ON COLUMN alerts.counselor_id IS 'Assigned counselor (NULL until acknowledged)';
COMMENT ON COLUMN alerts.trigger_reason IS 'Plain English explanation of what behavioral pattern triggered this alert';
COMMENT ON COLUMN alerts.risk_level IS 'Risk level at time of alert: LOW, MEDIUM, HIGH, CRITICAL';

-- Grant permissions (adjust based on your DB user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON alerts TO burnout_app;
-- GRANT SELECT, INSERT ON alerts_audit TO burnout_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO burnout_app;
