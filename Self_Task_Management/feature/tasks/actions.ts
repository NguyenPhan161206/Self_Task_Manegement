'use server'

import { revalidatePath } from 'next/cache'

// import { createServerClient } from '@/lib/supabase/server'  // TODO: uncomment when implementing real server actions with Supabase

import type { Task, TaskInsert, /* TaskUpdate, */ TaskStatus } from './types'

// Server Actions for tasks. These are the ONLY place mutations should happen from the server.
// Call them from client forms with <form action={createTask}>

export async function createTask(formData: FormData | TaskInsert) {
  // const supabase = createServerClient() // or pass user token  -- TODO: use when wiring real DB

  let input: TaskInsert
  if (formData instanceof FormData) {
    input = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      status: (formData.get('status') as TaskStatus) || 'todo',
      priority: ((formData.get('priority') as Task['priority']) || 'medium'),
      // user_id should come from auth, not form in real app
      user_id: 'demo-user', // TODO: replace with real auth.getUser().id
    }
  } else {
    input = formData
  }

  // const { data, error } = await supabase.from('tasks').insert(input).select().single()
  // if (error) throw error

  console.log('[feature/tasks/actions] createTask STUB', input)

  revalidatePath('/tasks')
  revalidatePath('/')
  const stubTask = { id: 'stub-' + Date.now(), ...input, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as const
  return { success: true, task: stubTask }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  // const supabase = createServerClient()

  // await supabase.from('tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', taskId)

  console.log('[feature/tasks/actions] updateTaskStatus STUB', { taskId, status })

  revalidatePath('/tasks')
  return { success: true }
}

export async function deleteTask(taskId: string) {
  // const supabase = createServerClient()
  // await supabase.from('tasks').delete().eq('id', taskId)

  console.log('[feature/tasks/actions] deleteTask STUB', taskId)

  revalidatePath('/tasks')
  return { success: true }
}

// Add more: bulkUpdate, assignTask, etc.
