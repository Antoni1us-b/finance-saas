/**
 * Supabase Admin Client — Server-Side Only
 *
 * Uses the SERVICE_ROLE_KEY which bypasses all RLS policies.
 * ⚠️  NEVER import this in client components or expose to the browser.
 * ⚠️  Only use inside API routes (app/api/...) or server-side code.
 */
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Add SUPABASE_SERVICE_ROLE_KEY to your .env.local and Vercel environment variables.'
    )
  }

  return createClient(url, key, {
    auth: {
      // Disable session management — admin client is stateless
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Verify the incoming request is from an authenticated admin user.
 * Uses the regular SSR client (user's JWT) so the RLS admin check is untampered.
 *
 * Returns the verified user object, or throws if not authenticated / not admin.
 */
export async function requireAdmin() {
  const { createClient: createServerClient } = await import('./server')
  const supabase = await createServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    const err = new Error('Unauthorized') as Error & { status: number }
    err.status = 401
    throw err
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_banned')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    const err = new Error('Forbidden: admin only') as Error & { status: number }
    err.status = 403
    throw err
  }

  return user
}
