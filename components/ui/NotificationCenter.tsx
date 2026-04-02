'use client'

import { useNotifications } from '@/hooks/useNotifications'
import type { Notification, NotificationType } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  AlertCircle, Bell, BellOff, CheckCheck, Clock,
  CreditCard, Loader2, Target, Trash2, TrendingUp, X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// ── Icon per notification type ────────────────────────────────
const typeIcon: Record<NotificationType, React.ElementType> = {
  transaction:  CreditCard,
  goal:         Target,
  subscription: TrendingUp,
  system:       AlertCircle,
}

const typeBg: Record<NotificationType, string> = {
  transaction:  'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',
  goal:         'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
  subscription: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  system:       'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
}

// ── Relative time helper ──────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)

  if (mins < 1)   return 'เมื่อกี้'
  if (mins < 60)  return `${mins} นาทีที่แล้ว`
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  if (days < 7)   return `${days} วันที่แล้ว`
  return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

// ── Single notification row ───────────────────────────────────
function NotifRow({
  n,
  onRead,
}: {
  n: Notification
  onRead: (id: string) => void
}) {
  const Icon = typeIcon[n.type] ?? AlertCircle

  return (
    <button
      onClick={() => !n.is_read && onRead(n.id)}
      className={cn(
        'w-full text-left flex items-start gap-3 px-4 py-3 transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-800/60',
        !n.is_read && 'bg-brand-50/40 dark:bg-brand-950/20'
      )}
    >
      {/* Icon */}
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', typeBg[n.type])}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', !n.is_read ? 'font-semibold text-slate-800 dark:text-slate-100' : 'font-medium text-slate-600 dark:text-slate-300')}>
          {n.title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {n.message}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {relativeTime(n.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!n.is_read && (
        <span className="mt-2 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
      )}
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────
export function NotificationCenter() {
  const { notifications, loading, unreadCount, markAsRead, markAllRead, clearRead } =
    useNotifications()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative h-9 w-9 rounded-xl flex items-center justify-center transition-colors',
          'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800',
          open && 'bg-slate-100 dark:bg-slate-800'
        )}
        aria-label="การแจ้งเตือน"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white dark:border-slate-950 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className={cn(
          'absolute right-0 top-11 z-50',
          'w-80 sm:w-96 rounded-2xl shadow-xl border',
          'bg-white dark:bg-slate-900',
          'border-slate-100 dark:border-slate-800',
          'overflow-hidden',
          'animate-in fade-in slide-in-from-top-2 duration-150'
        )}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                การแจ้งเตือน
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="อ่านทั้งหมด"
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={clearRead}
                title="ลบที่อ่านแล้ว"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <BellOff className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 text-center">
                  ไม่มีการแจ้งเตือนในขณะนี้
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <NotifRow key={n.id} n={n} onRead={markAsRead} />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 text-center">
              <span className="text-[11px] text-slate-400">
                แสดง {notifications.length} รายการล่าสุด
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
