'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import {
  AlertTriangle, CheckCircle2, KeyRound, Loader2,
  MoreHorizontal, RefreshCw, Search, Shield, Trash2,
  UserCheck, UserX, Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────
interface AdminUser {
  id:                 string
  email:              string
  full_name:          string | null
  role:               'admin' | 'user'
  is_banned:          boolean
  currency:           string
  created_at:         string
  last_sign_in_at:    string | null
  email_confirmed_at: string | null
  accounts_count:     number
  tx_count:           number
}

type ActionType = 'ban' | 'unban' | 'reset' | 'delete' | null

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit',
  })
}

function InitialAvatar({ name, email }: { name: string | null; email: string }) {
  const letter = (name ?? email).slice(0, 1).toUpperCase()
  const colors = ['bg-brand-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500']
  const idx = (letter.charCodeAt(0) ?? 0) % colors.length
  return (
    <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold', colors[idx])}>
      {letter}
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium',
      'animate-in fade-in slide-in-from-bottom-3 duration-200',
      ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
    )}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      {msg}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'banned'>('all')
  const [acting,     setActing]     = useState<string | null>(null)   // userId currently processing
  const [confirm,    setConfirm]    = useState<{ user: AdminUser; action: ActionType } | null>(null)
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null)

  // ── Data loading ────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/users')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Load failed')
      setUsers(json.users)
    } catch (e: any) {
      showToast(e.message, false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Filtered list ───────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(u => {
      const matchSearch = !q ||
        u.email.toLowerCase().includes(q) ||
        (u.full_name ?? '').toLowerCase().includes(q)

      const matchRole =
        roleFilter === 'all'    ? true :
        roleFilter === 'banned' ? u.is_banned :
        roleFilter === 'admin'  ? u.role === 'admin' :
        u.role === 'user' && !u.is_banned

      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  // ── Stats ───────────────────────────────────────────────────
  const totalUsers  = users.length
  const totalAdmins = users.filter(u => u.role === 'admin').length
  const totalBanned = users.filter(u => u.is_banned).length
  const confirmed   = users.filter(u => u.email_confirmed_at).length

  // ── Actions ──────────────────────────────────────────────────
  async function executeAction(user: AdminUser, action: NonNullable<ActionType>) {
    setConfirm(null)
    setActing(user.id)
    try {
      let res: Response
      if (action === 'ban' || action === 'unban') {
        res = await fetch(`/api/admin/users/${user.id}/ban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ban: action === 'ban' }),
        })
      } else if (action === 'reset') {
        res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: 'POST' })
      } else {
        res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Action failed')

      showToast(json.message, true)

      if (action === 'delete') {
        setUsers(prev => prev.filter(u => u.id !== user.id))
      } else if (action === 'ban' || action === 'unban') {
        setUsers(prev => prev.map(u =>
          u.id === user.id ? { ...u, is_banned: action === 'ban' } : u
        ))
      }
    } catch (e: any) {
      showToast(e.message, false)
    } finally {
      setActing(null)
    }
  }

  // ── Confirm dialog content ───────────────────────────────────
  const confirmConfig: Record<NonNullable<ActionType>, { title: string; body: string; cta: string; danger: boolean }> = {
    ban:   { title: 'ระงับบัญชีผู้ใช้',     body: 'ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้จนกว่าจะยกเลิกการระงับ',  cta: 'ระงับบัญชี',   danger: true },
    unban: { title: 'ยกเลิกการระงับบัญชี',  body: 'ผู้ใช้จะสามารถเข้าสู่ระบบได้อีกครั้ง',                  cta: 'ยกเลิกการระงับ', danger: false },
    reset: { title: 'ส่งรีเซ็ตรหัสผ่าน',    body: 'ระบบจะส่งอีเมลรีเซ็ตรหัสผ่านไปยังผู้ใช้คนนี้',           cta: 'ส่งอีเมล',      danger: false },
    delete:{ title: 'ลบบัญชีผู้ใช้',        body: 'การดำเนินการนี้ไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดจะถูกลบ', cta: 'ลบบัญชี',       danger: true },
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">จัดการผู้ใช้</h2>
            <p className="text-xs text-slate-400">User Management · {totalUsers} accounts</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ผู้ใช้ทั้งหมด',  value: loading ? '…' : totalUsers,  color: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400',       icon: Users },
          { label: 'Admin',           value: loading ? '…' : totalAdmins,  color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',   icon: Shield },
          { label: 'ถูกระงับ',        value: loading ? '…' : totalBanned,  color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',            icon: UserX },
          { label: 'ยืนยันอีเมล',     value: loading ? '…' : confirmed,   color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400', icon: UserCheck },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-4 py-4">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อหรืออีเมล..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Role filter pills */}
        <div className="flex gap-1.5">
          {([
            { value: 'all',    label: 'ทั้งหมด' },
            { value: 'admin',  label: 'Admin' },
            { value: 'user',   label: 'User' },
            { value: 'banned', label: 'ระงับ' },
          ] as const).map(f => (
            <button
              key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={cn(
                'px-3 h-10 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                roleFilter === f.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── User table ── */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {[
                  { label: 'ผู้ใช้',       responsive: '' },
                  { label: 'สิทธิ์',       responsive: '' },
                  { label: 'สถานะ',        responsive: '' },
                  { label: 'เข้าใช้ล่าสุด', responsive: 'hidden lg:table-cell' },
                  { label: 'สมัครเมื่อ',    responsive: 'hidden lg:table-cell' },
                  { label: 'บัญชี',        responsive: 'hidden md:table-cell' },
                  { label: 'รายการ',       responsive: 'hidden md:table-cell' },
                  { label: '',             responsive: '' },
                ].map(({ label, responsive }) => (
                  <th
                    key={label}
                    className={cn(
                      'text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap',
                      responsive,
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ── Loading skeleton ── */}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-50 dark:border-slate-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-36 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  </td>
                  {/* Role */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  </td>
                  {/* Last sign in — hidden on mobile */}
                  <td className="hidden lg:table-cell px-4 py-3">
                    <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  </td>
                  {/* Created at — hidden on mobile */}
                  <td className="hidden lg:table-cell px-4 py-3">
                    <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  </td>
                  {/* Accounts — hidden on mobile */}
                  <td className="hidden md:table-cell px-4 py-3">
                    <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  </td>
                  {/* Transactions — hidden on mobile */}
                  <td className="hidden md:table-cell px-4 py-3">
                    <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}

              {/* ── Empty ── */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    ไม่พบผู้ใช้
                  </td>
                </tr>
              )}

              {/* ── User rows ── */}
              {!loading && filtered.map(user => {
                const isActing = acting === user.id
                return (
                  <tr
                    key={user.id}
                    className={cn(
                      'border-b border-slate-50 dark:border-slate-800/50 transition-colors',
                      'hover:bg-slate-50/80 dark:hover:bg-slate-800/40',
                      user.is_banned && 'opacity-60',
                    )}
                  >
                    {/* Name + email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-[160px]">
                        <InitialAvatar name={user.full_name} email={user.email} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
                            {user.full_name ?? '(ไม่ระบุชื่อ)'}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <Badge variant="purple" dot>Admin</Badge>
                      ) : (
                        <Badge variant="default">User</Badge>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.is_banned ? (
                        <Badge variant="danger" dot>ระงับแล้ว</Badge>
                      ) : user.email_confirmed_at ? (
                        <Badge variant="success" dot>ยืนยันแล้ว</Badge>
                      ) : (
                        <Badge variant="warning" dot>รอยืนยัน</Badge>
                      )}
                    </td>

                    {/* Last sign in — hidden below lg */}
                    <td className="hidden lg:table-cell px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(user.last_sign_in_at)}
                    </td>

                    {/* Created at — hidden below lg */}
                    <td className="hidden lg:table-cell px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(user.created_at)}
                    </td>

                    {/* Accounts — hidden below md */}
                    <td className="hidden md:table-cell px-4 py-3 text-center tabular-nums text-slate-600 dark:text-slate-300">
                      {user.accounts_count}
                    </td>

                    {/* Transactions — hidden below md */}
                    <td className="hidden md:table-cell px-4 py-3 text-center tabular-nums text-slate-600 dark:text-slate-300">
                      {user.tx_count}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {isActing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400 ml-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" minWidth="13rem">
                            <DropdownMenuLabel>
                              {user.full_name ?? user.email}
                            </DropdownMenuLabel>

                            {/* Password reset */}
                            <DropdownMenuItem
                              icon={KeyRound}
                              onClick={() => setConfirm({ user, action: 'reset' })}
                            >
                              ส่งรีเซ็ตรหัสผ่าน
                            </DropdownMenuItem>

                            {/* Ban / Unban */}
                            {user.is_banned ? (
                              <DropdownMenuItem
                                icon={UserCheck}
                                onClick={() => setConfirm({ user, action: 'unban' })}
                                disabled={user.role === 'admin'}
                              >
                                ยกเลิกการระงับ
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                icon={UserX}
                                onClick={() => setConfirm({ user, action: 'ban' })}
                                disabled={user.role === 'admin'}
                                destructive
                              >
                                ระงับบัญชี
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {/* Delete */}
                            <DropdownMenuItem
                              icon={Trash2}
                              onClick={() => setConfirm({ user, action: 'delete' })}
                              disabled={user.role === 'admin'}
                              destructive
                            >
                              ลบบัญชีผู้ใช้
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              แสดง {filtered.length} จาก {totalUsers} ผู้ใช้
            </p>
            <button
              onClick={() => setSearch('')}
              className={cn(
                'text-xs text-slate-400 hover:text-brand-600 transition-colors',
                !search && 'invisible'
              )}
            >
              ล้างการค้นหา
            </button>
          </div>
        )}
      </Card>

      {/* ── Confirmation modal ── */}
      {confirm && confirm.action && (
        <Modal
          open
          title={confirmConfig[confirm.action].title}
          size="sm"
          onClose={() => setConfirm(null)}
        >
          <div className="space-y-4">
            {/* Target user info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <InitialAvatar name={confirm.user.full_name} email={confirm.user.email} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {confirm.user.full_name ?? '(ไม่ระบุชื่อ)'}
                </p>
                <p className="text-xs text-slate-400 truncate">{confirm.user.email}</p>
              </div>
            </div>

            {/* Warning */}
            <div className={cn(
              'flex items-start gap-2.5 p-3 rounded-xl text-sm',
              confirmConfig[confirm.action].danger
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            )}>
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{confirmConfig[confirm.action].body}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setConfirm(null)}>
                ยกเลิก
              </Button>
              <Button
                variant={confirmConfig[confirm.action].danger ? 'danger' : 'primary'}
                className="flex-1"
                onClick={() => executeAction(confirm.user, confirm.action!)}
              >
                {confirmConfig[confirm.action].cta}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  )
}
