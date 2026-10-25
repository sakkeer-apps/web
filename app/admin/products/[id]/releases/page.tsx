import { redirect, notFound } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getProductById, getReleases } from '@/lib/data'
import { ReleasesManager } from '@/components/admin/releases-manager'

interface ProductReleasesPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductReleasesPage({ params }: ProductReleasesPageProps) {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  const releases = await getReleases(id)

  return <ReleasesManager product={product} releases={releases} />
}
