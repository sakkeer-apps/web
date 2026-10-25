import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, Share2, Sparkles, AlertCircle } from 'lucide-react'
import { getArticleBySlug, getArticles, getSiteSettings } from '@/lib/data'
import { renderSanitizedMarkdown } from '@/lib/security'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return { title: 'Article Not Found — Muhammed Sakkeer' }
  }

  return {
    title: `${article.seo_title || article.title} — Muhammed Sakkeer`,
    description: article.seo_description || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  }
}

export async function generateStaticParams() {
  const articles = await getArticles({ publishedOnly: true })
  return articles.map((a) => ({ slug: a.slug }))
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params
  const [article, settings] = await Promise.all([
    getArticleBySlug(slug),
    getSiteSettings(),
  ])

  if (!article || !article.is_published) {
    notFound()
  }

  const sanitizedHtml = article.body_markdown ? renderSanitizedMarkdown(article.body_markdown) : ''

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader settings={settings} />

      <main style={{ flex: 1, paddingBottom: '120px' }}>
        <article className="container" style={{ maxWidth: '820px', paddingTop: '50px' }}>
          {/* Breadcrumb Navigation */}
          <div style={{ marginBottom: '28px' }}>
            <Link
              href="/insights"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#89939d',
                transition: 'color .2s',
              }}
            >
              <ArrowLeft style={{ width: '14px' }} /> Back to all field notes
            </Link>
          </div>

          {/* Article Header */}
          <header style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span className="category-badge" style={{ fontSize: '9px' }}>
                {article.category}
              </span>
              <span style={{ fontSize: '11px', color: '#74808a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar style={{ width: '12px' }} /> {article.published_date_formatted}
              </span>
              <span style={{ fontSize: '11px', color: '#74808a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock style={{ width: '12px' }} /> {article.reading_time_minutes} min read
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(32px, 4.5vw, 52px)',
                lineHeight: 1.1,
                letterSpacing: '-0.05em',
                color: '#eef1f4',
                fontWeight: 700,
                margin: '0 0 20px',
              }}
            >
              {article.title}
            </h1>

            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#b7c2cb',
                margin: '0 0 28px',
                borderLeft: '2px solid #b7ff63',
                paddingLeft: '18px',
              }}
            >
              {article.excerpt}
            </p>

            {/* Author Byline */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 0',
                borderTop: '1px solid #202930',
                borderBottom: '1px solid #202930',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(183, 255, 99, 0.1)',
                  border: '1px solid rgba(183, 255, 99, 0.3)',
                  color: '#b7ff63',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                MS
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#eef1f4' }}>Muhammed Sakkeer</div>
                <div style={{ fontSize: '11px', color: '#77818b' }}>AI Builder & IT Sales Specialist</div>
              </div>
            </div>
          </header>

          {/* Cover Image if present */}
          {article.cover_image_url && (
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                maxHeight: '400px',
                marginBottom: '40px',
                border: '1px solid #283139',
              }}
            >
              <img
                src={article.cover_image_url}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Article Body Content */}
          {sanitizedHtml ? (
            <div
              className="article-content"
              style={{
                color: '#d1d8dc',
                fontSize: '16px',
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <div
              style={{
                padding: '40px 28px',
                background: '#10161b',
                border: '1px solid #2b353e',
                borderRadius: '12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertCircle style={{ width: '28px', height: '28px', color: '#ffbf7b' }} />
              <h3 style={{ margin: 0, fontSize: '18px', color: '#eef1f4' }}>
                Full Field Note in Preparation
              </h3>
              <p style={{ margin: 0, color: '#8d98a2', fontSize: '13px', maxWidth: '480px', lineHeight: 1.6 }}>
                The complete editorial body for this insight is currently undergoing final review. Check back soon or reach out directly to discuss this thesis.
              </p>
              <Link
                href="/#contact"
                className="primary-button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginTop: '12px',
                }}
              >
                Discuss with author →
              </Link>
            </div>
          )}
        </article>
      </main>

      <PublicFooter settings={settings} />
    </div>
  )
}
