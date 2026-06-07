-- Remove personal_tasks entries for tasks that belong to a group
-- These tasks were created before the fix and should not appear in personal view
DELETE FROM public.personal_tasks
WHERE task_id IN (SELECT id FROM public.tasks WHERE group_id IS NOT NULL);
