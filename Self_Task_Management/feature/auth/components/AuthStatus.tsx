'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { useAuth } from '../hooks/useAuth'
import { signOut } from '../actions'

export function AuthStatus() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading auth...</div>
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user.user_metadata?.username || user.email}</span>
        </span>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link href="/sign-in">
        <Button variant="ghost" size="sm">Sign in</Button>
      </Link>
      <Link href="/sign-up">
        <Button size="sm">Sign up</Button>
      </Link>
    </div>
  )
}
