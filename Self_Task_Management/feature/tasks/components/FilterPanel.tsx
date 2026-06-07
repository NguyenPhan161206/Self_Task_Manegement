'use client'

import { memo } from 'react'
import { ListFilter, ListChecks, ArrowUpWideNarrow, Tags, Users, ChevronRight } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { TASK_STATUSES, TASK_PRIORITIES } from '../types'
import type { TaskStatus, TaskPriority } from '../types'
import type { Tag } from '@/feature/tags/types'
import type { Group } from '@/feature/groups/types'

interface FilterPanelProps {
  statusFilters: TaskStatus[]
  onStatusChange: (statuses: TaskStatus[]) => void
  priorityFilters: TaskPriority[]
  onPriorityChange: (priorities: TaskPriority[]) => void
  tagFilters: string[]
  onTagChange: (tags: string[]) => void
  availableTags: Tag[]
  tasksLoading: boolean
  onClearAll?: () => void
  groupFilters?: number[]
  onGroupChange?: (groupIds: number[]) => void
  availableGroups?: Group[]
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

const STATUS_DOT_COLORS: Record<string, string> = {
  todo: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  done: 'bg-emerald-500',
}

const PRIORITY_BAR_COLORS: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
}

function FilterSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-1">
          <Skeleton className="size-4 shrink-0 rounded-[4px]" />
          <Skeleton className="h-3.5 flex-1" />
        </div>
      ))}
    </div>
  )
}

function ActiveCount({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary leading-none">
      {count}
    </span>
  )
}

interface FilterSectionProps {
  title: string
  icon: React.ReactNode
  activeCount: number
  defaultOpen?: boolean
  children: React.ReactNode
}

function FilterSection({ title, icon, activeCount, defaultOpen = true, children }: FilterSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors [&[data-state=open]>svg:last-child]:rotate-90">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0">{icon}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ActiveCount count={activeCount} />
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-1 pb-0.5 pl-1 pr-1 space-y-0.5">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
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
  onClearAll,
  groupFilters,
  onGroupChange,
  availableGroups,
}: FilterPanelProps) {
  const anyActive = statusFilters.length > 0 || priorityFilters.length > 0 || tagFilters.length > 0 || (groupFilters?.length ?? 0) > 0

  return (
    <div className="space-y-1">
      {/* Panel header */}
      <div className="flex items-center justify-between px-2 pb-3 mb-1 border-b">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Bộ lọc</h2>
        </div>
        {anyActive && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            Xoá tất cả
          </button>
        )}
      </div>

      {/* Status section */}
      <FilterSection
        title="Trạng thái"
        icon={<ListChecks className="h-3.5 w-3.5" />}
        activeCount={statusFilters.length}
      >
        {tasksLoading ? (
          <FilterSkeleton count={3} />
        ) : (
          TASK_STATUSES.map(s => (
            <div
              key={s}
              className={cn(
                'flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors',
                'hover:bg-muted/50 cursor-pointer',
              )}
            >
              <span className={cn('size-2 shrink-0 rounded-full', STATUS_DOT_COLORS[s])} />
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
              <Label htmlFor={`status-${s}`} className="cursor-pointer text-sm font-normal flex-1">
                {STATUS_LABELS[s]}
              </Label>
            </div>
          ))
        )}
      </FilterSection>

      {/* Priority section */}
      <FilterSection
        title="Ưu tiên"
        icon={<ArrowUpWideNarrow className="h-3.5 w-3.5" />}
        activeCount={priorityFilters.length}
      >
        {tasksLoading ? (
          <FilterSkeleton count={3} />
        ) : (
          TASK_PRIORITIES.map(p => (
            <div
              key={p}
              className={cn(
                'flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors',
                'hover:bg-muted/50 cursor-pointer',
              )}
            >
              <span className={cn('w-0.5 h-5 shrink-0 rounded-full', PRIORITY_BAR_COLORS[p])} />
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
              <Label htmlFor={`priority-${p}`} className="cursor-pointer text-sm font-normal flex-1">
                {PRIORITY_LABELS[p]}
              </Label>
            </div>
          ))
        )}
      </FilterSection>

      {/* Tags section */}
      <FilterSection
        title="Tags"
        icon={<Tags className="h-3.5 w-3.5" />}
        activeCount={tagFilters.length}
      >
        {tasksLoading ? (
          <FilterSkeleton count={3} />
        ) : availableTags.length === 0 ? (
          <p className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
            <Tags className="h-3 w-3 shrink-0" />
            Chưa có thẻ nào
          </p>
        ) : (
          availableTags.map(tag => (
            <div
              key={tag.id}
              className={cn(
                'flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors',
                'hover:bg-muted/50 cursor-pointer',
              )}
            >
              <span className="inline-flex items-center justify-center size-4 shrink-0 rounded-[4px] bg-muted text-[9px] font-bold text-muted-foreground">
                #
              </span>
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
              <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer text-sm font-normal flex-1">
                {tag.name}
              </Label>
            </div>
          ))
        )}
      </FilterSection>

      {/* Groups section */}
      {availableGroups && availableGroups.length > 0 && onGroupChange && groupFilters !== undefined && (
        <FilterSection
          title="Nhóm"
          icon={<Users className="h-3.5 w-3.5" />}
          activeCount={groupFilters.length}
        >
          {availableGroups.map(group => (
            <div
              key={group.id}
              className={cn(
                'flex items-center gap-2.5 py-1.5 px-2 rounded-md transition-colors',
                'hover:bg-muted/50 cursor-pointer',
              )}
            >
              <span className="inline-flex items-center justify-center size-4 shrink-0 rounded-[4px] bg-muted text-[9px] font-bold text-muted-foreground">
                G
              </span>
              <Checkbox
                id={`group-${group.id}`}
                checked={groupFilters.includes(group.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onGroupChange([...groupFilters, group.id])
                  } else {
                    onGroupChange(groupFilters.filter(x => x !== group.id))
                  }
                }}
              />
              <Label htmlFor={`group-${group.id}`} className="cursor-pointer text-sm font-normal flex-1">
                {group.name}
              </Label>
            </div>
          ))}
        </FilterSection>
      )}

      {/* Bottom clear all */}
      {anyActive && onClearAll && (
        <div className="pt-2 mt-1 border-t">
          <button
            type="button"
            onClick={onClearAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <ListFilter className="h-3.5 w-3.5" />
            Xoá tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  )
}

export const FilterPanel = memo(FilterPanelInner)
