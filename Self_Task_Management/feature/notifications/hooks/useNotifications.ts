'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/feature/auth/hooks/useAuth'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../actions'
import type { Notification } from '../types'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    try {
      const [notifList, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ])
      setNotifications(notifList)
      setUnreadCount(count)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const callbackRef = useRef(refetch)
  useEffect(() => { callbackRef.current = refetch }, [refetch])

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => callbackRef.current(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()
  }, [refetch])

  const handleMarkAsRead = useCallback(async (id: number) => {
    await markAsRead(id)
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n)),
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead()
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true })),
    )
    setUnreadCount(0)
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetch,
  }
}
