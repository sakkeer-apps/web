import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getProductById } from '@/lib/data'
import { ProductForm } from '@/components/admin/product-form'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login?next=/admin/products')

  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <Suspense fallback={<div style={{ color: '#89939d', padding: '24px' }}>Loading product editor...</div>}>
      <ProductForm initialData={product} />
    </Suspense>
  )
}
