-- =============================================================================
-- Migration: Enable Realtime on tasks table
-- =============================================================================
-- Thêm bảng tasks vào publication supabase_realtime để client có thể
-- lắng nghe thay đổi (INSERT / UPDATE / DELETE) qua WebSocket.
-- =============================================================================

-- Thêm tasks vào publication (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
END $$;

-- REPLICA IDENTITY FULL giúp Realtime gửi đầy đủ dữ liệu row cũ + mới
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class
    WHERE relname = 'tasks' AND relreplident = 'f'
  ) THEN
    ALTER TABLE public.tasks REPLICA IDENTITY FULL;
  END IF;
END $$;

-- =============================================================================
-- Kiểm tra:
--   SELECT schemaname, tablename, pubname
--   FROM pg_publication_tables
--   WHERE pubname = 'supabase_realtime' AND schemaname = 'public';
-- =============================================================================
