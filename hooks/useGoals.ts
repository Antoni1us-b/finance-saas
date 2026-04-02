'use client'
import { createGoal, deleteGoal, depositGoal, getGoals, updateGoal, type GoalInput } from '@/lib/supabase/goals'
import { createNotification } from '@/lib/supabase/notifications'
import type { Goal } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'

export function useGoals() {
  const [goals,   setGoals]   = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true); setError(null)
    try { setGoals(await getGoals()) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const add    = useCallback(async (input: GoalInput) => {
    const g = await createGoal(input); setGoals(p => [...p, g]); return g
  }, [])

  const edit   = useCallback(async (id: string, input: Partial<GoalInput>) => {
    const g = await updateGoal(id, input); setGoals(p => p.map(x => x.id === id ? g : x)); return g
  }, [])

  const deposit = useCallback(async (id: string, amount: number) => {
    const g = await depositGoal(id, amount)
    setGoals(p => p.map(x => x.id === id ? g : x))

    // Notify when goal is completed
    if (g.is_completed) {
      createNotification({
        type:    'goal',
        title:   '🎉 บรรลุเป้าหมายแล้ว!',
        message: `"${g.name}" — ถึงเป้าหมาย ฿${Number(g.target_amount).toLocaleString('th-TH')} แล้ว`,
        link:    '/goals',
      }).catch(() => { /* non-critical */ })
    } else {
      const pct = Math.round((g.current_amount / g.target_amount) * 100)
      // Notify at 50% and 90% milestones
      const prev = goals.find(x => x.id === id)
      const prevPct = prev ? Math.round((prev.current_amount / prev.target_amount) * 100) : 0
      if ((pct >= 50 && prevPct < 50) || (pct >= 90 && prevPct < 90)) {
        createNotification({
          type:    'goal',
          title:   `เป้าหมาย ${pct}% แล้ว`,
          message: `"${g.name}" — เพิ่มเงินสำเร็จ ฿${Number(amount).toLocaleString('th-TH')} ความคืบหน้า ${pct}%`,
          link:    '/goals',
        }).catch(() => { /* non-critical */ })
      }
    }

    return g
  }, [goals])

  const remove  = useCallback(async (id: string) => {
    await deleteGoal(id); setGoals(p => p.filter(x => x.id !== id))
  }, [])

  const active    = goals.filter(g => !g.is_completed)
  const completed = goals.filter(g => g.is_completed)

  return { goals, active, completed, loading, error, refetch, add, edit, deposit, remove }
}
