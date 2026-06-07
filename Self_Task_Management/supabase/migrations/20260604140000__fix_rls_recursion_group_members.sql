-- =============================================================================
-- Migration: Fix infinite recursion in group_members RLS policies
-- =============================================================================
-- Lỗi: infinite recursion detected in policy for relation "group_members"
-- Nguyên nhân: Policies trên group_members tự tham chiếu group_members
-- Giải pháp: Dùng SECURITY DEFINER functions bypass RLS để tránh recursion
-- =============================================================================

-- ==========================================
-- 1. Helper SECURITY DEFINER functions
--    Chạy với quyền owner (superuser), bypass RLS
-- ==========================================

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS BIGINT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(gid BIGINT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = public.current_user_id() AND role_id = 1
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(gid BIGINT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = public.current_user_id()
  );
$$;

-- ==========================================
-- 2. Fix group_members policies (tự tham chiếu → recursion)
-- ==========================================

DROP POLICY IF EXISTS "Users can view members" ON public.group_members;
CREATE POLICY "Users can view members"
  ON public.group_members FOR SELECT
  USING (
    user_id = public.current_user_id()
    OR
    group_id IN (SELECT id FROM public.groups WHERE created_by = public.current_user_id())
    OR
    public.is_group_admin(group_id)
  );

DROP POLICY IF EXISTS "Users can insert members" ON public.group_members;
CREATE POLICY "Users can insert members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = public.current_user_id()
    OR
    public.is_group_admin(group_id)
  );

DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;
CREATE POLICY "Admins can update members"
  ON public.group_members FOR UPDATE
  USING (public.is_group_admin(group_id));

DROP POLICY IF EXISTS "Admins can delete members" ON public.group_members;
CREATE POLICY "Admins can delete members"
  ON public.group_members FOR DELETE
  USING (public.is_group_admin(group_id));

-- ==========================================
-- 3. Fix groups policies (dùng helper để tránh lỗi tiềm ẩn)
-- ==========================================

DROP POLICY IF EXISTS "Users can view groups" ON public.groups;
CREATE POLICY "Users can view groups"
  ON public.groups FOR SELECT
  USING (
    created_by = public.current_user_id()
    OR
    public.is_group_member(id)
  );

-- ==========================================
-- 4. Fix group_modules policies (dùng helper cho nhất quán)
-- ==========================================

DROP POLICY IF EXISTS "Users can view modules" ON public.group_modules;
CREATE POLICY "Users can view modules"
  ON public.group_modules FOR SELECT
  USING (public.is_group_member(group_id));

DROP POLICY IF EXISTS "Admins can insert modules" ON public.group_modules;
CREATE POLICY "Admins can insert modules"
  ON public.group_modules FOR INSERT
  WITH CHECK (public.is_group_admin(group_id));

DROP POLICY IF EXISTS "Admins can update modules" ON public.group_modules;
CREATE POLICY "Admins can update modules"
  ON public.group_modules FOR UPDATE
  USING (public.is_group_admin(group_id));

DROP POLICY IF EXISTS "Admins can delete modules" ON public.group_modules;
CREATE POLICY "Admins can delete modules"
  ON public.group_modules FOR DELETE
  USING (public.is_group_admin(group_id));
