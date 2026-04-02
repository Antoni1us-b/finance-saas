import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Middleware รันที่ Edge (ไม่นับ Serverless Function invocation)
 * → ป้องกัน protected routes และ refresh session อัตโนมัติ
 * → ลด round-trip ไม่ต้องเรียก API แยกเพื่อตรวจสอบ auth
 */
export async function middleware(request: NextRequest) {
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

  const { pathname } = request.nextUrl
  const isAuthPage      = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedPage = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/accounts')  ||
                          pathname.startsWith('/transactions') ||
                          pathname.startsWith('/subscriptions') ||
                          pathname.startsWith('/goals') ||
                          pathname.startsWith('/settings')

  // ไม่ได้ login → redirect ไป login (ยกเว้น demo mode ที่ไม่มี Supabase)
  if (isProtectedPage && !user && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // login แล้ว พยายามเข้า auth page → redirect ไป dashboard
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // ตรวจเฉพาะ routes ที่จำเป็น ไม่ตรวจ static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
