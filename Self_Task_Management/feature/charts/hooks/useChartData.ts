'use client'

import { useState, useEffect, useCallback } from 'react'
import { getChartData } from '../actions'
import type { ChartStats } from '../types'

export function useChartData() {
  const [data, setData] = useState<ChartStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getChartData()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu thống kê.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
