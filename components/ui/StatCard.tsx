import { cn } from '@/lib/utils'
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  className?: string
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, iconColor, iconBg, className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center', iconBg ?? 'bg-brand-50 dark:bg-brand-950')}>
          <Icon className={cn('h-5 w-5', iconColor ?? 'text-brand-600 dark:text-brand-400')} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1.5">
          {isPositive
            ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            : <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          }
          <span className={cn('text-xs font-medium', isPositive ? 'text-emerald-600' : 'text-red-600')}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
          {changeLabel && <span className="text-xs text-slate-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
