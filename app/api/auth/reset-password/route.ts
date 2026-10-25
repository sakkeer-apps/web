// app/api/auth/reset-password/route.ts - Password Reset Handler

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit, hashIp } from '@/lib/security'
import { logAuditEvent } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const ipH = hashIp(ip)

    const rateCheck = checkRateLimit(`reset:${ipH}`, 3, 300)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many reset requests. Please wait a few minutes.' }, { status: 429 })
    }

    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      })

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${siteUrl}/admin/reset-password/confirm`,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      await logAuditEvent('PASSWORD_RESET_REQUESTED', 'AUTH', email, { ipHash: ipH }, email)
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email address, password reset instructions have been dispatched.',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Reset failed.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
