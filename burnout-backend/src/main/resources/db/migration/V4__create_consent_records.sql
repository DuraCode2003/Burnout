CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_consented BOOLEAN NOT NULL DEFAULT false,
    anonymize_data BOOLEAN NOT NULL DEFAULT true,
    consented_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_has_consented ON consent_records(has_consented);

CREATE UNIQUE INDEX IF NOT EXISTS idx_consent_records_unique_user_id 
ON consent_records(user_id) 
WHERE has_consented IS NOT NULL;
