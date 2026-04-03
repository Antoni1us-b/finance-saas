import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const DEMO_EMAIL    = 'demo@finflow.com'
const DEMO_PASSWORD = 'demo1234'
const DEMO_NAME     = 'Demo User'

/**
 * POST /api/demo/ensure-account
 *
 * Ensures the demo account exists in auth.users + public.profiles.
 * Uses the service-role client so it works before the user is logged in.
 * Idempotent — safe to call repeatedly.
 */
export async function POST() {
  try {
    const admin = createAdminClient()

    // ── 1. Check if the demo user already exists ─────────────
    const { data: existingUsers } = await admin.auth.admin.listUsers()
    const existing = existingUsers?.users?.find(u => u.email === DEMO_EMAIL)

    if (existing) {
      // Make sure password is up-to-date (in case it was changed)
      await admin.auth.admin.updateUserById(existing.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      })
      return NextResponse.json({ ok: true, message: 'Demo account ready' })
    }

    // ── 2. Create the demo user ──────────────────────────────
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: DEMO_NAME },
    })

    if (createError) throw createError

    // ── 3. Ensure profile row exists ─────────────────────────
    // The DB trigger should create it, but upsert to be safe
    if (newUser?.user) {
      await admin.from('profiles').upsert({
        id: newUser.user.id,
        email: DEMO_EMAIL,
        full_name: DEMO_NAME,
        role: 'user',
        is_banned: false,
        currency: 'THB',
      }, { onConflict: 'id' })
    }

    return NextResponse.json({ ok: true, message: 'Demo account created' })
  } catch (e: any) {
    console.error('Demo ensure-account error:', e)
    return NextResponse.json(
      { error: e.message ?? 'Failed to create demo account' },
      { status: 500 },
    )
  }
}
