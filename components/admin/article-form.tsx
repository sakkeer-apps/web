'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Eye, Edit3, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Article } from '@/types'
import { saveArticle, deleteArticle } from '@/app/admin/insights/actions'
import { renderSanitizedMarkdown } from '@/lib/security'

interface ArticleFormProps {
  initialData?: Article | null
}

export function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter()
  const isEditing = Boolean(initialData?.id)

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [category, setCategory] = useState(initialData?.category || 'AI INNOVATION')
  const [readingTime, setReadingTime] = useState(initialData?.reading_time_minutes || 5)
  const [publishedDate, setPublishedDate] = useState(
    initialData?.published_date_formatted ||
      new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  )
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [bodyMarkdown, setBodyMarkdown] = useState(initialData?.body_markdown || '')
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '')
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? true)
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 1)
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '')
  const [seoDesc, setSeoDesc] = useState(initialData?.seo_description || '')

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
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

    const payload = {
      id: initialData?.id,
      title: title.trim(),
      slug: slug.trim(),
      category: category.trim(),
      excerpt: excerpt.trim(),
      body_markdown: bodyMarkdown.trim(),
      cover_image_url: coverImageUrl.trim(),
      reading_time_minutes: Number(readingTime),
      published_date_formatted: publishedDate.trim(),
      is_published: Boolean(isPublished),
      display_order: Number(displayOrder),
      seo_title: seoTitle.trim(),
      seo_description: seoDesc.trim(),
    }

    const res = await saveArticle(payload)
    if (res.success) {
      setMessage({ type: 'success', text: 'Article saved successfully!' })
      router.push('/admin/insights')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save article' })
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!initialData?.id) return
    const confirmed = window.confirm(`Permanently delete article "${initialData.title}"?`)
    if (!confirmed) return

    setDeleting(true)
    const res = await deleteArticle(initialData.id)
    if (res.success) {
      router.push('/admin/insights')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Delete failed' })
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <Link href="/admin" style={{ color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
          ← Dashboard
        </Link>
        <span style={{ color: '#52606d' }}>/</span>
        <Link href="/admin/insights" style={{ color: '#a1abb2', textDecoration: 'none' }}>
          Field Notes
        </Link>
        <span style={{ color: '#52606d' }}>/</span>
        <span style={{ color: '#74808a' }}>{isEditing ? 'Edit' : 'New'}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button asChild variant="outline" size="icon" style={{ width: '36px', height: '36px', borderColor: '#2b353d' }}>
            <Link href="/admin/insights">
              <ArrowLeft style={{ width: '16px' }} />
            </Link>
          </Button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
              {isEditing ? `Edit: ${initialData?.title}` : 'Write New Field Note'}
            </h1>
            <span style={{ fontSize: '11px', color: '#74808a' }}>
              {isEditing ? `Slug: ${initialData?.slug}` : 'Add a perspective on AI, enterprise sales, or technology'}
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
            <Save style={{ width: '14px', marginRight: '6px' }} /> {saving ? 'Saving...' : 'Save Article'}
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
          }}
        >
          {message.text}
        </div>
      )}

      {/* Core Fields */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#b7ff63' }}>Metadata & Structure</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="The practical AI stack for modern revenue teams"
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="the-practical-ai-stack"
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Category *
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="AI INNOVATION"
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Estimated Read Time (Minutes)
            </label>
            <input
              type="number"
              min={1}
              value={readingTime}
              onChange={(e) => setReadingTime(Number(e.target.value))}
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Display Date Label *
            </label>
            <input
              type="text"
              required
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              placeholder="Oct 14, 2026"
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Publication Status
            </label>
            <select
              value={isPublished ? 'true' : 'false'}
              onChange={(e) => setIsPublished(e.target.value === 'true')}
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            >
              <option value="true">Published (Live)</option>
              <option value="false">Draft (Private)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Excerpt / Summary * (Shown in insights list)
          </label>
          <textarea
            required
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short punchy thesis statement of the field note..."
            style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px', resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Cover Image URL (Optional)
          </label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Markdown Body Editor with Preview */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>Article Content (Markdown)</h3>
            <span style={{ fontSize: '11px', color: '#74808a' }}>
              Empty body will display an honest in-progress notice to visitors
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: '#0a0e12', padding: '4px', borderRadius: '8px', border: '1px solid #252e35' }}>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'edit' ? '#253039' : 'transparent',
                color: viewMode === 'edit' ? '#b7ff63' : '#88939c',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Edit3 style={{ width: '12px' }} /> Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'preview' ? '#253039' : 'transparent',
                color: viewMode === 'preview' ? '#b7ff63' : '#88939c',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Eye style={{ width: '12px' }} /> Live Preview
            </button>
          </div>
        </div>

        {viewMode === 'edit' ? (
          <textarea
            rows={14}
            value={bodyMarkdown}
            onChange={(e) => setBodyMarkdown(e.target.value)}
            placeholder="# Write your article in Markdown here...

Use headers, lists, blockquotes, and code snippets."
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0e12',
              border: '1px solid #2d373f',
              borderRadius: '8px',
              color: '#eef1f4',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: 1.6,
              resize: 'vertical',
            }}
          />
        ) : (
          <div
            style={{
              minHeight: '280px',
              padding: '24px',
              background: '#0a0e12',
              border: '1px solid #202930',
              borderRadius: '8px',
              color: '#d6dce0',
              fontSize: '14px',
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{
              __html:
                renderSanitizedMarkdown(bodyMarkdown) ||
                '<p style="color: #68737c; font-style: italic;">No markdown content yet. Switch to editor mode to write.</p>',
            }}
          />
        )}
      </div>

      {/* SEO Metadata */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>SEO Metadata Fields</h3>

        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Custom SEO Title (Defaults to article title if left empty)
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="The Practical AI Stack — Muhammed Sakkeer"
            style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Custom Meta Description (Defaults to excerpt if left empty)
          </label>
          <input
            type="text"
            value={seoDesc}
            onChange={(e) => setSeoDesc(e.target.value)}
            placeholder="A strategic overview of AI engineering in sales organizations..."
            style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button asChild variant="outline" style={{ borderColor: '#2b353d', color: '#9ba4ac' }}>
          <Link href="/admin/insights">Cancel</Link>
        </Button>
        <Button type="submit" className="primary-button" size="lg" disabled={saving}>
          <Save style={{ width: '16px', marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save Article'}
        </Button>
      </div>
    </form>
  )
}
