'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useChartData } from '../hooks/useChartData'
import { StatsCards } from './StatsCards'
import { StatusPieChart } from './StatusPieChart'
import { PriorityBarChart } from './PriorityBarChart'
import { TrendingLineChart } from './TrendingLineChart'
import { TagBarChart } from './TagBarChart'
import { UpcomingTasks } from './UpcomingTasks'

export function DashboardView() {
  const { data, isLoading, error, refetch } = useChartData()

  const isEmpty = data && data.total === 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Thống kê</h1>
        {!isLoading && (
          <Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Nạp lại
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Thử lại
          </Button>
        </div>
      )}

      {isEmpty && !isLoading && (
        <div className="rounded-lg border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          <p className="text-base font-medium">Chưa có dữ liệu thống kê</p>
          <p className="mt-1">Tạo nhiệm vụ đầu tiên để xem thống kê.</p>
        </div>
      )}

      {(!isEmpty || isLoading) && (
        <>
          <StatsCards
            total={data?.total ?? 0}
            done={data?.done ?? 0}
            inProgress={data?.inProgress ?? 0}
            overdue={data?.overdue ?? 0}
            isLoading={isLoading}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusPieChart data={data?.statusDistribution ?? []} isLoading={isLoading} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mức ưu tiên</CardTitle>
              </CardHeader>
              <CardContent>
                <PriorityBarChart data={data?.priorityDistribution ?? []} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Xu hướng theo tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingLineChart data={data?.weeklyTrend ?? []} isLoading={isLoading} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Nhiệm vụ theo thẻ</CardTitle>
              </CardHeader>
              <CardContent>
                <TagBarChart data={data?.tagDistribution ?? []} isLoading={isLoading} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sắp đến hạn</CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingTasks data={data?.upcomingTasks ?? []} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
