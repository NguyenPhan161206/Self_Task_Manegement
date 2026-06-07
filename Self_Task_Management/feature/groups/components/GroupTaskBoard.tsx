'use client'

import { KanbanBoard } from '@/feature/tasks/components/KanbanBoard'
import type { TaskWithMeta } from '@/feature/tasks/types'

interface GroupTaskBoardProps {
  tasks: TaskWithMeta[]
  onTasksChange?: (tasks: TaskWithMeta[]) => void
  onEditTask?: (task: TaskWithMeta) => void
}

export function GroupTaskBoard({ tasks, onTasksChange, onEditTask }: GroupTaskBoardProps) {
  return (
    <KanbanBoard
      tasks={tasks}
      onTasksChange={onTasksChange}
      onEditTask={onEditTask}
    />
  )
}
