import { MetadataRoute } from 'next'
import { getArticles, getSiteSettings } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, articles] = await Promise.all([
    getSiteSettings(),
    getArticles({ publishedOnly: true }),
  ])

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${settings.primary_domain || 'muhammedsakkeer.com'}`

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/insights/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...articleRoutes]
}
