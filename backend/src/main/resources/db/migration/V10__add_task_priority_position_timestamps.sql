ALTER TABLE tasks
    ADD COLUMN priority     VARCHAR(20),
    ADD COLUMN position     INT NOT NULL DEFAULT 0,
    ADD COLUMN created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill positions per status lane, ordered by id (first task = position 0)
WITH numbered AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY status ORDER BY id) - 1 AS rn
    FROM tasks
)
UPDATE tasks t
SET position = numbered.rn
FROM numbered
WHERE t.id = numbered.id;