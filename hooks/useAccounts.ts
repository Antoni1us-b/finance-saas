'use client'

import {
  calcNetWorth,
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
  type AccountInput,
} from '@/lib/supabase/accounts'
import { cacheClear, cacheGet, cacheSet } from '@/lib/supabase/cache'
import type { Account } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

const CACHE_KEY = 'accounts'
const CACHE_TTL = 60 // seconds — เก็บ 60 วินาที ลด API calls ซ้ำ

export type AccountsState = {
  accounts:      Account[]
  loading:       boolean
  error:         string | null
  netWorth:      number
  assets:        number
  liabilities:   number
  refetch:       () => Promise<void>
  addAccount:    (input: AccountInput) => Promise<void>
  editAccount:   (id: string, input: Partial<AccountInput>) => Promise<void>
  removeAccount: (id: string) => Promise<void>
}

export function useAccounts(): AccountsState {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    // ✅ ใช้ cache ถ้ามี → ไม่แสดง loading ให้ user รอนาน
    return cacheGet<Account[]>(CACHE_KEY) ?? []
  })
  const [loading, setLoading] = useState(() => !cacheGet<Account[]>(CACHE_KEY))
  const [error,   setError]   = useState<string | null>(null)
  const fetchedRef = useRef(false)

  const refetch = useCallback(async (force = false) => {
    // ✅ ถ้า cache ยังใช้ได้และไม่ force → ข้ามการ fetch
    const cached = cacheGet<Account[]>(CACHE_KEY)
    if (cached && !force) { setAccounts(cached); setLoading(false); return }

    setLoading(true)
    setError(null)
    try {
      const data = await getAccounts()
      cacheSet(CACHE_KEY, data, CACHE_TTL)   // ✅ เก็บ cache
      setAccounts(data)
    } catch (e: any) {
      setError(e.message ?? 'โหลดบัญชีไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    refetch()
  }, [refetch])

  // ✅ Optimistic update — อัป UI ทันที ไม่รอ API
  const addAccount = useCallback(async (input: AccountInput) => {
    const created = await createAccount(input)
    setAccounts(prev => {
      const next = [...prev, created]
      cacheSet(CACHE_KEY, next, CACHE_TTL)
      return next
    })
  }, [])

  const editAccount = useCallback(async (id: string, input: Partial<AccountInput>) => {
    // ✅ อัป UI ก่อน แล้วค่อย sync กับ server
    setAccounts(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...input } : a)
      cacheSet(CACHE_KEY, next, CACHE_TTL)
      return next
    })
    try {
      const updated = await updateAccount(id, input)
      setAccounts(prev => {
        const next = prev.map(a => a.id === id ? updated : a)
        cacheSet(CACHE_KEY, next, CACHE_TTL)
        return next
      })
    } catch (e) {
      // rollback ถ้า error
      cacheClear(CACHE_KEY)
      await refetch(true)
      throw e
    }
  }, [refetch])

  const removeAccount = useCallback(async (id: string) => {
    setAccounts(prev => {
      const next = prev.filter(a => a.id !== id)
      cacheSet(CACHE_KEY, next, CACHE_TTL)
      return next
    })
    try {
      await deleteAccount(id)
    } catch (e) {
      cacheClear(CACHE_KEY)
      await refetch(true)
      throw e
    }
  }, [refetch])

  const { assets, liabilities, netWorth } = calcNetWorth(accounts)

  return {
    accounts, loading, error,
    assets, liabilities, netWorth,
    refetch: () => refetch(true),
    addAccount, editAccount, removeAccount,
  }
}
