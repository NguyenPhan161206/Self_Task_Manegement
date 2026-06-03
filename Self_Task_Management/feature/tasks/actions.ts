'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'

import type { Task, TaskInsert, TaskUpdate, TaskStatus, TaskPriority } from './types'
import { MAX_TAGS_PER_TASK } from './types'

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const creatorId = await getUserIdFromAuth()
  if (!creatorId) return { success: false, error: 'Chưa đăng nhập.' }

  const title = formData.get('title') as string
  if (!title || !title.trim()) return { success: false, error: 'Tiêu đề không được để trống.' }

  const description = (formData.get('description') as string) || null
  const status = ((formData.get('status') as string) || 'todo') as TaskStatus
  const priority = ((formData.get('priority') as string) || 'medium') as TaskPriority
  const dueDate = (formData.get('due_date') as string) || null
  const startDate = (formData.get('start_date') as string) || null
  const tagIdsRaw = (formData.get('tag_ids') as string) || '[]'

  let tagIds: number[] = []
  try { tagIds = JSON.parse(tagIdsRaw) } catch { tagIds = [] }
  if (tagIds.length > MAX_TAGS_PER_TASK) return { success: false, error: `Tối đa ${MAX_TAGS_PER_TASK} thẻ.` }

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description,
      status,
      priority,
      due_date: dueDate,
      start_date: startDate || todayStr(),
      completed_date: status === 'done' ? todayStr() : null,
      created_at: todayStr(),
      creator_id: creatorId,
      last_updated_by: creatorId,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Also link task to user via personal_tasks
  await supabase
    .from('personal_tasks')
    .insert({ task_id: task.id, user_id: creatorId })

  // Link tags via task_tags
  if (tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('task_tags')
      .insert(tagIds.map(tag_id => ({ task_id: task.id, tag_id })))
    if (tagError) return { success: false, error: tagError.message }
  }

  revalidatePath('/tasks')
  return { success: true, task }
}

export async function updateTaskFromForm(taskId: number, formData: FormData) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const title = formData.get('title') as string
  if (!title || !title.trim()) return { success: false, error: 'Tiêu đề không được để trống.' }

  const description = (formData.get('description') as string) || null
  const status = ((formData.get('status') as string) || 'todo') as TaskStatus
  const priority = ((formData.get('priority') as string) || 'medium') as TaskPriority
  const dueDate = (formData.get('due_date') as string) || null
  const startDate = (formData.get('start_date') as string) || null
  const tagIdsRaw = (formData.get('tag_ids') as string) || '[]'

  let tagIds: number[] = []
  try { tagIds = JSON.parse(tagIdsRaw) } catch { tagIds = [] }
  if (tagIds.length > MAX_TAGS_PER_TASK) return { success: false, error: `Tối đa ${MAX_TAGS_PER_TASK} thẻ.` }

  // Fetch old task to compare status for completed_date logic
  const { data: oldTask } = await supabase
    .from('tasks')
    .select('status, completed_date')
    .eq('id', taskId)
    .single()

  const wasDone = oldTask?.status === 'done'
  const nowDone = status === 'done'

  let completedDate: string | null
  if (nowDone && !wasDone) {
    completedDate = todayStr()
  } else if (!nowDone && wasDone) {
    completedDate = null
  } else {
    completedDate = nowDone ? (oldTask?.completed_date ?? todayStr()) : null
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      title: title.trim(),
      description,
      status,
      priority,
      due_date: dueDate,
      start_date: startDate,
      completed_date: completedDate,
      last_updated_by: userId,
    })
    .eq('id', taskId)

  if (error) return { success: false, error: error.message }

  // Sync task_tags: delete old, insert new
  await supabase.from('task_tags').delete().eq('task_id', taskId)
  if (tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('task_tags')
      .insert(tagIds.map(tag_id => ({ task_id: taskId, tag_id })))
    if (tagError) return { success: false, error: tagError.message }
  }

  revalidatePath('/tasks')
  return { success: true }
}

export async function updateTaskStatus(taskId: number, status: TaskStatus) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { error } = await supabase
    .from('tasks')
    .update({
      status,
      last_updated_by: userId,
      completed_date: status === 'done' ? todayStr() : null,
    })
    .eq('id', taskId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/tasks')
  return { success: true }
}

export async function updateTask(taskId: number, data: Partial<TaskUpdate>) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  const { error } = await supabase
    .from('tasks')
    .update({ ...data, last_updated_by: userId })
    .eq('id', taskId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/tasks')
  return { success: true }
}

export async function deleteTask(taskId: number) {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return { success: false, error: 'Chưa đăng nhập.' }

  // Delete personal_tasks link first
  await supabase.from('personal_tasks').delete().eq('task_id', taskId)

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/tasks')
  return { success: true }
}
