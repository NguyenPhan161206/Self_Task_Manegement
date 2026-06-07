-- Add assignee_id column to tasks table for group task assignment
ALTER TABLE public.tasks ADD COLUMN assignee_id BIGINT REFERENCES public.users(id);
