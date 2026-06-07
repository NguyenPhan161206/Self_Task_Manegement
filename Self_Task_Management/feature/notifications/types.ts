import type { Database } from '@/types/database'

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type NotificationType = 'group_invite' | 'group_invite_accepted'
