'use client'

import { Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { TaskWithMeta, TaskStatus } from '../types'
import { isOverdue } from '../utils'

interface TaskCardProps {
  task: TaskWithMeta
  onStatusChange?: (id: number, status: TaskStatus) => void
  onEdit?: (task: TaskWithMeta) => void
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

export function TaskCard({ task, onStatusChange, onEdit, className }: TaskCardProps) {
  const overdue = isOverdue(task)
  const taskTags = task.taskTags?.map(tt => tt.tags?.name).filter((n): n is string => n != null) ?? []

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
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <Badge variant={PRIORITY_COLORS[task.priority || 'medium'] || 'default'} className="text-[10px] px-1.5 py-0">
            {PRIORITY_LABELS[task.priority || 'medium']}
          </Badge>
        </div>
      </div>

      {task.description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge variant={STATUS_COLORS[task.status || 'todo'] || 'outline'} className="text-[10px] px-1.5 py-0">
          {STATUS_LABELS[task.status || 'todo']}
        </Badge>
        {task.start_date && (
          <span className="text-[11px] text-muted-foreground">
            Bắt đầu: {new Date(task.start_date).toLocaleDateString('vi-VN')}
          </span>
        )}
        {task.due_date && (
          <span className={cn('text-[11px] text-muted-foreground', overdue && 'text-destructive font-medium')}>
            Hạn: {new Date(task.due_date).toLocaleDateString('vi-VN')}
          </span>
        )}
        {task.completed_date && task.status === 'done' && (
          <span className="text-[11px] text-green-600 font-medium">
            ✓ {new Date(task.completed_date).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>

      {taskTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {taskTags.map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      )}

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
