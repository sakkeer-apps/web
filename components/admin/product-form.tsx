'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Eye, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveProduct, deleteProduct } from '@/app/admin/products/actions'
import { Product, AccentColor, AppCategory } from '@/types'

interface ProductFormProps {
  initialData?: Product | null
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData?.id)

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [category, setCategory] = useState<AppCategory>(initialData?.category || 'AI tools')
  const [accent, setAccent] = useState<AccentColor>(initialData?.accent || 'cyan')
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || '')
  const [fullDesc, setFullDesc] = useState(initialData?.full_description || '')
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '')
  const [coverImageAlt, setCoverImageAlt] = useState(initialData?.cover_image_alt || '')
  const [tagsStr, setTagsStr] = useState((initialData?.tags || []).join(', '))
  const [platformsStr, setPlatformsStr] = useState((initialData?.supported_platforms || []).join(', '))
  const [systemReqs, setSystemReqs] = useState(initialData?.system_requirements || '')
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 1)
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? true)
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(initialData?.status || 'published')
  const [portfolioDownloadDisplay, setPortfolioDownloadDisplay] = useState(initialData?.portfolio_download_display || '')
  const [externalWebsite, setExternalWebsite] = useState(initialData?.external_website_url || '')
  const [liveDemo, setLiveDemo] = useState(initialData?.live_demo_url || '')
  const [repoUrl, setRepoUrl] = useState(initialData?.repo_url || '')

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      )
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const supportedPlatforms = platformsStr
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    const payload = {
      id: initialData?.id,
      title: title.trim(),
      slug: slug.trim(),
      category,
      accent,
      short_description: shortDesc.trim(),
      full_description: fullDesc.trim(),
      cover_image_url: coverImageUrl.trim(),
      cover_image_alt: coverImageAlt.trim(),
      tags,
      supported_platforms: supportedPlatforms,
      system_requirements: systemReqs.trim(),
      display_order: Number(displayOrder),
      is_featured: Boolean(isFeatured),
      status,
      portfolio_download_display: portfolioDownloadDisplay.trim(),
      external_website_url: externalWebsite.trim(),
      live_demo_url: liveDemo.trim(),
      repo_url: repoUrl.trim(),
    }

    const res = await saveProduct(payload)

    if (res.success) {
      setMessage({ type: 'success', text: 'Product saved successfully!' })
      router.push('/admin/products')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save product' })
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!initialData?.id) return
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${initialData.title}"?`)
    if (!confirmed) return

    setDeleting(true)
    const res = await deleteProduct(initialData.id)
    if (res.success) {
      router.push('/admin/products')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete product' })
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button asChild variant="outline" size="icon" style={{ width: '36px', height: '36px', borderColor: '#2b353d' }}>
            <Link href="/admin/products">
              <ArrowLeft style={{ width: '16px' }} />
            </Link>
          </Button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
              {isEditing ? `Edit: ${initialData?.title}` : 'Create New Product'}
            </h1>
            <span style={{ fontSize: '11px', color: '#74808a' }}>
              {isEditing ? `Slug: ${initialData?.slug}` : 'Add a new software project to your portal'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              style={{ borderColor: '#452626', color: '#f87171', background: 'rgba(239, 68, 68, 0.05)' }}
            >
              <Trash2 style={{ width: '14px', marginRight: '6px' }} /> Delete
            </Button>
          )}
          <Button type="submit" className="primary-button" disabled={saving}>
            <Save style={{ width: '14px', marginRight: '6px' }} /> {saving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(183, 255, 99, 0.1)',
            border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(183, 255, 99, 0.3)'}`,
            color: message.type === 'error' ? '#fca5a5' : '#b7ff63',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {message.type === 'error' ? <AlertCircle style={{ width: '16px' }} /> : <CheckCircle2 style={{ width: '16px' }} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Form Fields */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#b7ff63' }}>Core Information</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="SignalDesk AI"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Unique URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="signaldesk-ai"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AppCategory)}
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            >
              <option value="AI tools">AI tools</option>
              <option value="Web apps">Web apps</option>
              <option value="Mobile APK">Mobile APK</option>
              <option value="Windows EXE">Windows EXE</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Visual Accent Style *
            </label>
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value as AccentColor)}
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            >
              <option value="cyan">Cyan (Deep Blue-Green glow)</option>
              <option value="violet">Violet (Purple glow)</option>
              <option value="amber">Amber (Golden Orange glow)</option>
              <option value="emerald">Emerald (Lime Green glow)</option>
              <option value="blue">Blue (Electric Blue glow)</option>
              <option value="rose">Rose (Crimson glow)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Publication Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')}
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            >
              <option value="published">Published (Visible publicly)</option>
              <option value="draft">Draft (Admin eyes only)</option>
              <option value="archived">Archived (Delisted)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Display Order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Short Summary Description * (Shown on card)
          </label>
          <textarea
            required
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="An intelligent command center for turning messy sales conversations into clear next steps."
            style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Full Description (Shown in modal & details page)
          </label>
          <textarea
            rows={4}
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            placeholder="Detailed architectural notes, design decisions, and system capabilities..."
            style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Imagery & Media */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#b7ff63' }}>Cover Image & Previews</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Cover Image URL *
            </label>
            <input
              type="url"
              required
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', margin: '14px 0 6px' }}>
              Cover Image Alt Text
            </label>
            <input
              type="text"
              value={coverImageAlt}
              onChange={(e) => setCoverImageAlt(e.target.value)}
              placeholder="SignalDesk AI interface preview"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div style={{ background: '#0a0e12', border: '1px solid #202930', borderRadius: '8px', overflow: 'hidden', height: '140px', display: 'grid', placeItems: 'center' }}>
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '11px', color: '#68737c' }}>Cover preview will appear here</span>
            )}
          </div>
        </div>
      </div>

      {/* Technical Specs & Preserved Portfolio Stats */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#b7ff63' }}>Technical Specifications & Links</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Technology Tags (Comma-separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Next.js, AI SDK, Postgres"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Supported Platforms (Comma-separated)
            </label>
            <input
              type="text"
              value={platformsStr}
              onChange={(e) => setPlatformsStr(e.target.value)}
              placeholder="Web Browser, Cloud API, Android 9.0+"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            System Requirements
          </label>
          <input
            type="text"
            value={systemReqs}
            onChange={(e) => setSystemReqs(e.target.value)}
            placeholder="Modern browser (Chrome, Edge, Safari, Firefox) with 1080p+ display resolution."
            style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              External Website URL (Optional)
            </label>
            <input
              type="url"
              value={externalWebsite}
              onChange={(e) => setExternalWebsite(e.target.value)}
              placeholder="https://signaldesk.example.com"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Live Demo / Web App URL (Optional)
            </label>
            <input
              type="url"
              value={liveDemo}
              onChange={(e) => setLiveDemo(e.target.value)}
              placeholder="https://demo.signaldesk.example.com"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Source Repository URL (Optional)
            </label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/example/signaldesk-ai"
              style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Portfolio Manual Stats Preservation */}
        <div style={{ marginTop: '10px', padding: '16px', background: '#0a0e12', border: '1px solid #1e262c', borderRadius: '8px' }}>
          <label style={{ display: 'block', color: '#b7ff63', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            Portfolio Download Metric Display (Preserved Editable)
          </label>
          <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#74808a' }}>
            Original portfolio label (e.g. "2.8k", "1.4k"). This preserves your original design statistics while actual binary downloads are separately logged in the database.
          </p>
          <input
            type="text"
            value={portfolioDownloadDisplay}
            onChange={(e) => setPortfolioDownloadDisplay(e.target.value)}
            placeholder="2.8k"
            style={{ width: '160px', minHeight: '38px', padding: '0 10px', background: '#11161c', border: '1px solid #2e3840', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button asChild variant="outline" style={{ borderColor: '#2b353d', color: '#9ba4ac' }}>
          <Link href="/admin/products">Cancel</Link>
        </Button>
        <Button type="submit" className="primary-button" size="lg" disabled={saving}>
          <Save style={{ width: '16px', marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  )
}
