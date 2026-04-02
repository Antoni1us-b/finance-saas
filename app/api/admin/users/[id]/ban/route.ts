import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/users/[id]/ban
 * Body: { ban: boolean }
 *
 * Toggles is_banned on the target user's profile.
 * Also calls Supabase's auth admin ban to invalidate their active sessions.
 *
 * Safety checks:
 *  - Cannot ban yourself
 *  - Cannot ban another admin
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await requireAdmin()
    const { id: targetId } = await params
    const body = await req.json().catch(() => ({}))
    const ban: boolean = body.ban ?? true

    // Prevent self-ban
    if (caller.id === targetId) {
      return NextResponse.json(
        { error: 'ไม่สามารถระงับบัญชีของตัวเองได้' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Prevent banning another admin
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', targetId)
      .single()

    if (targetProfile?.role === 'admin') {
      return NextResponse.json(
        { error: 'ไม่สามารถระงับบัญชี admin — ถอน admin role ก่อน' },
        { status: 400 }
      )
    }

    // 1. Update profile is_banned flag
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ is_banned: ban })
      .eq('id', targetId)

    if (profileError) throw profileError

    // 2. Sync with Supabase Auth ban (invalidates JWT sessions)
    const { error: authError } = await adminClient.auth.admin.updateUserById(targetId, {
      ban_duration: ban ? '876600h' : 'none', // ~100 years or remove ban
    })
    if (authError) {
      // Non-fatal: profile is updated, auth ban is best-effort
      console.warn('Auth ban update failed (non-fatal):', authError.message)
    }

    return NextResponse.json({
      success: true,
      is_banned: ban,
      message: ban
        ? `ระงับบัญชี ${targetProfile?.full_name ?? targetId} เรียบร้อย`
        : `ยกเลิกการระงับบัญชี ${targetProfile?.full_name ?? targetId} เรียบร้อย`,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    )
  }
}
