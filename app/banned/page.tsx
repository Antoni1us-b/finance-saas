'use client'

import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, LogOut } from 'lucide-react'

export default function BannedPage() {
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto h-20 w-20 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center mb-6 shadow-sm">
          <AlertTriangle className="h-10 w-10 text-rose-600 dark:text-rose-400" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          บัญชีถูกระงับการใช้งาน
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          บัญชีของคุณถูกระงับโดยผู้ดูแลระบบ
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
          หากคิดว่าเป็นความผิดพลาด กรุณาติดต่อ{' '}
          <a
            href="mailto:support@finflow.app"
            className="text-brand-600 dark:text-brand-400 underline underline-offset-2"
          >
            support@finflow.app
          </a>
        </p>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  )
}
