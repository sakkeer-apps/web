import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getMediaHighlights } from '@/lib/data'
import { MediaSectionEditor } from '@/components/admin/media-section-editor'

export default async function AdminMediaSectionPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const highlights = await getMediaHighlights({ publishedOnly: false })

  return <MediaSectionEditor initialHighlights={highlights} />
}
