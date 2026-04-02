'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { useAccounts } from '@/hooks/useAccounts'
import { useExpenseByCategory, useMonthlyStats, useRecentTransactions } from '@/hooks/useTransactions'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight,
  Briefcase, Car, Film, Heart, Home, Laptop,
  Loader2, MoreHorizontal, PiggyBank,
  ShoppingBag, Sparkles, TrendingDown, TrendingUp,
  Utensils, Wallet,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// ── Icon map ──────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase, laptop: Laptop, 'trending-up': TrendingUp,
  utensils: Utensils, car: Car, 'shopping-bag': ShoppingBag,
  home: Home, heart: Heart, film: Film,
}

// ── Skeletons ─────────────────────────────────────────────────
const SkeletonBox = ({ h = 'h-8', w = 'w-32' }: { h?: string; w?: string }) => (
  <div className={`${h} ${w} rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse`} />
)

// ── Recharts custom tooltips ──────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-500">{p.name === 'income' ? 'รายได้' : 'รายจ่าย'}:</span>
          <span className="font-semibold">฿{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{d.name_th}</p>
      <p className="text-slate-500 mt-0.5">{formatCurrency(d.value)}</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { accounts, loading: accLoading, netWorth, assets, liabilities } = useAccounts()
  const { stats,   loading: statsLoading }   = useMonthlyStats(6)
  const { data: expCat, loading: catLoading } = useExpenseByCategory()
  const { data: recent, loading: recentLoading } = useRecentTransactions(6)

  const [seeding,     setSeeding]     = useState(false)
  const [seedDone,    setSeedDone]    = useState(false)
  const [seedError,   setSeedError]   = useState('')

  const latestMonth = stats[stats.length - 1]
  const prevMonth   = stats[stats.length - 2]
  const income      = latestMonth?.income  ?? 0
  const expense     = latestMonth?.expense ?? 0
  const savings     = income - expense
  const incomeChg   = prevMonth ? ((income  - prevMonth.income)  / prevMonth.income  * 100) : 0
  const expChg      = prevMonth ? ((expense - prevMonth.expense) / prevMonth.expense * 100) : 0
  const savingsRate = income > 0 ? (savings / income * 100) : 0
  const totalExp    = expCat.reduce((s, c) => s + c.value, 0)

  const handleSeedDemo = useCallback(async () => {
    setSeeding(true); setSeedError('')
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSeedDone(true)
      setTimeout(() => window.location.reload(), 1200)
    } catch (e: any) {
      setSeedError(e.message ?? 'เกิดข้อผิดพลาด')
    } finally { setSeeding(false) }
  }, [])

  const noData = !accLoading && accounts.length === 0

  return (
    <div className="space-y-6">

      {/* ── Demo Banner ── */}
      {noData && (
        <div className="relative overflow-hidden rounded-2xl border border-brand-200 dark:border-brand-800 bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950 dark:to-violet-950 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800 dark:text-slate-100">ยินดีต้อนรับสู่ FinFlow! 🎉</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                เริ่มต้นด้วยข้อมูลจำลอง เพื่อทดลองใช้งานได้ทันที หรือเพิ่มบัญชีเองเลย
              </p>
              {seedError && <p className="text-xs text-rose-600 mt-1">{seedError}</p>}
              {seedDone  && <p className="text-xs text-emerald-600 mt-1">✓ สร้างข้อมูลสำเร็จ กำลังโหลด...</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => router.push('/accounts')}>
                เพิ่มบัญชีเอง
              </Button>
              <Button size="sm" loading={seeding} onClick={handleSeedDemo}>
                <Sparkles className="h-4 w-4" />
                ใช้ข้อมูลจำลอง
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Net Worth Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-lg shadow-brand-200 dark:shadow-brand-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)]" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-brand-100">มูลค่าสุทธิ (Net Worth)</p>
            <Badge className="bg-white/20 text-white border-white/10 text-xs">
              {new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </Badge>
          </div>
          {accLoading
            ? <SkeletonBox h="h-10" w="w-48" />
            : <p className="text-4xl font-bold tabular-nums mt-2">{formatCurrency(netWorth)}</p>
          }
          <div className="flex items-center gap-4 mt-3 text-sm text-brand-100">
            <span>สินทรัพย์ {formatCurrency(assets)}</span>
            <span>·</span>
            <span>หนี้สิน {formatCurrency(liabilities)}</span>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {accounts.slice(0, 5).map(acc => (
            <div key={acc.id} className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-3 py-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: acc.color }} />
              <span className="text-xs font-medium text-white/90">{acc.name}</span>
              <span className="text-xs tabular-nums text-white/70">{formatCurrency(acc.balance)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="รายได้เดือนนี้"  value={statsLoading ? '...' : formatCurrency(income)}  change={statsLoading ? undefined : incomeChg}  changeLabel="vs เดือนก่อน" icon={ArrowUpRight}   iconBg="bg-emerald-50 dark:bg-emerald-950"  iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard title="รายจ่ายเดือนนี้" value={statsLoading ? '...' : formatCurrency(expense)} change={statsLoading ? undefined : expChg}     changeLabel="vs เดือนก่อน" icon={ArrowDownLeft}  iconBg="bg-rose-50 dark:bg-rose-950"        iconColor="text-rose-600 dark:text-rose-400" />
        <StatCard title="เงินออมเดือนนี้"  value={statsLoading ? '...' : formatCurrency(savings)} change={statsLoading ? undefined : savingsRate} changeLabel="อัตราออม"     icon={PiggyBank}     iconBg="bg-violet-50 dark:bg-violet-950"    iconColor="text-violet-600 dark:text-violet-400" />
        <StatCard title="บัญชีทั้งหมด"     value={accLoading   ? '...' : `${accounts.length} บัญชี`}                                                                         icon={Wallet}        iconBg="bg-sky-50 dark:bg-sky-950"          iconColor="text-sky-600 dark:text-sky-400" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>รายได้ vs รายจ่าย</CardTitle>
            <Badge variant="default">6 เดือน</Badge>
          </CardHeader>
          {statsLoading
            ? <div className="h-56 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
            : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats} barGap={4} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                  <Bar dataKey="income"  fill="#10b981" radius={[6,6,0,0]} maxBarSize={28} name="income" />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[6,6,0,0]} maxBarSize={28} name="expense" />
                  <Legend formatter={v => <span className="text-xs text-slate-500">{v === 'income' ? 'รายได้' : 'รายจ่าย'}</span>} iconType="circle" iconSize={7} />
                </BarChart>
              </ResponsiveContainer>
          }
        </Card>

        <Card>
          <CardHeader><CardTitle>สัดส่วนรายจ่าย</CardTitle></CardHeader>
          {catLoading
            ? <div className="h-56 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
            : expCat.length === 0
            ? <p className="text-sm text-slate-400 text-center py-16">ยังไม่มีรายจ่าย</p>
            : <div className="flex flex-col gap-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={expCat} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2} strokeWidth={0}>
                      {expCat.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {expCat.slice(0, 7).map(cat => (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="flex-1 text-slate-600 dark:text-slate-400 truncate">{cat.name_th}</span>
                      <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                        {totalExp > 0 ? `${((cat.value / totalExp) * 100).toFixed(0)}%` : '0%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
          }
        </Card>
      </div>

      {/* ── Recent + Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>รายการล่าสุด</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/transactions')}>ดูทั้งหมด →</Button>
          </CardHeader>
          {recentLoading
            ? <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="flex items-center gap-3"><div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" /><div className="flex-1 space-y-2"><div className="h-3.5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /><div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /></div><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></div>)}</div>
            : recent.length === 0
            ? <p className="text-sm text-slate-400 text-center py-10">ยังไม่มีรายการ</p>
            : <div className="space-y-0.5">
                {recent.map(tx => {
                  const cat = tx.category as any
                  const Icon = tx.type === 'transfer' ? ArrowLeftRight : (iconMap[cat?.icon] ?? MoreHorizontal)
                  const iconCls = tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                : tx.type === 'transfer' ? 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  const amtCls  = tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400'
                                : tx.type === 'transfer' ? 'text-sky-600 dark:text-sky-400'
                                : 'text-slate-700 dark:text-slate-300'
                  return (
                    <div key={tx.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.note ?? cat?.name_th ?? 'รายการ'}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString('th-TH',{day:'numeric',month:'short'})} · {cat?.name_th ?? (tx.type==='transfer'?'โอนเงิน':'')}</p>
                      </div>
                      <span className={`text-sm font-semibold tabular-nums shrink-0 ${amtCls}`}>
                        {tx.type==='income'?'+':tx.type==='expense'?'-':''}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
          }
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader><CardTitle>ข้อมูลเชิงลึก</CardTitle></CardHeader>
          <div className="space-y-2.5">
            {[
              savingsRate >= 20
                ? { type:'success', icon:TrendingUp,   text:`ออมได้ ${savingsRate.toFixed(0)}% เดือนนี้ 🎉` }
                : { type:'warning', icon:TrendingDown, text:`ออมได้ ${savingsRate.toFixed(0)}% ลองลดรายจ่ายดู` },
              expChg > 10
                ? { type:'warning', icon:TrendingUp,   text:`รายจ่ายเพิ่ม ${expChg.toFixed(0)}% จากเดือนก่อน ⚠️` }
                : { type:'success', icon:TrendingDown, text:`รายจ่ายลด ${Math.abs(expChg).toFixed(0)}% จากเดือนก่อน` },
              { type:'info', icon:Wallet, text:`มีบัญชีทั้งหมด ${accounts.length} บัญชี มูลค่าสุทธิ ${formatCurrency(netWorth)}` },
            ].map((ins, i) => {
              const Icon = ins.icon
              const colors: Record<string,string> = {
                success:'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
                warning:'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
                info:   'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900',
              }
              return (
                <div key={i} className={`flex items-start gap-3 rounded-xl border p-3.5 ${colors[ins.type]}`}>
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-sm leading-snug">{ins.text}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
