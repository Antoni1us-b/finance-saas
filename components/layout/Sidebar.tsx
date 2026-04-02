'use client'

import { cn } from '@/lib/utils'
import {
  BarChart3, CreditCard, LayoutDashboard, LogOut,
  Moon, Repeat2, Settings, Shield, Sun, Target, Wallet, X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/dashboard',      label: 'ภาพรวม',     labelEn: 'Dashboard',      icon: LayoutDashboard },
  { href: '/accounts',       label: 'บัญชี',       labelEn: 'Accounts',       icon: Wallet },
  { href: '/transactions',   label: 'รายการ',      labelEn: 'Transactions',   icon: BarChart3 },
  { href: '/subscriptions',  label: 'บริการ',      labelEn: 'Subscriptions',  icon: Repeat2 },
  { href: '/goals',          label: 'เป้าหมาย',   labelEn: 'Goals',          icon: Target },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [dark,    setDark]    = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
    // ตรวจสอบ admin role
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === 'admin'))
    })
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 transition-transform duration-300',
          'lg:relative lg:translate-x-0 lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">FinFlow</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Personal Finance</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {[...navItems, ...(isAdmin ? [{ href: '/admin', label: 'Admin', labelEn: 'Admin Panel', icon: Shield }] : [])].map(({ href, label, labelEn, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-200 dark:shadow-brand-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <span className="text-[10px] opacity-70 font-normal">{labelEn}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
          <button
            onClick={toggleDark}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>ตั้งค่า</span>
          </Link>
          <button
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              await createClient().auth.signOut()
              window.location.href = '/login'
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  )
}
