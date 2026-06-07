-- Add columns to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE groups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Create group_modules table for per-group feature toggles
CREATE TABLE IF NOT EXISTS group_modules (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  module_id BIGINT NOT NULL REFERENCES modules(id),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(group_id, module_id)
);

-- Seed modules (if table is empty)
INSERT INTO modules (id, name)
OVERRIDING SYSTEM VALUE
SELECT v.id, v.name FROM (VALUES
  (1, 'tasks'),
  (2, 'comments'),
  (3, 'attachments'),
  (4, 'invite')
) AS v(id, name)
WHERE NOT EXISTS (SELECT 1 FROM modules);

-- Seed roles (if table is empty)
INSERT INTO roles (id, name)
OVERRIDING SYSTEM VALUE
SELECT v.id, v.name FROM (VALUES
  (1, 'admin'),
  (2, 'member')
) AS v(id, name)
WHERE NOT EXISTS (SELECT 1 FROM roles);
