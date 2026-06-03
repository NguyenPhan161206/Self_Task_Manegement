'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserIdFromAuth } from '@/feature/auth/lib/getUserId'
import type { ChartStats, UpcomingTask } from './types'

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr)
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `Tuần ${weekNum}`
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function daysFromNow(dateStr: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.floor((d.getTime() - now.getTime()) / 86400000)
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp',
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const STATUS_COLOR: Record<string, string> = {
  todo: 'var(--chart-1)',
  in_progress: 'var(--chart-3)',
  done: 'var(--chart-2)',
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--chart-3)',
  medium: 'var(--chart-1)',
  low: 'var(--chart-2)',
}

export async function getChartData(): Promise<ChartStats> {
  const supabase = await createClient()
  const userId = await getUserIdFromAuth()
  if (!userId) throw new Error('Chưa đăng nhập.')

  // Get user's task IDs
  const { data: pt } = await supabase
    .from('personal_tasks')
    .select('task_id')
    .eq('user_id', userId)

  const taskIds = pt?.map(p => p.task_id).filter(Boolean) as number[] || []

  if (taskIds.length === 0) {
    return {
      total: 0, done: 0, inProgress: 0, overdue: 0,
      statusDistribution: [],
      priorityDistribution: [],
      weeklyTrend: [],
      tagDistribution: [],
      upcomingTasks: [],
    }
  }

  // Fetch all user tasks with tags
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, task_tags(tags(id, name))')
    .in('id', taskIds)

  if (!tasks || tasks.length === 0) {
    return {
      total: 0, done: 0, inProgress: 0, overdue: 0,
      statusDistribution: [],
      priorityDistribution: [],
      weeklyTrend: [],
      tagDistribution: [],
      upcomingTasks: [],
    }
  }

  const today = todayStr()

  // Count by status
  const statusCount: Record<string, number> = {}
  const priorityCount: Record<string, number> = {}
  let doneCount = 0
  let inProgressCount = 0
  let overdueCount = 0
  const createdWeekly: Record<string, number> = {}
  const completedWeekly: Record<string, number> = {}
  const tagCount: Record<string, number> = {}
  const upcomingTasks: UpcomingTask[] = []

  for (const task of tasks) {
    const status = task.status || 'todo'
    const priority = task.priority || 'medium'

    statusCount[status] = (statusCount[status] || 0) + 1
    priorityCount[priority] = (priorityCount[priority] || 0) + 1

    if (status === 'done') doneCount++
    if (status === 'in_progress') inProgressCount++

    // Overdue check
    if (task.due_date && status !== 'done' && task.due_date < today) {
      overdueCount++
    }

    // Weekly created trend
    if (task.created_at) {
      const week = formatWeek(task.created_at)
      createdWeekly[week] = (createdWeekly[week] || 0) + 1
    }

    // Weekly completed trend
    if (task.completed_date) {
      const week = formatWeek(task.completed_date)
      completedWeekly[week] = (completedWeekly[week] || 0) + 1
    }

    // Tag distribution
    const tags = (task as any).task_tags || []
    for (const tt of tags) {
      const tagName = tt.tags?.name
      if (tagName) {
        tagCount[tagName] = (tagCount[tagName] || 0) + 1
      }
    }

    // Upcoming tasks (due in next 7 days, not done)
    if (task.due_date && status !== 'done') {
      const daysUntil = daysFromNow(task.due_date)
      if (daysUntil >= 0 && daysUntil <= 7) {
        upcomingTasks.push({
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          priority: task.priority || 'medium',
        })
      }
    }
  }

  // Build status distribution
  const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({
    status: STATUS_LABELS[status] || status,
    count,
    fill: STATUS_COLOR[status] || CHART_COLORS[0],
  }))

  // Build priority distribution
  const priorityOrder = ['high', 'medium', 'low']
  const priorityDistribution = priorityOrder
    .filter(p => priorityCount[p])
    .map(p => ({
      priority: PRIORITY_LABELS[p] || p,
      count: priorityCount[p],
      fill: PRIORITY_COLOR[p] || CHART_COLORS[0],
    }))

  // Build weekly trend (last 8 weeks)
  const allWeeks = new Set([...Object.keys(createdWeekly), ...Object.keys(completedWeekly)])
  const sortedWeeks = Array.from(allWeeks).sort().slice(-8)
  const weeklyTrend = sortedWeeks.map(week => ({
    week,
    completed: completedWeekly[week] || 0,
    created: createdWeekly[week] || 0,
  }))

  // Build tag distribution (top 10)
  const sortedTags = Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
  const tagDistribution = sortedTags.map(([tag, count], i) => ({
    tag,
    count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  // Sort upcoming tasks by due date
  upcomingTasks.sort((a, b) => a.due_date.localeCompare(b.due_date))

  return {
    total: tasks.length,
    done: doneCount,
    inProgress: inProgressCount,
    overdue: overdueCount,
    statusDistribution,
    priorityDistribution,
    weeklyTrend,
    tagDistribution,
    upcomingTasks,
  }
}
