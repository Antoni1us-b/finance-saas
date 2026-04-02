'use client'
import { createGoal, deleteGoal, depositGoal, getGoals, updateGoal, type GoalInput } from '@/lib/supabase/goals'
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
    const g = await depositGoal(id, amount); setGoals(p => p.map(x => x.id === id ? g : x)); return g
  }, [])

  const remove  = useCallback(async (id: string) => {
    await deleteGoal(id); setGoals(p => p.filter(x => x.id !== id))
  }, [])

  const active    = goals.filter(g => !g.is_completed)
  const completed = goals.filter(g => g.is_completed)

  return { goals, active, completed, loading, error, refetch, add, edit, deposit, remove }
}
