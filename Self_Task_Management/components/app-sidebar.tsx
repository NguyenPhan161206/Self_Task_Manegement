'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Zap, CheckSquare, Users, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { useAuth } from '@/feature/auth/hooks/useAuth'

interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  disabled?: boolean
}

function NavItem({ href, label, icon: Icon, active, disabled }: NavItemProps) {
  return (
    <Link
      href={disabled ? '#' : href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        disabled && 'pointer-events-none opacity-40',
      )}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
      {disabled && (
        <span className="ml-auto text-[10px] text-muted-foreground">Sắp ra mắt</span>
      )}
    </Link>
  )
}

export function AppSidebar() {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (pathname === '/') return null

  if (loading) {
    return (
      <aside className="hidden w-60 shrink-0 border-r bg-muted/30 p-3 lg:block">
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-3/4" />
        </div>
      </aside>
    )
  }

  if (!user) return null

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-muted/30 lg:flex lg:flex-col">
      <div className="flex flex-col gap-1 p-3 overflow-y-auto flex-1">
        <NavItem
          href="/dashboard"
          label="Biểu đồ"
          icon={BarChart3}
          active={pathname === '/dashboard'}
        />

        <Collapsible defaultOpen className="mt-1">
          <CollapsibleTrigger>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Chức năng</span>
            </span>
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-2 mt-1 flex flex-col gap-0.5 pl-3 border-l">
              <NavItem
                href="/tasks"
                label="Nhiệm vụ"
                icon={CheckSquare}
                active={pathname === '/tasks'}
              />
              <NavItem
                href="/groups"
                label="Nhóm"
                icon={Users}
                active={pathname.startsWith('/groups')}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="border-t p-3">
        <p className="text-[10px] text-muted-foreground">Self Task v0.1</p>
      </div>
    </aside>
  )
}
