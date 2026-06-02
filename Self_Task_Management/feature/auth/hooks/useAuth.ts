'use client'

import { useState, useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'

import type { AuthState } from '../types'

/**
 * Client-side auth hook.
 * Subscribes to Supabase auth state changes and provides signIn/signOut.
 * Can be used in any client component for current user info.
 */
export function useAuth(): AuthState & {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      })
    })

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState((s) => ({ ...s, error: error }))
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    // State will update via onAuthStateChange listener
  }

  return {
    ...state,
    signIn,
    signOut,
  }
}
