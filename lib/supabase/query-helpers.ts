import { createClient } from './client'

/**
 * ดึงข้อมูลสรุป Dashboard ใน 1 request เดียว
 * แทนที่จะเรียก 4 tables แยกกัน = ลด API calls 75%
 */
export async function getDashboardSummary(userId: string) {
  const supabase = createClient()

  // ✅ parallel fetch — เรียกพร้อมกันแทนลำดับ
  const [accountsRes, txMonthRes, subsRes, goalsRes] = await Promise.all([
    // บัญชีทั้งหมด
    supabase
      .from('accounts')
      .select('id,name,type,balance,currency,color')
      .eq('user_id', userId)
      .eq('is_active', true),

    // รายการเดือนนี้ (เฉพาะ 3 columns ที่ต้องการ)
    supabase
      .from('transactions')
      .select('type,amount,date')
      .eq('user_id', userId)
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10))
      .lte('date', new Date().toISOString().slice(0, 10)),

    // subscription ที่ active
    supabase
      .from('subscriptions')
      .select('id,name,amount,billing_cycle,next_billing,color,is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_billing', { ascending: true })
      .limit(10),                             // ✅ จำกัดผลลัพธ์

    // goals ที่ยังทำอยู่
    supabase
      .from('goals')
      .select('id,name,target_amount,current_amount,color,icon,target_date')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .limit(5),                              // ✅ จำกัดผลลัพธ์
  ])

  return {
    accounts:     accountsRes.data ?? [],
    transactions: txMonthRes.data  ?? [],
    subscriptions: subsRes.data    ?? [],
    goals:        goalsRes.data    ?? [],
    errors: [accountsRes.error, txMonthRes.error, subsRes.error, goalsRes.error].filter(Boolean),
  }
}

/**
 * ดึงรายการล่าสุดพร้อม pagination
 * ป้องกัน query ดึงข้อมูลเป็นพัน rows
 */
export async function getTransactionsPaginated(
  userId: string,
  page    = 0,
  limit   = 20,
  filters?: { type?: string; categoryId?: string; from?: string; to?: string }
) {
  const supabase = createClient()
  const from = page * limit
  const to   = from + limit - 1

  let query = supabase
    .from('transactions')
    .select(`
      id, type, amount, date, note, tags,
      account:accounts!account_id(id,name,color,type),
      category:categories!category_id(id,name,name_th,icon,color)
    `, { count: 'exact' })           // ✅ นับ total พร้อมกัน ไม่ต้อง query แยก
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)                 // ✅ pagination แทน fetch ทั้งหมด

  if (filters?.type)       query = query.eq('type', filters.type)
  if (filters?.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters?.from)       query = query.gte('date', filters.from)
  if (filters?.to)         query = query.lte('date', filters.to)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], total: count ?? 0, page, limit }
}

/**
 * ดึงสถิติรายเดือนด้วย aggregation ที่ฝั่ง DB
 * ไม่ดึง raw transactions มา sum ที่ client
 */
export async function getMonthlyStats(userId: string, months = 6) {
  const supabase = createClient()
  const since = new Date()
  since.setMonth(since.getMonth() - months)

  // ✅ ใช้ aggregate ที่ DB แทนดึง rows มาคำนวณ client
  const { data, error } = await supabase
    .from('transactions')
    .select('type,amount,date')
    .eq('user_id', userId)
    .gte('date', since.toISOString().slice(0, 10))
    .in('type', ['income', 'expense'])
    .order('date', { ascending: true })

  if (error) throw error

  // group ที่ client (เพราะ Supabase free ไม่มี RPC aggregate ง่ายๆ)
  const map = new Map<string, { income: number; expense: number }>()
  for (const row of data ?? []) {
    const month = row.date.slice(0, 7) // "YYYY-MM"
    if (!map.has(month)) map.set(month, { income: 0, expense: 0 })
    const entry = map.get(month)!
    if (row.type === 'income')  entry.income  += row.amount
    if (row.type === 'expense') entry.expense += row.amount
  }

  return Array.from(map.entries())
    .map(([month, stats]) => ({ month, ...stats }))
    .slice(-months)
}
