-- Add created_at column to tasks table for chart data
ALTER TABLE tasks ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();

-- Backfill existing tasks: use start_date if available, otherwise now()
UPDATE tasks SET created_at = start_date WHERE created_at IS NULL AND start_date IS NOT NULL;
UPDATE tasks SET created_at = now() WHERE created_at IS NULL;
