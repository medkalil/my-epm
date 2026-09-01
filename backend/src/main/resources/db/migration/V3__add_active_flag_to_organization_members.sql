ALTER TABLE organization_members ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark the earliest joined organization as active for each existing user
UPDATE organization_members
SET is_active = TRUE
WHERE id IN (
    SELECT MIN(id)
    FROM organization_members
    GROUP BY user_id
);