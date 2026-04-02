import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/admin/users/[id]
 * Permanently deletes a user from auth.users.
 * Cascade deletes handle: profiles → accounts → transactions → goals → subscriptions.
 *
 * Safety checks:
 *  - Cannot delete yourself (prevents accidental self-deletion)
 *  - Cannot delete other admins (prevents privilege escalation)
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await requireAdmin()
    const { id: targetId } = await params

    // Prevent self-deletion
    if (caller.id === targetId) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบบัญชีของตัวเองได้' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Prevent deleting another admin
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', targetId)
      .single()

    if (targetProfile?.role === 'admin') {
      return NextResponse.json(
        { error: 'ไม่สามารถลบผู้ดูแลระบบได้ — ถอน admin role ก่อน' },
        { status: 400 }
      )
    }

    // Delete from auth.users — cascades to profiles + all user data
    const { error } = await adminClient.auth.admin.deleteUser(targetId)
    if (error) throw error

    return NextResponse.json({
      success: true,
      message: `ลบผู้ใช้ ${targetProfile?.full_name ?? targetId} เรียบร้อย`,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    )
  }
}
