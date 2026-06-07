import type { Database } from '@/types/database'

export type Group = Database['public']['Tables']['groups']['Row']
export type GroupInsert = Database['public']['Tables']['groups']['Insert']
export type GroupUpdate = Database['public']['Tables']['groups']['Update']

export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type GroupMemberInsert = Database['public']['Tables']['group_members']['Insert']

export type GroupModule = Database['public']['Tables']['group_modules']['Row']
export type GroupModuleInsert = Database['public']['Tables']['group_modules']['Insert']

export type Module = Database['public']['Tables']['modules']['Row']
export type Role = Database['public']['Tables']['roles']['Row']

export interface GroupWithMeta extends Group {
  member_count?: number
  role?: 'admin' | 'member'
}

export interface GroupMemberWithUser extends GroupMember {
  users?: { id: number; username: string; email: string | null; avatar: string | null }
  roles?: { id: number; name: string }
}

export interface GroupModuleWithModule extends GroupModule {
  modules?: { id: number; name: string }
}

export type GroupRole = 'admin' | 'member'
