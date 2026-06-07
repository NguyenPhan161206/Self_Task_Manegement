'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { TASK_STATUSES, TASK_PRIORITIES } from '../types'
import type { TaskWithMeta } from '../types'
import { createTask } from '../actions'
import { updateTaskFromForm } from '../actions'
import { useTags } from '@/feature/tags/hooks/useTags'
import { TagSelector } from '@/feature/tags/components/TagSelector'
import { useGroups } from '@/feature/groups/hooks/useGroups'
import { useGroupMembers } from '@/feature/groups/hooks/useGroupMembers'
import type { GroupMemberWithUser } from '@/feature/groups/types'

interface TaskFormProps {
  onSuccess?: () => void
  task?: TaskWithMeta
  defaultGroupId?: number
}

export function TaskForm({ onSuccess, task, defaultGroupId }: TaskFormProps) {
  const { tags } = useTags()
  const { groups } = useGroups()
  const { members } = useGroupMembers(defaultGroupId ?? null)
  const groupMembers = members as GroupMemberWithUser[]
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    () => task?.taskTags?.map(tt => tt.tags?.id).filter((id): id is number => id != null) ?? []
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!task

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEdit
        ? await updateTaskFromForm(task.id, formData)
        : await createTask(formData)
      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || (isEdit ? 'Cập nhật thất bại' : 'Tạo nhiệm vụ thất bại'))
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Tiêu đề</Label>
        <Input
          id="title"
          name="title"
          defaultValue={task?.title}
          placeholder="Nhập tiêu đề nhiệm vụ"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Input
          id="description"
          name="description"
          defaultValue={task?.description ?? ''}
          placeholder="Mô tả chi tiết (không bắt buộc)"
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <SelectRoot name="status" defaultValue={task?.status || 'todo'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map(s => (
                <SelectItem key={s} value={s}>
                  {s === 'todo' ? 'Cần làm' : s === 'in_progress' ? 'Đang làm' : 'Hoàn thành'}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Ưu tiên</Label>
          <SelectRoot name="priority" defaultValue={task?.priority || 'medium'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map(p => (
                <SelectItem key={p} value={p}>
                  {p === 'low' ? 'Thấp' : p === 'medium' ? 'Trung bình' : 'Cao'}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Ngày bắt đầu</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={task?.start_date ?? ''}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Hạn chót</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={task?.due_date ?? ''}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nhóm</Label>
        {defaultGroupId ? (
          <>
            <input type="hidden" name="group_id" value={String(defaultGroupId)} />
            <div className="rounded-md border px-3 py-2 text-sm">
              {groups.find(g => g.id === defaultGroupId)?.name ?? `Nhóm #${defaultGroupId}`}
            </div>
          </>
        ) : (
          <SelectRoot
            name="group_id"
            defaultValue={task?.group_id ? String(task.group_id) : '0'}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Cá nhân</SelectItem>
              {groups.map(g => (
                <SelectItem key={g.id} value={String(g.id)}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        )}
      </div>

      {defaultGroupId && (
        <div className="space-y-2">
          <Label>Người thực hiện</Label>
          <SelectRoot
            name="assignee_id"
            defaultValue={task?.assignee_id ? String(task.assignee_id) : '0'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn người thực hiện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Không phân công</SelectItem>
              {groupMembers.map(m => (
                <SelectItem key={m.user_id} value={String(m.user_id)}>
                  {m.users?.username ?? `User #${m.user_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>
      )}

      <div className="space-y-2">
        <Label>Thẻ tag</Label>
        <TagSelector tags={tags} selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} disabled={isPending} />
        <input type="hidden" name="tag_ids" value={JSON.stringify(selectedTagIds)} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Đang lưu...' : 'Đang tạo...'}
            </>
          ) : (
            isEdit ? 'Lưu thay đổi' : 'Tạo nhiệm vụ'
          )}
        </Button>
      </div>
    </form>
  )
}
