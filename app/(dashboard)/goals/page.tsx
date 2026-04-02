'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useGoals } from '@/hooks/useGoals'
import type { Goal } from '@/lib/types'
import { cn, formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'
import {
  AlertCircle, CheckCircle2, Home, Laptop, Loader2,
  Plane, Plus, RefreshCw, Shield, Target, Trash2,
} from 'lucide-react'
import { useState } from 'react'

// ── Config ────────────────────────────────────────────────────
const goalIcons: Record<string, React.ElementType> = {
  shield: Shield, plane: Plane, laptop: Laptop,
  home: Home, target: Target,
}

const GOAL_ICON_OPTIONS = ['target', 'shield', 'plane', 'laptop', 'home'] as const

const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#0ea5e9', '#ec4899', '#f97316', '#ef4444', '#8b5cf6']

interface GoalForm {
  name:           string
  target_amount:  string
  current_amount: string
  target_date:    string
  icon:           string
  color:          string
  note:           string
}

const defaultForm: GoalForm = {
  name: '', target_amount: '', current_amount: '0',
  target_date: '', icon: 'target', color: COLORS[0], note: '',
}

// ── Skeleton ──────────────────────────────────────────────────
function GoalSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function GoalsPage() {
  const { active, completed, loading, error, refetch, add, edit, deposit, remove } = useGoals()

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editingGoal,  setEditingGoal]  = useState<Goal | null>(null)
  const [depositModal, setDepositModal] = useState<Goal | null>(null)
  const [depositAmt,   setDepositAmt]   = useState('')
  const [saving,       setSaving]       = useState(false)
  const [depositing,   setDepositing]   = useState(false)
  const [deleting,     setDeleting]     = useState<string | null>(null)
  const [saveError,    setSaveError]    = useState('')
  const [form,         setForm]         = useState<GoalForm>(defaultForm)

  const totalTarget = active.reduce((s, g) => s + g.target_amount, 0)
  const totalSaved  = active.reduce((s, g) => s + g.current_amount, 0)
  const overallPct  = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0

  // ── Form helpers ─────────────────────────────────────────────
  function openCreate() {
    setEditingGoal(null)
    setForm(defaultForm)
    setSaveError('')
    setModalOpen(true)
  }

  function openEdit(g: Goal) {
    setEditingGoal(g)
    setForm({
      name:           g.name,
      target_amount:  String(g.target_amount),
      current_amount: String(g.current_amount),
      target_date:    g.target_date ?? '',
      icon:           g.icon,
      color:          g.color,
      note:           g.note ?? '',
    })
    setSaveError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { setSaveError('กรุณากรอกชื่อเป้าหมาย'); return }
    if (!form.target_amount || Number(form.target_amount) <= 0) { setSaveError('กรุณากรอกจำนวนเป้าหมาย'); return }
    setSaving(true)
    setSaveError('')
    try {
      const input = {
        name:           form.name.trim(),
        target_amount:  Number(form.target_amount),
        current_amount: Number(form.current_amount) || 0,
        target_date:    form.target_date || null,
        icon:           form.icon,
        color:          form.color,
        note:           form.note.trim() || null,
      }
      if (editingGoal) {
        await edit(editingGoal.id, input)
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

  async function handleDeposit() {
    if (!depositModal || !depositAmt || Number(depositAmt) <= 0) return
    setDepositing(true)
    try {
      await deposit(depositModal.id, Number(depositAmt))
      setDepositModal(null)
      setDepositAmt('')
    } catch {
      // silent
    } finally {
      setDepositing(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await remove(id)
      if (editingGoal?.id === id) setModalOpen(false)
    } catch {
      // silent
    } finally {
      setDeleting(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Hero summary ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-6 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {loading
              ? <div className="space-y-2">
                  <div className="h-4 w-40 bg-violet-400/50 rounded animate-pulse" />
                  <div className="h-8 w-36 bg-violet-400/50 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-violet-400/30 rounded animate-pulse" />
                </div>
              : <>
                  <p className="text-sm text-violet-200">เป้าหมายที่กำลังดำเนินการ ({active.length})</p>
                  <p className="text-3xl font-bold tabular-nums mt-1">{formatCurrency(totalSaved)}</p>
                  <p className="text-sm text-violet-200 mt-1">จาก {formatCurrency(totalTarget)} ที่ตั้งเป้าไว้</p>
                </>
            }
          </div>
          <div className="shrink-0">
            <div className="w-36">
              <div className="flex justify-between text-xs text-violet-200 mb-1.5">
                <span>ความคืบหน้ารวม</span>
                <span>{overallPct.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-violet-500/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
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
            {loading ? '...' : `${active.length + completed.length} เป้าหมาย`}
          </h2>
          {!loading && (
            <button onClick={refetch} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> เพิ่มเป้าหมาย
        </Button>
      </div>

      {/* ── Active Goals ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Skeletons */}
        {loading && Array.from({ length: 3 }).map((_, i) => <GoalSkeleton key={i} />)}

        {/* Cards */}
        {!loading && active.map(goal => {
          const Icon = goalIcons[goal.icon] ?? Target
          const pct  = Math.min(goal.progress ?? 0, 100)
          const days = goal.target_date ? getDaysUntil(goal.target_date) : null
          return (
            <Card key={goal.id} hover className="group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ background: goal.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{goal.name}</p>
                    {goal.target_date && (
                      <p className="text-xs text-slate-400">{formatDate(goal.target_date)}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => openEdit(goal)}
                >
                  <span className="text-base leading-none">•••</span>
                </Button>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {formatCurrency(goal.current_amount)}
                  </span>
                  <span className="text-slate-400 tabular-nums">
                    {formatCurrency(goal.target_amount)}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: goal.color }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: goal.color }}>
                    {pct.toFixed(1)}%
                  </span>
                  {days !== null && (
                    <span className={cn('text-xs', days <= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400')}>
                      {days > 0 ? `เหลือ ${days} วัน` : 'ถึงกำหนดแล้ว'}
                    </span>
                  )}
                </div>
              </div>

              {/* Note */}
              {goal.note && (
                <p className="mt-3 text-xs text-slate-400 truncate">{goal.note}</p>
              )}

              {/* Deposit button */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="secondary" size="sm" className="w-full"
                  onClick={() => { setDepositModal(goal); setDepositAmt('') }}
                >
                  <Plus className="h-3.5 w-3.5" /> เพิ่มเงินออม
                </Button>
              </div>
            </Card>
          )
        })}

        {/* Add card button */}
        {!loading && (
          <button
            onClick={openCreate}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-slate-400 hover:border-violet-400 hover:text-violet-500 dark:hover:border-violet-600 dark:hover:text-violet-400 transition-colors min-h-[200px]"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">เพิ่มเป้าหมายใหม่</span>
          </button>
        )}

        {/* Empty state */}
        {!loading && active.length === 0 && completed.length === 0 && !error && (
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
            <Target className="h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">ยังไม่มีเป้าหมาย</p>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> ตั้งเป้าหมายแรก
            </Button>
          </div>
        )}
      </div>

      {/* ── Completed ── */}
      {!loading && completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            สำเร็จแล้ว ({completed.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(goal => {
              const Icon = goalIcons[goal.icon] ?? Target
              return (
                <Card key={goal.id} className="opacity-70 group relative">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: goal.color + '20' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: goal.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{goal.name}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.target_amount)} ✓</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    disabled={deleting === goal.id}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all"
                  >
                    {deleting === goal.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { if (!saving) setModalOpen(false) }}
        title={editingGoal ? 'แก้ไขเป้าหมาย' : 'เพิ่มเป้าหมายใหม่'}
      >
        <div className="space-y-4">
          <Input
            label="ชื่อเป้าหมาย"
            placeholder="เช่น กองทุนฉุกเฉิน, ท่องเที่ยวญี่ปุ่น"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <Input
            label="จำนวนเงินเป้าหมาย (฿)"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={form.target_amount}
            onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))}
            prefix={<span className="text-sm font-semibold">฿</span>}
          />

          <Input
            label="มีอยู่แล้ว (฿)"
            type="number"
            step="1"
            min="0"
            placeholder="0"
            value={form.current_amount}
            onChange={e => setForm(f => ({ ...f, current_amount: e.target.value }))}
            prefix={<span className="text-sm font-semibold">฿</span>}
          />

          <Input
            label="กำหนดสำเร็จ (ถ้ามี)"
            type="date"
            value={form.target_date}
            onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
          />

          {/* Icon picker */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">ไอคอน</label>
            <div className="flex gap-2">
              {GOAL_ICON_OPTIONS.map(ico => {
                const Ico = goalIcons[ico] ?? Target
                return (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon: ico }))}
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center border-2 transition-all',
                      form.icon === ico
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                    )}
                  >
                    <Ico className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">สี</label>
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
            placeholder="รายละเอียดเพิ่มเติม"
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
            {editingGoal && (
              <Button
                variant="danger" size="sm"
                loading={deleting === editingGoal.id}
                disabled={saving}
                onClick={() => handleDelete(editingGoal.id)}
              >
                ลบเป้าหมาย
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                ยกเลิก
              </Button>
              <Button loading={saving} onClick={handleSave}>
                {editingGoal ? 'บันทึกการแก้ไข' : 'เพิ่มเป้าหมาย'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Deposit Modal ── */}
      <Modal
        open={!!depositModal}
        onClose={() => { if (!depositing) { setDepositModal(null); setDepositAmt('') } }}
        title={`เพิ่มเงินออม – ${depositModal?.name ?? ''}`}
        size="sm"
      >
        <div className="space-y-4">
          {depositModal && (
            <>
              {/* Progress preview */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">ยอดปัจจุบัน</span>
                  <span className="font-bold tabular-nums">{formatCurrency(depositModal.current_amount)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">เป้าหมาย</span>
                  <span className="font-bold tabular-nums text-slate-400">{formatCurrency(depositModal.target_amount)}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((depositModal.current_amount / depositModal.target_amount) * 100, 100)}%`,
                      background: depositModal.color,
                    }}
                  />
                </div>
              </div>

              <Input
                label="จำนวนเงินที่ต้องการเพิ่ม (฿)"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                prefix={<span className="text-sm font-semibold">฿</span>}
              />

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => { setDepositModal(null); setDepositAmt('') }}
                  disabled={depositing}
                >
                  ยกเลิก
                </Button>
                <Button loading={depositing} className="flex-1" onClick={handleDeposit}>
                  เพิ่มเงินออม
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
