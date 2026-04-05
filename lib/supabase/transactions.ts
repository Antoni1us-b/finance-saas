import type { Transaction, TransactionType } from '@/lib/types'
import { createClient } from './client'

const TX_SELECT = `
  id, type, amount, date, note, tags, is_recurring, created_at,
  account_id, to_account_id, category_id, subscription_id,
  account:accounts!account_id(id,name,color,type,currency),
  to_account:accounts!to_account_id(id,name,color,type),
  category:categories!category_id(id,name,name_th,icon,color)
`

export interface TransactionInput {
  type:           TransactionType
  amount:         number
  date:           string
  account_id:     string
  to_account_id?: string | null
  category_id?:   string | null
  note?:          string | null
  tags?:          string[]
  is_recurring?:  boolean
  subscription_id?: string | null
}

export interface TransactionFilter {
  type?:        TransactionType
  category_id?: string
  account_id?:  string
  from?:        string
  to?:          string
  search?:      string
  page?:        number
  limit?:       number
}

// ── READ with pagination ──────────────────────────────────────
export async function getTransactions(filters: TransactionFilter = {}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const page  = filters.page  ?? 0
  const limit = filters.limit ?? 25
  const from  = page * limit
  const to    = from + limit - 1

  let query = supabase
    .from('transactions')
    .select(TX_SELECT, { count: 'exact' })
    .eq('user_id', user.id)
    .order('date',       { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters.type)        query = query.eq('type', filters.type)
  if (filters.category_id) query = query.eq('category_id', filters.category_id)
  if (filters.account_id)  query = query.eq('account_id', filters.account_id)
  if (filters.from)        query = query.gte('date', filters.from)
  if (filters.to)          query = query.lte('date', filters.to)
  // Server-side search on the note field (category search remains client-side)
  if (filters.search)      query = query.ilike('note', `%${filters.search}%`)

  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as unknown as Transaction[], total: count ?? 0 }
}

// ── RECENT (for dashboard) ────────────────────────────────────
export async function getRecentTransactions(limit = 8) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('transactions')
    .select(TX_SELECT)
    .eq('user_id', user.id)
    .order('date',       { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as unknown as Transaction[]
}

// ── MONTHLY STATS (for chart) ─────────────────────────────────
export async function getMonthlyStats(months = 6) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const since = new Date()
  since.setMonth(since.getMonth() - months + 1)
  since.setDate(1)

  const { data, error } = await supabase
    .from('transactions')
    .select('type,amount,date')
    .eq('user_id', user.id)
    .in('type', ['income', 'expense'])
    .gte('date', since.toISOString().slice(0, 10))

  if (error) throw error

  const map = new Map<string, { income: number; expense: number }>()
  for (const row of data ?? []) {
    const key = row.date.slice(0, 7)
    if (!map.has(key)) map.set(key, { income: 0, expense: 0 })
    const e = map.get(key)!
    if (row.type === 'income')  e.income  += Number(row.amount)
    if (row.type === 'expense') e.expense += Number(row.amount)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, stats]) => ({
      month: new Date(month + '-01').toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
      ...stats,
    }))
}

// ── EXPENSE BY CATEGORY (for pie chart) ──────────────────────
export async function getExpenseByCategory(year?: number, month?: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const now = new Date()
  const y = year  ?? now.getFullYear()
  const m = month ?? now.getMonth() + 1
  const from = `${y}-${String(m).padStart(2,'0')}-01`
  const to   = new Date(y, m, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, category:categories!category_id(id,name,name_th,icon,color)')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', from)
    .lte('date', to)

  if (error) throw error

  const map = new Map<string, { name: string; name_th: string; icon: string; color: string; value: number }>()
  for (const row of data ?? []) {
    const cat = row.category as any
    if (!cat) continue
    const existing = map.get(cat.id)
    if (existing) existing.value += Number(row.amount)
    else map.set(cat.id, { name: cat.name, name_th: cat.name_th ?? cat.name, icon: cat.icon, color: cat.color, value: Number(row.amount) })
  }

  return Array.from(map.values()).sort((a, b) => b.value - a.value)
}

// ── CREATE ────────────────────────────────────────────────────
export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id: user.id })
    .select(TX_SELECT)
    .single()

  if (error) throw error
  return data as unknown as Transaction
}

// ── UPDATE ────────────────────────────────────────────────────
export async function updateTransaction(
  id: string,
  input: Partial<TransactionInput>,
): Promise<Transaction> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)          // RLS safety — can only update own rows
    .select(TX_SELECT)
    .single()

  if (error) throw error
  return data as unknown as Transaction
}

// ── DELETE ────────────────────────────────────────────────────
export async function deleteTransaction(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
