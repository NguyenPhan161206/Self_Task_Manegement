import type { Task, TaskFilter } from '../types'

// Example data access layer colocated in the feature.
// In real app these would talk to Supabase via the safe clients in @/lib/supabase
// or call server actions.

export async function getTasks(filter?: TaskFilter): Promise<Task[]> {
  // const supabase = createClient()
  // let q = supabase.from('tasks').select('*')
  // if (filter?.status && filter.status !== 'all') q = q.eq('status', filter.status)
  // const { data } = await q.order('created_at', { ascending: false })
  // return data || []

  console.log('[feature/tasks/lib/queries] getTasks STUB', filter)
  return [] // return seed data in future
}

export function subscribeToTasks(/* _callback */ _callback: (tasks: Task[]) => void) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // const supabase = createClient()
  // const channel = supabase
  //   .channel('public:tasks')
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => { ... })
  //   .subscribe()

  console.log('[feature/tasks/lib] subscribeToTasks STUB (realtime would be here)')
  return () => {
    // channel.unsubscribe()
    console.log('[feature/tasks/lib] unsubscribed (stub)')
  }
}
