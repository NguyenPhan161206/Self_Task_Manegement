import { TaskCard } from '@/feature/tasks/components/TaskCard'
import type { Task } from '@/feature/tasks/types'

// Demo data using the new feature/types (this will be replaced by real data from Supabase)
const demoTasks: Task[] = [
  {
    id: 'demo-1',
    user_id: 'demo',
    title: 'Set up scalable folder structure',
    description: 'feature/, lib/supabase, types, docs, etc.',
    status: 'done',
    priority: 'high',
    due_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: 'demo',
    title: 'Connect real Supabase tasks table',
    description: 'Use the clients in lib/supabase + actions in feature/tasks',
    status: 'in_progress',
    priority: 'medium',
    due_date: new Date(Date.now() + 1000 * 3600 * 24).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-6 text-sm leading-loose pt-2">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Welcome to Self Task</h1>
          <p className="text-muted-foreground mt-1">A beautiful, simple way to manage your personal tasks.</p>
        </div>

        <div>
          <p>You may now add components and start building real features.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Folder structure is now in place: <code>feature/tasks</code>, <code>feature/auth</code>, <code>lib/supabase</code>.
            See <code>README.md</code> and the READMEs inside each feature.
          </p>
        </div>

        <div className="mt-4">
          <h2 className="font-medium mb-2 text-base">Demo — using the new tasks feature</h2>
          <div className="space-y-3">
            {demoTasks.map((t) => (
              <TaskCard key={t.id} task={{ ...t, isOverdue: false, daysUntilDue: null }} />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 font-mono">
            (TaskCard + types + utils imported from @/feature/tasks — structure is alive!)
          </p>
        </div>

        <div className="font-mono text-xs text-muted-foreground mt-2">
          (Use the sun/moon button in the header or press <kbd>d</kbd> to toggle dark/light mode)
        </div>
      </div>
    </div>
  )
}
