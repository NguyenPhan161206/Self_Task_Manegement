'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { TaskWithMeta, TaskStatus } from '../types'
import { isOverdue } from '../utils'

interface TaskCardProps {
  task: TaskWithMeta
  onStatusChange?: (id: number, status: TaskStatus) => void
  className?: string
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'success' | 'outline'> = {
  todo: 'outline',
  in_progress: 'secondary',
  done: 'success',
}

const PRIORITY_COLORS: Record<string, 'default' | 'warning' | 'destructive'> = {
  low: 'default',
  medium: 'warning',
  high: 'destructive',
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Thấp',
  medium: 'TB',
  high: 'Cao',
}

export function TaskCard({ task, onStatusChange, className }: TaskCardProps) {
  const overdue = isOverdue(task)

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 transition hover:shadow-sm',
        overdue && 'border-destructive/50 bg-destructive/5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug line-clamp-2">{task.title}</h3>
        <Badge variant={PRIORITY_COLORS[task.priority || 'medium'] || 'default'} className="shrink-0 text-[10px] px-1.5 py-0">
          {PRIORITY_LABELS[task.priority || 'medium']}
        </Badge>
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <Badge variant={STATUS_COLORS[task.status || 'todo'] || 'outline'} className="text-[10px] px-1.5 py-0">
          {STATUS_LABELS[task.status || 'todo']}
        </Badge>
        {task.due_date && (
          <span className={cn('text-[11px] text-muted-foreground', overdue && 'text-destructive font-medium')}>
            {new Date(task.due_date).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>

      {onStatusChange && task.status !== 'done' && (
        <button
          onClick={() => onStatusChange(task.id, 'done')}
          className="mt-2 text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Đánh dấu hoàn thành
        </button>
      )}
    </div>
  )
}
