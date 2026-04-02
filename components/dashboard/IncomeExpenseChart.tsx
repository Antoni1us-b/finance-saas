'use client'

import { dummyMonthlyStats } from '@/lib/data/dummy'
import { formatNumber } from '@/lib/utils'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name === 'income' ? 'รายได้' : 'รายจ่าย'}:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">฿{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function IncomeExpenseChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dummyMonthlyStats} barGap={4} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${formatNumber(v)}`} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
        <Bar dataKey="income"  fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} name="income" />
        <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} name="expense" />
        <Legend
          formatter={(val) => (
            <span className="text-xs text-slate-500">{val === 'income' ? 'รายได้' : 'รายจ่าย'}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
