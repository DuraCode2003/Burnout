-- V10: Add Support Sessions and Chat Messages
ALTER TABLE alerts ADD COLUMN support_requested BOOLEAN DEFAULT FALSE;

CREATE TABLE support_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    counselor_id UUID REFERENCES users(id),
    alert_id UUID NOT NULL REFERENCES alerts(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES support_sessions(id),
    sender_type VARCHAR(20) NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_support_sessions_alert_id ON support_sessions(alert_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
