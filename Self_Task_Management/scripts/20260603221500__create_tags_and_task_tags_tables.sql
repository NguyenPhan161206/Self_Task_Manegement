-- =============================================================================
-- Migration: Create tags + task_tags tables with RLS policies
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================
-- tags:       global per-user tags (max 10 tags per user)
-- task_tags:  many-to-many junction between tasks and tags
-- =============================================================================

-- ==========================================
-- 1. public.tags
-- ==========================================
CREATE TABLE IF NOT EXISTS public.tags (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name       VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT tags_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  UNIQUE(user_id, name)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tags' AND policyname = 'Users can read own tags') THEN
    CREATE POLICY "Users can read own tags"
      ON public.tags FOR SELECT
      USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tags' AND policyname = 'Users can insert own tags') THEN
    CREATE POLICY "Users can insert own tags"
      ON public.tags FOR INSERT
      WITH CHECK (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tags' AND policyname = 'Users can delete own tags') THEN
    CREATE POLICY "Users can delete own tags"
      ON public.tags FOR DELETE
      USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

-- ==========================================
-- 2. public.task_tags
-- ==========================================
CREATE TABLE IF NOT EXISTS public.task_tags (
  id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id  BIGINT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id   BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(task_id, tag_id)
);

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_tags' AND policyname = 'Users can read own task_tags') THEN
    CREATE POLICY "Users can read own task_tags"
      ON public.task_tags FOR SELECT
      USING (
        task_id IN (
          SELECT task_id FROM public.personal_tasks
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_tags' AND policyname = 'Users can insert own task_tags') THEN
    CREATE POLICY "Users can insert own task_tags"
      ON public.task_tags FOR INSERT
      WITH CHECK (
        task_id IN (
          SELECT task_id FROM public.personal_tasks
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_tags' AND policyname = 'Users can delete own task_tags') THEN
    CREATE POLICY "Users can delete own task_tags"
      ON public.task_tags FOR DELETE
      USING (
        task_id IN (
          SELECT task_id FROM public.personal_tasks
          WHERE user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;

-- ==========================================
-- 3. Migrate existing data from tasks.tags → task_tags
-- ==========================================
DO $$ BEGIN
  -- Insert each unique tag per user into tags table
  INSERT INTO public.tags (user_id, name)
  SELECT DISTINCT pt.user_id, TRIM(LOWER(unnest(string_to_array(t.tags, ','))))
  FROM public.tasks t
  JOIN public.personal_tasks pt ON pt.task_id = t.id
  WHERE t.tags IS NOT NULL AND TRIM(t.tags) != ''
  ON CONFLICT (user_id, name) DO NOTHING;

  -- Link tasks to tags via task_tags
  INSERT INTO public.task_tags (task_id, tag_id)
  SELECT DISTINCT t.id, tg.id
  FROM public.tasks t
  JOIN public.personal_tasks pt ON pt.task_id = t.id
  JOIN public.tags tg ON tg.user_id = pt.user_id
    AND tg.name = ANY(STRING_TO_ARRAY(LOWER(t.tags), ','))
  WHERE t.tags IS NOT NULL AND TRIM(t.tags) != ''
  ON CONFLICT (task_id, tag_id) DO NOTHING;
END $$;

-- ==========================================
-- Enable Realtime on task_tags (so tag changes trigger refetch)
-- ==========================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'task_tags'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_tags;
  END IF;
END $$;

-- ==========================================
-- Kiểm tra:
--   SELECT * FROM public.tags ORDER BY user_id, name;
--   SELECT * FROM public.task_tags ORDER BY task_id, tag_id;
-- ==========================================
