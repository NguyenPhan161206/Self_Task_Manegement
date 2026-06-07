'use client'

import Link from 'next/link'
import { memo } from 'react'
import { Users } from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { GroupWithMeta } from '../types'

interface GroupCardProps {
  group: GroupWithMeta
}

function GroupCardInner({ group }: GroupCardProps) {
  const initials = group.name.slice(0, 2).toUpperCase()

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="cursor-pointer transition hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              {group.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={group.avatar} alt={group.name} className="aspect-square size-full rounded-full object-cover" />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="truncate">{group.name}</CardTitle>
              <CardDescription className="truncate">
                {group.description || 'Không có mô tả'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{group.member_count ?? 0} thành viên</span>
            </div>
            {group.role && (
              <Badge variant={group.role === 'admin' ? 'default' : 'secondary'}>
                {group.role === 'admin' ? 'Quản trị' : 'Thành viên'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export const GroupCard = memo(GroupCardInner)
