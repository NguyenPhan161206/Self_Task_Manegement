// Public API for the auth feature
// Import from here: import { useAuth, signInWithPassword, signUp, signOut } from '@/feature/auth'

export * from './types'
export { useAuth } from './hooks/useAuth'
export { signInWithPassword, signUp, signOut, getCurrentUser } from './actions'
export { getUserIdFromAuth } from './lib/getUserId'
