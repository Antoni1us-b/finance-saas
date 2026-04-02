'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAccounts } from '@/hooks/useAccounts'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import type { BillingCycle, Subscription } from '@/lib/types'
import { cn, formatCurrency, getDaysUntil } from '@/lib/utils'
import {
  AlertCircle, Bell, Calendar, Plus, Power, RefreshCw, Trash2,
} from 'lucide-react'
import { useState } from 'react'

// ── Config ────────────────────────────────────────────────────
const cycleLabels: Record<BillingCycle, string> = {
  daily:     'รายวัน',
  weekly:    'รายสัปดาห์',
  monthly:   'รายเดือน',
  quarterly: 'รายไตรมาส',
  yearly:    'รายปี',
}

const cycleMultiplier: Record<BillingCycle, number> = {
  daily: 365, weekly: 52, monthly: 12, quarterly: 4, yearly: 1,
}

const COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316', '#6366f1', '#e50914', '#1db954']

interface SubForm {
  name:          string
  amount:        string
  billing_cycle: BillingCycle
  next_billing:  string
  account_id:    string
  color:         string
  note:          string
}

const defaultForm: SubForm = {
  name:          '',
  amount:        '',
  billing_cycle: 'monthly',
  next_billing:  new Date().toISOString().slice(0, 10),
  account_id:    '',
  color:         COLORS[0],
  note:          '',
}

