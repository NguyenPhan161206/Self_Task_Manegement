# Self Task Management

Next.js 16 (App Router) + Supabase + shadcn/ui (radix-vega style) + Tailwind 4.

A personal task management app. Built to be **easy to scale**, **safe**, and **easy to explore**.

## Current status
- Bare template running (`npm run dev` works).
- Supabase connected via `.env` (keys present, client + admin patterns ready).
- Theme (dark/light + `d` hotkey) + one example accordion.
- **Home is now a beautiful fanpage-style landing page** — fully driven by `data/home.json`. Edit text, CTAs, testimonials, and image URLs there for instant changes. Images use `next/image` + picsum placeholders (replace paths in JSON with your own in `public/images/`).
- **No real tasks/auth code yet** — the folder structure below is prepared so the first real features can be added cleanly.

## Project folder structure (scalable by design)

We use the **existing `feature/` directory (singular, as pre-created)** + colocated `lib/` for cross-cutting concerns.

```
/
├── app/                  # Next.js App Router only (routing, layouts, pages)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/           # Shared UI
│   ├── ui/               # shadcn primitives ONLY (add via npx shadcn)
│   └── theme-provider.tsx
├── feature/              # ★ THE KEY FOR SCALING (vertical slices / feature folders)
│   ├── auth/             # Authentication & session
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions.ts    # Server Actions
│   │   ├── types.ts
│   │   ├── index.ts      # Public barrel
│   │   └── README.md
│   ├── tasks/            # Core domain: the actual task management
│   │   ├── components/   # TaskCard, TaskForm, TaskList (use ui/ + lucide)
│   │   ├── hooks/        # useTasks, useTaskFilters
│   │   ├── actions.ts    # createTask, updateTaskStatus, deleteTask...
│   │   ├── lib/          # queries, realtime subscriptions
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── index.ts
│   │   └── README.md
│   └── (add more: projects/, notifications/, settings/ ...)
├── lib/                  # Cross-feature utilities & infrastructure
│   ├── utils.ts          # cn() + other pure helpers
│   └── supabase/         # ★ SAFE CLIENT SEPARATION
│       ├── client.ts     # Browser-safe (public anon key)
│       ├── server.ts     # Server-only (service key or user token)
│       ├── index.ts
│       └── README.md (safety rules)
├── hooks/                # Only truly global hooks (most live in feature/*/hooks)
├── types/                # Global/shared types (e.g. database.ts)
│   └── database.ts       # Supabase types (generate from your project)
├── public/
├── README.md             # You are here
└── (configs: package.json, tsconfig.json, components.json, .env, ...)
```

### Why this structure?
- **Easy to upscale**: Add a whole new capability by creating `feature/whatever/`. Delete by removing one folder. No hunting across app/, components/, lib/.
- **Safe**: 
  - `lib/supabase/server.ts` vs `client.ts` makes it obvious where secrets can be used.
  - Server Actions live next to the feature that owns the data.
  - Types are co-located with the code that uses them.
- **Easy to explore**: 
  - New person? Open `feature/tasks/README.md` — everything they need is described + the files are right there.
  - Consistent layout in every `feature/*`.
  - Barrel `index.ts` tells you the public surface.
- Uses the pre-existing `feature/` + `hooks/` + `lib/` directories + shadcn aliases.

## Adding a new feature (the "upscale" recipe)

1. `mkdir -p feature/my-new-thing/{components,hooks,lib}`
2. Copy the folder layout + files from `feature/tasks/` or `feature/auth/`
3. Fill `README.md` first (forces clarity)
4. Export from `feature/my-new-thing/index.ts`
5. Use: `import { MyThing } from '@/feature/my-new-thing'`
6. (Optional) Add `"my-new-thing"` alias in `components.json` if you want shadcn to know about it later.

## Adding shadcn/ui components

```bash
npx shadcn@latest add button
```

They go into `components/ui/` (kept pristine — only primitives).

Feature-specific composed components go in `feature/*/components/`.

## Supabase + safety

- Client components / browser → `import { supabase } from '@/lib/supabase/client'`
- Server Actions / RSC / API → `import { createServerClient, supabaseAdmin } from '@/lib/supabase/server'`
- See `lib/supabase/README.md` (created with the structure) for rules.
- **Never** import the server file from a client component (Next bundler + our folder layout makes this natural).

Future improvement: add `@supabase/ssr` and `createBrowserClient` / `createServerClient` + middleware for cookie-based sessions.

## Types

`types/database.ts` is a hand-written stand-in.

When your Supabase schema (tasks table etc.) is stable:

```bash
# After linking project (supabase CLI)
npx supabase gen types typescript --linked > types/database.ts
```

Then update `feature/tasks/types.ts` etc. to re-export from it.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run format`
- `npm run dev:create-accounts -- --count 10` — **Dev only**: instantly create N test accounts (with username) for easy multi-user testing. No email confirmation needed. Use `--help` for options. See `scripts/create-test-accounts.ts`.

## Dev testing accounts
For developers who want to create many accounts for testing without friction:
Use the script above. It uses the service role to create accounts with `email_confirm: true` and a simple shared password.

**Note:** We removed the previous in-app /dev/test-accounts UI route because it was causing Next.js Turbopack to repeatedly recompile (due to internal route type generation picking up the /dev segment and conflicting with root route validators in .next/dev/types). The CLI script is more reliable and doesn't pollute the app route tree.

## Original shadcn template instructions (kept for reference)

### Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

### Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

---

**This structure was created so the app can grow from "Project ready!" placeholder into a real, maintainable Self Task Management tool without becoming a mess.** Start implementing inside `feature/tasks/` and `feature/auth/`.
