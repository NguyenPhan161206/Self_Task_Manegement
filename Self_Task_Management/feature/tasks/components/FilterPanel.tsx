'use client'

import { memo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { TASK_STATUSES, TASK_PRIORITIES } from '../types'
import type { TaskStatus, TaskPriority } from '../types'
import type { Tag } from '@/feature/tags/types'

interface FilterPanelProps {
  statusFilters: TaskStatus[]
  onStatusChange: (statuses: TaskStatus[]) => void
  priorityFilters: TaskPriority[]
  onPriorityChange: (priorities: TaskPriority[]) => void
  tagFilters: string[]
  onTagChange: (tags: string[]) => void
  availableTags: Tag[]
  tasksLoading: boolean
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'Cần làm',
  in_progress: 'Đang làm',
  done: 'Hoàn thành',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
}

function FilterSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-[4px]" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
}

function FilterPanelInner({
  statusFilters,
  onStatusChange,
  priorityFilters,
  onPriorityChange,
  tagFilters,
  onTagChange,
  availableTags,
  tasksLoading,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Status section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Trạng thái
        </h3>
        {tasksLoading ? (
          <FilterSkeleton count={3} />
        ) : (
          <div className="space-y-1.5">
            {TASK_STATUSES.map(s => (
              <div key={s} className="flex items-center gap-2 py-0.5">
                <Checkbox
                  id={`status-${s}`}
                  checked={statusFilters.includes(s)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onStatusChange([...statusFilters, s])
                    } else {
                      onStatusChange(statusFilters.filter(x => x !== s))
                    }
                  }}
                />
                <Label htmlFor={`status-${s}`} className="cursor-pointer text-sm font-normal">
                  {STATUS_LABELS[s]}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Priority section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Ưu tiên
        </h3>
        {tasksLoading ? (
          <FilterSkeleton count={3} />
        ) : (
          <div className="space-y-1.5">
            {TASK_PRIORITIES.map(p => (
              <div key={p} className="flex items-center gap-2 py-0.5">
                <Checkbox
                  id={`priority-${p}`}
                  checked={priorityFilters.includes(p)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onPriorityChange([...priorityFilters, p])
                    } else {
                      onPriorityChange(priorityFilters.filter(x => x !== p))
                    }
                  }}
                />
                <Label htmlFor={`priority-${p}`} className="cursor-pointer text-sm font-normal">
                  {PRIORITY_LABELS[p]}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          Tags
        </h3>
        {tasksLoading ? (
          <FilterSkeleton count={3} />
        ) : availableTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có thẻ</p>
        ) : (
          <div className="space-y-1.5">
            {availableTags.map(tag => (
              <div key={tag.id} className="flex items-center gap-2 py-0.5">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={tagFilters.includes(tag.name)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onTagChange([...tagFilters, tag.name])
                    } else {
                      onTagChange(tagFilters.filter(x => x !== tag.name))
                    }
                  }}
                />
                <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer text-sm font-normal">
                  {tag.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const FilterPanel = memo(FilterPanelInner)
