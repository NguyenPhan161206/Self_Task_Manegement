-- =============================================================================
-- Migration: Remove app_settings, hardcode tag limit back in function
-- Chỉ developer mới có thể đổi limit qua SQL (sửa hàm dưới đây)
-- =============================================================================

-- Xoá bảng app_settings (không còn dùng)
DROP TABLE IF EXISTS public.app_settings CASCADE;

-- Hardcode limit trực tiếp trong function
CREATE OR REPLACE FUNCTION public.get_max_tags_per_user()
RETURNS int
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN 10;
END;
$$;
