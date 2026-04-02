import type { Goal } from '@/lib/types'
import { createClient } from './client'

const GOAL_SELECT = 'id,user_id,account_id,name,target_amount,current_amount,target_date,icon,color,is_completed,note,created_at,updated_at'

export interface GoalInput {
  name:           string
  target_amount:  number
  current_amount?: number
  target_date?:   string | null
  icon?:          string
  color?:         string
  note?:          string | null
  account_id?:    string | null
}

// ── READ ──────────────────────────────────────────────────────
export async function getGoals(): Promise<Goal[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('goals')
    .select(GOAL_SELECT)
    .eq('user_id', user.id)
    .order('is_completed', { ascending: true })
    .order('created_at',   { ascending: true })

  if (error) throw error
  return (data ?? []).map(g => ({
    ...g,
    progress: g.target_amount > 0
      ? Math.min((g.current_amount / g.target_amount) * 100, 100)
      : 0,
  })) as Goal[]
}

// ── CREATE ────────────────────────────────────────────────────
export async function createGoal(input: GoalInput): Promise<Goal> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id:        user.id,
      name:           input.name.trim(),
      target_amount:  input.target_amount,
      current_amount: input.current_amount ?? 0,
      target_date:    input.target_date    ?? null,
      icon:           input.icon           ?? 'target',
      color:          input.color          ?? '#10b981',
      note:           input.note           ?? null,
      account_id:     input.account_id     ?? null,
    })
    .select(GOAL_SELECT)
    .single()

  if (error) throw error
  return { ...data, progress: Math.min((data.current_amount / data.target_amount) * 100, 100) } as Goal
}

// ── UPDATE ────────────────────────────────────────────────────
export async function updateGoal(id: string, input: Partial<GoalInput & { is_completed?: boolean }>): Promise<Goal> {
  const supabase = createClient()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name           !== undefined) patch.name           = input.name.trim()
  if (input.target_amount  !== undefined) patch.target_amount  = input.target_amount
  if (input.current_amount !== undefined) {
    patch.current_amount = input.current_amount
    patch.is_completed   = input.current_amount >= (input.target_amount ?? 0)
  }
  if (input.target_date    !== undefined) patch.target_date    = input.target_date
  if (input.icon           !== undefined) patch.icon           = input.icon
  if (input.color          !== undefined) patch.color          = input.color
  if (input.note           !== undefined) patch.note           = input.note
  if (input.is_completed   !== undefined) patch.is_completed   = input.is_completed

  const { data, error } = await supabase
    .from('goals')
    .update(patch)
    .eq('id', id)
    .select(GOAL_SELECT)
    .single()

  if (error) throw error
  return { ...data, progress: Math.min((data.current_amount / data.target_amount) * 100, 100) } as Goal
}

// ── DEPOSIT ───────────────────────────────────────────────────
export async function depositGoal(id: string, amount: number): Promise<Goal> {
  const supabase = createClient()
  const { data: current, error: fetchErr } = await supabase
    .from('goals')
    .select('current_amount,target_amount')
    .eq('id', id)
    .single()
  if (fetchErr) throw fetchErr

  const newAmount = current.current_amount + amount
  return updateGoal(id, {
    current_amount: newAmount,
    is_completed:   newAmount >= current.target_amount,
  })
}

// ── DELETE ────────────────────────────────────────────────────
export async function deleteGoal(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw error
}
