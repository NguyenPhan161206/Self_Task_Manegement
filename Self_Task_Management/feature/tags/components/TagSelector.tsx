'use client'

import { Badge } from '@/components/ui/badge'
import type { Tag } from '../types'

interface TagSelectorProps {
  tags: Tag[]
  selectedTagIds: number[]
  onChange: (ids: number[]) => void
  disabled?: boolean
}

export function TagSelector({ tags, selectedTagIds, onChange, disabled }: TagSelectorProps) {
  function toggle(tagId: number) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  if (tags.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Chưa có thẻ nào. Tạo thẻ trong phần Quản lý thẻ trước.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(tag => {
        const selected = selectedTagIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            disabled={disabled}
            onClick={() => toggle(tag.id)}
            className="cursor-pointer"
          >
            <Badge
              variant={selected ? 'default' : 'outline'}
              className="text-xs px-2 py-0.5"
            >
              {tag.name}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
