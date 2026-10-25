// lib/auth.ts - Admin authentication and session management

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export interface AdminUser {
  id: string
  email: string
  role: 'owner' | 'admin'
}

// Cookie name for fallback local session if Supabase is in setup mode
const LOCAL_SESSION_COOKIE = 'ms_admin_session'

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is configured, use official Supabase Auth session
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {}
          },
        },
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        return {
          id: user.id,
          email: user.email,
          role: 'owner',
        }
      }
    } catch (err) {
      console.error('Error verifying Supabase user session:', err)
    }
  }

  // Fallback: If in local development and admin session cookie exists
  const localSession = cookieStore.get(LOCAL_SESSION_COOKIE)?.value
  if (localSession) {
    try {
      const parsed = JSON.parse(Buffer.from(localSession, 'base64').toString('utf8'))
      if (parsed.email && parsed.exp > Date.now()) {
        return {
          id: parsed.id || 'owner-local',
          email: parsed.email,
          role: 'owner',
        }
      }
    } catch {}
  }

  return null
}

export async function setLocalAdminSession(email: string): Promise<void> {
  const cookieStore = await cookies()
  const payload = JSON.stringify({
    id: 'owner-local',
    email,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  cookieStore.set(LOCAL_SESSION_COOKIE, Buffer.from(payload).toString('base64'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(LOCAL_SESSION_COOKIE)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {}
          },
        },
      })
      await supabase.auth.signOut()
    } catch {}
  }
}
