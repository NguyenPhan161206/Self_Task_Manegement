-- =============================================================================
-- Migration: Add DB trigger to enforce max tags per user
-- Admin/Dev muốn đổi số lượng tag tối đa:
--   CREATE OR REPLACE FUNCTION public.get_max_tags_per_user()
--   RETURNS int AS $$ BEGIN RETURN 20; END; $$ LANGUAGE plpgsql IMMUTABLE;
-- =============================================================================

-- Hàm trả về số lượng tag tối đa cho mỗi user
-- Đây là single source of truth; dev/admin chỉ cần sửa hàm này
CREATE OR REPLACE FUNCTION public.get_max_tags_per_user()
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN 10;
END;
$$;

-- Trigger function: kiểm tra giới hạn trước khi INSERT
CREATE OR REPLACE FUNCTION public.check_tags_per_user_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  current_count int;
  max_allowed int;
BEGIN
  max_allowed := public.get_max_tags_per_user();
  SELECT COUNT(*) INTO current_count
  FROM public.tags
  WHERE user_id = NEW.user_id;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Mỗi người dùng chỉ được tạo tối đa % thẻ.', max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_tags_per_user_limit ON public.tags;

CREATE TRIGGER enforce_tags_per_user_limit
  BEFORE INSERT ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.check_tags_per_user_limit();

-- =============================================================================
-- Kiểm tra:
--   SELECT public.get_max_tags_per_user();
-- =============================================================================
