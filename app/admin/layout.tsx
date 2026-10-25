import type { Metadata } from 'next'
import { getCurrentAdminUser } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'

export const metadata: Metadata = {
  title: 'Owner Portal — Muhammed Sakkeer',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentAdminUser()

  if (!user) {
    return <>{children}</>
  }

  return <AdminShell userEmail={user.email}>{children}</AdminShell>
}
