import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { MediaLibrary } from '@/components/admin/media-library'
import { MediaAsset } from '@/types'

export default async function AdminMediaPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  let initialAssets: MediaAsset[] = []
  const adminClient = createAdminClient()

  if (adminClient) {
    try {
      const { data } = await adminClient
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) initialAssets = data
    } catch {}
  }

  return <MediaLibrary initialAssets={initialAssets} />
}
