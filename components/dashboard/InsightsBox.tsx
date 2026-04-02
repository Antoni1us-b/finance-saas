import { dummyMonthlyStats, dummySubscriptions } from '@/lib/data/dummy'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, TrendingDown, TrendingUp } from 'lucide-react'

interface Insight {
  type: 'success' | 'warning' | 'info'
  icon: React.ElementType
  text: string
}

function buildInsights(): Insight[] {
  const latest  = dummyMonthlyStats[dummyMonthlyStats.length - 1]
  const prev    = dummyMonthlyStats[dummyMonthlyStats.length - 2]
  const savings = latest.income - latest.expense
  const savingsRate = (savings / latest.income) * 100
  const expenseChange = ((latest.expense - prev.expense) / prev.expense) * 100
  const monthlySubs = dummySubscriptions
    .filter(s => s.is_active && s.billing_cycle === 'monthly')
    .reduce((s, x) => s + x.amount, 0)

  return [
    savingsRate >= 20
      ? { type: 'success', icon: CheckCircle2, text: `ออมได้ ${savingsRate.toFixed(0)}% ของรายได้เดือนนี้ 🎉` }
      : { type: 'warning', icon: AlertCircle,  text: `ออมได้เพียง ${savingsRate.toFixed(0)}% ลองลดค่าใช้จ่ายดูนะ` },
    expenseChange > 10
      ? { type: 'warning', icon: TrendingUp,   text: `รายจ่ายเพิ่มขึ้น ${expenseChange.toFixed(0)}% จากเดือนก่อน` }
      : { type: 'success', icon: TrendingDown, text: `รายจ่ายลดลง ${Math.abs(expenseChange).toFixed(0)}% จากเดือนก่อน 👍` },
    { type: 'info', icon: Info, text: `ค่าบริการรายเดือนรวม ${formatCurrency(monthlySubs)} ต่อเดือน` },
  ]
}

const colors = {
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-100 dark:border-amber-900',
  info:    'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-100 dark:border-sky-900',
}

export function InsightsBox() {
  const insights = buildInsights()
  return (
    <div className="space-y-2.5">
      {insights.map((ins, i) => {
        const Icon = ins.icon
        return (
          <div key={i} className={`flex items-start gap-3 rounded-xl border p-3.5 ${colors[ins.type]}`}>
            <Icon className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm leading-snug">{ins.text}</p>
          </div>
        )
      })}
    </div>
  )
}
