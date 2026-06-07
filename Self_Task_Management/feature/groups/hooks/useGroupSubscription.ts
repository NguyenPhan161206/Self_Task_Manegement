'use client'

import { useEffect, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient()

const listeners = new Set<{ current: () => void }>()
let channel: RealtimeChannel | null = null

function notifyAll() {
  listeners.forEach((ref) => ref.current())
}

export function useGroupSubscription(onChange: () => void) {
  const callbackRef = useRef(onChange)
  callbackRef.current = onChange

  useEffect(() => {
    listeners.add(callbackRef)

    if (!channel) {
      channel = supabase
        .channel('groups-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'groups' },
          notifyAll,
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'group_members' },
          notifyAll,
        )
        .subscribe()
    }

    return () => {
      listeners.delete(callbackRef)
      if (listeners.size === 0 && channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    }
  }, [])
}
