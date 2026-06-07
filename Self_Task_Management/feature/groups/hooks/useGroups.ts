'use client'

import { useState, useEffect, useCallback } from 'react'

import { getUserGroups } from '../lib/queries'
import type { GroupWithMeta } from '../types'
import { useGroupSubscription } from './useGroupSubscription'

export function useGroups() {
  const [groups, setGroups] = useState<GroupWithMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setError(null)
    try {
      const result = await getUserGroups()
      setGroups(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải nhóm')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useGroupSubscription(refetch)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()
  }, [refetch])

  return { groups, isLoading, error, refetch, setGroups }
}
