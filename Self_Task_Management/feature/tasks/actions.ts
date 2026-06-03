'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'

import type { Task, TaskInsert, TaskUpdate, TaskStatus, TaskPriority } from './types'

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

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title: title.trim(),
      description,
      status,
      priority,
      due_date: dueDate,
      creator_id: creatorId,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  // Also link task to user via personal_tasks
  await supabase
    .from('personal_tasks')
    .insert({ task_id: task.id, user_id: creatorId })

  revalidatePath('/tasks')
  return { success: true, task }
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
