import { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/data'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${settings.primary_domain || 'muhammedsakkeer.com'}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
