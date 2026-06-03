-- =============================================================================
-- Migration: App settings table for configurable tag limit
-- Giúp admin/dev đổi số lượng tag tối đa qua UI thay vì sửa SQL
-- =============================================================================

-- ==========================================
-- 1. Bảng app_settings (lưu cấu hình động)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO public.app_settings (key, value)
VALUES ('max_tags_per_user', '10')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Anyone can read app_settings') THEN
    CREATE POLICY "Anyone can read app_settings"
      ON public.app_settings FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Can insert app_settings') THEN
    CREATE POLICY "Can insert app_settings"
      ON public.app_settings FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Can update app_settings') THEN
    CREATE POLICY "Can update app_settings"
      ON public.app_settings FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- ==========================================
-- 2. Cập nhật trigger function đọc từ settings
-- ==========================================
CREATE OR REPLACE FUNCTION public.get_max_tags_per_user()
RETURNS int
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  val TEXT;
BEGIN
  SELECT value INTO val FROM public.app_settings WHERE key = 'max_tags_per_user';
  RETURN COALESCE(val::int, 10);
END;
$$;

-- ==========================================
-- Kiểm tra:
--   SELECT public.get_max_tags_per_user();
--   UPDATE app_settings SET value = '20' WHERE key = 'max_tags_per_user';
--   SELECT public.get_max_tags_per_user();
-- ==========================================
