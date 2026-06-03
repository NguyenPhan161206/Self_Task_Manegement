'use client'

import { useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { FilterPanel } from '@/feature/tasks/components/FilterPanel'
import { TaskForm } from '@/feature/tasks/components/TaskForm'
import { KanbanBoard } from '@/feature/tasks/components/KanbanBoard'
import { TaskEmpty } from '@/feature/tasks/components/TaskEmpty'
import { useTags } from '@/feature/tags/hooks/useTags'
import { TagManager } from '@/feature/tags/components/TagManager'
import type { TaskPriority, TaskStatus, TaskWithMeta } from '@/feature/tasks/types'

export function TasksDashboard() {
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>([])
  const [priorityFilters, setPriorityFilters] = useState<TaskPriority[]>([])
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskWithMeta | null>(null)

  const { tasks, isInitialLoading, error, refetch, setTasks } = useTasks({
    search,
    statuses: statusFilters,
    priorities: priorityFilters,
    tags: tagFilters,
  })

  const { tags: globalTags, refetch: refetchTags } = useTags()

  const handleTasksChange = useCallback((updated: TaskWithMeta[]) => {
    setTasks(updated)
  }, [setTasks])

  const clearAllFilters = useCallback(() => {
    setStatusFilters([])
    setPriorityFilters([])
    setTagFilters([])
  }, [])

  const availableTags = globalTags

  if (isInitialLoading) {
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
    <div className="flex">
      {/* Left: main content */}
      <div className="flex-1 min-w-0">
        <div className="py-8 pl-8 pr-8 lg:pr-6">
          {/* Header row */}
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

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhiệm vụ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Kanban or empty state */}
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

      {/* Right: filter panel */}
      <aside className="hidden lg:block w-72 shrink-0 border-l bg-card sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin p-4">
        <FilterPanel
          statusFilters={statusFilters}
          onStatusChange={setStatusFilters}
          priorityFilters={priorityFilters}
          onPriorityChange={setPriorityFilters}
          tagFilters={tagFilters}
          onTagChange={setTagFilters}
          availableTags={availableTags}
          tasksLoading={isInitialLoading}
          onClearAll={clearAllFilters}
        />
      </aside>
    </div>
  )
}
