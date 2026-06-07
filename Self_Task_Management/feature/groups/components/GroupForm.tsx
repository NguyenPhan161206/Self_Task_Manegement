'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createGroup, updateGroup } from '../actions'
import type { Group } from '../types'

interface GroupFormProps {
  onSuccess?: () => void
  group?: Group
}

export function GroupForm({ onSuccess, group }: GroupFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!group

  async function handleSubmit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = isEdit
        ? await updateGroup(group.id, formData)
        : await createGroup(formData)
      if (result.success) {
        onSuccess?.()
      } else {
        setError(result.error || (isEdit ? 'Cập nhật thất bại' : 'Tạo nhóm thất bại'))
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
        <Label htmlFor="name">Tên nhóm</Label>
        <Input
          id="name"
          name="name"
          defaultValue={group?.name}
          placeholder="Nhập tên nhóm"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Input
          id="description"
          name="description"
          defaultValue={group?.description ?? ''}
          placeholder="Mô tả về nhóm (không bắt buộc)"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar">Ảnh đại diện (URL)</Label>
        <Input
          id="avatar"
          name="avatar"
          defaultValue={group?.avatar ?? ''}
          placeholder="https://example.com/avatar.jpg"
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Đang lưu...' : 'Đang tạo...'}
            </>
          ) : (
            isEdit ? 'Lưu thay đổi' : 'Tạo nhóm'
          )}
        </Button>
      </div>
    </form>
  )
}
