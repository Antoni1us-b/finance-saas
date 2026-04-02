import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * POST /api/admin/users/[id]/reset-password
 *
 * Sends a password reset email to the target user via Supabase Auth.
 * Uses admin.generateLink to create a recovery link (bypasses rate limits).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id: targetId } = await params

    const adminClient = createAdminClient()

    // Look up the user's email
    const { data: { user: targetUser }, error: userError } =
      await adminClient.auth.admin.getUserById(targetId)

    if (userError || !targetUser?.email) {
      return NextResponse.json(
        { error: 'ไม่พบผู้ใช้หรือไม่มีอีเมล' },
        { status: 404 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      ?? process.env.VERCEL_URL
      ?? 'http://localhost:3000'

    // Generate a password recovery link (admin-scoped, no rate limits)
    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: targetUser.email,
        options: {
          redirectTo: `${siteUrl}/login`,
        },
      })

    if (linkError) throw linkError

    // The link is generated — in production you'd send it via your own email
    // provider. For Supabase-hosted email, use resetPasswordForEmail instead:
    const { error: emailError } = await adminClient.auth.resetPasswordForEmail(
      targetUser.email,
      { redirectTo: `${siteUrl}/login` }
    )

    if (emailError) {
      // Fall back: return the generated link for manual use
      return NextResponse.json({
        success: true,
        method: 'link_only',
        message: `ส่งอีเมลไม่ได้ — ใช้ลิงก์นี้แทน`,
        reset_link: linkData?.properties?.action_link,
      })
    }

    return NextResponse.json({
      success: true,
      method: 'email_sent',
      message: `ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง ${targetUser.email} แล้ว`,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    )
  }
}
