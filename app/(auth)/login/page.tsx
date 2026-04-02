'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
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

          {/* Demo shortcut */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            ทดลองใช้งาน (Demo)
          </Button>
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
