-- =============================================================================
-- Migration: Drop profiles table
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================================================

-- Xóa bảng profiles mà chúng ta vừa tạo
DROP TABLE IF EXISTS public.profiles CASCADE;

-- (Tùy chọn) Kiểm tra xem bảng user có đúng cấu trúc như ứng dụng mong đợi không:
-- id (UUID), email (TEXT), username (TEXT), password_hash (TEXT)
