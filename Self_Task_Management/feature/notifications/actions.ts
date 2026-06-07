'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'

import type { Notification, NotificationInsert } from './types'

export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return (data ?? []) as Notification[]
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  return count ?? 0
}

export async function createNotification(input: NotificationInsert) {
  const { supabaseAdmin } = await import('@/lib/supabase/server')

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert(input)

  if (error) {
    console.error('[createNotification]', error.message)
  }
}

export async function markAsRead(notificationId: number) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
}

export async function markAllAsRead() {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}
