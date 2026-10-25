// app/api/auth/logout/route.ts - Admin Logout Handler

import { NextResponse } from 'next/server'
import { clearAdminSession } from '@/lib/auth'

export async function POST() {
  await clearAdminSession()
  return NextResponse.json({ success: true })
}

export async function GET(request: Request) {
  await clearAdminSession()
  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/admin/login', url.origin))
}
