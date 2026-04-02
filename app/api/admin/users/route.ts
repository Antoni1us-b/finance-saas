import { createAdminClient, requireAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/users
 * List all users (auth.users + profiles merged).
 * Requires: authenticated admin session.
 */
export async function GET() {
  try {
    await requireAdmin()

    const adminClient = createAdminClient()

    // Fetch auth users (email, created_at, last_sign_in, confirmed status)
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    if (authError) throw authError

    // Fetch all profiles (role, is_banned, stats)
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select(`
        id, full_name, role, currency, is_banned, created_at,
        accounts:accounts(count),
        transactions:transactions(count)
      `)
    if (profilesError) throw profilesError

    // Build a profile lookup map
    const profileMap = new Map(
      (profiles ?? []).map((p: any) => [p.id, p])
    )

    // Merge auth users with profiles
    const users = (authData?.users ?? []).map((u: any) => {
      const profile = profileMap.get(u.id) as any
      return {
        id:                 u.id,
        email:              u.email ?? '—',
        full_name:          profile?.full_name ?? null,
        role:               profile?.role       ?? 'user',
        is_banned:          profile?.is_banned  ?? false,
        currency:           profile?.currency   ?? 'THB',
        created_at:         u.created_at,
        last_sign_in_at:    u.last_sign_in_at   ?? null,
        email_confirmed_at: u.email_confirmed_at ?? null,
        accounts_count:     profile?.accounts?.[0]?.count     ?? 0,
        tx_count:           profile?.transactions?.[0]?.count ?? 0,
      }
    })

    // Sort: admins first, then by created_at desc
    users.sort((a: any, b: any) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1
      if (b.role === 'admin' && a.role !== 'admin') return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({ users })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    )
  }
}
