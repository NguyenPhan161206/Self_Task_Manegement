# Auth Feature (`feature/auth`)

Handles authentication, session management, and user identity for Self Task Management using Supabase.

## Why here (for scale + explore + safety)
- All auth code in **one place**: easy to find, easy to replace (e.g. swap Supabase auth), easy to delete the whole feature.
- Co-located with tasks feature for similar patterns.
- Client-safe vs server-only clearly separated via `lib/supabase/`.

## Key files
- `components/` - Auth UI (LoginForm, UserAvatar, ProtectedRoute wrapper etc.)
- `hooks/` - `useAuth`, `useSession`
- `actions.ts` - Server Actions (signInWithPassword, signOut, signUp with username support)
- `lib/` - thin wrappers over supabase client if needed
- `types.ts` - Session, UserProfile, AuthError etc. (username lives in user.user_metadata.username)
- `index.ts` - public barrel exports only

## Usage
```tsx
import { useAuth } from '@/feature/auth'
import { signInWithPassword, signOut } from '@/feature/auth/actions'
```

## Implemented (ready to use)
- Email + password **Sign in** and **Sign up** (Server Actions + SSR client)
- During **Sign up**, users can declare a **username** (stored in user_metadata.username and shown in UI)
- `useAuth()` hook with live session subscription (`onAuthStateChange`)
- Sign-in page: `/sign-in`
- Sign-up page: `/sign-up` (now includes username field)
- Header shows username (falls back to email)
- Proper cookie session handling via `@supabase/ssr`

## Pages
- Visit http://localhost:3000/sign-in to test login
- Visit http://localhost:3000/sign-up to create a test user

After successful login you can use `getCurrentUser()` in server components or `useAuth()` on client.

## Next improvements
- Add OAuth providers (Google, GitHub) in Supabase dashboard + actions
- Email confirmation flow
- Protected route middleware (see Next.js + Supabase docs)
- Password reset
- Better error UI / loading states


## Safety notes
- Use `lib/supabase/client.ts` in client components.
- Use `lib/supabase/server.ts` (or createServerClient) in server actions / RSC.
- Protect routes with middleware (future: add middleware.ts at root that uses supabase).

## Next steps
- Implement real Supabase email/password + OAuth (Google etc.)
- Add protected layout using this feature
- Types should match your Supabase `auth.users` + custom `profiles` table
