'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateGroup, deleteGroup } from '../actions'
import { InviteMemberDialog } from './InviteMemberDialog'
import type { GroupWithMeta } from '../types'

interface GroupSettingsProps {
  group: GroupWithMeta
  onUpdated: () => void
  onDeleted: () => void
}

export function GroupSettings({ group, onUpdated, onDeleted }: GroupSettingsProps) {
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave(formData: FormData) {
    setError(null)
    setIsSaving(true)
    const result = await updateGroup(group.id, formData)
    setIsSaving(false)
    if (result.success) {
      onUpdated()
    } else {
      setError(result.error ?? 'Cập nhật thất bại')
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteGroup(group.id)
    setDeleting(false)
    if (result.success) {
      onDeleted()
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Mời thành viên</h3>
        <p className="text-sm text-muted-foreground">
          Mời người dùng khác tham gia nhóm bằng email hoặc tìm kiếm.
        </p>
        <InviteMemberDialog groupId={group.id} onSuccess={onUpdated} />
      </div>

      <Separator />

      <form action={handleSave} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="edit-name">Tên nhóm</Label>
          <Input
            id="edit-name"
            name="name"
            defaultValue={group.name}
            required
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-description">Mô tả</Label>
          <Input
            id="edit-description"
            name="description"
            defaultValue={group.description ?? ''}
            disabled={isSaving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-avatar">Ảnh đại diện (URL)</Label>
          <Input
            id="edit-avatar"
            name="avatar"
            defaultValue={group.avatar ?? ''}
            disabled={isSaving}
          />
        </div>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </form>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-destructive">Vùng nguy hiểm</h3>
        <p className="text-xs text-muted-foreground">
          Xoá nhóm sẽ xoá tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
        </p>
        <DialogRoot open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Xoá nhóm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xoá nhóm?</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xoá &ldquo;{group.name}&rdquo;? Tất cả dữ liệu sẽ bị xoá vĩnh viễn.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Huỷ
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Đang xoá...' : 'Xoá nhóm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </div>
    </div>
  )
}
