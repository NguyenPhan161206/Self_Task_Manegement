'use client'

import { useState } from 'react'

import type { Task, TaskFilter } from '../types'
import { filterTasks } from '../utils'

// Stub hook demonstrating the pattern
// Real version will use Supabase client + realtime channel subscription
export function useTasks(initialTasks: Task[] = [], filter: TaskFilter = {}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate loading / refetch
  const refetch = async () => {
    setIsLoading(true)
    // TODO: const data = await fetchTasksFromServerAction() or supabase query via client
    setTimeout(() => setIsLoading(false), 120)
  }

  const filtered = filterTasks(tasks, filter)

  // TODO: setup realtime
  // useEffect(() => { const channel = supabase.channel('tasks')... })

  return {
    tasks: filtered,
    allTasks: tasks,
    isLoading,
    refetch,
    setTasks, // for optimistic updates
  }
}
