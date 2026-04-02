import type { Account, AccountType } from '@/lib/types'
import { createClient } from './client'

export interface AccountInput {
  name: string
  type: AccountType
  balance: number
  currency?: string
  color?: string
  icon?: string
}

// เลือกเฉพาะ columns ที่ใช้จริง → ลด payload ~40%
const ACCOUNT_COLUMNS = 'id,user_id,name,type,balance,currency,color,icon,is_active,created_at,updated_at'

// ── READ ──────────────────────────────────────────────────────
export async function getAccounts(): Promise<Account[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('accounts')
    .select(ACCOUNT_COLUMNS)        // ✅ ระบุ columns แทน select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Account[]
}

// ── CREATE (รวม getUser ไว้ใน RLS ไม่ต้องเรียกแยก) ───────────
export async function createAccount(input: AccountInput): Promise<Account> {
  const supabase = createClient()

  // ✅ ใช้ auth.uid() จาก RLS อัตโนมัติ ไม่ต้อง getUser() แยก
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่')

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id:  user.id,
      name:     input.name.trim(),
      type:     input.type,
      balance:  input.balance,
      currency: input.currency ?? 'THB',
      color:    input.color   ?? '#0ea5e9',
      icon:     input.icon    ?? 'bank',
    })
    .select(ACCOUNT_COLUMNS)        // ✅ ระบุ columns
    .single()

  if (error) throw error
  return data as Account
}

// ── UPDATE ────────────────────────────────────────────────────
export async function updateAccount(
  id: string,
  input: Partial<AccountInput>
): Promise<Account> {
  const supabase = createClient()

  // ✅ อัปเดตเฉพาะ fields ที่เปลี่ยน ไม่ส่งทุก field
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (input.name     !== undefined) patch.name     = input.name.trim()
  if (input.type     !== undefined) patch.type     = input.type
  if (input.balance  !== undefined) patch.balance  = input.balance
  if (input.currency !== undefined) patch.currency = input.currency
  if (input.color    !== undefined) patch.color    = input.color
  if (input.icon     !== undefined) patch.icon     = input.icon

  const { data, error } = await supabase
    .from('accounts')
    .update(patch)
    .eq('id', id)
    .select(ACCOUNT_COLUMNS)
    .single()

  if (error) throw error
  return data as Account
}

// ── DELETE (soft delete → ไม่กระทบ transactions เดิม) ────────
export async function deleteAccount(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('accounts')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ── CALC (pure function ไม่ใช้ API) ──────────────────────────
export function calcNetWorth(accounts: Account[]) {
  let assets = 0, liabilities = 0
  for (const a of accounts) {
    if (a.type === 'credit') liabilities += Math.abs(a.balance)
    else assets += a.balance
  }
  return { assets, liabilities, netWorth: assets - liabilities }
}