// ── Skeleton ──────────────────────────────────────────────────
function SubSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between">
        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const { subs, active, upcoming, monthly, loading, error, refetch, add, edit, toggle, remove } = useSubscriptions()
  const { accounts } = useAccounts()

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [toggling,   setToggling]   = useState<string | null>(null)
  const [saveError,  setSaveError]  = useState('')
  const [form,       setForm]       = useState<SubForm>(defaultForm)

  const yearlyEst = active.reduce((t, s) => t + s.amount * cycleMultiplier[s.billing_cycle], 0)

  // ── Helpers ──────────────────────────────────────────────────
  function openCreate() {
    setEditingSub(null)
    setForm({ ...defaultForm, account_id: accounts[0]?.id ?? '' })
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(s: Subscription) {
    setEditingSub(s)
    setForm({
      name:          s.name,
      amount:        String(s.amount),
      billing_cycle: s.billing_cycle,
      next_billing:  s.next_billing,
      account_id:    s.account_id ?? '',
      color:         s.color,
      note:          s.note ?? '',
    })
    setSaveError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { setSaveError('กรุณากรอกชื่อบริการ'); return }
    if (!form.amount || Number(form.amount) <= 0) { setSaveError('กรุณากรอกค่าใช้จ่าย'); return }
    if (!form.next_billing) { setSaveError('กรุณาเลือกวันที่ชำระถัดไป'); return }
    setSaving(true)
    setSaveError('')
    try {
      const input = {
        name:          form.name.trim(),
        amount:        Number(form.amount),
        billing_cycle: form.billing_cycle,
        next_billing:  form.next_billing,
        account_id:    form.account_id || null,
        color:         form.color,
        note:          form.note.trim() || null,
      }
      if (editingSub) {
        await edit(editingSub.id, input)
      } else {
        await add(input)
      }
      setModalOpen(false)
    } catch (e: any) {
      setSaveError(e.message ?? 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(id: string) {
    setToggling(id)
    try {
      await toggle(id)
    } catch {
      // silent
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await remove(id)
      if (editingSub?.id === id) setModalOpen(false)
    } catch {
      // silent
    } finally {
      setDeleting(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'บริการที่ใช้งาน',
            value: loading ? null : `${active.length} บริการ`,
            color: 'text-brand-600 dark:text-brand-400',
          },
          {
            label: 'ค่าใช้จ่ายต่อเดือน',
            value: loading ? null : formatCurrency(monthly),
            color: 'text-slate-800 dark:text-slate-100',
          },
          {
            label: 'ประมาณการรายปี',
            value: loading ? null : formatCurrency(yearlyEst),
            color: 'text-amber-600 dark:text-amber-400',
          },
          {
            label: 'แจ้งเตือน 7 วัน',
            value: loading ? null : `${upcoming.length} รายการ`,
            color: upcoming.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400',
          },
        ].map(({ label, value, color }) => (
          <Card key={label} className="py-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            {value === null
              ? <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              : <p className={cn('text-xl font-bold tabular-nums', color)}>{value}</p>
            }
          </Card>
        ))}
      </div>

      {/* ── Upcoming alert ── */}
      {!loading && upcoming.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
              บริการที่ต้องชำระใน 7 วันข้างหน้า
            </p>
            <div className="space-y-1">
              {upcoming.map(s => {
                const days = getDaysUntil(s.next_billing)
                return (
                  <p key={s.id} className="text-xs text-amber-700 dark:text-amber-300">
                    • {s.name} — {formatCurrency(s.amount)}{' '}
                    ({days === 0 ? 'วันนี้!' : `อีก ${days} วัน`})
                  </p>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-300 flex-1">{error}</p>
          <Button variant="ghost" size="icon" onClick={refetch}>
            <RefreshCw className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {loading ? '...' : `${subs.length} บริการ`}
          </h2>
          {!loading && (
            <button onClick={refetch} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> เพิ่มบริการ
        </Button>
      </div>

      {/* ── Subscription Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Skeletons */}
        {loading && Array.from({ length: 4 }).map((_, i) => <SubSkeleton key={i} />)}

        {/* Cards */}
        {!loading && subs.map(sub => {
          const days = getDaysUntil(sub.next_billing)
          const isTogglingThis = toggling === sub.id
          return (
            <Card
              key={sub.id}
              hover
              className={cn('relative group', !sub.is_active && 'opacity-60')}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0"
                    style={{ background: sub.color }}
                  >
                    {sub.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{sub.name}</p>
                    <p className="text-xs text-slate-400">{cycleLabels[sub.billing_cycle]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Toggle active */}
                  <button
                    onClick={() => handleToggle(sub.id)}
                    disabled={isTogglingThis}
                    className={cn(
                      'h-7 w-7 rounded-lg flex items-center justify-center transition-colors',
                      sub.is_active
                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <Power className={cn('h-3.5 w-3.5', isTogglingThis && 'animate-spin opacity-60')} />
                  </button>
                  {/* Edit */}
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => openEdit(sub)}
                  >
                    <Bell className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Amount */}
              <p className="text-2xl font-bold tabular-nums text-slate-800 dark:text-slate-100">
                {formatCurrency(sub.amount)}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  /{cycleLabels[sub.billing_cycle].replace('ราย', '')}
                </span>
              </p>

              {sub.note && (
                <p className="mt-1 text-xs text-slate-400 truncate">{sub.note}</p>
              )}

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    ต่อไป: {new Date(sub.next_billing).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <Badge
                  variant={days <= 0 ? 'danger' : days <= 3 ? 'warning' : days <= 7 ? 'info' : 'default'}
                  dot={days <= 7}
                >
                  {days <= 0
                    ? 'วันนี้!'
                    : days <= 7
                      ? `อีก ${days} วัน`
                      : sub.is_active ? 'ปกติ' : 'หยุดพัก'}
                </Badge>
              </div>
            </Card>
          )
        })}

        {/* Add card button */}
        {!loading && subs.length > 0 && (
          <button
            onClick={openCreate}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:hover:border-brand-600 dark:hover:text-brand-400 transition-colors min-h-[160px]"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">เพิ่มบริการใหม่</span>
          </button>
        )}

        {/* Empty state */}
        {!loading && subs.length === 0 && !error && (
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <Bell className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">ยังไม่มีบริการสมัครสมาชิก</p>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> เพิ่มบริการแรก
            </Button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { if (!saving) setModalOpen(false) }}
        title={editingSub ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}
      >
        <div className="space-y-4">
          <Input
            label="ชื่อบริการ"
            placeholder="เช่น Netflix, Spotify, iCloud+"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <Input
            label="ค่าใช้จ่าย (฿)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            prefix={<span className="text-sm font-semibold">฿</span>}
          />

          <Select
            label="รอบการชำระ"
            value={form.billing_cycle}
            onChange={e => setForm(f => ({ ...f, billing_cycle: e.target.value as BillingCycle }))}
          >
            {Object.entries(cycleLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>

          <Input
            label="วันที่ชำระถัดไป"
            type="date"
            value={form.next_billing}
            onChange={e => setForm(f => ({ ...f, next_billing: e.target.value }))}
          />

          <Select
            label="หักจากบัญชี"
            value={form.account_id}
            onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
          >
            <option value="">— ไม่ระบุ —</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">สีบริการ</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    'h-8 w-8 rounded-xl border-2 transition-all hover:scale-110',
                    form.color === c ? 'border-slate-700 dark:border-white scale-110 shadow-md' : 'border-transparent'
                  )}
                  style={{ background: c }}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                />
              ))}
            </div>
          </div>

          <Input
            label="หมายเหตุ"
            placeholder="เช่น แพ็กเกจ Premium, 200 GB"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          />

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-300">{saveError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            {editingSub && (
              <Button
                variant="danger" size="sm"
                loading={deleting === editingSub.id}
                disabled={saving}
                onClick={() => handleDelete(editingSub.id)}
              >
                ลบบริการ
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                ยกเลิก
              </Button>
              <Button loading={saving} onClick={handleSave}>
                {editingSub ? 'บันทึกการแก้ไข' : 'เพิ่มบริการ'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
