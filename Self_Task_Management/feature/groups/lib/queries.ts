'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'

import type { Group, GroupWithMeta, GroupMemberWithUser, GroupModuleWithModule, Module } from '../types'

export async function getUserGroups(): Promise<GroupWithMeta[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(*), roles(name)')
    .eq('user_id', userId)

  if (!memberships) return []

  const results: GroupWithMeta[] = []
  for (const m of memberships) {
    const group = m.groups as Group | null
    if (!group) continue

    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id)

    results.push({
      ...group,
      member_count: count ?? 0,
      role: m.roles?.name as 'admin' | 'member' | undefined,
    })
  }

  return results
}

export async function getGroupById(groupId: number): Promise<GroupWithMeta | null> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return null

  const { data: membership } = await supabase
    .from('group_members')
    .select('groups(*), roles(name)')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership) return null

  const group = membership.groups as Group | null
  if (!group) return null

  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  return {
    ...group,
    member_count: count ?? 0,
    role: membership.roles?.name as 'admin' | 'member' | undefined,
  }
}

export async function getGroupMembers(groupId: number): Promise<GroupMemberWithUser[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  const { data } = await supabase
    .from('group_members')
    .select('*, users(id, username, email, avatar), roles(id, name)')
    .eq('group_id', groupId)
    .order('id')

  return (data as unknown as GroupMemberWithUser[]) ?? []
}

export async function getGroupTasks(groupId: number): Promise<number[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  const { data } = await supabase
    .from('tasks')
    .select('id')
    .eq('group_id', groupId)

  return (data ?? []).map(t => t.id)
}

export async function getGroupModules(groupId: number): Promise<GroupModuleWithModule[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  const { data } = await supabase
    .from('group_modules')
    .select('*, modules(id, name)')
    .eq('group_id', groupId)

  return (data as unknown as GroupModuleWithModule[]) ?? []
}

export async function getAvailableModules(): Promise<Module[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('modules')
    .select('*')
    .order('id')

  return data ?? []
}

export async function searchUsers(query: string): Promise<Array<{ id: number; username: string; email: string | null; avatar: string | null }>> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  if (!query || query.length < 2) return []

  const { data } = await supabase
    .from('users')
    .select('id, username, email, avatar')
    .neq('id', userId)
    .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10)

  return data ?? []
}

export async function getUserMemberGroupIds(): Promise<number[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  const { data } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  return (data ?? []).map(m => m.group_id).filter((id): id is number => id !== null)
}
