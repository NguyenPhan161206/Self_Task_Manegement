'use client'

import { CalendarDays } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { UpcomingTask } from '../types'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
}

const priorityBadge: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
}

interface UpcomingTasksProps {
  data: UpcomingTask[]
  isLoading: boolean
}

export function UpcomingTasks({ data, isLoading }: UpcomingTasksProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Không có nhiệm vụ sắp đến hạn
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((task) => (
        <div key={task.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate">{task.title}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(task.due_date)}</span>
          <Badge variant={priorityBadge[task.priority] || 'secondary'} className="text-[10px] px-1.5 py-0">
            {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
          </Badge>
        </div>
      ))}
    </div>
  )
}
