# Supabase Clients (Safety Layer)

This folder exists so it is **impossible** (or at least very obvious) to accidentally use privileged credentials on the client.

## Rules (follow these)

1. **Browser / Client Components / hooks** (`'use client'`)
   - Import from `./client`
   - Only ever uses `NEXT_PUBLIC_*` keys
   - Example: `import { supabase } from '@/lib/supabase/client'`

2. **Server Components, Server Actions, Route Handlers, middleware**
   - Import from `./server`
   - Can use service role key (full admin) **or** user access token
   - Example: `import { createServerClient } from '@/lib/supabase/server'`

3. Never import anything from `server.ts` into a file that can run in the browser.

4. When you are ready for proper Next.js SSR auth (recommended):
   - `npm install @supabase/ssr`
   - Replace the current clients with `createBrowserClient` / `createServerClient` from `@supabase/ssr`
   - Add a `middleware.ts` at project root that refreshes sessions on every request.

Current implementation uses the basic `@supabase/supabase-js` so we can stand up the folder structure immediately.

See `feature/auth/` and `feature/tasks/actions.ts` for usage patterns.
