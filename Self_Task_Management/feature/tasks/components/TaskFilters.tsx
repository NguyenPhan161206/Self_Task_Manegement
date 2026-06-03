'use client'

import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TASK_STATUSES, TASK_PRIORITIES } from '../types'
import type { TaskStatus, TaskPriority } from '../types'

interface TaskFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: TaskStatus | 'all'
  onStatusChange: (value: TaskStatus | 'all') => void
  priorityFilter: TaskPriority | 'all'
  onPriorityChange: (value: TaskPriority | 'all') => void
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Tất cả',
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
}

const PRIORITY_LABELS: Record<string, string> = {
  all: 'Tất cả',
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
}

export function TaskFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm nhiệm vụ..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <div className="flex flex-wrap gap-1">
          {(['all', ...TASK_STATUSES] as const).map(s => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="xs"
              onClick={() => onStatusChange(s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>

        <div className="flex gap-1">
          {(['all', ...TASK_PRIORITIES] as const).map(p => (
            <Button
              key={p}
              variant={priorityFilter === p ? 'secondary' : 'outline'}
              size="xs"
              onClick={() => onPriorityChange(p)}
            >
              {PRIORITY_LABELS[p]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
