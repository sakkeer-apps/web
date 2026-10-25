'use client'

import { useEffect, useRef } from 'react'
import { X, Download, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product } from '@/types'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    if (product) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      modalRef.current?.focus()
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [product, onClose])

  if (!product) return null

  const release = product.current_release || (product.releases && product.releases[0])
  const isWebApp = product.category === 'Web apps' || release?.package_type === 'external_web'
  const targetUrl = isWebApp
    ? release?.external_launch_url || product.live_demo_url || product.external_website_url
    : release?.id
    ? `/api/download/${release.id}`
    : null

  const displayVersion = release?.version || 'v1.0.0'
  const displaySize = release?.file_size_formatted || 'Cloud Web'
  const displayDownloads = product.portfolio_download_display || 'Verified'

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
        style={{ outline: 'none' }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close details">
          <X />
        </button>

        <img src={product.cover_image_url} alt={product.cover_image_alt || `${product.title} preview`} />

        <div className="modal-content">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
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
          <h2 id="product-title">{product.title}</h2>
          <p>{product.full_description || product.short_description}</p>

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
              <small>{release && release.download_count > 0 ? 'DOWNLOADS' : 'PLATFORMS'}</small>
              {release && release.download_count > 0
                ? `${release.download_count} verified`
                : product.supported_platforms?.length
                ? product.supported_platforms.join(', ')
                : product.category}
            </span>
          </div>

          <div className="tag-row" style={{ marginBottom: '24px' }}>
            {product.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          {targetUrl ? (
            <Button asChild className="primary-button" size="lg" style={{ width: '100%' }}>
              <a href={targetUrl} target={isWebApp ? '_blank' : undefined} rel="noopener noreferrer">
                {isWebApp ? (
                  <>
                    <ExternalLink data-icon="inline-start" /> Open application
                  </>
                ) : (
                  <>
                    <Download data-icon="inline-start" /> Download release ({displayVersion})
                  </>
                )}
              </a>
            </Button>
          ) : (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                background: '#0a0e12',
                border: '1px solid #283138',
                borderRadius: '8px',
                color: '#89939d',
                fontSize: '12px',
              }}
            >
              Public release binary is in preparation by author.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
