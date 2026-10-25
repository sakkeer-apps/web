import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Sparkles, Calendar, Clock, ChevronRight } from 'lucide-react'
import { getArticles, getSiteSettings } from '@/lib/data'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'

export const metadata: Metadata = {
  title: 'Field Notes & Insights — Muhammed Sakkeer',
  description: 'Perspectives on artificial intelligence, enterprise revenue architecture, and human systems.',
}

export default async function InsightsListingPage() {
  const [articles, settings] = await Promise.all([
    getArticles({ publishedOnly: true }),
    getSiteSettings(),
  ])

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader settings={settings} />

      <main style={{ flex: 1, paddingBottom: '100px' }}>
        {/* Hero Banner */}
        <section className="container" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
          <div style={{ marginBottom: '24px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#89939d',
                transition: 'color .2s',
              }}
            >
              <ArrowLeft style={{ width: '14px' }} /> Return to portfolio
            </Link>
          </div>

          <div className="section-label" style={{ marginBottom: '12px' }}>
            <span className="section-dot" /> {settings.insights_section_label}
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.06em',
              margin: '0 0 16px',
              fontWeight: 700,
              color: '#eef1f4',
            }}
          >
            {settings.insights_title} <em>{settings.insights_title_accent}</em>
          </h1>

          <p style={{ maxWidth: '560px', color: '#9ba4ac', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
            {settings.insights_description}
          </p>
        </section>

        {/* Articles List */}
        <section className="container">
          <div className="article-list" style={{ borderTop: '1px solid #2a343c' }}>
            {articles.map((article, index) => (
              <Link
                key={article.slug}
                href={`/insights/${article.slug}`}
                className="article-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 220px 25px',
                  gap: '20px',
                  alignItems: 'center',
                  padding: '28px 0',
                  borderBottom: '1px solid #2a343c',
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'background .15s',
                }}
              >
                <span className="article-number" style={{ color: '#b7ff63', fontFamily: 'monospace', fontSize: '12px' }}>
                  0{index + 1}
                </span>

                <div className="article-main">
                  <span className="article-category" style={{ color: '#7d8992', fontSize: '9px', letterSpacing: '.13em', textTransform: 'uppercase' }}>
                    {article.category}
                  </span>
                  <h2 style={{ margin: '8px 0 6px', fontSize: '20px', letterSpacing: '-0.04em', fontWeight: 500, color: '#eef1f4' }}>
                    {article.title}
                  </h2>
                  <p style={{ margin: 0, color: '#89939c', fontSize: '13px', lineHeight: 1.5, maxWidth: '640px' }}>
                    {article.excerpt}
                  </p>
                </div>

                <div className="article-details" style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#74808a', fontSize: '11px' }}>
                  <span>{article.published_date_formatted}</span>
                  <span>{article.reading_time_minutes} min read</span>
                </div>

                <ArrowUpRight className="article-arrow" style={{ color: '#84909a', width: '16px' }} />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter settings={settings} />
    </div>
  )
}
