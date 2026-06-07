'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Users, Puzzle, ListChecks, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTasks } from '@/feature/tasks/hooks/useTasks'
import { KanbanBoard } from '@/feature/tasks/components/KanbanBoard'
import { TaskEmpty } from '@/feature/tasks/components/TaskEmpty'
import { TaskForm } from '@/feature/tasks/components/TaskForm'
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DialogRoot as EditDialogRoot,
  DialogContent as EditDialogContent,
  DialogHeader as EditDialogHeader,
  DialogTitle as EditDialogTitle,
  DialogDescription as EditDialogDescription,
} from '@/components/ui/dialog'
import { getGroupById } from '@/feature/groups/lib/queries'
import { MemberList } from '@/feature/groups/components/MemberList'
import { InviteMemberDialog } from '@/feature/groups/components/InviteMemberDialog'
import { GroupSettings } from '@/feature/groups/components/GroupSettings'
import { GroupModuleManager } from '@/feature/groups/components/GroupModuleManager'
import type { GroupWithMeta } from '@/feature/groups/types'
import type { TaskWithMeta } from '@/feature/tasks/types'

type Tab = 'tasks' | 'members' | 'settings' | 'modules'

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'tasks', label: 'Nhiệm vụ', icon: ListChecks },
  { key: 'members', label: 'Thành viên', icon: Users },
  { key: 'modules', label: 'Chức năng', icon: Puzzle },
  { key: 'settings', label: 'Cài đặt', icon: Settings },
]

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = Number(params.id)

  const [group, setGroup] = useState<GroupWithMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskWithMeta | null>(null)

  const isAdmin = group?.role === 'admin'

  const { tasks, isInitialLoading, error, refetch, setTasks } = useTasks({
    groupId,
    includeGroupTasks: true,
  })

  const fetchGroup = useCallback(async () => {
    const result = await getGroupById(groupId)
    if (!result) {
      router.push('/groups')
      return
    }
    setGroup(result)
    setLoading(false)
  }, [groupId, router])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroup()
  }, [fetchGroup])

  const handleTasksChange = useCallback((updated: TaskWithMeta[]) => {
    setTasks(updated)
  }, [setTasks])

  const handleEditTaskFn = useCallback((task: TaskWithMeta) => {
    setEditTask(task)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!group) return null

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/groups')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{group.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isDisabled = !isAdmin && (tab.key === 'settings' || tab.key === 'modules')
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => !isDisabled && setActiveTab(tab.key)}
              disabled={isDisabled}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
                isDisabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'tasks' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {tasks.length} nhiệm vụ
            </p>
            <DialogRoot open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <ListChecks className="mr-1.5 h-4 w-4" />
                  Tạo nhiệm vụ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo nhiệm vụ mới</DialogTitle>
                  <DialogDescription>
                    Thêm một nhiệm vụ vào nhóm &ldquo;{group.name}&rdquo;
                  </DialogDescription>
                </DialogHeader>
                <TaskForm
                  defaultGroupId={groupId}
                  onSuccess={() => { setCreateDialogOpen(false); refetch() }}
                />
              </DialogContent>
            </DialogRoot>
          </div>

          <EditDialogRoot open={!!editTask} onOpenChange={(open) => { if (!open) setEditTask(null) }}>
            <EditDialogContent>
              <EditDialogHeader>
                <EditDialogTitle>Chỉnh sửa nhiệm vụ</EditDialogTitle>
                <EditDialogDescription>
                  Cập nhật thông tin nhiệm vụ.
                </EditDialogDescription>
              </EditDialogHeader>
              {editTask && (
                <TaskForm
                  task={editTask}
                  onSuccess={() => { setEditTask(null); refetch() }}
                />
              )}
            </EditDialogContent>
          </EditDialogRoot>

          {isInitialLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border p-3">
                  <div className="h-4 w-20 bg-muted rounded mb-3" />
                  <div className="h-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : tasks.length === 0 ? (
            <TaskEmpty onCreate={() => setCreateDialogOpen(true)} />
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTasksChange={handleTasksChange}
              onEditTask={handleEditTaskFn}
            />
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {group.member_count ?? 0} thành viên
            </p>
            {isAdmin && (
              <InviteMemberDialog groupId={group.id} onSuccess={fetchGroup} />
            )}
          </div>
          <MemberList group={group} />
        </div>
      )}

      {activeTab === 'modules' && isAdmin && (
        <div>
          <h2 className="text-lg font-medium mb-2">Quản lý chức năng</h2>
          <GroupModuleManager groupId={group.id} />
        </div>
      )}

      {activeTab === 'settings' && isAdmin && (
        <div>
          <GroupSettings
            group={group}
            onUpdated={fetchGroup}
            onDeleted={() => router.push('/groups')}
          />
        </div>
      )}
    </div>
  )
}
