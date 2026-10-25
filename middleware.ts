// middleware.ts - Route protection, security headers, and domain redirection

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl
  const response = NextResponse.next()

  // 1. Security Headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 2. Secondary Domain Permanent Redirect
  // If request arrives on a configured secondary alias domain, 301 redirect to primary site
  const secondaryDomain = process.env.SECONDARY_DOMAIN
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (secondaryDomain && siteUrl && host.toLowerCase().includes(secondaryDomain.toLowerCase())) {
    try {
      const primaryUrl = new URL(siteUrl)
      if (host.toLowerCase() !== primaryUrl.host.toLowerCase()) {
        const redirectUrl = new URL(pathname + request.nextUrl.search, primaryUrl.origin)
        return NextResponse.redirect(redirectUrl, { status: 301 })
      }
    } catch {}
  }

  // 3. Admin Authentication Guard
  if (pathname.startsWith('/admin')) {
    // Exempt login and reset password paths
    if (
      pathname === '/admin/login' ||
      pathname.startsWith('/admin/reset-password')
    ) {
      return response
    }

    // Check for Supabase session cookie or local admin session cookie
    const hasSupabaseCookie = request.cookies
      .getAll()
      .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))
    const hasLocalSession = request.cookies.has('ms_admin_session')

    if (!hasSupabaseCookie && !hasLocalSession) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
