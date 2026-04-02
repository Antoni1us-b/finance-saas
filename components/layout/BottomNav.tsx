'use client'

import { cn } from '@/lib/utils'
import { BarChart3, LayoutDashboard, Repeat2, Target, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard',     label: 'ภาพรวม',    icon: LayoutDashboard },
  { href: '/accounts',      label: 'บัญชี',      icon: Wallet },
  { href: '/transactions',  label: 'รายการ',     icon: BarChart3 },
  { href: '/subscriptions', label: 'บริการ',     icon: Repeat2 },
  { href: '/goals',         label: 'เป้าหมาย',  icon: Target },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 safe-area-pb">
      <div className="flex items-stretch h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150',
                active
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <div className={cn(
                'flex items-center justify-center h-7 w-7 rounded-xl transition-colors',
                active ? 'bg-brand-50 dark:bg-brand-950' : ''
              )}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span className={cn('text-[10px] font-medium leading-none', active ? 'font-semibold' : '')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
