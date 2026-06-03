'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'

import type { Tag } from './types'
import { MAX_TAGS_PER_USER } from './types'

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  const { data } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  return data ?? []
}

export async function createTag(name: string) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const trimmed = name.trim().toLowerCase()
  if (!trimmed) return { success: false, error: 'Tên thẻ không được để trống.' }

  if (trimmed.length > 50) return { success: false, error: 'Tên thẻ tối đa 50 ký tự.' }

  const { count } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (count != null && count >= MAX_TAGS_PER_USER) {
    return { success: false, error: `Bạn chỉ được tạo tối đa ${MAX_TAGS_PER_USER} thẻ.` }
  }

  const { error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name: trimmed })

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Thẻ này đã tồn tại.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/tasks')
  return { success: true }
}

export async function deleteTag(tagId: number) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)
    .eq('user_id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/tasks')
  return { success: true }
}
