'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  Activity, AlertTriangle, BarChart3, CreditCard,
  Loader2, RefreshCw, RepeatIcon, Shield, Target,
  TrendingUp, Users, Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SystemStats {
  total_users:          number
  total_admins:         number
  total_accounts:       number
  total_transactions:   number
  total_subscriptions:  number
  total_goals:          number
  completed_goals:      number
  total_income:         number
  total_expense:        number
  generated_at:         string
}

interface UserRow {
  id:             string
  full_name:      string | null
  role:           string
  currency:       string
  created_at:     string
  accounts_count: number
  tx_count:       number
  subs_count:     number
  active_goals:   number
  last_activity:  string | null
}

// ── Role badge ────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
      role === 'admin'
        ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
    }`}>
      {role === 'admin' && <Shield className="h-2.5 w-2.5" />}
      {role}
    </span>
  )
}

// ── Stat tile ─────────────────────────────────────────────────
function StatTile({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) {
  return (
    <Card className="flex items-center gap-4 py-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{value}</p>
      </div>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const [stats,   setStats]   = useState<SystemStats | null>(null)
  const [users,   setUsers]   = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  async function load() {
    setLoading(true)
    try {
      // ตรวจ role ก่อน
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsAdmin(false); return }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { setIsAdmin(false); return }
      setIsAdmin(true)

      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('fetch failed')
      const json = await res.json()
      setStats(json.stats)
      setUsers(json.users)
      setLastRefresh(new Date())
    } catch {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Not admin ─────────────────────────────────────────────
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-sm text-slate-500 max-w-xs">
          หน้านี้สำหรับผู้ดูแลระบบเท่านั้น<br />
          หากต้องการสิทธิ์ admin กรุณาติดต่อผู้ดูแลระบบ
        </p>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    )
  }

  const netFlow = (stats?.total_income ?? 0) - (stats?.total_expense ?? 0)

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Admin Dashboard</h2>
            <p className="text-xs text-slate-400">
              อัปเดตล่าสุด {lastRefresh.toLocaleTimeString('th-TH')}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* ── System Stats Grid ── */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="ผู้ใช้ทั้งหมด"        value={stats.total_users}         icon={Users}       color="bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400" />
            <StatTile label="บัญชีธนาคาร"           value={stats.total_accounts}      icon={Wallet}      color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" />
            <StatTile label="รายการทั้งหมด"          value={stats.total_transactions}  icon={BarChart3}   color="bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400" />
            <StatTile label="Subscriptions"          value={stats.total_subscriptions} icon={RepeatIcon}  color="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="รายได้รวมทั้งระบบ"     value={formatCurrency(stats.total_income)}  icon={TrendingUp}  color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" />
            <StatTile label="รายจ่ายรวมทั้งระบบ"    value={formatCurrency(stats.total_expense)} icon={CreditCard}  color="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" />
            <StatTile label="Net Flow ระบบ"          value={formatCurrency(netFlow)}             icon={Activity}    color={netFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} />
            <StatTile label="Goals สำเร็จ"           value={`${stats.completed_goals}/${stats.total_goals}`} icon={Target} color="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" />
          </div>
        </>
      )}

      {/* ── User Table ── */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle>รายชื่อผู้ใช้</CardTitle>
          <span className="text-xs text-slate-400">{users.length} คน</span>
        </CardHeader>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['ชื่อ', 'สิทธิ์', 'บัญชี', 'รายการ', 'Subs', 'เป้าหมาย', 'ใช้งานล่าสุด', 'สมัครเมื่อ'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">ไม่พบผู้ใช้</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(u.full_name ?? '?').slice(0,1).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                        {u.full_name ?? '(ไม่ระบุชื่อ)'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-center tabular-nums">{u.accounts_count}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{u.tx_count}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{u.subs_count}</td>
                  <td className="px-4 py-3 text-center tabular-nums">{u.active_goals}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {u.last_activity
                      ? new Date(u.last_activity).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })
                      : '—'
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Health Status ── */}
      <Card>
        <CardHeader>
          <CardTitle>สถานะระบบ</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Database',    status: 'online', detail: 'Supabase PostgreSQL' },
            { label: 'Auth',        status: 'online', detail: `${stats?.total_users ?? 0} MAUs` },
            { label: 'API',         status: 'online', detail: 'Next.js Edge Ready' },
          ].map(({ label, status, detail }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                <p className="text-xs text-slate-400">{detail}</p>
              </div>
              <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">{status}</span>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-center text-xs text-slate-400 pb-2">
        FinFlow Admin · ข้อมูลอัปเดตเมื่อ {stats ? new Date(stats.generated_at).toLocaleString('th-TH') : '—'}
      </p>
    </div>
  )
}
