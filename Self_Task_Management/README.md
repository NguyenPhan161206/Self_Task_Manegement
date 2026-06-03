# Self Task Management

Next.js 16 (App Router) + Supabase + shadcn/ui (radix-vega) + Tailwind 4 + Recharts.

A personal task management app with Kanban board, realtime sync, tags, charts, and auth.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack, App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + RLS policies |
| UI | shadcn/ui (Radix primitives) + Tailwind CSS 4 |
| Charts | shadcn/chart + Recharts |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |
| Language | TypeScript |

## Route Map

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static → Dynamic* | Fanpage landing (data-driven from `data/home.json`) |
| `/sign-in` | Static | Sign in form |
| `/sign-up` | Static | Sign up form |
| `/tasks` | Dynamic | Kanban board + task management (auth required) |
| `/dashboard` | Dynamic | Charts & stats dashboard (auth required) |

*\* `/` becomes dynamic when auth check is added for CTA redirect*

## Current Status

### ✅ Done
- **Auth**: Sign-up / sign-in / sign-out, session management
- **Auth bridge**: `auth_user_id` (UUID) mapping → `public.users` (bigint)
- **RLS policies**: 12 policies covering users, tasks, personal_tasks
- **Realtime**: tasks + task_tags subscribed via Supabase Realtime
- **Task CRUD**: Create, edit, delete, update status
- **Kanban board**: 3 columns (Cần làm / Đang làm / Hoàn thành), drag-and-drop with @dnd-kit
- **Tags**: Global tag pool (max 10/user), M2M via task_tags, TagManager dialog, TagSelector
- **Sidebar**: Collapsible navigation (Dashboard, Tasks, Groups — disabled)
- **Dashboard**: Statistics cards, status pie chart, priority bar chart, trending line chart, tag bar chart, upcoming tasks
- **Filter panel**: Multi-select (status / priority / tags), collapsible sections, color indicators, clear all
- **Performance**: React.memo, useMemo, useCallback on all heavy components
- **Home page**: Beautiful fanpage, data-driven from `data/home.json`

### 🚧 In Progress
- (none — planning next features)

### 📋 Planned
- Group / project feature
- Notifications
- Mobile responsive improvements

## Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── dashboard/            # Charts dashboard page
│   ├── sign-in/              # Sign in page
│   ├── sign-up/              # Sign up page
│   ├── tasks/                # Tasks page (Kanban + filter)
│   ├── layout.tsx            # Root layout (header + sidebar + main)
│   ├── page.tsx              # Fanpage landing
│   └── globals.css           # Global styles + theme variables
├── components/
│   ├── ui/                   # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── app-header.tsx        # Top navigation bar
│   └── app-sidebar.tsx       # Left sidebar navigation
├── feature/                  # ★ Vertical feature slices
│   ├── auth/                 # Authentication (components, hooks, actions)
│   ├── tasks/                # Core task management (Kanban, CRUD, filters)
│   ├── tags/                 # Tag management (CRUD, global pool, M2M)
│   └── charts/               # Dashboard charts (5 chart types + DashboardView)
├── data/
│   └── home.json             # Fanpage content (edit text, CTAs, testimonials here)
├── lib/
│   ├── utils.ts              # cn() + helpers
│   └── supabase/             # Supabase clients (server.ts, client.ts)
├── types/
│   └── database.ts           # Supabase generated types
├── scripts/                  # CLI utilities (test accounts, etc.)
└── supabase/
    └── migrations/           # Database migrations
```

## Getting Started

### Prerequisites
- Node.js 20+
- Supabase project (local or hosted)

### Environment Variables

Create `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # for admin operations
```

### Install & Run

```bash
npm install
npm run dev
```

### Database Migrations

```bash
npx supabase migration up
```

Or apply manually via Supabase SQL editor.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Lint check |
| `npm run format` | Format code |
| `npm run dev:create-accounts -- --count 10` | Create N test accounts (dev only) |

## Key Architecture Decisions

- **Auth-first flow**: Supabase Auth user (UUID) created first, then `public.users` (bigint) with `auth_user_id` mapping
- **RLS via subquery**: `(SELECT id FROM users WHERE auth_user_id = auth.uid())` to map Auth UUID → users.id
- **Tag limit enforced at DB**: Trigger `check_tags_per_user_limit()` — cannot bypass via app
- **Feature folders**: Each capability is a self-contained `feature/*/` with components, hooks, actions, types
- **Fanpage data-driven**: All text, CTAs, and images in `data/home.json` — edit without touching code
- **Chart colors**: Pastel palette, status/priority assigned fixed colors (not index-based)
