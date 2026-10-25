import { getSiteSettings, getProducts, getArticles, getMediaHighlights } from '@/lib/data'
import { PortfolioPortal } from '@/components/portfolio-portal'

export const revalidate = 60 // Revalidate cache periodically

export default async function Page() {
  const [settings, products, articles, mediaHighlights] = await Promise.all([
    getSiteSettings(),
    getProducts({ status: 'published' }),
    getArticles({ publishedOnly: true }),
    getMediaHighlights(),
  ])

  return (
    <PortfolioPortal
      settings={settings}
      initialProducts={products}
      initialArticles={articles}
      initialMediaHighlights={mediaHighlights}
    />
  )
}
