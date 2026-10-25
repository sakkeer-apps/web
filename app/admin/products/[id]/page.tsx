import { redirect, notFound } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getProductById } from '@/lib/data'
import { ProductForm } from '@/components/admin/product-form'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return <ProductForm initialData={product} />
}
