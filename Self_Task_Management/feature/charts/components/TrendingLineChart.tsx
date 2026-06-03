'use client'

import { Line, LineChart, CartesianGrid, XAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

interface TrendingLineChartProps {
  data: { week: string; completed: number; created: number }[]
  isLoading: boolean
}

export function TrendingLineChart({ data, isLoading }: TrendingLineChartProps) {
  if (isLoading) {
    return (
      <div className="h-60 p-4">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-sm text-muted-foreground">
        Chưa có dữ liệu
      </div>
    )
  }

  const chartConfig: ChartConfig = {
    created: { label: 'Tạo mới', color: 'var(--chart-1)' },
    completed: { label: 'Hoàn thành', color: 'var(--chart-2)' },
  }

  return (
    <ChartContainer config={chartConfig} className="h-60 w-full">
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line dataKey="created" stroke="var(--color-created)" strokeWidth={2} dot={false} />
        <Line dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}
