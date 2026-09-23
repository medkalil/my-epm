CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT,
    actor           VARCHAR(100) NOT NULL,
    action          VARCHAR(50)  NOT NULL,
    resource        VARCHAR(100),
    resource_id     BIGINT,
    http_method     VARCHAR(10),
    path            VARCHAR(255),
    status_code     INT,
    success         BOOLEAN NOT NULL DEFAULT TRUE,
    error_message   TEXT,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(255),
    duration_ms     BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_created ON audit_logs (organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_org_action  ON audit_logs (organization_id, action);
CREATE INDEX idx_audit_logs_org_actor   ON audit_logs (organization_id, actor);