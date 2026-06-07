'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useNotifications } from '../hooks/useNotifications'

export function NotificationBell() {
  const router = useRouter()
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const handleNotificationClick = useCallback(
    async (notif: typeof notifications[number]) => {
      if (!notif.is_read) {
        await markAsRead(notif.id)
      }

      if (notif.type === 'group_invite' || notif.type === 'group_invite_accepted') {
        const groupId = (notif.data as Record<string, unknown>)?.group_id
        if (groupId) {
          router.push(`/groups/${groupId}`)
        }
      }
    },
    [markAsRead, router],
  )

  const getTimeAgo = useCallback(
    (dateStr: string | null) => {
      if (!dateStr) return ''
      const diff = now - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Vừa xong'
      if (mins < 60) return `${mins} phút trước`
      const hours = Math.floor(mins / 60)
      if (hours < 24) return `${hours} giờ trước`
      const days = Math.floor(hours / 24)
      return `${days} ngày trước`
    },
    [now],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3 w-3" />
              Đọc tất cả
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Không có thông báo
            </p>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                type="button"
                onClick={() => handleNotificationClick(notif)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-accent',
                  !notif.is_read && 'bg-accent/50',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{notif.title}</p>
                  {notif.message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {notif.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {getTimeAgo(notif.created_at)}
                  </span>
                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
