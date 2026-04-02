'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAccounts } from '@/hooks/useAccounts'
import { useTransactions } from '@/hooks/useTransactions'
import { dummyCategories } from '@/lib/data/dummy'
import type { TransactionType } from '@/lib/types'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  AlertCircle, ArrowDownLeft, ArrowLeftRight, ArrowUpRight,
  Loader2, Plus, RefreshCw, Search, Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

// ── Config ────────────────────────────────────────────────────
const TYPE_FILTERS: { label: string; value: '' | TransactionType }[] = [
  { label: 'ทั้งหมด', value: '' },
  { label: 'รายได้',  value: 'income' },
  { label: 'รายจ่าย', value: 'expense' },
  { label: 'โอน',     value: 'transfer' },
]

const typeLabels: Record<TransactionType, string> = {
  income:   'รายได้',
  expense:  'รายจ่าย',
  transfer: 'โอน',
}

const typeBadgeVariant: Record<TransactionType, 'success' | 'danger' | 'info'> = {
  income:   'success',
  expense:  'danger',
  transfer: 'info',
}

const typeIcons: Record<TransactionType, React.ElementType> = {
  income:   ArrowUpRight,
  expense:  ArrowDownLeft,
  transfer: ArrowLeftRight,
}

interface TxForm {
  type:          TransactionType
  amount:        number | ''
  date:          string
  account_id:    string
  to_account_id: string
  category_id:   string
  note:          string
  tags:          string
}

const today = new Date().toISOString().slice(0, 10)

const defaultForm: TxForm = {
  type:          'expense',
  amount:        '',
  date:          today,
  account_id:    '',
  to_account_id: '',
  category_id:   '',
  note:          '',
  tags:          '',
}

