-- =============================================================================
-- Migration: Add RLS policies for groups, group_members, group_modules
-- =============================================================================
-- Lý do: Các bảng groups/group_members/group_modules có RLS enabled mặc định
-- nhưng không có policy, gây lỗi "new row violates row-level security policy"
-- khi server action (createGroup) cố INSERT.
-- Pattern theo các policies có sẵn trong scripts/*.sql
-- =============================================================================

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_modules ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. public.groups
-- ==========================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'groups' AND policyname = 'Users can create groups') THEN
    CREATE POLICY "Users can create groups"
      ON public.groups FOR INSERT
      WITH CHECK (created_by = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'groups' AND policyname = 'Users can view groups') THEN
    CREATE POLICY "Users can view groups"
      ON public.groups FOR SELECT
      USING (
        created_by = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR
        id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'groups' AND policyname = 'Admins can update groups') THEN
    CREATE POLICY "Admins can update groups"
      ON public.groups FOR UPDATE
      USING (
        id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'groups' AND policyname = 'Admins can delete groups') THEN
    CREATE POLICY "Admins can delete groups"
      ON public.groups FOR DELETE
      USING (
        id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;

-- ==========================================
-- 2. public.group_members
-- ==========================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Users can view members') THEN
    CREATE POLICY "Users can view members"
      ON public.group_members FOR SELECT
      USING (
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Users can insert members') THEN
    CREATE POLICY "Users can insert members"
      ON public.group_members FOR INSERT
      WITH CHECK (
        -- Cho phép user thêm chính họ (khi tạo nhóm) hoặc admin thêm member
        user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        OR
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Admins can update members') THEN
    CREATE POLICY "Admins can update members"
      ON public.group_members FOR UPDATE
      USING (
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Admins can delete members') THEN
    CREATE POLICY "Admins can delete members"
      ON public.group_members FOR DELETE
      USING (
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;

-- ==========================================
-- 3. public.group_modules
-- ==========================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_modules' AND policyname = 'Users can view modules') THEN
    CREATE POLICY "Users can view modules"
      ON public.group_modules FOR SELECT
      USING (
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_modules' AND policyname = 'Admins can insert modules') THEN
    CREATE POLICY "Admins can insert modules"
      ON public.group_modules FOR INSERT
      WITH CHECK (
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_modules' AND policyname = 'Admins can update modules') THEN
    CREATE POLICY "Admins can update modules"
      ON public.group_modules FOR UPDATE
      USING (
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_modules' AND policyname = 'Admins can delete modules') THEN
    CREATE POLICY "Admins can delete modules"
      ON public.group_modules FOR DELETE
      USING (
        group_id IN (
          SELECT group_id FROM public.group_members
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role_id = 1
        )
      );
  END IF;
END $$;
