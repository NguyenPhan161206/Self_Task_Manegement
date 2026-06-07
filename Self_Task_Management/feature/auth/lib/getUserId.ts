'use server'

import { createClient, supabaseAdmin } from '@/lib/supabase/server'

/**
 * Lấy users.id (bigint) từ Supabase Auth session hiện tại.
 * Dùng auth_user_id để bridge giữa auth.users (UUID) và public.users (bigint).
 * Tự động tạo users row nếu chưa tồn tại (self-healing).
 * Trả về null nếu chưa đăng nhập.
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

  if (data?.id) return data.id

  // ── Self-healing: tạo users row nếu Auth user tồn tại nhưng chưa có trong public.users ──
  const username =
    user.user_metadata?.username ??
    user.email?.split('@')[0] ??
    `user-${user.id.slice(0, 8)}`

  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('users')
    .insert({
      username,
      email: user.email,
      auth_user_id: user.id,
      password_hash: 'auto-managed',
    })
    .select('id')
    .single()

  if (insertError || !newUser) return null
  return newUser.id
}
