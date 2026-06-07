'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import { getGroupMembers } from '../lib/queries'
import type { GroupMemberWithUser } from '../types'

export function useGroupMembers(groupId: number | null) {
  const [members, setMembers] = useState<GroupMemberWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (groupId === null) {
      setMembers([])
      setIsLoading(false)
      return
    }
    setError(null)
    try {
      const result = await getGroupMembers(groupId)
      setMembers(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải thành viên')
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  const callbackRef = useRef(refetch)
  useEffect(() => { callbackRef.current = refetch }, [refetch])

  useEffect(() => {
    if (groupId === null) return
    const supabase = createClient()
    const channel = supabase
      .channel(`group-members-${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${groupId}` }, () => callbackRef.current())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { members, isLoading, error, refetch, setMembers }
}
