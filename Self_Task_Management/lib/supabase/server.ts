import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Uses @supabase/ssr + next/headers cookies for automatic session cookie management.
 * This is the safe way to do auth in Next.js App Router.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component context → cannot set cookies, which is fine
            // because refresh is handled by the Auth client internally.
          }
        },
      },
    }
  )
}

/**
 * Clears all Supabase auth session cookies.
 * Used in signOut when the SSR client's cookie methods may not apply
 * properly in Server Action redirect scenarios.
 */
export async function clearAuthCookies() {
  try {
    const cookieStore = await cookies()
    const cookiesToDelete = cookieStore
      .getAll()
      .filter((c) => c.name.startsWith('sb-') || c.name.startsWith('supabase-'))
    for (const cookie of cookiesToDelete) {
      cookieStore.set(cookie.name, '', { maxAge: 0, path: '/' })
    }
  } catch {
    // Non-critical cleanup
  }
}

// Optional: Admin client using service role (use sparingly, never expose to client)
import { createClient as createJsClient } from '@supabase/supabase-js'

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!serviceKey) {
  console.warn('[supabase/server] SUPABASE_SERVICE_ROLE_KEY missing')
}

export const supabaseAdmin = createJsClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
