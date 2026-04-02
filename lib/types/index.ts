export type AccountType = 'bank' | 'credit' | 'investment' | 'cash' | 'e-wallet'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type CategoryType = 'income' | 'expense' | 'both'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  locale: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  color: string
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  name_th: string | null
  icon: string
  color: string
  type: CategoryType
  is_system: boolean
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  to_account_id: string | null
  category_id: string | null
  type: TransactionType
  amount: number
  date: string
  note: string | null
  tags: string[] | null
  is_recurring: boolean
  subscription_id: string | null
  created_at: string
  updated_at: string
  // Joined
  account?: Account
  to_account?: Account
  category?: Category
}

export interface Subscription {
  id: string
  user_id: string
  account_id: string | null
  category_id: string | null
  name: string
  amount: number
  currency: string
  billing_cycle: BillingCycle
  next_billing: string
  logo_url: string | null
  color: string
  is_active: boolean
  note: string | null
  created_at: string
  updated_at: string
  // Joined
  account?: Account
  category?: Category
}

export interface Goal {
  id: string
  user_id: string
  account_id: string | null
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  icon: string
  color: string
  is_completed: boolean
  note: string | null
  created_at: string
  updated_at: string
  // Computed
  progress?: number
}

// ── Utility ──────────────────────────────────────────────
export interface DateRange {
  from: Date
  to: Date
}

export interface MonthlyStats {
  month: string
  income: number
  expense: number
}

export interface ExpenseByCategory {
  name: string
  name_th: string
  value: number
  color: string
  icon: string
}
