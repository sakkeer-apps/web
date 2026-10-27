import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { ArticleForm } from '@/components/admin/article-form'

export default async function NewInsightPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login?next=/admin/insights/new')

  return <ArticleForm />
}
