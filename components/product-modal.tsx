'use client'

import { useEffect, useRef, useState } from 'react'
import {
  X,
  Download,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Check,
  Code2,
  Layers,
  Calendar,
  FileCheck,
  Star,
  GitFork,
  Image as ImageIcon,
  Shield,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product, Release } from '@/types'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

type ModalTab = 'overview' | 'features' | 'screenshots' | 'releases' | 'github'

export function ProductModal({ product, onClose }: ProductModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<ModalTab>('overview')
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(0)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    if (product) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      modalRef.current?.focus()
      setActiveTab('overview')
      setActiveScreenshotIndex(0)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [product, onClose])

  if (!product) return null

  // Published releases list
  const publishedReleases = (product.releases || []).filter((r) => r.is_published)
  const primaryRelease = product.current_release || publishedReleases[0] || null

  // Has verifiable downloadable package
  const hasDownloadablePackage = Boolean(
    primaryRelease &&
    primaryRelease.package_type !== 'external_web' &&
    primaryRelease.id
  )

  // Has live web application URL
  const webAppUrl =
    product.live_demo_url ||
    product.external_website_url ||
    (primaryRelease?.package_type === 'external_web' ? primaryRelease.external_launch_url : null)

  // Has GitHub repository
  const githubRepoUrl = product.repo_url || product.github_url || product.github_data?.html_url || null
  const ghData = product.github_data

  // Gallery items / screenshots
  const screenshots = (product.gallery || []).filter((g) => g && g.url)

  // Features
  const featuresList = product.features || []

  // Available tabs
  const availableTabs: { id: ModalTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
  ]
  if (featuresList.length > 0) {
    availableTabs.push({ id: 'features', label: 'Features', count: featuresList.length })
  }
  if (screenshots.length > 0) {
    availableTabs.push({ id: 'screenshots', label: 'Screenshots', count: screenshots.length })
  }
  if (publishedReleases.length > 0) {
    availableTabs.push({ id: 'releases', label: 'Releases', count: publishedReleases.length })
  }
  if (githubRepoUrl) {
    availableTabs.push({ id: 'github', label: 'GitHub' })
  }

  const displayVersion = primaryRelease?.version || 'v1.0.0'
  const displaySize = primaryRelease?.file_size_formatted || (webAppUrl ? 'Cloud Web' : 'Verified')

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          outline: 'none',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0e12',
          border: '1px solid #283139',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Modal Close Button */}
        <button className="modal-close" onClick={onClose} aria-label="Close details" style={{ zIndex: 10 }}>
          <X />
        </button>

        {/* Hero Cover Header */}
        <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', background: '#05070a' }}>
          <img
            src={product.cover_image_url}
            alt={product.cover_image_alt || `${product.title} preview`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #0a0e12 0%, rgba(10, 14, 18, 0.6) 60%, transparent 100%)',
            }}
          />

          {/* Title and Badges overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '24px',
              right: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span className="category-badge">{product.category}</span>
              {product.supported_platforms?.map((plat) => {
                const lower = plat.toLowerCase()
                const badgeClass = lower.includes('win')
                  ? 'platform-badge windows'
                  : lower.includes('android')
                  ? 'platform-badge android'
                  : lower.includes('web')
                  ? 'platform-badge web'
                  : 'platform-badge'
                return (
                  <span key={plat} className={badgeClass}>
                    {plat}
                  </span>
                )
              })}
            </div>
            <h2 id="product-title" style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#eef1f4' }}>
              {product.title}
            </h2>
          </div>
        </div>

        {/* Modal Navigation Tabs (Requirement 5) */}
        {availableTabs.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '0 24px',
              borderBottom: '1px solid #1c242a',
              background: '#0d1217',
              overflowX: 'auto',
            }}
          >
            {availableTabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 14px',
                    border: 'none',
                    borderBottom: `2px solid ${isActive ? '#b7ff63' : 'transparent'}`,
                    background: 'transparent',
                    color: isActive ? '#b7ff63' : '#89939d',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '99px',
                        background: isActive ? 'rgba(183, 255, 99, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#b7ff63' : '#74808a',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Modal Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p style={{ margin: '0 0 14px', fontSize: '14px', lineHeight: 1.6, color: '#c5ced4' }}>
                  {product.full_description || product.short_description}
                </p>
                {product.full_description && product.short_description !== product.full_description && (
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#89939d' }}>
                    {product.short_description}
                  </p>
                )}
              </div>

              {/* Specs Grid */}
              <div className="modal-specs">
                <span>
                  <small>VERSION</small>
                  {displayVersion}
                </span>
                <span>
                  <small>PACKAGE</small>
                  {displaySize}
                </span>
                <span>
                  <small>{primaryRelease && primaryRelease.download_count > 0 ? 'DOWNLOADS' : 'PLATFORMS'}</small>
                  {primaryRelease && primaryRelease.download_count > 0
                    ? `${primaryRelease.download_count} verified`
                    : product.supported_platforms?.length
                    ? product.supported_platforms.join(', ')
                    : product.category}
                </span>
              </div>

              {/* System Requirements */}
              {product.system_requirements && (
                <div style={{ background: '#10161b', border: '1px solid #1c242a', borderRadius: '8px', padding: '12px 16px' }}>
                  <div style={{ fontSize: '10px', color: '#74808a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    System Requirements
                  </div>
                  <div style={{ fontSize: '12px', color: '#d1d8dc' }}>{product.system_requirements}</div>
                </div>
              )}

              {/* Tags Row */}
              {product.tags && product.tags.length > 0 && (
                <div className="tag-row">
                  {product.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FEATURES */}
          {activeTab === 'features' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: '#89939d', marginBottom: '4px' }}>
                Key architectural capabilities and functional highlights of {product.title}:
              </div>
              {featuresList.map((feature, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#10161b',
                    border: '1px solid #1c242a',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(183, 255, 99, 0.1)',
                      border: '1px solid rgba(183, 255, 99, 0.3)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#b7ff63',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Check style={{ width: '12px', height: '12px' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#eef1f4', lineHeight: 1.5 }}>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SCREENSHOTS */}
          {activeTab === 'screenshots' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {screenshots[activeScreenshotIndex] && (
                <div
                  style={{
                    width: '100%',
                    height: '320px',
                    background: '#05070a',
                    border: '1px solid #202930',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <img
                    src={screenshots[activeScreenshotIndex].url}
                    alt={screenshots[activeScreenshotIndex].alt || `${product.title} screenshot ${activeScreenshotIndex + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Thumbnails */}
              {screenshots.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {screenshots.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveScreenshotIndex(idx)}
                      style={{
                        width: '72px',
                        height: '52px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: `2px solid ${activeScreenshotIndex === idx ? '#b7ff63' : '#202930'}`,
                        background: '#05070a',
                        padding: 0,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RELEASES / DOWNLOADS */}
          {activeTab === 'releases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: '#89939d' }}>
                All officially published release builds and executable packages for {product.title}:
              </div>
              {publishedReleases.map((rel) => {
                const isBinary = rel.package_type !== 'external_web'
                const downloadUrl = isBinary ? `/api/download/${rel.id}` : rel.external_launch_url || webAppUrl

                return (
                  <div
                    key={rel.id}
                    style={{
                      background: '#10161b',
                      border: '1px solid #1c242a',
                      borderRadius: '10px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#eef1f4' }}>{rel.version}</span>
                        <span
                          style={{
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(183, 255, 99, 0.12)',
                            color: '#b7ff63',
                          }}
                        >
                          {rel.package_type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '11px', color: '#74808a' }}>{rel.file_size_formatted}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#74808a' }}>{rel.release_date}</span>
                        {downloadUrl && (
                          <Button asChild size="sm" className="primary-button" style={{ height: '32px', fontSize: '11px' }}>
                            <a href={downloadUrl} target={isBinary ? undefined : '_blank'} rel="noopener noreferrer">
                              {isBinary ? (
                                <>
                                  <Download style={{ width: '12px', marginRight: '4px' }} /> Download
                                </>
                              ) : (
                                <>
                                  <ExternalLink style={{ width: '12px', marginRight: '4px' }} /> Launch
                                </>
                              )}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {rel.release_notes && (
                      <div style={{ fontSize: '12px', color: '#c5ced4', lineHeight: 1.5 }}>{rel.release_notes}</div>
                    )}

                    {rel.file_checksum_sha256 && (
                      <div style={{ fontSize: '10px', color: '#74808a', fontFamily: 'monospace' }}>
                        SHA-256: <span style={{ color: '#9ba4ac' }}>{rel.file_checksum_sha256}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 5: GITHUB (Requirement 4 & 5) */}
          {activeTab === 'github' && githubRepoUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* GitHub Repo Card */}
              <div
                style={{
                  background: '#10161b',
                  border: '1px solid #202930',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Official GitHub SVG Logo */}
                    <svg
                      height="24"
                      viewBox="0 0 16 16"
                      version="1.1"
                      width="24"
                      aria-hidden="true"
                      fill="#eef1f4"
                    >
                      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
                    </svg>

                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#eef1f4' }}>
                        {ghData?.full_name || product.repo_url?.replace(/^https?:\/\/github\.com\//, '') || product.title}
                      </div>
                      {ghData?.language && (
                        <span style={{ fontSize: '11px', color: '#b7ff63' }}>{ghData.language}</span>
                      )}
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline" style={{ borderColor: 'rgba(183, 255, 99, 0.4)', color: '#b7ff63' }}>
                    <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink style={{ width: '13px', marginRight: '6px' }} /> View on GitHub
                    </a>
                  </Button>
                </div>

                {ghData?.description && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#c5ced4', lineHeight: 1.5 }}>
                    {ghData.description}
                  </p>
                )}

                {/* Repo Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', paddingTop: '8px', borderTop: '1px solid #1c242a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <Star style={{ width: '14px', color: '#facc15' }} />
                    <span style={{ color: '#eef1f4', fontWeight: 600 }}>{ghData?.stargazers_count ?? 0}</span>
                    <span style={{ color: '#74808a', fontSize: '11px' }}>stars</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <GitFork style={{ width: '14px', color: '#89939d' }} />
                    <span style={{ color: '#eef1f4', fontWeight: 600 }}>{ghData?.forks_count ?? 0}</span>
                    <span style={{ color: '#74808a', fontSize: '11px' }}>forks</span>
                  </div>

                  {ghData?.license && (
                    <div style={{ fontSize: '12px', color: '#74808a' }}>
                      License: <strong style={{ color: '#d1d8dc' }}>{ghData.license}</strong>
                    </div>
                  )}

                  {ghData?.default_branch && (
                    <div style={{ fontSize: '12px', color: '#74808a' }}>
                      Branch: <strong style={{ color: '#d1d8dc' }}>{ghData.default_branch}</strong>
                    </div>
                  )}
                </div>

                {/* Topics */}
                {ghData?.topics && ghData.topics.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
                    {ghData.topics.map((top) => (
                      <span
                        key={top}
                        style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '99px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#89939d',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        #{top}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Bar (Multi-source actions supported simultaneously - Requirement 5) */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #1c242a',
            background: '#0d1217',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          {/* 1. Download Binary package (Only when verified package exists) */}
          {hasDownloadablePackage && (
            <Button asChild className="primary-button" size="lg">
              <a href={`/api/download/${primaryRelease!.id}`}>
                <Download style={{ width: '16px', marginRight: '8px' }} />
                Download {primaryRelease!.package_type.toUpperCase()} ({primaryRelease!.version})
              </a>
            </Button>
          )}

          {/* 2. Open Live Web Application */}
          {webAppUrl && (
            <Button
              asChild
              variant={hasDownloadablePackage ? 'outline' : 'default'}
              className={hasDownloadablePackage ? undefined : 'primary-button'}
              size="lg"
              style={hasDownloadablePackage ? { borderColor: 'rgba(183, 255, 99, 0.4)', color: '#b7ff63' } : undefined}
            >
              <a href={webAppUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink style={{ width: '16px', marginRight: '8px' }} /> Open application
              </a>
            </Button>
          )}

          {/* 3. View GitHub Repository */}
          {githubRepoUrl && (
            <Button asChild variant="outline" size="lg" style={{ borderColor: '#283139', color: '#d1d8dc' }}>
              <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
                <Code2 style={{ width: '16px', marginRight: '8px' }} /> View on GitHub
              </a>
            </Button>
          )}

          {/* Fallback if no source configured yet */}
          {!hasDownloadablePackage && !webAppUrl && !githubRepoUrl && (
            <div style={{ color: '#74808a', fontSize: '12px' }}>
              Public release binary is in preparation by author.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
