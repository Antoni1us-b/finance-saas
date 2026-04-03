import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Middleware รันที่ Edge (ไม่นับ Serverless Function invocation)
 * → ป้องกัน protected routes และ refresh session อัตโนมัติ
 * → ตรวจสอบ is_banned — redirect ไป /banned ถ้า account ถูกระงับ
 * → ป้องกัน /admin/* — เฉพาะ admin role เท่านั้น
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Public routes — skip Supabase call entirely ────────────
  // Landing page, API health, demo provisioning, /banned need no auth check.
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/api/demo') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/banned')

  if (isPublicRoute) {
    return NextResponse.next({ request })
  }

  // ── Create Supabase client for session refresh ─────────────
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ✅ refresh session ก่อนตรวจสอบ (สำคัญมาก)
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage      = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isBannedPage    = pathname.startsWith('/banned')
  const isAdminRoute    = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  const isProtectedPage = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/accounts')   ||
                          pathname.startsWith('/transactions') ||
                          pathname.startsWith('/subscriptions') ||
                          pathname.startsWith('/goals')       ||
                          pathname.startsWith('/settings')   ||
                          isAdminRoute

  // ── Not logged in → redirect to /login ───────────────────
  if (isProtectedPage && !user) {
    // Skip redirect in demo mode (no Supabase configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (user) {
    // ── Check profile status (ban + role) for authenticated users ──
    // Only fetch for protected pages to avoid DB call on public routes
    if (isProtectedPage && !isBannedPage) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', user.id)
        .single()

      // Banned user → send to /banned (allow /banned page itself)
      if (profile?.is_banned) {
        return NextResponse.redirect(new URL('/banned', request.url))
      }

      // Admin-only routes — check role
      if (isAdminRoute && profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // ── Banned page is accessible to logged-in banned users ──
    // (they need to be able to log out from /banned)

    // ── Logged in, trying to access auth page → redirect to dashboard ──
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // ตรวจเฉพาะ routes ที่จำเป็น ไม่ตรวจ static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
