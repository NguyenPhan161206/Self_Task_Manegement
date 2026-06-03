'use client'

import { useState, useEffect, useCallback } from 'react'

import { getTags } from '../actions'
import type { Tag } from '../types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    const result = await getTags()
    setTags(result)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { tags, isLoading, refetch, setTags }
}
