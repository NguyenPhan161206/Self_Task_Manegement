'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { TASK_STATUSES, TASK_PRIORITIES } from '../types'
import { createTask } from '../actions'

interface TaskFormProps {
  onSuccess?: () => void
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await createTask(formData)
      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || 'Tạo nhiệm vụ thất bại')
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
          placeholder="Mô tả chi tiết (không bắt buộc)"
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <SelectRoot name="status" defaultValue="todo">
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
          <SelectRoot name="priority" defaultValue="medium">
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

      <div className="space-y-2">
        <Label htmlFor="due_date">Hạn chót</Label>
        <Input
          id="due_date"
          name="due_date"
          type="date"
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            'Tạo nhiệm vụ'
          )}
        </Button>
      </div>
    </form>
  )
}
