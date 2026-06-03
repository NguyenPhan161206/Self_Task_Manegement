'use client'

import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

import type { TaskWithMeta, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  tasks: TaskWithMeta[]
  onStatusChange?: (id: number, status: TaskStatus) => void
  onEditTask?: (task: TaskWithMeta) => void
}

function SortableTaskCard({ task, onStatusChange, onEditTask }: { task: TaskWithMeta; onStatusChange?: (id: number, status: TaskStatus) => void; onEditTask?: (task: TaskWithMeta) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onStatusChange={onStatusChange}
        onEdit={onEditTask}
        className={cn(isDragging && 'opacity-50 shadow-lg', 'cursor-grab active:cursor-grabbing')}
      />
    </div>
  )
}

export function KanbanColumn({ status, title, tasks, onStatusChange, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-xl border bg-card/50 p-3 transition-colors',
        isOver && 'border-primary bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 min-h-[120px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            Kéo thả nhiệm vụ vào đây
          </div>
        ) : (
          tasks.map(task => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onEditTask={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  )
}
