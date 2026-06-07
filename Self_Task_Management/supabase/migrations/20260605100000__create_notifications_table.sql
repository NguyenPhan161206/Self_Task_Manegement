-- =============================================================================
-- Migration: Create notifications table for in-app notifications
-- =============================================================================
-- Chạy file này trong Supabase Dashboard → SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,             -- 'group_invite' | 'group_invite_accepted'
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