// ── Skeleton ──────────────────────────────────────────────────
function TxRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" /></td>
      <td className="px-4 py-3"><div className="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" /></td>
      <td className="px-4 py-3 text-right"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded ml-auto" /></td>
      <td className="px-4 py-3"><div className="h-7 w-7 bg-slate-200 dark:bg-slate-700 rounded-lg ml-auto" /></td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function TransactionsPage() {
  const { data: transactions, loading, error, refetch, add, remove } = useTransactions()
  const { accounts } = useAccounts()

  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | TransactionType>('')
  const [catFilter,  setCatFilter]  = useState('')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [saveError,  setSaveError]  = useState('')
  const [form,       setForm]       = useState<TxForm>(defaultForm)

  // ── Derived ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions.filter(tx => {
      if (typeFilter && tx.type !== typeFilter) return false
      if (catFilter  && tx.category_id !== catFilter) return false
      if (q) {
        const inNote = tx.note?.toLowerCase().includes(q) ?? false
        const inCat  = (tx.category?.name_th ?? tx.category?.name ?? '').toLowerCase().includes(q)
        if (!inNote && !inCat) return false
      }
      return true
    })
  }, [transactions, search, typeFilter, catFilter])

  const totalIncome  = useMemo(() => transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),  [transactions])
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [transactions])
  const net          = totalIncome - totalExpense

  // ── Form helpers ─────────────────────────────────────────────
  function openCreate() {
    setForm({ ...defaultForm, account_id: accounts[0]?.id ?? '' })
    setSaveError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.amount || Number(form.amount) <= 0) { setSaveError('กรุณากรอกจำนวนเงิน'); return }
    if (!form.account_id) { setSaveError('กรุณาเลือกบัญชี'); return }
    if (!form.date)        { setSaveError('กรุณาเลือกวันที่'); return }
    if (form.type === 'transfer' && !form.to_account_id) { setSaveError('กรุณาเลือกบัญชีปลายทาง'); return }
    setSaving(true)
    setSaveError('')
    try {
      await add({
        type:          form.type,
        amount:        Number(form.amount),
        date:          form.date,
        account_id:    form.account_id,
        to_account_id: form.type === 'transfer' ? form.to_account_id || null : null,
        category_id:   form.category_id || null,
        note:          form.note.trim() || null,
        tags:          form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      })
      setModalOpen(false)
    } catch (e: any) {
      setSaveError(e.message ?? 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await remove(id)
    } catch {
      // row stays on failure
    } finally {
      setDeleting(null)
    }
  }

  const categoriesForType = useMemo(() => {
    if (form.type === 'transfer') return []
    return dummyCategories.filter(c => c.type === form.type || c.type === 'both')
  }, [form.type])

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'รายได้รวม',    value: totalIncome,  color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'รายจ่ายรวม',   value: totalExpense, color: 'text-rose-600 dark:text-rose-400' },
          {
            label: 'คงเหลือสุทธิ', value: net,
            color: net >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-600 dark:text-rose-400',
          },
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
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ค้นหารายการหรือหมวดหมู่..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                'px-3 h-10 rounded-xl text-sm font-medium transition-colors',
                typeFilter === f.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">ทุกหมวดหมู่</option>
          {dummyCategories.map(c => (
            <option key={c.id} value={c.id}>{c.name_th ?? c.name}</option>
          ))}
        </select>

        <Button size="md" onClick={openCreate}>
          <Plus className="h-4 w-4" /> เพิ่มรายการ
        </Button>
      </div>

      {/* ── Table ── */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">วันที่</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">รายการ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">บัญชี</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">ประเภท</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">จำนวนเงิน</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

              {/* Skeleton rows */}
              {loading && Array.from({ length: 6 }).map((_, i) => <TxRowSkeleton key={i} />)}

              {/* Data rows */}
              {!loading && filtered.map(tx => {
                const Icon = typeIcons[tx.type]
                const catLabel = tx.category?.name_th ?? tx.category?.name ?? '—'
                const isNegative = tx.type === 'expense'
                const isTransfer = tx.type === 'transfer'
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
                          tx.type === 'income'   && 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
                          tx.type === 'expense'  && 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
                          tx.type === 'transfer' && 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-800 dark:text-slate-100 font-medium truncate">
                            {tx.note ?? catLabel}
                          </p>
                          {tx.note && tx.category && (
                            <p className="text-xs text-slate-400 truncate">{catLabel}</p>
                          )}
                          {tx.tags && tx.tags.length > 0 && (
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {tx.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {tx.account?.name ?? '—'}
                      {isTransfer && tx.to_account && (
                        <span className="text-slate-400 ml-1">→ {tx.to_account.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={typeBadgeVariant[tx.type]} dot>
                        {typeLabels[tx.type]}
                      </Badge>
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap',
                      isNegative  ? 'text-rose-600 dark:text-rose-400'
                      : isTransfer ? 'text-sky-600 dark:text-sky-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                    )}>
                      {isNegative ? '−' : isTransfer ? '' : '+'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                        disabled={deleting === tx.id}
                        onClick={() => handleDelete(tx.id)}
                      >
                        {deleting === tx.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />
                        }
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <ArrowLeftRight className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">
              {search || typeFilter || catFilter ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีรายการ'}
            </p>
            {!search && !typeFilter && !catFilter && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> เพิ่มรายการแรก
              </Button>
            )}
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-400">{filtered.length} รายการ</p>
            <button onClick={() => refetch()} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </Card>

      {/* ── Add Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { if (!saving) setModalOpen(false) }}
        title="เพิ่มรายการใหม่"
        size="md"
      >
        <div className="space-y-4">

          {/* Type tabs */}
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: t, category_id: '', to_account_id: '' }))}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium transition-colors',
                  form.type === t
                    ? t === 'income'   ? 'bg-emerald-600 text-white'
                    : t === 'expense'  ? 'bg-rose-600 text-white'
                    : 'bg-sky-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {typeLabels[t]}
              </button>
            ))}
          </div>

          <Input
            label="จำนวนเงิน (฿)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value === '' ? '' : Number(e.target.value) }))}
            prefix={<span className="text-sm font-semibold">฿</span>}
          />

          <Input
            label="วันที่"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />

          <Select
            label="บัญชี"
            value={form.account_id}
            onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
          >
            <option value="">— เลือกบัญชี —</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>

          {form.type === 'transfer' && (
            <Select
              label="บัญชีปลายทาง"
              value={form.to_account_id}
              onChange={e => setForm(f => ({ ...f, to_account_id: e.target.value }))}
            >
              <option value="">— เลือกบัญชีปลายทาง —</option>
              {accounts.filter(a => a.id !== form.account_id).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          )}

          {form.type !== 'transfer' && (
            <Select
              label="หมวดหมู่"
              value={form.category_id}
              onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            >
              <option value="">— เลือกหมวดหมู่ (ไม่บังคับ) —</option>
              {categoriesForType.map(c => (
                <option key={c.id} value={c.id}>{c.name_th ?? c.name}</option>
              ))}
            </Select>
          )}

          <Input
            label="หมายเหตุ"
            placeholder="เช่น ค่าอาหารกลางวัน"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          />

          <Input
            label="แท็ก (คั่นด้วยเครื่องหมายจุลภาค)"
            placeholder="เช่น food, work, personal"
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
          />

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-300">{saveError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 justify-end">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button loading={saving} onClick={handleSave}>
              บันทึกรายการ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
