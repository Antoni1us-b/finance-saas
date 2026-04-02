import type { BillingCycle, Subscription } from '@/lib/types'
import { createClient } from './client'

const SUB_SELECT = 'id,user_id,account_id,category_id,name,amount,currency,billing_cycle,next_billing,color,is_active,note,created_at,updated_at'

export interface SubscriptionInput {
  name:          string
  amount:        number
  billing_cycle: BillingCycle
  next_billing:  string
  account_id?:   string | null
  category_id?:  string | null
  color?:        string
  note?:         string | null
  currency?:     string
}

// ── READ ──────────────────────────────────────────────────────
export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('subscriptions')
    .select(SUB_SELECT)
    .eq('user_id', user.id)
    .order('is_active',    { ascending: false })
    .order('next_billing', { ascending: true })

  if (error) throw error
  return (data ?? []) as Subscription[]
}

// ── CREATE ────────────────────────────────────────────────────
export async function createSubscription(input: SubscriptionInput): Promise<Subscription> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id:       user.id,
      name:          input.name.trim(),
      amount:        input.amount,
      billing_cycle: input.billing_cycle,
      next_billing:  input.next_billing,
      account_id:    input.account_id  ?? null,
      category_id:   input.category_id ?? null,
      color:         input.color       ?? '#8b5cf6',
      note:          input.note        ?? null,
      currency:      input.currency    ?? 'THB',
    })
    .select(SUB_SELECT)
    .single()

  if (error) throw error
  return data as Subscription
}

// ── UPDATE ────────────────────────────────────────────────────
export async function updateSubscription(id: string, input: Partial<SubscriptionInput & { is_active?: boolean }>): Promise<Subscription> {
  const supabase = createClient()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name          !== undefined) patch.name          = input.name.trim()
  if (input.amount        !== undefined) patch.amount        = input.amount
  if (input.billing_cycle !== undefined) patch.billing_cycle = input.billing_cycle
  if (input.next_billing  !== undefined) patch.next_billing  = input.next_billing
  if (input.account_id    !== undefined) patch.account_id    = input.account_id
  if (input.color         !== undefined) patch.color         = input.color
  if (input.note          !== undefined) patch.note          = input.note
  if (input.is_active     !== undefined) patch.is_active     = input.is_active

  const { data, error } = await supabase
    .from('subscriptions')
    .update(patch)
    .eq('id', id)
    .select(SUB_SELECT)
    .single()

  if (error) throw error
  return data as Subscription
}

// ── DELETE ────────────────────────────────────────────────────
export async function deleteSubscription(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('subscriptions').delete().eq('id', id)
  if (error) throw error
}

// ── MONTHLY COST ──────────────────────────────────────────────
export const cycleToMonths: Record<BillingCycle, number> = {
  daily: 1/30, weekly: 1/4.33, monthly: 1, quarterly: 1/3, yearly: 1/12,
}
export function calcMonthlyCost(subs: Subscription[]): number {
  return subs
    .filter(s => s.is_active)
    .reduce((sum, s) => sum + s.amount * cycleToMonths[s.billing_cycle], 0)
}
