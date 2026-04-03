'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const DEMO_EMAIL    = 'demo@finflow.com'
const DEMO_PASSWORD = 'demo1234'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError]         = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  async function handleDemoLogin() {
    setDemoLoading(true)
    setError('')
    try {
      const supabase = createClient()

      // Ensure demo account exists (creates if missing, idempotent)
      await fetch('/api/demo/ensure-account', { method: 'POST' })

      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'ไม่สามารถเข้าสู่ระบบ Demo ได้ กรุณาลองใหม่')
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-200 mb-4">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">ยินดีต้อนรับกลับ</h1>
          <p className="text-sm text-slate-500 mt-1">เข้าสู่ระบบ FinFlow</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              เข้าสู่ระบบ
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">หรือ</span>
            </div>
          </div>

          {/* Demo shortcut — actually signs in with demo credentials */}
          <Button
            variant="outline"
            className="w-full gap-2"
            loading={demoLoading}
            onClick={handleDemoLogin}
          >
            <Play className="h-4 w-4" />
            ทดลองใช้งาน (Demo)
          </Button>

          <p className="text-center text-[11px] text-slate-400 mt-2">
            demo@finflow.com / demo1234
          </p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          ยังไม่มีบัญชี?{' '}
          <Link href="/register" className="text-brand-600 font-medium hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}
