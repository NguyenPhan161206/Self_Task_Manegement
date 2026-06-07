'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import { getGroupModules, getAvailableModules } from '../lib/queries'
import type { GroupModuleWithModule, Module } from '../types'
import { toggleModule as toggleModuleAction } from '../actions'

export function useGroupModules(groupId: number) {
  const [modules, setModules] = useState<GroupModuleWithModule[]>([])
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setError(null)
    try {
      const [result, avail] = await Promise.all([
        getGroupModules(groupId),
        getAvailableModules(),
      ])
      setModules(result)
      setAvailableModules(avail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải chức năng')
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  const callbackRef = useRef(refetch)
  useEffect(() => { callbackRef.current = refetch }, [refetch])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`group-modules-${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_modules', filter: `group_id=eq.${groupId}` }, () => callbackRef.current())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch()
  }, [refetch])

  const toggle = useCallback(async (moduleId: number, enabled: boolean) => {
    const result = await toggleModuleAction(groupId, moduleId, enabled)
    if (result.success) {
      setModules(prev => prev.map(m =>
        m.module_id === moduleId ? { ...m, enabled } : m
      ))
    }
    return result
  }, [groupId])

  return { modules, availableModules, isLoading, error, refetch, toggle }
}
