# Tasks Feature (`feature/tasks`)

The heart of **Self Task Management**. Everything related to creating, reading, updating, deleting, filtering, and realtime-syncing tasks lives here.

## Design goals (upscale, safe, explore)
- **Upscale**: Adding "projects", "tags", "comments on tasks", "teams" = create parallel `feature/projects/`, `feature/comments/`. Delete tasks feature = rm -rf feature/tasks.
- **Safe**: Server actions + lib/supabase/server for mutations. Types match DB. Client components only receive serializable data. RLS assumed on Supabase side.
- **Easy to explore**: One folder. Start reading README.md then types.ts + actions.ts. Components are dumb (receive data via props or hooks from this feature).

## Standard layout inside this feature
- `components/` - UI pieces specific to tasks (TaskCard, TaskForm, TaskFilters, TaskList). Compose with `@/components/ui/*` primitives.
- `hooks/` - `useTasks`, `useTask`, `useRealtimeTasks` (tanstack-query or native supabase channel later).
- `actions.ts` - All Server Actions (createTask, updateTaskStatus, deleteTask...). 'use server'
- `lib/` - Data access layer: `getTasks(query)`, `subscribeToTasks` etc. Thin wrappers.
- `types.ts` - Task, TaskInsert, TaskFilter, Priority etc. (single source of truth).
- `utils.ts` - Pure functions (isOverdue, formatDueDate, groupByStatus).
- `index.ts` - Only export what other parts of app should use.
- `README.md` - This file (update as it grows).

## Example future usage (after wiring Supabase)
```tsx
// app/(dashboard)/tasks/page.tsx
import { TaskList } from '@/feature/tasks'
import { getTasks } from '@/feature/tasks/lib/queries' // or from actions

export default async function TasksPage() {
  const tasks = await getTasks({ status: 'todo' })
  return <TaskList initialTasks={tasks} />
}
```

## DB alignment
See `types/database.ts` (tasks table). Keep in sync. When schema changes, regen types.

## Realtime & safety
Use Supabase Realtime channels for live updates. Subscribe only when user is authenticated.

## Vietnamese (LANGUAGE=vi)
UI strings here should eventually come from i18n (t('tasks.title') etc). For now hardcode EN + note TODO.
