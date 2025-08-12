-- Tabla de auditoría profesional para el sistema COFADENA
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    username VARCHAR(100),
    action_type VARCHAR(32) NOT NULL, -- create, update, delete, login, etc
    entity VARCHAR(32) NOT NULL,      -- projects, clients, users, etc
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    extra JSONB
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_auditlog_created_at ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auditlog_user_id ON audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_auditlog_action_type ON audit_log (action_type);
CREATE INDEX IF NOT EXISTS idx_auditlog_entity ON audit_log (entity);
