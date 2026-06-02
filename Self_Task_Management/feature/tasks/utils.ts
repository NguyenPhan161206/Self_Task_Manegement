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
    groups[t.status].push(enriched)
  }
  return groups
}

export function filterTasks(tasks: Task[], filter: { search?: string; status?: TaskStatus | 'all' }): Task[] {
  return tasks.filter(t => {
    const matchesSearch = !filter.search || t.title.toLowerCase().includes(filter.search.toLowerCase())
    const matchesStatus = !filter.status || filter.status === 'all' || t.status === filter.status
    return matchesSearch && matchesStatus
  })
}
