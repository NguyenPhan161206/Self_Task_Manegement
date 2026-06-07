'use client'

import { memo } from 'react'
import { Users, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { GroupCard } from './GroupCard'
import { GroupForm } from './GroupForm'
import type { GroupWithMeta } from '../types'

interface GroupListProps {
  groups: GroupWithMeta[]
  isLoading: boolean
  onGroupCreated: () => void
}

function GroupListInner({ groups, isLoading, onGroupCreated }: GroupListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Nhóm của tôi</h1>
        <DialogRoot>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo nhóm
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo nhóm mới</DialogTitle>
              <DialogDescription>
                Tạo một nhóm để cộng tác với các thành viên khác.
              </DialogDescription>
            </DialogHeader>
            <GroupForm onSuccess={onGroupCreated} />
          </DialogContent>
        </DialogRoot>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-1">Chưa có nhóm nào</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tạo nhóm đầu tiên để bắt đầu cộng tác với mọi người.
          </p>
          <DialogRoot>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Tạo nhóm
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo nhóm mới</DialogTitle>
                <DialogDescription>
                  Tạo một nhóm để cộng tác với các thành viên khác.
                </DialogDescription>
              </DialogHeader>
              <GroupForm onSuccess={onGroupCreated} />
            </DialogContent>
          </DialogRoot>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}

export const GroupList = memo(GroupListInner)
