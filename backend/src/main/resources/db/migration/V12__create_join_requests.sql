CREATE TABLE join_requests (
    join_request_id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    user_id          BIGINT NOT NULL REFERENCES users(id),
    status           VARCHAR(30) NOT NULL,           -- PENDING | APPROVED | REJECTED
    requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at      TIMESTAMPTZ,
    reviewer_id      BIGINT REFERENCES users(id)
);

CREATE UNIQUE INDEX uq_join_requests_pending
    ON join_requests(organization_id, user_id)
    WHERE status = 'PENDING';

CREATE INDEX idx_join_requests_org_status ON join_requests (organization_id, status, requested_at DESC);