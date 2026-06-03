'use client'

import { ListCheck, Timer, AlertCircle, FileText } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  total: number
  done: number
  inProgress: number
  overdue: number
  isLoading: boolean
}

const items = [
  { key: 'total', label: 'Tổng số', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'done', label: 'Hoàn thành', icon: ListCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'inProgress', label: 'Đang thực hiện', icon: Timer, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'overdue', label: 'Quá hạn', icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
] as const

export function StatsCards({ total, done, inProgress, overdue, isLoading }: StatsCardsProps) {
  const values = { total, done, inProgress, overdue }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.key} size="sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <div className={cn('rounded-lg p-2', item.bg)}>
                <Icon className={cn('h-4 w-4', item.color)} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{values[item.key]}</div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
