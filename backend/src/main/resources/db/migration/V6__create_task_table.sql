CREATE TABLE tasks (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    status            VARCHAR(50) NOT NULL,
    project_id        BIGINT NOT NULL,
    organization_id   BIGINT NOT NULL,
    affected_user_id  BIGINT,
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_user FOREIGN KEY (affected_user_id) REFERENCES users(id) ON DELETE SET NULL
);
