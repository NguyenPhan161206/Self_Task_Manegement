'use client'

import { memo } from 'react'
import { Shield, UserMinus } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useGroupMembers } from '../hooks/useGroupMembers'
import { removeMember, updateMemberRole } from '../actions'
import type { GroupWithMeta } from '../types'

interface MemberListProps {
  group: GroupWithMeta
}

function MemberListInner({ group }: MemberListProps) {
  const { members, isLoading, refetch } = useGroupMembers(group.id)
  const isAdmin = group.role === 'admin'

  const handleRemove = async (userId: number) => {
    const result = await removeMember(group.id, userId)
    if (result.success) refetch()
  }

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    const result = await updateMemberRole(group.id, userId, newRoleId)
    if (result.success) refetch()
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {members.map(member => {
        const username = member.users?.username ?? 'Unknown'
        const initials = username.slice(0, 2).toUpperCase()
        const isMemberAdmin = member.roles?.name === 'admin'
        const isLeader = member.user_id === group.created_by

        const roleBadge = isLeader
          ? { label: 'Trưởng nhóm', variant: 'default' as const }
          : isMemberAdmin
            ? { label: 'Quản trị', variant: 'secondary' as const }
            : { label: 'Thành viên', variant: 'outline' as const }

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <Avatar>
              {member.users?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.users.avatar} alt={username} className="aspect-square size-full rounded-full object-cover" />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{username}</p>
              <p className="text-xs text-muted-foreground truncate">
                {member.users?.email ?? ''}
              </p>
            </div>
            <Badge variant={roleBadge.variant}>
              {roleBadge.label}
            </Badge>
            {isAdmin && !isMemberAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Hành động</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRoleChange(member.user_id!, 1)}>
                    <Shield className="mr-2 h-4 w-4" />
                    Cấp quyền admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRemove(member.user_id!)}
                    className="text-destructive"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Xoá khỏi nhóm
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {isAdmin && isMemberAdmin && member.user_id !== group.created_by && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Hành động</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRoleChange(member.user_id!, 2)}>
                    Hạ xuống thành viên
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      })}
    </div>
  )
}

export const MemberList = memo(MemberListInner)
