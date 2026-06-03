'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2, Tags } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import { createTag, deleteTag } from '../actions'
import type { Tag } from '../types'
import { MAX_TAGS_PER_USER } from '../types'

interface TagManagerProps {
  tags: Tag[]
  onTagsChange: () => void
}

export function TagManager({ tags, onTagsChange }: TagManagerProps) {
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(formData: FormData) {
    setError(null)
    const nameValue = formData.get('name') as string
    startTransition(async () => {
      const result = await createTag(nameValue)
      if (result.success) {
        setName('')
        onTagsChange()
      } else {
        setError(result.error || 'Thêm thẻ thất bại')
      }
    })
  }

  function handleDelete(tagId: number) {
    startTransition(async () => {
      await deleteTag(tagId)
      onTagsChange()
    })
  }

  const remaining = MAX_TAGS_PER_USER - tags.length

  return (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tags className="mr-1.5 h-4 w-4" />
          Quản lý thẻ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quản lý thẻ</DialogTitle>
          <DialogDescription>
            Tạo tối đa {MAX_TAGS_PER_USER} thẻ để gắn cho nhiệm vụ của bạn.
            {remaining > 0
              ? ` Bạn còn tạo được ${remaining} thẻ.`
              : ' Bạn đã đạt tối đa.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form action={handleAdd} className="flex gap-2" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleAdd(fd) }}>
            <Input
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Tên thẻ mới..."
              disabled={isPending || remaining <= 0}
              className="flex-1"
            />
            <Button type="submit" disabled={isPending || remaining <= 0 || !name.trim()}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>

          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có thẻ nào. Hãy tạo thẻ đầu tiên!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag.id} variant="secondary" className="gap-1 pr-1 text-sm">
                  {tag.name}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(tag.id)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-secondary-foreground/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  )
}
