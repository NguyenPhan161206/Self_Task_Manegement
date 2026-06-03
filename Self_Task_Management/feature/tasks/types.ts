import type { Database } from '@/types/database'

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskFilter {
  status?: TaskStatus | 'all'
  priority?: TaskPriority | 'all'
  search?: string
}

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

export interface TaskWithMeta extends Task {
  isOverdue?: boolean
  daysUntilDue?: number | null
}

export type PersonalTask = Database['public']['Tables']['personal_tasks']['Row']
export type PersonalTaskInsert = Database['public']['Tables']['personal_tasks']['Insert']
