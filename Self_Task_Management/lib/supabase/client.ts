import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in Client Components / browser.
 * Uses @supabase/ssr for proper cookie-based session handling in Next.js.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY!
  )
}
