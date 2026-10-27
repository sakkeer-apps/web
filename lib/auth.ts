// lib/auth.ts - Admin authentication and session management

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export interface AdminUser {
  id: string
  email: string
  role: 'owner' | 'admin'
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

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

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user || !user.email) {
      return null
    }

    // Server-controlled owner authorization:
    // Requires role: 'owner' in protected app_metadata (cannot be modified by client SDK).
    // Matches the database is_owner() policy.
    if (user.app_metadata?.role !== 'owner') {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: 'owner',
    }
  } catch (err) {
    console.error('Error verifying Supabase user session:', err)
    return null
  }
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
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
