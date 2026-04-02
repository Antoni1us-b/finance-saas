import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ตรวจสอบสิทธิ์ admin
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ดึงสถิติจาก view
  const { data: stats, error } = await supabase
    .from('admin_system_stats').select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ดึง user list
  const { data: users } = await supabase
    .from('admin_user_summary').select('*').limit(50)

  return NextResponse.json({ stats, users: users ?? [] })
}
