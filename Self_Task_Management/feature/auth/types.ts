import type { User, Session } from '@supabase/supabase-js'

export type AuthUser = User
export type AuthSession = Session

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  error: Error | null
}

export type AuthError = {
  message: string
  status?: number
}
