import type { Task, TaskWithMeta, TaskStatus } from './types'

export function isOverdue(task: Task): boolean {
  if (!task.due_date) return false
  return new Date(task.due_date) < new Date() && task.status !== 'done'
}

export function getDaysUntilDue(task: Task): number | null {
  if (!task.due_date) return null
  const due = new Date(task.due_date)
  const now = new Date()
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export function enrichTask(task: Task): TaskWithMeta {
  return {
    ...task,
    isOverdue: isOverdue(task),
    daysUntilDue: getDaysUntilDue(task),
  }
}

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, TaskWithMeta[]> {
  const groups: Record<TaskStatus, TaskWithMeta[]> = {
    todo: [],
    in_progress: [],
    done: [],
  }
  for (const t of tasks) {
    const enriched = enrichTask(t)
    const status = t.status as TaskStatus | null
    if (status && status in groups) {
      groups[status].push(enriched)
    }
  }
  return groups
}
