-- =============================================================================
-- Migration: Update task_tags RLS policies to support group tasks
-- =============================================================================
-- Lý do: task_tags policy cũ chỉ kiểm tra personal_tasks, nhưng task nhóm
-- không còn personal_tasks entry nữa. Cần cho phép cả group tasks.
-- =============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own task_tags" ON public.task_tags;
DROP POLICY IF EXISTS "Users can insert own task_tags" ON public.task_tags;
DROP POLICY IF EXISTS "Users can delete own task_tags" ON public.task_tags;

-- New SELECT policy: allow if task is in personal_tasks OR if task belongs to user's group
CREATE POLICY "Users can read own task_tags"
  ON public.task_tags FOR SELECT
  USING (
    task_id IN (
      SELECT task_id FROM public.personal_tasks
      WHERE user_id = public.current_user_id()
    )
    OR
    task_id IN (
      SELECT id FROM public.tasks
      WHERE group_id IS NOT NULL
        AND public.is_group_member(group_id)
    )
  );

-- New INSERT policy: same condition
CREATE POLICY "Users can insert own task_tags"
  ON public.task_tags FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT task_id FROM public.personal_tasks
      WHERE user_id = public.current_user_id()
    )
    OR
    task_id IN (
      SELECT id FROM public.tasks
      WHERE group_id IS NOT NULL
        AND public.is_group_member(group_id)
    )
  );

-- New DELETE policy: same condition
CREATE POLICY "Users can delete own task_tags"
  ON public.task_tags FOR DELETE
  USING (
    task_id IN (
      SELECT task_id FROM public.personal_tasks
      WHERE user_id = public.current_user_id()
    )
    OR
    task_id IN (
      SELECT id FROM public.tasks
      WHERE group_id IS NOT NULL
        AND public.is_group_member(group_id)
    )
  );
