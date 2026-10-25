import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getSiteSettings } from '@/lib/data'
import { ContentEditor } from '@/components/admin/content-editor'

export default async function AdminContentPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const settings = await getSiteSettings()

  return <ContentEditor initialSettings={settings} />
}
