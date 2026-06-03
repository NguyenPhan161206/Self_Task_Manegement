'use client'

import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { useTasks } from '@/feature/tasks/hooks/useTasks'
import { TaskForm } from '@/feature/tasks/components/TaskForm'
import { TaskFilters } from '@/feature/tasks/components/TaskFilters'
import { KanbanBoard } from '@/feature/tasks/components/KanbanBoard'
import { TaskEmpty } from '@/feature/tasks/components/TaskEmpty'
import { useTags } from '@/feature/tags/hooks/useTags'
import { TagManager } from '@/feature/tags/components/TagManager'
import type { TaskPriority, TaskStatus, TaskWithMeta } from '@/feature/tasks/types'

export function TasksDashboard() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskWithMeta | null>(null)

  const { tasks, isLoading, error, refetch, setTasks } = useTasks({
    search,
    status: statusFilter,
    priority: priorityFilter,
    tag: tagFilter,
  })

  const { tags: globalTags, refetch: refetchTags } = useTags()

  const handleTasksChange = useCallback((updated: TaskWithMeta[]) => {
    setTasks(updated)
  }, [setTasks])

  const availableTags = globalTags

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border p-3">
              <Skeleton className="h-5 w-20 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Nhiệm vụ của tôi</h1>

        <div className="flex items-center gap-2">
          <TagManager tags={globalTags} onTagsChange={refetchTags} />
          <DialogRoot open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Tạo nhiệm vụ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo nhiệm vụ mới</DialogTitle>
                <DialogDescription>
                  Thêm một nhiệm vụ để bắt đầu theo dõi công việc của bạn.
                </DialogDescription>
              </DialogHeader>
              <TaskForm onSuccess={() => { setDialogOpen(false); refetch() }} />
            </DialogContent>
          </DialogRoot>
        </div>

        <DialogRoot open={!!editTask} onOpenChange={(open) => { if (!open) setEditTask(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa nhiệm vụ</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin nhiệm vụ của bạn.
              </DialogDescription>
            </DialogHeader>
            {editTask && (
              <TaskForm
                task={editTask}
                onSuccess={() => { setEditTask(null); refetch() }}
              />
            )}
          </DialogContent>
        </DialogRoot>
      </div>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        tagFilter={tagFilter}
        onTagChange={setTagFilter}
        availableTags={availableTags}
      />

      <div className="mt-6">
        {error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <TaskEmpty onCreate={() => setDialogOpen(true)} />
        ) : (
          <KanbanBoard tasks={tasks} onTasksChange={handleTasksChange} onEditTask={setEditTask} />
        )}
      </div>
    </div>
  )
}
