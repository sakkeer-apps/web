// app/api/auth/login/route.ts - Admin Login Handler

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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

      // Enforce owner authorization check:
      // Valid Supabase login alone must NOT grant owner privileges.
      // Requires role: 'owner' in protected app_metadata to match database is_owner() policy.
      if (data.user.app_metadata?.role !== 'owner') {
        // Sign out immediately and clear cookies
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: 'Access denied: This account does not possess owner administration privileges.' },
          { status: 403 }
        )
      }

      await logAuditEvent('LOGIN_SUCCESS', 'AUTH', data.user.id, { ipHash: ipH }, email)
      return NextResponse.json({ success: true, user: { email: data.user.email, id: data.user.id } })
    }

    return NextResponse.json(
      {
        error: 'Database authentication service is not configured. Please check NEXT_PUBLIC_SUPABASE_URL and anon key.',
      },
      { status: 500 }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
