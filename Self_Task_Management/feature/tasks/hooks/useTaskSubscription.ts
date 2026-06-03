'use client'

import { useEffect, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Task } from '../types'

export function useTaskSubscription(onChange: () => void) {
  const supabase = createClient()
  const callbackRef = useRef(onChange)

  useEffect(() => {
    callbackRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on<Task>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => callbackRef.current(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_tags' },
        () => callbackRef.current(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
}
