'use client'

import { getCategories } from '@/lib/supabase/categories'
import { cacheGet, cacheSet } from '@/lib/supabase/cache'
import type { Category } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

const CACHE_KEY = 'categories'
const CACHE_TTL = 120 // categories change rarely

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => {
    return cacheGet<Category[]>(CACHE_KEY) ?? []
  })
  const [loading, setLoading] = useState(() => !cacheGet<Category[]>(CACHE_KEY))
  const fetchedRef = useRef(false)

  const refetch = useCallback(async () => {
    const cached = cacheGet<Category[]>(CACHE_KEY)
    if (cached) { setCategories(cached); setLoading(false); return }

    setLoading(true)
    try {
      const data = await getCategories()
      cacheSet(CACHE_KEY, data, CACHE_TTL)
      setCategories(data)
    } catch {
      // Categories failing silently is acceptable — dropdown will be empty
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    refetch()
  }, [refetch])

  return { categories, loading, refetch }
}
