'use client'

import { useState, useEffect, useCallback } from 'react'

import { createClient } from '@/lib/supabase/client'
import { enrichTask } from '../utils'
import type { Task, TaskFilter, TaskWithMeta } from '../types'
import { useTaskSubscription } from './useTaskSubscription'

export function useTasks(filter: TaskFilter = {}) {
  const [tasks, setTasks] = useState<TaskWithMeta[]>([])
  const [isInitialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setError(null)

    try {
      const supabase = createClient()

      // Get current auth user UUID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setTasks([])
        setInitialLoading(false)
        return
      }

      // Find users.id from auth_user_id
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!userRow) {
        setTasks([])
        setInitialLoading(false)
        return
      }

      // Query tasks via personal_tasks with nested task_tags
      let query = supabase
        .from('personal_tasks')
        .select('task_id, tasks(*, task_tags(tags(id, name)))')
        .eq('user_id', userRow.id)

      if (filter.statuses && filter.statuses.length > 0) {
        query = query.in('tasks.status', filter.statuses)
      }
      if (filter.priorities && filter.priorities.length > 0) {
        query = query.in('tasks.priority', filter.priorities)
      }

      const { data, error: queryError } = await query

      if (queryError) {
        setError(queryError.message)
        setInitialLoading(false)
        return
      }

      let result: TaskWithMeta[] = (data || [])
        .map(item => {
          const task = item.tasks as TaskWithMeta | null
          if (task) {
            task.taskTags = (task as any).task_tags ?? []
            delete (task as any).task_tags
          }
          return task
        })
        .filter((t): t is TaskWithMeta => t !== null)
        .map(enrichTask)

      // Client-side search filter
      if (filter.search) {
        const q = filter.search.toLowerCase()
        result = result.filter(t => t.title.toLowerCase().includes(q))
      }

      // Client-side tag filter
      if (filter.tags && filter.tags.length > 0) {
        result = result.filter(t =>
          t.taskTags?.some(tt => tt.tags?.name && filter.tags!.includes(tt.tags.name))
        )
      }

      setTasks(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải nhiệm vụ')
    } finally {
      setInitialLoading(false)
    }
  }, [filter.statuses, filter.priorities, filter.search, filter.tags])

  useTaskSubscription(fetchTasks)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    isInitialLoading,
    error,
    refetch: fetchTasks,
    setTasks,
  }
}
