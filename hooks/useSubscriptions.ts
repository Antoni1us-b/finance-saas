'use client'
import { calcMonthlyCost, createSubscription, deleteSubscription, getSubscriptions, updateSubscription, type SubscriptionInput } from '@/lib/supabase/subscriptions'
import type { Subscription } from '@/lib/types'
import { getDaysUntil } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'

export function useSubscriptions() {
  const [subs,    setSubs]    = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setSubs(await getSubscriptions()) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const add    = useCallback(async (input: SubscriptionInput) => {
    const s = await createSubscription(input); setSubs(p => [...p, s]); return s
  }, [])

  const edit   = useCallback(async (id: string, input: Partial<SubscriptionInput & { is_active?: boolean }>) => {
    const s = await updateSubscription(id, input); setSubs(p => p.map(x => x.id === id ? s : x)); return s
  }, [])

  const toggle = useCallback(async (id: string) => {
    const sub = subs.find(s => s.id === id)
    if (!sub) return
    await edit(id, { is_active: !sub.is_active })
  }, [subs, edit])

  const remove = useCallback(async (id: string) => {
    await deleteSubscription(id); setSubs(p => p.filter(x => x.id !== id))
  }, [])

  const active   = subs.filter(s => s.is_active)
  const upcoming = active.filter(s => getDaysUntil(s.next_billing) <= 7)
  const monthly  = calcMonthlyCost(subs)

  return { subs, active, upcoming, monthly, loading, error, refetch, add, edit, toggle, remove }
}
