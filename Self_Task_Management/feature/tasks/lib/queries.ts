'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'

import type { Task, TaskFilter } from '../types'

export async function getTasks(filter?: TaskFilter): Promise<Task[]> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) return []

  // Query tasks via personal_tasks junction table
  let query = supabase
    .from('personal_tasks')
    .select('task_id, tasks(*)')
    .eq('user_id', userId)

  if (filter?.statuses && filter.statuses.length > 0) {
    query = query.in('tasks.status', filter.statuses)
  }
  if (filter?.priorities && filter.priorities.length > 0) {
    query = query.in('tasks.priority', filter.priorities)
  }

  const { data, error } = await query

  if (error || !data) return []

  let tasks: Task[] = data
    .map(item => (item.tasks as Task | null))
    .filter((t): t is Task => t !== null)

  if (filter?.search) {
    const q = filter.search.toLowerCase()
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q))
  }

  return tasks
}

export function subscribeToTasks(_callback: (tasks: Task[]) => void) {
  console.log('[feature/tasks/lib] subscribeToTasks STUB (realtime would be here)')
  return () => {
    console.log('[feature/tasks/lib] unsubscribed (stub)')
  }
}
