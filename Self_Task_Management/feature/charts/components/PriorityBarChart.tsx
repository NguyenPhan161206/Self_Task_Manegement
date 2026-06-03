'use client'

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

interface PriorityBarChartProps {
  data: { priority: string; count: number; fill: string }[]
  isLoading: boolean
}

export function PriorityBarChart({ data, isLoading }: PriorityBarChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-end gap-2 h-60 p-4">
        <Skeleton className="flex-1 h-40" />
        <Skeleton className="flex-1 h-32" />
        <Skeleton className="flex-1 h-48" />
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

  const chartConfig: ChartConfig = {}
  for (const item of data) {
    chartConfig[item.priority] = { label: item.priority, color: item.fill }
  }

  return (
    <ChartContainer config={chartConfig} className="h-60 w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="priority" tickLine={false} tickMargin={10} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="count" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
