'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Lấy users.id (bigint) từ Supabase Auth session hiện tại.
 * Dùng auth_user_id để bridge giữa auth.users (UUID) và public.users (bigint).
 * Trả về null nếu chưa đăng nhập hoặc không tìm thấy.
 */
export async function getUserIdFromAuth(): Promise<number | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  return data?.id ?? null
}
