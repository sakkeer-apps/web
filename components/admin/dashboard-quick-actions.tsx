'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Package,
  Upload,
  FilePlus,
  FileText,
  Video,
  ImageIcon,
  Layers,
  Share2,
  Mail,
  Globe,
  Search,
  X,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product } from '@/types'

interface DashboardQuickActionsProps {
  products: Product[]
  unreadMessagesCount: number
}

export function DashboardQuickActions({ products, unreadMessagesCount }: DashboardQuickActionsProps) {
  const router = useRouter()
  const [showUploadPicker, setShowUploadPicker] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true
    const q = productSearch.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    )
  })

  return (
    <>
      {/* Main Quick Actions Container */}
      <div
        style={{
          background: 'linear-gradient(180deg, #10161b 0%, #0d1217 100%)',
          border: '1px solid #283139',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid #1f272e',
            paddingBottom: '16px',
          }}
        >
          <div>
            <div className="section-label" style={{ fontSize: '10px', marginBottom: '4px' }}>
              <span className="section-dot" /> ONE-CLICK ACTIONS
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#eef1f4', letterSpacing: '-0.02em' }}>
              Administration Quick Actions
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7e8a94' }}>
              Direct access to all portal features without needing to remember internal URLs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button asChild size="sm" className="primary-button" style={{ height: '34px', fontSize: '12px' }}>
              <Link href="/admin/products/new">
                <Plus style={{ width: '14px', marginRight: '6px' }} /> Add Application
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowUploadPicker(true)}
              style={{
                height: '34px',
                fontSize: '12px',
                borderColor: '#2e3841',
                color: '#ffbf7b',
                background: '#12181f',
              }}
            >
              <Upload style={{ width: '14px', marginRight: '6px' }} /> Upload New Version
            </Button>
          </div>
        </div>

        {/* Section 1: Software & Releases */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#89939d',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Package style={{ width: '13px', height: '13px', color: '#b7ff63' }} />
            Applications & Releases
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
            }}
          >
            {/* 1. Add Application */}
            <Link
              href="/admin/products/new"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(183, 255, 99, 0.12)',
                  border: '1px solid rgba(183, 255, 99, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#b7ff63',
                  flexShrink: 0,
                }}
              >
                <Plus style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Add Application</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Upload APK/EXE, link Web App, or GitHub repo
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 2. Manage Applications */}
            <Link
              href="/admin/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(114, 184, 255, 0.12)',
                  border: '1px solid rgba(114, 184, 255, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#72b8ff',
                  flexShrink: 0,
                }}
              >
                <Package style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Manage Applications</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  {products.length} products • edit catalog & releases
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 3. Upload New Version */}
            <button
              onClick={() => setShowUploadPicker(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid rgba(255, 191, 123, 0.3)',
                borderRadius: '12px',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 191, 123, 0.12)',
                  border: '1px solid rgba(255, 191, 123, 0.4)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ffbf7b',
                  flexShrink: 0,
                }}
              >
                <Upload style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Upload New Version
                  <span style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(255, 191, 123, 0.15)', color: '#ffbf7b', borderRadius: '4px' }}>
                    Select App
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Choose product & drop APK, EXE, or ZIP package
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </button>
          </div>
        </div>

        {/* Section 2: Content, Publishing & Media */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#89939d',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Layers style={{ width: '13px', height: '13px', color: '#c691ff' }} />
            Content, Articles & Media
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
            }}
          >
            {/* 4. Add Article */}
            <Link
              href="/admin/insights/new"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(198, 145, 255, 0.12)',
                  border: '1px solid rgba(198, 145, 255, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#c691ff',
                  flexShrink: 0,
                }}
              >
                <FilePlus style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Add Article</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Write & publish a new field note
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 5. Manage Articles */}
            <Link
              href="/admin/insights"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 133, 161, 0.12)',
                  border: '1px solid rgba(255, 133, 161, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ff85a1',
                  flexShrink: 0,
                }}
              >
                <FileText style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Manage Articles</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Review drafts, published field notes & SEO
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 6. Add Video / Media */}
            <Link
              href="/admin/media-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(114, 184, 255, 0.12)',
                  border: '1px solid rgba(114, 184, 255, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#72b8ff',
                  flexShrink: 0,
                }}
              >
                <Video style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Add Video / Media</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Product demo videos & media highlights
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 7. Photo Library */}
            <Link
              href="/admin/media"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(94, 234, 212, 0.12)',
                  border: '1px solid rgba(94, 234, 212, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#5eead4',
                  flexShrink: 0,
                }}
              >
                <ImageIcon style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Photo Library</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Browse, upload & organize media assets
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 8. Edit Website Content */}
            <Link
              href="/admin/content"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(96, 165, 250, 0.12)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#60a5fa',
                  flexShrink: 0,
                }}
              >
                <Layers style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Edit Website Content</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Hero headlines, brand bios & stats
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 9. Social Links */}
            <Link
              href="/admin/content?tab=socials"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fbbf24',
                  flexShrink: 0,
                }}
              >
                <Share2 style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Social Links</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  LinkedIn, GitHub, WhatsApp, YouTube & email
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>
          </div>
        </div>

        {/* Section 3: Communications & Settings */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#89939d',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Globe style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
            Inquiries & Domain Settings
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
            }}
          >
            {/* 10. Contact Messages */}
            <Link
              href="/admin/messages"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: unreadMessagesCount > 0 ? '1px solid rgba(183, 255, 99, 0.4)' : '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: unreadMessagesCount > 0 ? 'rgba(183, 255, 99, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: unreadMessagesCount > 0 ? '1px solid rgba(183, 255, 99, 0.4)' : '1px solid #283139',
                  display: 'grid',
                  placeItems: 'center',
                  color: unreadMessagesCount > 0 ? '#b7ff63' : '#a0abb4',
                  flexShrink: 0,
                }}
              >
                <Mail style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Contact Messages
                  {unreadMessagesCount > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: '#b7ff63',
                        color: '#080b0f',
                        fontWeight: 700,
                      }}
                    >
                      {unreadMessagesCount} unread
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Enterprise client inquiries & conversations
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>

            {/* 11. Domain Settings */}
            <Link
              href="/admin/settings/domains"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                background: '#090d10',
                border: '1px solid #202930',
                borderRadius: '12px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.15s ease',
                minHeight: '64px',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#38bdf8',
                  flexShrink: 0,
                }}
              >
                <Globe style={{ width: '20px', height: '20px' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>Domain Settings</div>
                <div style={{ fontSize: '11px', color: '#74808a', marginTop: '2px' }}>
                  Custom domain verification, DNS & SSL
                </div>
              </div>
              <ChevronRight style={{ width: '16px', color: '#4a5660', flexShrink: 0 }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Upload New Version Selector Modal */}
      {showUploadPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 10, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUploadPicker(false)
          }}
        >
          <div
            style={{
              background: '#0e1419',
              border: '1px solid #2d3842',
              borderRadius: '16px',
              width: 'min(100%, 620px)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #202930',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ffbf7b', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <Upload style={{ width: '13px', height: '13px' }} /> Upload New Version
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
                  Select Application
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#89939d' }}>
                  Choose which product to update with a new APK, EXE, MSI, or ZIP package release.
                </p>
              </div>

              <button
                onClick={() => setShowUploadPicker(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#89939d',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label="Close modal"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid #1c242a' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '15px',
                    height: '15px',
                    color: '#68737c',
                  }}
                />
                <input
                  type="text"
                  placeholder="Filter applications by title or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    background: '#090d10',
                    border: '1px solid #232c34',
                    color: '#eef1f4',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Product List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#74808a' }}>
                  <Package style={{ width: '32px', height: '32px', margin: '0 auto 12px', opacity: 0.4 }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#c5ced4', marginBottom: '4px' }}>
                    {products.length === 0 ? 'No applications in your catalog yet' : 'No matching applications found'}
                  </div>
                  <p style={{ fontSize: '12px', margin: '0 0 16px' }}>
                    {products.length === 0
                      ? 'Create an application first before uploading a version.'
                      : 'Try adjusting your search query.'}
                  </p>
                  <Button asChild size="sm" className="primary-button" onClick={() => setShowUploadPicker(false)}>
                    <Link href="/admin/products/new">
                      <Plus style={{ width: '14px', marginRight: '6px' }} /> Add Application
                    </Link>
                  </Button>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const currentVer = p.current_release?.version || (p.releases && p.releases[0]?.version)
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '14px 16px',
                        background: '#090d10',
                        border: '1px solid #1f272e',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#12181f',
                            border: '1px solid #232c34',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#b7ff63',
                            flexShrink: 0,
                            overflow: 'hidden',
                          }}
                        >
                          {p.cover_image_url ? (
                            <img src={p.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package style={{ width: '18px', height: '18px' }} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#74808a', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span style={{ color: '#b5c0c8' }}>{p.category}</span>
                            <span>•</span>
                            <span style={{ color: currentVer ? '#b7ff63' : '#68737c' }}>
                              {currentVer ? `Current: ${currentVer}` : 'No releases yet'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <Button
                          asChild
                          size="sm"
                          className="primary-button"
                          style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}
                          onClick={() => setShowUploadPicker(false)}
                        >
                          <Link href={`/admin/products/${p.id}?tab=upload`}>
                            <Upload style={{ width: '13px', marginRight: '5px' }} /> Upload version
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          style={{ height: '32px', fontSize: '12px', borderColor: '#2b353d', color: '#9ca5ad', padding: '0 10px' }}
                          onClick={() => setShowUploadPicker(false)}
                        >
                          <Link href={`/admin/products/${p.id}/releases`}>
                            History
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #1c242a',
                background: '#090d10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#68737c',
              }}
            >
              <span>Or view entire catalog:</span>
              <Link
                href="/admin/products"
                onClick={() => setShowUploadPicker(false)}
                style={{ color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Go to Manage Applications →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
