import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getSiteSettings } from '@/lib/data'
import { DomainManager } from '@/components/admin/domain-manager'

export default async function AdminDomainsPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const settings = await getSiteSettings()

  return <DomainManager settings={settings} />
}
