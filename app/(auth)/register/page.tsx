'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">สมัครสมาชิกสำเร็จ!</h2>
          <p className="text-slate-500 text-sm mt-2">กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ</p>
          <Button className="mt-6 w-full" onClick={() => router.push('/login')}>ไปยังหน้าเข้าสู่ระบบ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-200 mb-4">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">สร้างบัญชีใหม่</h1>
          <p className="text-sm text-slate-500 mt-1">เริ่มต้นจัดการการเงินของคุณ</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="ชื่อ-นามสกุล"
              placeholder="สมชาย ใจดี"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <Input
              label="อีเมล"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              สมัครสมาชิก
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          มีบัญชีแล้ว?{' '}
          <Link href="/login" className="text-brand-600 font-medium hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
