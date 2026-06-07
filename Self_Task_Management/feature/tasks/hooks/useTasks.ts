'use client'

import { useState, useEffect, useCallback } from 'react'

import { createClient } from '@/lib/supabase/client'
import { enrichTask } from '../utils'
import type { TaskFilter, TaskWithMeta } from '../types'
import { useTaskSubscription } from './useTaskSubscription'

export function useTasks(filter: TaskFilter = {}) {
  const [tasks, setTasks] = useState<TaskWithMeta[]>([])
  const [isInitialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setError(null)

    try {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setTasks([])
        setInitialLoading(false)
        return
      }

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

      // 1. Query personal tasks (skip when viewing a specific group)
      const specificGroupId = filter.groupId
      let result: TaskWithMeta[] = []

      if (!specificGroupId) {
        let personalQuery = supabase
          .from('personal_tasks')
          .select('task_id, tasks(*, task_tags(tags(id, name)))')
          .eq('user_id', userRow.id)

        if (filter.statuses && filter.statuses.length > 0) {
          personalQuery = personalQuery.in('tasks.status', filter.statuses)
        }
        if (filter.priorities && filter.priorities.length > 0) {
          personalQuery = personalQuery.in('tasks.priority', filter.priorities)
        }

        const { data: personalData, error: queryError } = await personalQuery

        if (queryError) {
          setError(queryError.message)
          setInitialLoading(false)
          return
        }

        result = (personalData || [])
          .map(item => {
            const task = item.tasks as (TaskWithMeta & { task_tags?: unknown[] }) | null
            if (task) {
              task.taskTags = (task.task_tags ?? []) as TaskWithMeta['taskTags']
              delete (task as { task_tags?: unknown }).task_tags
            }
            return task as TaskWithMeta | null
          })
          .filter((t): t is TaskWithMeta => t !== null)
          .map(enrichTask)
      }

      // 2. Query group tasks
      const includeGroups = filter.includeGroupTasks ?? false

      if (includeGroups || specificGroupId) {
        const { data: memberships } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', userRow.id)

        const groupIds = (memberships || [])
          .map(m => m.group_id)
          .filter((id): id is number => id !== null)

        let effectiveGroupIds = groupIds
        if (specificGroupId) {
          effectiveGroupIds = groupIds.filter(id => id === specificGroupId)
        }

        if (effectiveGroupIds.length > 0) {
          // Fetch group names for the user's groups
          const { data: groupNameData } = await supabase
            .from('groups')
            .select('id, name')
            .in('id', effectiveGroupIds)
          const groupNameMap = new Map<number, string>((groupNameData ?? []).map(g => [g.id, g.name]))

          let groupQuery = supabase
            .from('tasks')
            .select('*, task_tags(tags(id, name))')
            .in('group_id', effectiveGroupIds)

          if (filter.statuses && filter.statuses.length > 0) {
            groupQuery = groupQuery.in('status', filter.statuses)
          }
          if (filter.priorities && filter.priorities.length > 0) {
            groupQuery = groupQuery.in('priority', filter.priorities)
          }

          const { data: groupData } = await groupQuery

          if (groupData) {
            const groupTasks = groupData
              .map(row => {
                const taskRow = row as TaskWithMeta & { task_tags?: unknown[] }
                const enriched = enrichTask(taskRow)
                enriched.taskTags = (taskRow.task_tags?.map((tt: unknown) => {
                  const t = tt as { tags?: { id: number; name: string } | null }
                  return t.tags ? { tags: t.tags } : null
                }).filter(Boolean) ?? []) as TaskWithMeta['taskTags']
                delete (taskRow as { task_tags?: unknown }).task_tags

                if (taskRow.group_id) {
                  enriched.groupName = groupNameMap.get(taskRow.group_id)
                }

                return enriched
              })
              .filter(t => !result.find(existing => existing.id === t.id))

            result = [...result, ...groupTasks]
          }
        }
      }

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
  }, [filter.statuses, filter.priorities, filter.search, filter.tags, filter.groupId, filter.includeGroupTasks])

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
