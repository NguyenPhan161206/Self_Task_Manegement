-- =============================================================================
-- Migration: Add SELECT policies for lookup tables (roles, modules)
-- =============================================================================
-- Lý do: roles và modules có RLS enabled nhưng không có SELECT policy nào,
-- khiến authenticated user không thể đọc dữ liệu qua embedded query
-- (ví dụ: group_members → roles(name) trả về null)
-- =============================================================================

-- 1. public.roles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Enable read for authenticated users') THEN
    CREATE POLICY "Enable read for authenticated users"
      ON public.roles FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- 2. public.modules
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Enable read for authenticated users') THEN
    CREATE POLICY "Enable read for authenticated users"
      ON public.modules FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
