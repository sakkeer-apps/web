// app/api/auth/login/route.ts - Admin Login Handler

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { setLocalAdminSession } from '@/lib/auth'
import { logAuditEvent } from '@/lib/data'
import { checkRateLimit, hashIp } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const ipH = hashIp(ip)

    // Rate limiting: max 5 login attempts per minute per IP
    const rateCheck = checkRateLimit(`login:${ipH}`, 5, 60)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 60 seconds before trying again.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase is configured, authenticate through Supabase Auth
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error || !data.user) {
        return NextResponse.json({ error: error?.message || 'Invalid email or password.' }, { status: 401 })
      }

      await logAuditEvent('LOGIN_SUCCESS', 'AUTH', data.user.id, { ipHash: ipH }, email)
      return NextResponse.json({ success: true, user: { email: data.user.email, id: data.user.id } })
    }

    // If Supabase is not yet configured, check if OWNER_INITIAL_PASSWORD is set in env for initial setup
    const ownerEmail = process.env.OWNER_EMAIL || 'techsakeer@gmail.com'
    const ownerPass = process.env.OWNER_INITIAL_PASSWORD

    if (ownerPass && email.trim().toLowerCase() === ownerEmail.toLowerCase() && password === ownerPass) {
      await setLocalAdminSession(email.trim())
      await logAuditEvent('LOGIN_SUCCESS_LOCAL', 'AUTH', 'owner-local', { ipHash: ipH }, email)
      return NextResponse.json({ success: true, user: { email, id: 'owner-local' } })
    }

    return NextResponse.json(
      {
        error:
          'Invalid credentials or Supabase not configured. Please run `pnpm run seed:admin` or configure .env.local.',
      },
      { status: 401 }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
