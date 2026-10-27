import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getSiteSettings } from '@/lib/data'
import { ContentEditor } from '@/components/admin/content-editor'

export default async function AdminContentPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login?next=/admin/content')

  const settings = await getSiteSettings()

  return (
    <Suspense fallback={<div style={{ color: '#89939d', padding: '24px' }}>Loading website content editor...</div>}>
      <ContentEditor initialSettings={settings} />
    </Suspense>
  )
}
