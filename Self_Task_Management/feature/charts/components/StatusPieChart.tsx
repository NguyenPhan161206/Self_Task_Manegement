'use client'

import { Pie, PieChart } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

interface StatusPieChartProps {
  data: { status: string; count: number; fill: string }[]
  isLoading: boolean
}

export function StatusPieChart({ data, isLoading }: StatusPieChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Skeleton className="h-48 w-48 rounded-full" />
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
    chartConfig[item.status] = { label: item.status, color: item.fill }
  }

  return (
    <ChartContainer config={chartConfig} className="h-60 w-full">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" innerRadius={48} outerRadius={80} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  )
}
