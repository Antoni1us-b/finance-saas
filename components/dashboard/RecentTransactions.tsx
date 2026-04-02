import { dummyTransactions } from '@/lib/data/dummy'
import { cn, formatCurrency, formatDateShort } from '@/lib/utils'
import {
  ArrowLeftRight, Briefcase, Car, Film, Heart, Home,
  Laptop, MoreHorizontal, ShoppingBag, TrendingUp, Utensils,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '../ui/Badge'

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase, laptop: Laptop, 'trending-up': TrendingUp,
  utensils: Utensils, car: Car, 'shopping-bag': ShoppingBag,
  home: Home, heart: Heart, film: Film,
}

export function RecentTransactions() {
  const recent = [...dummyTransactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)

  return (
    <div className="space-y-0.5">
      {recent.map((tx) => {
        const Icon = tx.type === 'transfer'
          ? ArrowLeftRight
          : (tx.category ? (iconMap[tx.category.icon] ?? MoreHorizontal) : MoreHorizontal)

        const iconColor = tx.type === 'income'
          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400'
          : tx.type === 'transfer'
          ? 'text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-400'
          : 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'

        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', iconColor)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                {tx.note ?? (tx.category?.name_th ?? tx.category?.name ?? 'รายการโอน')}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {formatDateShort(tx.date)} · {tx.category?.name_th ?? (tx.type === 'transfer' ? 'โอนเงิน' : '')}
              </p>
            </div>
            <span
              className={cn(
                'text-sm font-semibold tabular-nums shrink-0',
                tx.type === 'income'   ? 'text-emerald-600 dark:text-emerald-400' :
                tx.type === 'transfer' ? 'text-sky-600 dark:text-sky-400' :
                                         'text-slate-700 dark:text-slate-300'
              )}
            >
              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
              {formatCurrency(tx.amount)}
            </span>
          </div>
        )
      })}

      <div className="pt-2">
        <Link
          href="/transactions"
          className="block text-center text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline py-1.5"
        >
          ดูทั้งหมด →
        </Link>
      </div>
    </div>
  )
}
