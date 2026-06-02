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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
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
