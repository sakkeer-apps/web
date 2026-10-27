'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  ChevronRight,
  CirclePlay,
  Code2,
  Download,
  ExternalLink,
  Globe,
  Laptop,
  Menu,
  Play,
  Send,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteSettings, Product, Article, MediaHighlight, AppCategory } from '@/types'
import { ProductModal } from '@/components/product-modal'
import { VideoModal } from '@/components/video-modal'
import { ContactModal } from '@/components/contact-modal'
import { PublicFooter } from '@/components/public-footer'

interface PortfolioPortalProps {
  settings: SiteSettings
  initialProducts: Product[]
  initialArticles: Article[]
  initialMediaHighlights: MediaHighlight[]
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-label">
      <span className="section-dot" />
      {children}
    </div>
  )
}

export function PortfolioPortal({
  settings,
  initialProducts,
  initialArticles,
  initialMediaHighlights,
}: PortfolioPortalProps) {
  const [activeCategory, setActiveCategory] = useState<AppCategory>('All')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<MediaHighlight | null>(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)

  const featuredMedia = useMemo(() => {
    const published = initialMediaHighlights.filter((m) => m.is_published !== false)
    return published.find((m) => m.is_featured) || published[0] || null
  }, [initialMediaHighlights])

  const galleryVideos = useMemo(() => {
    const published = initialMediaHighlights.filter((m) => m.is_published !== false)
    return published.filter((m) => m.id !== featuredMedia?.id)
  }, [initialMediaHighlights, featuredMedia])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return initialProducts
    return initialProducts.filter((product) => product.category === activeCategory)
  }, [activeCategory, initialProducts])



  return (
    <main className="site-shell">
      {/* Site Header */}
      <header className="site-header">
        <a className="brand" href="#top" aria-label={`${settings.brand_name} home`}>
          <span className="brand-mark">
            <Sparkles />
          </span>
          <span>{settings.brand_name}</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#top">Home</a>
          <a href="#applications">Applications</a>
          <a href="#articles">Articles</a>
          <a href="#media">Media</a>
          <a href="#contact">About / Contact</a>
        </nav>

        <div className="header-actions">
          {settings.availability_badge_active && (
            <a className="availability" href="#contact">
              <span />
              {settings.availability_badge_text}
            </a>
          )}

          <Button
            className="menu-button"
            variant="outline"
            size="icon"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#top" onClick={() => setMobileOpen(false)}>
            Home
          </a>
          <a href="#applications" onClick={() => setMobileOpen(false)}>
            Applications
          </a>
          <a href="#articles" onClick={() => setMobileOpen(false)}>
            Articles
          </a>
          <a href="#media" onClick={() => setMobileOpen(false)}>
            Media
          </a>
          <a href="#contact" onClick={() => setMobileOpen(false)}>
            About / Contact
          </a>
        </nav>
      )}

      {/* Hero Section */}
      <section className="hero container" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            {settings.hero_eyebrow || 'AI APP BUILDER & IT ENTERPRISE SALES SPECIALIST'}
          </div>

          <h1>
            {settings.hero_title_line1} <em>{settings.hero_title_accent}</em>
            <br />
            <span className="outline-text">{settings.hero_title_line2}</span>{' '}
            <span className="dot-accent">{settings.hero_title_dot}</span>
          </h1>

          <p className="hero-description">{settings.hero_description}</p>

          <div className="hero-actions" style={{ flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            <Button
              size="lg"
              className="primary-button"
              onClick={() => (document.getElementById('applications') || document.getElementById('work'))?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Applications <ChevronRight data-icon="inline-end" />
            </Button>
            <button
              className="text-link"
              onClick={() => setContactModalOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {settings.hero_secondary_cta_text} <ArrowUpRight />
            </button>
            <a
              href="#articles"
              style={{
                fontSize: '12px',
                color: '#7b8791',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: '8px',
              }}
            >
              Latest Articles ↓
            </a>
          </div>

          {/* Hero Statistics */}
          <div className="hero-stats">
            {settings.hero_stats.map((stat, idx) => (
              <div key={idx}>
                <strong>
                  {stat.value}
                  <span>{stat.suffix}</span>
                </strong>
                <small>{stat.label}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual Card with Orbits & Terminal Window */}
        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-card">
            <div className="card-topline">
              <span className="live-pill">
                <span />
                LIVE SYSTEM
              </span>
              <span>v2.4.1</span>
            </div>
            <div className="terminal-window">
              <div className="terminal-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="terminal-code">
                <span className="code-muted">01</span>
                <span className="code-purple">const</span> <span className="code-blue">signal</span>{' '}
                <span className="code-white">=</span> <span className="code-green">await</span>
                <br />
                <span className="code-muted">02</span>
                <span className="code-white indent">AI.analyze</span>
                <span className="code-white">(</span>
                <span className="code-orange">revenue</span>
                <span className="code-white">)</span>
                <br />
                <span className="code-muted">03</span>
                <span className="code-purple">return</span> <span className="code-blue">insight</span>
                <span className="code-white">.</span>
                <span className="code-green">nextMove</span>
                <span className="code-white">()</span>
              </div>
              <div className="terminal-status">
                <span>
                  <Zap /> processing signal
                </span>
                <span className="status-bar">
                  <i />
                </span>
              </div>
            </div>
            <div className="hero-card-footer">
              <div className="avatar-stack">
                <span>MS</span>
                <span>JD</span>
                <span>+</span>
              </div>
              <span>Building in public</span>
            </div>
          </div>
          <div className="floating-label label-top">
            <Code2 /> ENGINEERED FOR IMPACT
          </div>
          <div className="floating-label label-bottom">
            <span className="pulse-dot" /> SHIP. LEARN. REPEAT.
          </div>
        </div>
      </section>

      {/* Marquee Band */}
      <section className="marquee-band">
        <div className="marquee-track">
          <span>AI PRODUCTS</span>
          <i /> <span>ENTERPRISE SOLUTIONS</span>
          <i /> <span>REVENUE STRATEGY</span>
          <i /> <span>AI PRODUCTS</span>
          <i /> <span>ENTERPRISE SOLUTIONS</span>
          <i />
        </div>
      </section>

      {/* Applications / Software Showcase Section */}
      <section className="section container" id="applications">
        <span id="work" className="sr-only" aria-hidden="true" />
        <div className="section-heading">
          <div>
            <SectionLabel>{settings.work_section_label || 'APPLICATIONS / SOFTWARE SHOWCASE'}</SectionLabel>
            <h2>
              {settings.work_title} <span>{settings.work_title_accent}</span>
            </h2>
          </div>
          <p>{settings.work_description}</p>
        </div>

        {/* Categories Tablist */}
        <div className="filter-row" role="tablist" aria-label="Software categories">
          {(['All', 'AI tools', 'Web apps', 'Mobile APK', 'Windows EXE'] as AppCategory[]).map(
            (category) => (
              <button
                key={category}
                className={activeCategory === category ? 'filter active' : 'filter'}
                onClick={() => setActiveCategory(category)}
                role="tab"
                aria-selected={activeCategory === category}
              >
                {category}
              </button>
            )
          )}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const rel = product.current_release || (product.releases && product.releases[0])
            const displayVersion = rel?.version || 'v1.0.0'
            const displaySize = rel?.file_size_formatted || 'Cloud Web'

            // Determine platform badges based on actual database attributes
            const platforms: Array<'Windows' | 'Android' | 'Web'> = []
            const platStrings = (product.supported_platforms || []).map((p) => p.toLowerCase())
            if (
              platStrings.some((p) => p.includes('win')) ||
              product.category === 'Windows EXE' ||
              rel?.package_type === 'exe' ||
              rel?.package_type === 'msi'
            ) {
              platforms.push('Windows')
            }
            if (
              platStrings.some((p) => p.includes('android')) ||
              product.category === 'Mobile APK' ||
              rel?.package_type === 'apk'
            ) {
              platforms.push('Android')
            }
            if (
              platStrings.some((p) => p.includes('web')) ||
              product.category === 'Web apps' ||
              rel?.package_type === 'external_web' ||
              product.live_demo_url ||
              product.external_website_url
            ) {
              platforms.push('Web')
            }
            if (platforms.length === 0) {
              platforms.push('Web')
            }

            const isWindows = platforms.includes('Windows')
            const isAndroid = platforms.includes('Android')
            const isWeb = platforms.includes('Web')
            const AppIcon = isWindows ? Laptop : isAndroid ? Smartphone : isWeb ? Globe : Sparkles

            const isBinaryDownload = Boolean(rel && rel.package_type !== 'external_web' && rel.id)
            const webAppUrl = rel?.package_type === 'external_web'
              ? rel.external_launch_url || product.live_demo_url || product.external_website_url
              : product.live_demo_url || product.external_website_url || null
            const githubUrl = product.repo_url || product.github_url || null

            const directAction = isBinaryDownload
              ? { type: 'download', url: `/api/download/${rel!.id}`, label: 'Download', external: false }
              : webAppUrl
              ? { type: 'webapp', url: webAppUrl, label: 'Open App', external: true }
              : githubUrl
              ? { type: 'github', url: githubUrl, label: 'GitHub', external: true }
              : null

            return (
              <article
                key={product.id || product.slug}
                className="product-card"
                onClick={() => setSelectedProduct(product)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedProduct(product)}
                aria-label={`View ${product.title} details`}
              >
                <div className={`product-image ${product.accent}`}>
                  <img
                    src={product.cover_image_url}
                    alt={product.cover_image_alt || `${product.title} interface preview`}
                  />
                  <div className="image-overlay" />
                  <span className="category-badge">{product.category}</span>
                  <button className="preview-button" aria-label={`Open ${product.title}`}>
                    <ArrowUpRight />
                  </button>
                </div>

                <div className="product-content">
                  {/* Platform Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {platforms.map((p) => {
                      const lower = p.toLowerCase()
                      const badgeClass = lower.includes('win')
                        ? 'platform-badge windows'
                        : lower.includes('android')
                        ? 'platform-badge android'
                        : lower.includes('web')
                        ? 'platform-badge web'
                        : 'platform-badge'
                      return (
                        <span key={p} className={badgeClass}>
                          {p}
                        </span>
                      )
                    })}
                  </div>

                  {/* Header with App Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(183, 255, 99, 0.08)',
                        border: '1px solid rgba(183, 255, 99, 0.2)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#b7ff63',
                        flexShrink: 0,
                      }}
                    >
                      <AppIcon style={{ width: '13px', height: '13px' }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#eef1f4' }}>{product.title}</h3>
                  </div>

                  <p>{product.short_description}</p>

                  <div className="product-meta" style={{ marginTop: 'auto', paddingTop: '8px' }}>
                    <span>{displayVersion}</span>
                    <span>{displaySize}</span>
                    {rel && rel.download_count > 0 && (
                      <span style={{ color: '#b7ff63' }}>{rel.download_count} dl</span>
                    )}
                  </div>

                  <div className="tag-row" style={{ marginTop: '8px' }}>
                    {product.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  {/* Direct Action Bar */}
                  <div className="card-actions-bar" style={{ marginTop: '14px' }}>
                    <button
                      type="button"
                      className="card-action-details"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProduct(product)
                      }}
                    >
                      View Details
                    </button>
                    {directAction ? (
                      <a
                        href={directAction.url}
                        target={directAction.external ? '_blank' : undefined}
                        rel={directAction.external ? 'noopener noreferrer' : undefined}
                        className="card-action-download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {directAction.type === 'download' ? (
                          <>
                            <Download style={{ width: '12px', height: '12px' }} /> Download
                          </>
                        ) : directAction.type === 'webapp' ? (
                          <>
                            <ExternalLink style={{ width: '12px', height: '12px' }} /> Open App
                          </>
                        ) : (
                          <>
                            <Code2 style={{ width: '12px', height: '12px' }} /> GitHub
                          </>
                        )}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="card-action-download"
                        style={{ opacity: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProduct(product)
                        }}
                      >
                        Details
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Field Notes / Insights Section */}
      <section className="section insights-section container" id="articles">
        <span id="insights" className="sr-only" aria-hidden="true" />
        <div className="section-heading">
          <div>
            <SectionLabel>{settings.insights_section_label}</SectionLabel>
            <h2>
              {settings.insights_title} <span>{settings.insights_title_accent}</span>
            </h2>
          </div>
          <Link className="text-link" href="/insights">
            View all notes <ArrowUpRight />
          </Link>
        </div>

        <div className="article-list">
          {initialArticles.slice(0, 3).map((article, index) => (
            <Link
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="article-row"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              <span className="article-number">0{index + 1}</span>
              <div className="article-main">
                <span className="article-category">{article.category}</span>
                <h3>{article.title}</h3>
              </div>
              <div className="article-details">
                <span>{article.published_date_formatted}</span>
                <span>{article.reading_time_minutes} min read</span>
              </div>
              <ArrowUpRight className="article-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {/* Media Highlight Section */}
      <section className="media-section" id="media">
        <div className="container media-inner">
          <div className="media-copy">
            <SectionLabel>{settings.media_section_label}</SectionLabel>
            <h2>
              {settings.media_title}
              <br />
              <span>{settings.media_title_accent}</span>
            </h2>
            <p>{settings.media_description}</p>
            {featuredMedia && (
              <button
                className="play-link"
                onClick={() => setSelectedVideo(featuredMedia)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span>
                  <Play fill="currentColor" />
                </span>{' '}
                {settings.media_cta_text}
              </button>
            )}
          </div>

          <div className="video-card">
            <img
              src={featuredMedia?.thumbnail_url || 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=85'}
              alt={featuredMedia?.title || 'Abstract workspace with colorful interface designs'}
            />
            <div className="video-shade" />
            {featuredMedia && (
              <span
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  zIndex: 2,
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: '99px',
                  background: 'rgba(10, 15, 20, 0.85)',
                  color: '#b7ff63',
                  border: '1px solid rgba(183, 255, 99, 0.3)',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {featuredMedia.video_type === 'uploaded' ? 'DIRECT STREAM' : featuredMedia.video_type}
              </span>
            )}
            <button
              className="video-play"
              aria-label="Play featured demo"
              onClick={() => setSelectedVideo(featuredMedia)}
            >
              <CirclePlay />
            </button>
            <span className="video-caption">
              {featuredMedia?.caption || 'BUILDING SIGNALDESK AI / 03:42'}
            </span>
          </div>
        </div>

        {/* Matching Video Gallery for Additional Published Videos */}
        {galleryVideos.length > 0 && (
          <div
            className="container"
            style={{
              paddingTop: '32px',
              paddingBottom: '80px',
              borderTop: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <div className="section-label" style={{ fontSize: '10px' }}>
                  <span className="section-dot" /> GALLERY ARCHIVE
                </div>
                <h3 style={{ margin: '6px 0 0', fontSize: '20px', fontWeight: 700, color: '#eef1f4' }}>
                  More Demos & Field Walkthroughs
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#74808a' }}>
                {galleryVideos.length} {galleryVideos.length === 1 ? 'recording' : 'recordings'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {galleryVideos.map((item) => {
                const isYoutube = item.video_type === 'youtube'
                const isInstagram = item.video_type === 'instagram'
                const isFacebook = item.video_type === 'facebook'
                const isVimeo = item.video_type === 'vimeo'

                const providerBadgeStyle = {
                  position: 'absolute' as const,
                  top: '12px',
                  left: '12px',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase' as const,
                  background: isYoutube
                    ? 'rgba(255, 0, 51, 0.85)'
                    : isInstagram
                    ? 'rgba(225, 48, 108, 0.85)'
                    : isFacebook
                    ? 'rgba(24, 119, 242, 0.85)'
                    : isVimeo
                    ? 'rgba(26, 183, 234, 0.85)'
                    : 'rgba(183, 255, 99, 0.2)',
                  color: '#fff',
                  backdropFilter: 'blur(4px)',
                }

                return (
                  <article
                    key={item.id}
                    className="product-card"
                    onClick={() => setSelectedVideo(item)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedVideo(item)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#10161b',
                      border: '1px solid #283139',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                    aria-label={`Play ${item.title}`}
                  >
                    <div
                      style={{
                        position: 'relative',
                        height: '170px',
                        overflow: 'hidden',
                        background: '#0a0e12',
                      }}
                    >
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                      />
                      <div className="image-overlay" />
                      <span style={providerBadgeStyle}>
                        {item.video_type === 'uploaded' ? 'DIRECT STREAM' : item.video_type}
                      </span>
                      <button
                        className="preview-button"
                        aria-label={`Play ${item.title}`}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          bottom: '12px',
                        }}
                      >
                        <Play style={{ width: '14px', fill: 'currentColor' }} />
                      </button>
                      {item.duration_label && (
                        <span
                          style={{
                            position: 'absolute',
                            left: '12px',
                            bottom: '12px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: '#eef1f4',
                            fontSize: '9px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                          }}
                        >
                          {item.duration_label}
                        </span>
                      )}
                    </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {item.caption && (
                        <div style={{ fontSize: '9px', color: '#b7ff63', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                          {item.caption}
                        </div>
                      )}
                      <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#eef1f4' }}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p style={{ margin: 0, fontSize: '12px', color: '#89939c', lineHeight: 1.5 }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #1c242a', fontSize: '11px', color: '#b7ff63' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Watch demo <Play style={{ width: '10px', height: '10px', fill: 'currentColor' }} />
                      </span>
                      <span style={{ color: '#74808a', fontSize: '10px' }}>Stream live</span>
                    </div>
                  </div>
                </article>
              )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section className="contact-section container" id="contact">
        <div className="contact-panel">
          <div>
            <SectionLabel>{settings.contact_section_label}</SectionLabel>
            <h2>
              {settings.contact_title}
              <br />
              <span>{settings.contact_title_accent}</span>
            </h2>
          </div>
          <div className="contact-right">
            <p>{settings.contact_description}</p>
            <div className="contact-actions">
              <Button className="primary-button" size="lg" onClick={() => setContactModalOpen(true)}>
                <Send data-icon="inline-start" /> Start a conversation
              </Button>
              <a className="contact-email" href={`mailto:${settings.contact_email}`}>
                {settings.contact_email} <ArrowUpRight />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter settings={settings} />

      {/* Product Details Modal Dialog */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* Accessible Video Player Modal Dialog */}
      <VideoModal
        highlight={selectedVideo}
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Working Contact Conversation Dialog */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        contactEmail={settings.contact_email}
      />
    </main>
  )
}
