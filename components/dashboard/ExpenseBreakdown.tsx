'use client'

import { dummyExpenseByCategory } from '@/lib/data/dummy'
import { formatCurrency } from '@/lib/utils'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const total = dummyExpenseByCategory.reduce((s, c) => s + c.value, 0)

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{d.name_th}</p>
      <p className="text-slate-500 mt-0.5">{formatCurrency(d.value)} ({((d.value / total) * 100).toFixed(1)}%)</p>
    </div>
  )
}

export function ExpenseBreakdown() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="shrink-0">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={dummyExpenseByCategory}
              dataKey="value"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              strokeWidth={0}
            >
              {dummyExpenseByCategory.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-2 min-w-0">
        {dummyExpenseByCategory.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
            <span className="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">{cat.name_th}</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
              {((cat.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
