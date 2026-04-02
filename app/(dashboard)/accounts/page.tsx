'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAccounts } from '@/hooks/useAccounts'
import type { AccountInput } from '@/lib/supabase/accounts'
import type { AccountType } from '@/lib/types'
import { BrandIcon } from '@/lib/icon-mapper'
import { cn, formatCurrency } from '@/lib/utils'
import {
  AlertCircle, Edit2,
  Loader2, Plus, RefreshCw, Wallet,
} from 'lucide-react'
import { useState } from 'react'

// ── Config ────────────────────────────────────────────────────
const typeLabels: Record<AccountType, string> = {
  bank: 'ธนาคาร', credit: 'บัตรเครดิต', investment: 'การลงทุน',
  cash: 'เงินสด', 'e-wallet': 'กระเป๋าเงินดิจิทัล',
}
const COLORS = ['#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#f97316','#6366f1','#14b8a6']

const defaultForm: AccountInput & { id?: string } = {
  name: '', type: 'bank', balance: 0, currency: 'THB', color: COLORS[0], icon: 'bank',
}

// ── Skeleton ──────────────────────────────────────────────────
function AccountSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded mb-2" />
      <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function AccountsPage() {
  const { accounts, loading, error, assets, liabilities, netWorth, refetch, addAccount, editAccount, removeAccount } = useAccounts()

  const [modalOpen, setModalOpen]   = useState(false)
  const [saving,    setSaving]      = useState(false)
  const [deleting,  setDeleting]    = useState(false)
  const [saveError, setSaveError]   = useState('')
  const [form,      setForm]        = useState(defaultForm)
  const [editId,    setEditId]      = useState<string | null>(null)

  function openCreate() {
    setEditId(null)
    setForm(defaultForm)
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(acc: typeof accounts[0]) {
    setEditId(acc.id)
    setForm({ name: acc.name, type: acc.type, balance: acc.balance, currency: acc.currency, color: acc.color, icon: acc.icon })
    setSaveError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { setSaveError('กรุณากรอกชื่อบัญชี'); return }
    setSaving(true)
    setSaveError('')
    try {
      if (editId) {
        await editAccount(editId, form)
      } else {
        await addAccount(form)
      }
      setModalOpen(false)
    } catch (e: any) {
      setSaveError(e.message ?? 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editId) return
    setDeleting(true)
    try {
      await removeAccount(editId)
      setModalOpen(false)
    } catch (e: any) {
      setSaveError(e.message ?? 'ลบไม่สำเร็จ')
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'สินทรัพย์รวม', value: assets,      color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'หนี้สินรวม',   value: liabilities,  color: 'text-rose-600 dark:text-rose-400' },
          { label: 'มูลค่าสุทธิ',  value: netWorth,     color: 'text-brand-600 dark:text-brand-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center py-5">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            {loading
              ? <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
              : <p className={cn('text-2xl font-bold tabular-nums', color)}>{formatCurrency(value)}</p>
            }
          </Card>
        ))}
      </div>

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
            {loading ? '...' : `${accounts.length} บัญชี`}
          </h2>
          {!loading && (
            <button onClick={refetch} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> เพิ่มบัญชี
        </Button>
      </div>

      {/* ── Account Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Skeletons */}
        {loading && Array.from({ length: 3 }).map((_, i) => <AccountSkeleton key={i} />)}

        {/* Cards */}
        {!loading && accounts.map((acc) => {
          const isNegative = acc.balance < 0
          return (
            <Card key={acc.id} hover className="relative group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Brand-aware icon — uses account name to pick bank logo/color */}
                  <BrandIcon
                    name={acc.name}
                    typeHint={acc.type}
                    colorOverride={acc.color}
                    size="lg"
                    className="shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{acc.name}</p>
                    <p className="text-xs text-slate-400">{typeLabels[acc.type]}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => openEdit(acc)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Balance */}
              <div>
                <p className="text-xs text-slate-400 mb-1">ยอดคงเหลือ</p>
                <p className={cn('text-xl font-bold tabular-nums', isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-100')}>
                  {formatCurrency(acc.balance, acc.currency)}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  acc.is_active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                )}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', acc.is_active ? 'bg-emerald-500' : 'bg-slate-400')} />
                  {acc.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <span className="text-xs text-slate-400">{acc.currency}</span>
              </div>
            </Card>
          )
        })}

        {/* Empty state */}
        {!loading && accounts.length === 0 && !error && (
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <Wallet className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">ยังไม่มีบัญชี</p>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> เพิ่มบัญชีแรก
            </Button>
          </div>
        )}

        {/* Add card */}
        {!loading && accounts.length > 0 && (
          <button
            onClick={openCreate}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-slate-400 hover:border-brand-400 hover:text-brand-500 dark:hover:border-brand-600 dark:hover:text-brand-400 transition-colors min-h-[160px]"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">เพิ่มบัญชีใหม่</span>
          </button>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { if (!saving && !deleting) setModalOpen(false) }}
        title={editId ? 'แก้ไขบัญชี' : 'เพิ่มบัญชีใหม่'}
      >
        <div className="space-y-4">
          <Input
            label="ชื่อบัญชี"
            placeholder="เช่น กสิกรไทย ออมทรัพย์"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <Select
            label="ประเภทบัญชี"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as AccountType }))}
          >
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>

          <Input
            label={`ยอดเงิน${editId ? 'ปัจจุบัน' : 'เริ่มต้น'} (฿)`}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.balance === 0 && !editId ? '' : form.balance}
            onChange={e => setForm(f => ({ ...f, balance: Number(e.target.value) }))}
            prefix={<span className="text-sm font-semibold">฿</span>}
          />

          <Select
            label="สกุลเงิน"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
          >
            {['THB','USD','EUR','JPY','SGD','GBP'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">สีบัญชี</label>
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

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-300">{saveError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            {editId && (
              <Button
                variant="danger"
                size="sm"
                loading={deleting}
                disabled={saving}
                onClick={handleDelete}
              >
                ลบบัญชี
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={saving || deleting}
              >
                ยกเลิก
              </Button>
              <Button loading={saving} disabled={deleting} onClick={handleSave}>
                {editId ? 'บันทึกการแก้ไข' : 'เพิ่มบัญชี'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
