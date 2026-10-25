import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { ProductForm } from '@/components/admin/product-form'

export default async function NewProductPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  return <ProductForm />
}
