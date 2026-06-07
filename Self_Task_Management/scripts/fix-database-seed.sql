-- =============================================================================
-- Fix: Seed roles, modules và tạo notifications table
-- Chạy file này trong Supabase Dashboard → SQL Editor
-- =============================================================================

-- =============================================
-- 1. Seed roles table (nếu chưa có dữ liệu)
-- =============================================
INSERT INTO roles (id, name)
OVERRIDING SYSTEM VALUE
SELECT v.id, v.name FROM (VALUES
  (1, 'admin'),
  (2, 'member')
) AS v(id, name)
WHERE NOT EXISTS (SELECT 1 FROM roles);

-- =============================================
-- 2. Seed modules table (nếu chưa có dữ liệu)
-- =============================================
INSERT INTO modules (id, name)
OVERRIDING SYSTEM VALUE
SELECT v.id, v.name FROM (VALUES
  (1, 'tasks'),
  (2, 'comments'),
  (3, 'attachments'),
  (4, 'invite')
) AS v(id, name)
WHERE NOT EXISTS (SELECT 1 FROM modules);

-- =============================================
-- 3. Tạo bảng notifications (nếu chưa tồn tại)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view own notifications') THEN
    CREATE POLICY "Users can view own notifications"
      ON public.notifications FOR SELECT
      USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update own notifications') THEN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications FOR UPDATE
      USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Service role can insert notifications') THEN
    CREATE POLICY "Service role can insert notifications"
      ON public.notifications FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;
