'use client'

import { memo } from 'react'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useGroupModules } from '../hooks/useGroupModules'

const MODULE_LABELS: Record<string, { label: string; description: string }> = {
  tasks: { label: 'Nhiệm vụ', description: 'Cho phép thành viên tạo và quản lý nhiệm vụ' },
  comments: { label: 'Bình luận', description: 'Cho phép thành viên bình luận trên nhiệm vụ' },
  attachments: { label: 'Đính kèm', description: 'Cho phép thành viên đính kèm file vào nhiệm vụ' },
  invite: { label: 'Mời thành viên', description: 'Cho phép thành viên mời người khác vào nhóm' },
}

interface GroupModuleManagerProps {
  groupId: number
}

function GroupModuleManagerInner({ groupId }: GroupModuleManagerProps) {
  const { modules, isLoading, toggle } = useGroupModules(groupId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  const handleToggle = async (moduleId: number, currentEnabled: boolean) => {
    await toggle(moduleId, !currentEnabled)
  }

  return (
    <div className="space-y-2 max-w-lg">
      <p className="text-sm text-muted-foreground mb-4">
        Bật/tắt các chức năng mà thành viên trong nhóm có thể sử dụng.
      </p>
      {modules.map(mod => {
        const moduleName = mod.modules?.name ?? ''
        const info = MODULE_LABELS[moduleName] ?? { label: moduleName, description: '' }

        return (
          <div
            key={mod.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="text-sm font-medium">{info.label}</p>
              <p className="text-xs text-muted-foreground">{info.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={mod.enabled}
              onClick={() => handleToggle(mod.module_id, mod.enabled)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                mod.enabled ? 'bg-primary' : 'bg-input',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                  mod.enabled ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export const GroupModuleManager = memo(GroupModuleManagerInner)
