export interface ChartStats {
  total: number
  done: number
  inProgress: number
  overdue: number
  statusDistribution: { status: string; count: number; fill: string }[]
  priorityDistribution: { priority: string; count: number; fill: string }[]
  weeklyTrend: { week: string; completed: number; created: number }[]
  tagDistribution: { tag: string; count: number; fill: string }[]
  upcomingTasks: UpcomingTask[]
}

export interface UpcomingTask {
  id: number
  title: string
  due_date: string
  priority: string
}
