import type { Account, Category, Transaction, Subscription, Goal, MonthlyStats, ExpenseByCategory } from '@/lib/types'

// ── Accounts ────────────────────────────────────────────────
export const dummyAccounts: Account[] = [
  {
    id: 'acc-1', user_id: 'user-1', name: 'กสิกรไทย ออมทรัพย์', type: 'bank',
    balance: 125_430, currency: 'THB', color: '#16a34a', icon: 'building-2',
    is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc-2', user_id: 'user-1', name: 'SCB บัตรเครดิต', type: 'credit',
    balance: -8_200, currency: 'THB', color: '#7c3aed', icon: 'credit-card',
    is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc-3', user_id: 'user-1', name: 'กองทุน RMF', type: 'investment',
    balance: 210_000, currency: 'THB', color: '#0ea5e9', icon: 'trending-up',
    is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc-4', user_id: 'user-1', name: 'เงินสด', type: 'cash',
    balance: 3_500, currency: 'THB', color: '#f59e0b', icon: 'wallet',
    is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'acc-5', user_id: 'user-1', name: 'TrueMoney Wallet', type: 'e-wallet',
    balance: 1_200, currency: 'THB', color: '#f97316', icon: 'smartphone',
    is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
]

// ── Categories ───────────────────────────────────────────────
export const dummyCategories: Category[] = [
  { id: 'cat-1',  user_id: null, name: 'Salary',        name_th: 'เงินเดือน',            icon: 'briefcase',    color: '#10b981', type: 'income',  is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-2',  user_id: null, name: 'Freelance',     name_th: 'ฟรีแลนซ์',             icon: 'laptop',       color: '#06b6d4', type: 'income',  is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-3',  user_id: null, name: 'Investment',    name_th: 'การลงทุน',             icon: 'trending-up',  color: '#6366f1', type: 'income',  is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-4',  user_id: null, name: 'Food & Drink',  name_th: 'อาหารและเครื่องดื่ม', icon: 'utensils',     color: '#f59e0b', type: 'expense', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-5',  user_id: null, name: 'Transport',     name_th: 'การเดินทาง',           icon: 'car',          color: '#3b82f6', type: 'expense', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-6',  user_id: null, name: 'Shopping',      name_th: 'การช้อปปิ้ง',          icon: 'shopping-bag', color: '#ec4899', type: 'expense', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-7',  user_id: null, name: 'Housing',       name_th: 'ที่อยู่อาศัย',         icon: 'home',         color: '#f97316', type: 'expense', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-8',  user_id: null, name: 'Health',        name_th: 'สุขภาพ',               icon: 'heart',        color: '#ef4444', type: 'expense', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-9',  user_id: null, name: 'Entertainment', name_th: 'ความบันเทิง',          icon: 'film',         color: '#a855f7', type: 'expense', is_system: true, created_at: '2024-01-01T00:00:00Z' },
  { id: 'cat-10', user_id: null, name: 'Subscriptions', name_th: 'บริการรายเดือน',       icon: 'repeat',       color: '#8b5cf6', type: 'expense', is_system: true, created_at: '2024-01-01T00:00:00Z' },
]

// ── Transactions ─────────────────────────────────────────────
export const dummyTransactions: Transaction[] = [
  { id: 't-1',  user_id: 'user-1', account_id: 'acc-1', to_account_id: null, category_id: 'cat-1',  type: 'income',  amount: 65_000, date: '2024-12-01', note: 'เงินเดือน ธ.ค.',           tags: [], is_recurring: true,  subscription_id: null, created_at: '2024-12-01T09:00:00Z', updated_at: '2024-12-01T09:00:00Z', category: { id: 'cat-1', user_id: null, name: 'Salary', name_th: 'เงินเดือน', icon: 'briefcase', color: '#10b981', type: 'income', is_system: true, created_at: '' } },
  { id: 't-2',  user_id: 'user-1', account_id: 'acc-1', to_account_id: null, category_id: 'cat-2',  type: 'income',  amount: 12_000, date: '2024-12-05', note: 'งาน Freelance เว็บไซต์',   tags: ['freelance'], is_recurring: false, subscription_id: null, created_at: '2024-12-05T10:00:00Z', updated_at: '2024-12-05T10:00:00Z', category: { id: 'cat-2', user_id: null, name: 'Freelance', name_th: 'ฟรีแลนซ์', icon: 'laptop', color: '#06b6d4', type: 'income', is_system: true, created_at: '' } },
  { id: 't-3',  user_id: 'user-1', account_id: 'acc-2', to_account_id: null, category_id: 'cat-7',  type: 'expense', amount: 12_000, date: '2024-12-05', note: 'ค่าเช่าบ้าน',                tags: [], is_recurring: true,  subscription_id: null, created_at: '2024-12-05T11:00:00Z', updated_at: '2024-12-05T11:00:00Z', category: { id: 'cat-7', user_id: null, name: 'Housing', name_th: 'ที่อยู่อาศัย', icon: 'home', color: '#f97316', type: 'expense', is_system: true, created_at: '' } },
  { id: 't-4',  user_id: 'user-1', account_id: 'acc-4', to_account_id: null, category_id: 'cat-4',  type: 'expense', amount: 350,    date: '2024-12-06', note: 'ข้าวกะเพราหมูกรอบ',         tags: ['food'], is_recurring: false, subscription_id: null, created_at: '2024-12-06T12:30:00Z', updated_at: '2024-12-06T12:30:00Z', category: { id: 'cat-4', user_id: null, name: 'Food & Drink', name_th: 'อาหารและเครื่องดื่ม', icon: 'utensils', color: '#f59e0b', type: 'expense', is_system: true, created_at: '' } },
  { id: 't-5',  user_id: 'user-1', account_id: 'acc-1', to_account_id: null, category_id: 'cat-5',  type: 'expense', amount: 2_100, date: '2024-12-07', note: 'น้ำมันรถ + ค่าทางด่วน',    tags: ['car'], is_recurring: false, subscription_id: null, created_at: '2024-12-07T08:00:00Z', updated_at: '2024-12-07T08:00:00Z', category: { id: 'cat-5', user_id: null, name: 'Transport', name_th: 'การเดินทาง', icon: 'car', color: '#3b82f6', type: 'expense', is_system: true, created_at: '' } },
  { id: 't-6',  user_id: 'user-1', account_id: 'acc-2', to_account_id: null, category_id: 'cat-6',  type: 'expense', amount: 5_890, date: '2024-12-08', note: 'Central Shopping',            tags: ['shopping'], is_recurring: false, subscription_id: null, created_at: '2024-12-08T15:00:00Z', updated_at: '2024-12-08T15:00:00Z', category: { id: 'cat-6', user_id: null, name: 'Shopping', name_th: 'การช้อปปิ้ง', icon: 'shopping-bag', color: '#ec4899', type: 'expense', is_system: true, created_at: '' } },
  { id: 't-7',  user_id: 'user-1', account_id: 'acc-1', to_account_id: 'acc-3', category_id: null,  type: 'transfer', amount: 10_000, date: '2024-12-10', note: 'โอนลงทุน RMF',            tags: [], is_recurring: false, subscription_id: null, created_at: '2024-12-10T09:00:00Z', updated_at: '2024-12-10T09:00:00Z' },
  { id: 't-8',  user_id: 'user-1', account_id: 'acc-4', to_account_id: null, category_id: 'cat-4',  type: 'expense', amount: 180,    date: '2024-12-11', note: 'ก๋วยเตี๋ยวเรือ',             tags: ['food'], is_recurring: false, subscription_id: null, created_at: '2024-12-11T13:00:00Z', updated_at: '2024-12-11T13:00:00Z', category: { id: 'cat-4', user_id: null, name: 'Food & Drink', name_th: 'อาหารและเครื่องดื่ม', icon: 'utensils', color: '#f59e0b', type: 'expense', is_system: true, created_at: '' } },
  { id: 't-9',  user_id: 'user-1', account_id: 'acc-1', to_account_id: null, category_id: 'cat-9',  type: 'expense', amount: 599,    date: '2024-12-12', note: 'Netflix รายเดือน',           tags: ['streaming'], is_recurring: true,  subscription_id: 'sub-1', created_at: '2024-12-12T00:00:00Z', updated_at: '2024-12-12T00:00:00Z', category: { id: 'cat-9', user_id: null, name: 'Entertainment', name_th: 'ความบันเทิง', icon: 'film', color: '#a855f7', type: 'expense', is_system: true, created_at: '' } },
  { id: 't-10', user_id: 'user-1', account_id: 'acc-2', to_account_id: null, category_id: 'cat-8',  type: 'expense', amount: 1_200, date: '2024-12-14', note: 'ค่าแพทย์คลินิก',             tags: ['health'], is_recurring: false, subscription_id: null, created_at: '2024-12-14T10:00:00Z', updated_at: '2024-12-14T10:00:00Z', category: { id: 'cat-8', user_id: null, name: 'Health', name_th: 'สุขภาพ', icon: 'heart', color: '#ef4444', type: 'expense', is_system: true, created_at: '' } },
]

// ── Subscriptions ─────────────────────────────────────────────
export const dummySubscriptions: Subscription[] = [
  { id: 'sub-1', user_id: 'user-1', account_id: 'acc-1', category_id: 'cat-9', name: 'Netflix',    amount: 599,   currency: 'THB', billing_cycle: 'monthly',  next_billing: '2025-01-12', logo_url: null, color: '#e50914', is_active: true, note: null, created_at: '2024-01-12T00:00:00Z', updated_at: '2024-01-12T00:00:00Z' },
  { id: 'sub-2', user_id: 'user-1', account_id: 'acc-1', category_id: 'cat-9', name: 'Spotify',    amount: 149,   currency: 'THB', billing_cycle: 'monthly',  next_billing: '2025-01-08', logo_url: null, color: '#1db954', is_active: true, note: null, created_at: '2024-01-08T00:00:00Z', updated_at: '2024-01-08T00:00:00Z' },
  { id: 'sub-3', user_id: 'user-1', account_id: 'acc-1', category_id: 'cat-10',name: 'iCloud+',    amount: 35,    currency: 'THB', billing_cycle: 'monthly',  next_billing: '2025-01-03', logo_url: null, color: '#147efb', is_active: true, note: '200 GB', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
  { id: 'sub-4', user_id: 'user-1', account_id: 'acc-2', category_id: 'cat-10',name: 'Adobe CC',   amount: 1_890, currency: 'THB', billing_cycle: 'monthly',  next_billing: '2025-01-20', logo_url: null, color: '#e83c23', is_active: true, note: 'All Apps', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' },
  { id: 'sub-5', user_id: 'user-1', account_id: 'acc-1', category_id: 'cat-10',name: 'LINE MAN',   amount: 129,   currency: 'THB', billing_cycle: 'monthly',  next_billing: '2025-01-15', logo_url: null, color: '#00b900', is_active: true, note: 'Delivery Pro', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
  { id: 'sub-6', user_id: 'user-1', account_id: 'acc-2', category_id: 'cat-10',name: 'Vercel Pro',  amount: 700,  currency: 'THB', billing_cycle: 'monthly',  next_billing: '2025-01-25', logo_url: null, color: '#000000', is_active: true, note: null, created_at: '2024-01-25T00:00:00Z', updated_at: '2024-01-25T00:00:00Z' },
  { id: 'sub-7', user_id: 'user-1', account_id: 'acc-1', category_id: 'cat-10',name: 'GitHub Pro',  amount: 600,  currency: 'THB', billing_cycle: 'yearly',   next_billing: '2025-06-01', logo_url: null, color: '#333333', is_active: true, note: null, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
]

// ── Goals ─────────────────────────────────────────────────────
export const dummyGoals: Goal[] = [
  { id: 'goal-1', user_id: 'user-1', account_id: 'acc-3', name: 'กองทุนฉุกเฉิน',    target_amount: 200_000, current_amount: 125_430, target_date: '2025-06-30', icon: 'shield', color: '#10b981', is_completed: false, note: '6 เดือนของค่าใช้จ่าย', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-12-01T00:00:00Z', progress: 62.7 },
  { id: 'goal-2', user_id: 'user-1', account_id: 'acc-3', name: 'ท่องเที่ยวญี่ปุ่น',  target_amount: 80_000,  current_amount: 32_000,  target_date: '2025-04-01', icon: 'plane', color: '#f59e0b', is_completed: false, note: 'ซากุระ เม.ย. 2568',      created_at: '2024-06-01T00:00:00Z', updated_at: '2024-12-01T00:00:00Z', progress: 40 },
  { id: 'goal-3', user_id: 'user-1', account_id: 'acc-3', name: 'MacBook Pro',       target_amount: 79_900,  current_amount: 79_900,  target_date: '2024-11-01', icon: 'laptop', color: '#6366f1', is_completed: true,  note: null,                       created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-01T00:00:00Z', progress: 100 },
  { id: 'goal-4', user_id: 'user-1', account_id: 'acc-3', name: 'ดาวน์บ้าน',          target_amount: 500_000, current_amount: 210_000, target_date: '2027-01-01', icon: 'home', color: '#0ea5e9', is_completed: false, note: 'ดาวน์ 10% บ้านราคา 5M',  created_at: '2024-01-01T00:00:00Z', updated_at: '2024-12-01T00:00:00Z', progress: 42 },
]

// ── Monthly chart data ────────────────────────────────────────
export const dummyMonthlyStats: MonthlyStats[] = [
  { month: 'ก.ค.',  income: 65_000, expense: 38_200 },
  { month: 'ส.ค.',  income: 72_000, expense: 42_100 },
  { month: 'ก.ย.',  income: 65_000, expense: 35_800 },
  { month: 'ต.ค.',  income: 78_000, expense: 51_200 },
  { month: 'พ.ย.',  income: 65_000, expense: 40_300 },
  { month: 'ธ.ค.',  income: 77_000, expense: 43_600 },
]

// ── Expense breakdown ─────────────────────────────────────────
export const dummyExpenseByCategory: ExpenseByCategory[] = [
  { name: 'Housing',       name_th: 'ที่อยู่อาศัย',         value: 12_000, color: '#f97316', icon: 'home' },
  { name: 'Food & Drink',  name_th: 'อาหาร',                 value: 8_900,  color: '#f59e0b', icon: 'utensils' },
  { name: 'Shopping',      name_th: 'ช้อปปิ้ง',             value: 5_890,  color: '#ec4899', icon: 'shopping-bag' },
  { name: 'Subscriptions', name_th: 'บริการรายเดือน',       value: 4_102,  color: '#8b5cf6', icon: 'repeat' },
  { name: 'Transport',     name_th: 'การเดินทาง',           value: 3_800,  color: '#3b82f6', icon: 'car' },
  { name: 'Health',        name_th: 'สุขภาพ',               value: 1_800,  color: '#ef4444', icon: 'heart' },
  { name: 'Entertainment', name_th: 'ความบันเทิง',          value: 1_500,  color: '#a855f7', icon: 'film' },
  { name: 'Other',         name_th: 'อื่นๆ',                value: 5_608,  color: '#6b7280', icon: 'more-horizontal' },
]
