'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove } from '@dnd-kit/sortable'

import type { TaskWithMeta, TaskStatus } from '../types'
import { TASK_STATUSES } from '../types'
import { groupTasksByStatus } from '../utils'
import { updateTaskStatus } from '../actions'
import { TaskCard } from './TaskCard'
import { KanbanColumn } from './KanbanColumn'

interface KanbanBoardProps {
  tasks: TaskWithMeta[]
  onTasksChange?: (tasks: TaskWithMeta[]) => void
  onEditTask?: (task: TaskWithMeta) => void
}

const COLUMN_LABELS: Record<TaskStatus, string> = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
}

function KanbanBoardInner({ tasks, onTasksChange, onEditTask }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithMeta | null>(null)
  const grouped = useMemo(() => groupTasksByStatus(tasks), [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }, [tasks])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveTask(null)

    const { active, over } = event
    if (!over) return

    const activeId = active.id as number
    const overId = over.id as number | TaskStatus

    // Find the source and target columns
    let sourceStatus: TaskStatus | null = null
    for (const s of TASK_STATUSES) {
      if (grouped[s].some(t => t.id === activeId)) {
        sourceStatus = s
        break
      }
    }
    if (!sourceStatus) return

    // If dropped on a column header
    if (TASK_STATUSES.includes(overId as TaskStatus)) {
      const targetStatus = overId as TaskStatus
      if (sourceStatus !== targetStatus) {
        await updateTaskStatus(activeId, targetStatus)
        // Optimistic update
        if (onTasksChange) {
          const updated = tasks.map(t =>
            t.id === activeId ? { ...t, status: targetStatus } : t
          )
          onTasksChange(updated)
        }
      }
      return
    }

    // If dropped on another task
    const overTask = tasks.find(t => t.id === overId)
    if (!overTask) return

    const targetStatus = overTask.status as TaskStatus
    if (sourceStatus !== targetStatus) {
      await updateTaskStatus(activeId, targetStatus)
      if (onTasksChange) {
        const updated = tasks.map(t =>
          t.id === activeId ? { ...t, status: targetStatus } : t
        )
        onTasksChange(updated)
      }
    }
  }, [tasks, grouped, onTasksChange])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TASK_STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            title={COLUMN_LABELS[status]}
            tasks={grouped[status]}
            onEditTask={onEditTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export const KanbanBoard = memo(KanbanBoardInner)
