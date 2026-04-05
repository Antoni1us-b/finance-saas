'use client'
import { createTransaction, deleteTransaction, updateTransaction, getExpenseByCategory, getMonthlyStats, getRecentTransactions, getTransactions, type TransactionFilter, type TransactionInput } from '@/lib/supabase/transactions'
import { createNotification } from '@/lib/supabase/notifications'
import type { ExpenseByCategory, MonthlyStats, Transaction } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'

export function useTransactions(initialFilter: TransactionFilter = {}) {
  const [data,    setData]    = useState<Transaction[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [filter,  setFilter]  = useState<TransactionFilter>(initialFilter)

  const fetch = useCallback(async (f: TransactionFilter = filter) => {
    setLoading(true); setError(null)
    try {
      const res = await getTransactions(f)
      setData(res.data); setTotal(res.total)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetch() }, []) // eslint-disable-line

  const applyFilter = useCallback((f: Partial<TransactionFilter>) => {
    const next = { ...filter, ...f, page: 0 }
    setFilter(next); fetch(next)
  }, [filter, fetch])

  const add = useCallback(async (input: TransactionInput) => {
    const tx = await createTransaction(input)
    setData(prev => [tx, ...prev]); setTotal(t => t + 1)

    // Fire-and-forget notification (non-blocking)
    const typeLabel = input.type === 'income' ? 'รายได้' : input.type === 'expense' ? 'รายจ่าย' : 'โอนเงิน'
    createNotification({
      type:    'transaction',
      title:   `บันทึก${typeLabel}สำเร็จ`,
      message: `${input.type === 'income' ? '+' : input.type === 'expense' ? '-' : ''}฿${Number(input.amount).toLocaleString('th-TH')}${input.note ? ` · ${input.note}` : ''}`,
      link:    '/transactions',
    }).catch(() => { /* notifications are non-critical */ })

    return tx
  }, [])

  const update = useCallback(async (id: string, input: Partial<TransactionInput>) => {
    const updated = await updateTransaction(id, input)
    setData(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteTransaction(id)
    setData(prev => prev.filter(t => t.id !== id)); setTotal(t => t - 1)
  }, [])

  return { data, total, loading, error, filter, applyFilter, refetch: fetch, add, update, remove }
}

export function useMonthlyStats(months = 6) {
  const [stats,   setStats]   = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getMonthlyStats(months).then(setStats).catch(console.error).finally(() => setLoading(false))
  }, [months])
  return { stats, loading }
}

export function useExpenseByCategory() {
  const [data,    setData]    = useState<ExpenseByCategory[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getExpenseByCategory().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}

export function useRecentTransactions(limit = 8) {
  const [data,    setData]    = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getRecentTransactions(limit).then(setData).catch(console.error).finally(() => setLoading(false))
  }, [limit])
  return { data, loading }
}
