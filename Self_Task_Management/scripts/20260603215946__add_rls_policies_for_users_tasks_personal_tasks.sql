-- =============================================================================
-- Migration: Add RLS policies for users, tasks, personal_tasks
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================
-- Lý do: Cả 3 bảng đều có RLS enabled nhưng không có policy nào,
-- khiến anon key không thể đọc/ghi dữ liệu, gây lỗi "Chưa đăng nhập"
-- khi tạo nhiệm vụ.
-- =============================================================================

-- ==========================================
-- 1. public.users
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can read own record') THEN
    CREATE POLICY "Users can read own record"
      ON public.users FOR SELECT
      USING (auth.uid() = auth_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own record') THEN
    CREATE POLICY "Users can update own record"
      ON public.users FOR UPDATE
      USING (auth.uid() = auth_user_id)
      WITH CHECK (auth.uid() = auth_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role can insert users') THEN
    CREATE POLICY "Service role can insert users"
      ON public.users FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Service role can delete users') THEN
    CREATE POLICY "Service role can delete users"
      ON public.users FOR DELETE
      USING (true);
  END IF;
END $$;

-- ==========================================
-- 2. public.tasks
-- ==========================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can read their tasks') THEN
    CREATE POLICY "Users can read their tasks"
      ON public.tasks FOR SELECT
      USING (
        creator_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR
        id IN (
          SELECT task_id FROM public.personal_tasks
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can insert tasks') THEN
    CREATE POLICY "Users can insert tasks"
      ON public.tasks FOR INSERT
      WITH CHECK (
        creator_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can update their tasks') THEN
    CREATE POLICY "Users can update their tasks"
      ON public.tasks FOR UPDATE
      USING (
        creator_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      )
      WITH CHECK (
        creator_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can delete their tasks') THEN
    CREATE POLICY "Users can delete their tasks"
      ON public.tasks FOR DELETE
      USING (
        creator_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;

-- ==========================================
-- 3. public.personal_tasks
-- ==========================================
ALTER TABLE public.personal_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personal_tasks' AND policyname = 'Users can read own personal_tasks') THEN
    CREATE POLICY "Users can read own personal_tasks"
      ON public.personal_tasks FOR SELECT
      USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personal_tasks' AND policyname = 'Users can insert own personal_tasks') THEN
    CREATE POLICY "Users can insert own personal_tasks"
      ON public.personal_tasks FOR INSERT
      WITH CHECK (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'personal_tasks' AND policyname = 'Users can delete own personal_tasks') THEN
    CREATE POLICY "Users can delete own personal_tasks"
      ON public.personal_tasks FOR DELETE
      USING (
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;

-- ==========================================
-- Kiểm tra sau khi chạy:
--   SELECT tablename, policyname, cmd
--   FROM pg_policies
--   WHERE tablename IN ('users', 'tasks', 'personal_tasks')
--   ORDER BY tablename, policyname;
-- ==========================================
