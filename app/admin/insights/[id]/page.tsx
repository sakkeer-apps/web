import { redirect, notFound } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getArticles } from '@/lib/data'
import { ArticleForm } from '@/components/admin/article-form'

interface EditInsightPageProps {
  params: Promise<{ id: string }>
}

export default async function EditInsightPage({ params }: EditInsightPageProps) {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const { id } = await params
  const articles = await getArticles({ publishedOnly: false })
  const article = articles.find((a) => a.id === id)

  if (!article) {
    notFound()
  }

  return <ArticleForm initialData={article} />
}
