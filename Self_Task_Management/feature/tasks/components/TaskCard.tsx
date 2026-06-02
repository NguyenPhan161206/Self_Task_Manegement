'use client'

import { cn } from '@/lib/utils'
import type { TaskWithMeta } from '../types'
import { isOverdue } from '../utils'

interface TaskCardProps {
  task: TaskWithMeta
  onStatusChange?: (id: string, status: TaskWithMeta['status']) => void
  className?: string
}

/**
 * Example feature-specific component.
 * Uses shared ui/ primitives when available.
 * Keeps presentation + small logic for this domain.
 */
export function TaskCard({ task, onStatusChange, className }: TaskCardProps) {
  const overdue = isOverdue(task)

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition hover:shadow-sm',
        overdue && 'border-destructive/50 bg-destructive/5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium leading-tight">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {task.priority}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{task.status}</span>
        {task.due_date && (
          <span className={cn('text-muted-foreground', overdue && 'text-destructive font-medium')}>
            due {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Example action - in real would use server action or hook */}
      {onStatusChange && task.status !== 'done' && (
        <button
          onClick={() => onStatusChange(task.id, 'done')}
          className="mt-3 text-xs underline underline-offset-2 hover:no-underline"
        >
          Mark done
        </button>
      )}
    </div>
  )
}
