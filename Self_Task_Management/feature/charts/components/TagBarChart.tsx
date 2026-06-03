'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

interface TagBarChartProps {
  data: { tag: string; count: number; fill: string }[]
  isLoading: boolean
}

export function TagBarChart({ data, isLoading }: TagBarChartProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 h-60 p-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-6 w-3/5" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-60 text-sm text-muted-foreground">
        Chưa có thẻ nào
      </div>
    )
  }

  const chartConfig: ChartConfig = {}
  for (const item of data) {
    chartConfig[item.tag] = { label: item.tag, color: item.fill }
  }

  return (
    <ChartContainer config={chartConfig} className="h-60 w-full">
      <BarChart accessibilityLayer data={data} layout="vertical">
        <CartesianGrid horizontal={false} />
        <YAxis dataKey="tag" type="category" tickLine={false} tickMargin={10} axisLine={false} width={80} />
        <XAxis dataKey="count" type="number" hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
