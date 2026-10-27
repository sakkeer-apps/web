import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login?next=/admin/products/new')

  return (
    <Suspense fallback={<div style={{ color: '#89939d', padding: '24px' }}>Loading product editor...</div>}>
      <ProductForm />
    </Suspense>
  )
}
