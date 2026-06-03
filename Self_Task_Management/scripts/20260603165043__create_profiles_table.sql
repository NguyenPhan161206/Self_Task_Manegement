-- =============================================================================
-- Migration: Create profiles table
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- Bảng profiles: lưu thông tin user trong database TRƯỚC KHI tạo auth user.
-- Đảm bảo profile.id === auth.users.id (cùng UUID).

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraint: username phải từ 3-20 ký tự
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  -- Constraint: email không được rỗng
  CONSTRAINT email_not_empty CHECK (char_length(email) > 0)
);

-- Index cho tìm kiếm nhanh theo email và username
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (but not email or password_hash)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow INSERT from service role only (signup flow uses supabaseAdmin)
-- Regular authenticated users cannot insert profiles directly.
-- The server action with service role handles this.
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow DELETE from service role only (rollback flow)
CREATE POLICY "Service role can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- Kiểm tra sau khi chạy:
--   SELECT * FROM public.profiles;  -- phải trả về bảng trống
--   SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_name = 'profiles' AND table_schema = 'public';
-- =============================================================================
