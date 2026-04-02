import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/demo/seed
 * ใส่ข้อมูลจำลองสำหรับ user ที่ login อยู่
 * เรียกได้ครั้งเดียว — ถ้ามีข้อมูลแล้วจะ return error
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // เรียก DB function ที่ seed ข้อมูล
    const { error } = await supabase.rpc('seed_demo_data', {
      target_user_id: user.id,
    })

    if (error) {
      // ถ้ามีข้อมูลแล้ว ไม่ถือเป็น error ร้ายแรง
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'Demo data already exists', code: 'ALREADY_SEEDED' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, message: 'Demo data created successfully' })
  } catch (e: any) {
    console.error('Seed demo error:', e)
    return NextResponse.json(
      { error: e.message ?? 'Seed failed' },
      { status: 500 }
    )
  }
}
