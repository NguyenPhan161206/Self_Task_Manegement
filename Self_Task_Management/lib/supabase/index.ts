// Safe Supabase clients for Self Task Management
// - createClient() from client.ts : for Client Components (browser)
// - createClient() from server.ts : for Server Components / Server Actions (uses cookies)
//
// Uses @supabase/ssr for automatic secure cookie-based sessions.
// See .env for keys (use ANON / PUBLISHABLE for normal auth).
// Never import service-role admin code into client bundles.

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient, supabaseAdmin } from './server'
