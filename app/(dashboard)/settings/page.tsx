'use client'

import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle2, LogOut, Moon, Palette, Sun, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const CURRENCIES = ['THB','USD','EUR','JPY','SGD','GBP','CNY','AUD']
const LOCALES    = [
  { value: 'th-TH', label: 'ภาษาไทย' },
  { value: 'en-US', label: 'English (US)' },
]

export default function SettingsPage() {
  const router  = useRouter()
  const [user,     setUser]     = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [currency, setCurrency] = useState('THB')
  const [locale,   setLocale]   = useState('th-TH')
  const [dark,     setDark]     = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [status,   setStatus]   = useState<'idle'|'success'|'error'>('idle')
  const [errMsg,   setErrMsg]   = useState('')

  // Load user & profile
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      setUser(data.user)

      supabase
        .from('profiles')
        .select('full_name, currency, locale')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            setFullName(profile.full_name ?? '')
            setCurrency(profile.currency ?? 'THB')
            setLocale(profile.locale ?? 'th-TH')
          }
        })
    })

    const saved = localStorage.getItem('theme')
    setDark(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches))
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setStatus('idle')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, currency, locale, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      setErrMsg(error.message)
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    }
    setSaving(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <CardTitle>โปรไฟล์</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold shadow">
              {fullName ? fullName.slice(0, 1).toUpperCase() : (user?.email?.slice(0, 1).toUpperCase() ?? '?')}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{fullName || '(ยังไม่ได้ตั้งชื่อ)'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <Input
            label="ชื่อ-นามสกุล"
            placeholder="สมชาย ใจดี"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select label="สกุลเงินหลัก" value={currency} onChange={e => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="ภาษา / Locale" value={locale} onChange={e => setLocale(e.target.value)}>
              {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </Select>
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300">บันทึกเรียบร้อยแล้ว</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-300">{errMsg}</p>
            </div>
          )}

          <Button loading={saving} onClick={handleSave}>บันทึกการเปลี่ยนแปลง</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-slate-400" />
            <CardTitle>ธีมและการแสดงผล</CardTitle>
          </div>
        </CardHeader>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
            <p className="text-xs text-slate-400 mt-0.5">สลับระหว่างธีมสว่างและมืด</p>
          </div>
          <button
            onClick={toggleDark}
            className={`relative h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none ${dark ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 flex items-center justify-center ${dark ? 'translate-x-5' : 'translate-x-0'}`}>
              {dark
                ? <Moon className="h-3 w-3 text-brand-600" />
                : <Sun className="h-3 w-3 text-amber-500" />
              }
            </span>
          </button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-slate-400" />
            <CardTitle>บัญชี</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">ออกจากระบบ</p>
              <p className="text-xs text-slate-400 mt-0.5">ออกจากบัญชีในอุปกรณ์นี้</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> ออกจากระบบ
            </Button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rose-600">ลบบัญชี</p>
                <p className="text-xs text-slate-400 mt-0.5">ลบข้อมูลทั้งหมดอย่างถาวร ไม่สามารถกู้คืนได้</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => alert('โปรดติดต่อ support เพื่อลบบัญชี')}>
                ลบบัญชี
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* App info */}
      <p className="text-center text-xs text-slate-400 pb-4">
        FinFlow v0.1.0 · Built with Next.js + Supabase
      </p>
    </div>
  )
}
