'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Play,
  Video,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  ExternalLink,
  Upload,
  Film,
  Sparkles,
  X,
  Edit2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaHighlight, VideoType } from '@/types'
import {
  saveMediaHighlight,
  deleteMediaHighlight,
  toggleMediaHighlightPublished,
  setMediaHighlightFeatured,
  reorderMediaHighlights,
} from '@/app/admin/media-section/actions'
import { createClient } from '@/lib/supabase/client'
import { detectVideoProvider, parseVideoEmbedInfo } from '@/lib/video-helpers'
import { VideoModal } from '@/components/video-modal'

interface MediaSectionEditorProps {
  initialHighlights?: MediaHighlight[]
  initialHighlight?: MediaHighlight | null // Backwards compatibility
}

export function MediaSectionEditor({ initialHighlights = [], initialHighlight }: MediaSectionEditorProps) {
  const router = useRouter()

  // Consolidate initial highlights
  const highlightsList = initialHighlights.length > 0
    ? initialHighlights
    : initialHighlight
    ? [initialHighlight]
    : []

  const [highlights, setHighlights] = useState<MediaHighlight[]>(highlightsList)
  const [editingItem, setEditingItem] = useState<MediaHighlight | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewItem, setPreviewItem] = useState<MediaHighlight | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [videoType, setVideoType] = useState<VideoType>('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [durationLabel, setDurationLabel] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isPublished, setIsPublished] = useState(true)

  // Direct video upload state
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  function openCreateModal() {
    setEditingItem(null)
    setIsCreating(true)
    setTitle('')
    setCaption('DEMO / 03:00')
    setDescription('')
    setThumbnailUrl('https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=85')
    setVideoType('youtube')
    setVideoUrl('')
    setDurationLabel('03:00')
    setIsFeatured(highlights.length === 0)
    setIsPublished(true)
    setUploadStatus('idle')
    setUploadError(null)
    setUploadMessage(null)
    setMessage(null)
  }

  function openEditModal(item: MediaHighlight) {
    setIsCreating(false)
    setEditingItem(item)
    setTitle(item.title)
    setCaption(item.caption || '')
    setDescription(item.description || '')
    setThumbnailUrl(item.thumbnail_url)
    setVideoType(item.video_type)
    setVideoUrl(item.video_url || '')
    setDurationLabel(item.duration_label || '')
    setIsFeatured(item.is_featured)
    setIsPublished(item.is_published !== false)
    setUploadStatus('idle')
    setUploadError(null)
    setUploadMessage(null)
    setMessage(null)
  }

  function handleVideoUrlChange(rawUrl: string) {
    setVideoUrl(rawUrl)
    const detected = detectVideoProvider(rawUrl)
    if (detected !== 'none') {
      setVideoType(detected)
    }

    const info = parseVideoEmbedInfo(rawUrl, detected)
    if (info.suggestedThumbnail && (!thumbnailUrl || thumbnailUrl.includes('images.unsplash.com'))) {
      setThumbnailUrl(info.suggestedThumbnail)
    }
  }

  // Direct video upload to Supabase Storage with progress
  async function handleDirectVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const validMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    const hasValidExt = /\.(mp4|webm|ogg|mov)$/i.test(file.name)
    if (!validMimes.includes(file.type) && !hasValidExt) {
      setUploadStatus('error')
      setUploadError('Invalid video format. Supported formats: MP4, WebM, OGG, QuickTime (.mov).')
      return
    }

    // Max 50 MB limit
    const maxSize = 52428800
    if (file.size > maxSize) {
      setUploadStatus('error')
      setUploadError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 50 MB limit.`)
      return
    }

    setUploadStatus('uploading')
    setUploadError(null)
    setUploadProgressPercent(10)
    setUploadMessage(`Uploading ${file.name}...`)

    const supabase = createClient()
    if (!supabase) {
      setUploadStatus('error')
      setUploadError('Supabase storage client is not configured.')
      return
    }

    try {
      const uniqueName = `videos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      // Upload with progress simulation and resolution
      const interval = setInterval(() => {
        setUploadProgressPercent((prev) => (prev < 90 ? prev + 15 : prev))
      }, 300)

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('media')
        .upload(uniqueName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'video/mp4',
        })

      clearInterval(interval)

      if (uploadErr) {
        setUploadStatus('error')
        setUploadError(`Storage upload failed: ${uploadErr.message}`)
        return
      }

      // Retrieve public URL
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(uniqueName)
      const publicUrl = publicUrlData.publicUrl

      setUploadProgressPercent(100)
      setUploadStatus('success')
      setUploadMessage('Video uploaded successfully!')
      setVideoType('uploaded')
      setVideoUrl(publicUrl)

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      }
    } catch (err: unknown) {
      setUploadStatus('error')
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (uploadStatus === 'uploading') {
      setMessage({ type: 'error', text: 'Please wait for video upload to finish before saving.' })
      setSaving(false)
      return
    }

    const payload = {
      id: editingItem?.id,
      title: title.trim(),
      caption: caption.trim(),
      description: description.trim(),
      thumbnail_url: thumbnailUrl.trim(),
      video_type: videoType,
      video_url: videoUrl.trim(),
      duration_label: durationLabel.trim(),
      display_order: editingItem ? editingItem.display_order : highlights.length + 1,
      is_featured: isFeatured,
      is_published: isPublished,
    }

    const res = await saveMediaHighlight(payload)
    if (res.success) {
      setMessage({ type: 'success', text: `Media video "${title}" saved successfully!` })
      setEditingItem(null)
      setIsCreating(false)
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save media highlight' })
    }
    setSaving(false)
  }

  async function handleDelete(id: string, itemTitle: string) {
    if (!window.confirm(`Permanently remove video "${itemTitle}"?`)) return

    const res = await deleteMediaHighlight(id)
    if (res.success) {
      setMessage({ type: 'success', text: `Video "${itemTitle}" deleted.` })
      setHighlights((prev) => prev.filter((h) => h.id !== id))
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Delete failed' })
    }
  }

  async function handleTogglePublished(item: MediaHighlight) {
    const nextStatus = item.is_published === false ? true : false
    const res = await toggleMediaHighlightPublished(item.id, nextStatus)
    if (res.success) {
      setHighlights((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, is_published: nextStatus } : h))
      )
      setMessage({ type: 'success', text: `Video "${item.title}" ${nextStatus ? 'published' : 'hidden'}.` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Status update failed' })
    }
  }

  async function handleSetFeatured(id: string, itemTitle: string) {
    const res = await setMediaHighlightFeatured(id)
    if (res.success) {
      setHighlights((prev) =>
        prev.map((h) => ({ ...h, is_featured: h.id === id }))
      )
      setMessage({ type: 'success', text: `"${itemTitle}" is now the featured showcase demo!` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to set featured' })
    }
  }

  async function handleMoveOrder(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= highlights.length) return

    const newOrder = [...highlights]
    const temp = newOrder[index]
    newOrder[index] = newOrder[targetIndex]
    newOrder[targetIndex] = temp

    setHighlights(newOrder)

    const ids = newOrder.map((h) => h.id)
    const res = await reorderMediaHighlights(ids)
    if (!res.success) {
      setMessage({ type: 'error', text: res.error || 'Failed to save reorder' })
      router.refresh()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <Link href="/admin" style={{ color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
          ← Dashboard
        </Link>
        <span style={{ color: '#52606d' }}>/</span>
        <span style={{ color: '#89939d' }}>Video & Media Highlights</span>
      </div>

      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '4px' }}>
            <span className="section-dot" /> MEDIA SHOWCASE & DEMOS
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
            Media Highlights & Video Showcase
          </h1>
          <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
            Add, preview, publish, reorder, and feature product walkthroughs from YouTube, YouTube Shorts, Vimeo, Facebook, Instagram, or direct MP4/WebM uploads.
          </p>
        </div>

        <Button className="primary-button" onClick={openCreateModal}>
          <Plus data-icon="inline-start" /> Add New Video Demo
        </Button>
      </div>

      {/* Alert Banner */}
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

      {/* Videos List */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #202930', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#eef1f4' }}>Video Demos ({highlights.length})</h3>
            <span style={{ fontSize: '11px', color: '#68737c' }}>
              {highlights.filter((h) => h.is_published !== false).length} Published • {highlights.filter((h) => h.is_published === false).length} Hidden
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#b7ff63' }}>Featured video displays in hero media section</span>
        </div>

        {highlights.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#68737c', fontSize: '13px' }}>
            <Video style={{ width: '32px', height: '32px', margin: '0 auto 10px', opacity: 0.5 }} />
            <div>No media highlights recorded yet.</div>
            <div style={{ marginTop: '8px' }}>
              <Button size="sm" variant="outline" onClick={openCreateModal}>
                <Plus style={{ width: '12px', marginRight: '4px' }} /> Add your first video
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {highlights.map((item, index) => {
              const isFirst = index === 0
              const isLast = index === highlights.length - 1
              const info = parseVideoEmbedInfo(item.video_url, item.video_type)

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '18px 20px',
                    borderBottom: '1px solid #1c242a',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: item.is_featured ? 'rgba(183, 255, 99, 0.02)' : 'transparent',
                  }}
                >
                  {/* Left: Thumbnail & Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '320px', flex: '1 1 auto' }}>
                    {/* Thumbnail preview */}
                    <div
                      style={{
                        position: 'relative',
                        width: '120px',
                        height: '68px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#0a0e12',
                        border: '1px solid #283139',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => setPreviewItem(item)}
                      title="Click to preview video playback"
                    >
                      <img
                        src={item.thumbnail_url || 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80'}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.3)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Play style={{ width: '20px', height: '20px', color: '#b7ff63' }} />
                      </div>
                      {item.duration_label && (
                        <span
                          style={{
                            position: 'absolute',
                            right: '4px',
                            bottom: '4px',
                            background: 'rgba(0,0,0,0.8)',
                            color: '#eef1f4',
                            fontSize: '9px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            fontFamily: 'monospace',
                          }}
                        >
                          {item.duration_label}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#eef1f4' }}>{item.title}</span>

                        {item.is_featured && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '99px',
                              fontSize: '9px',
                              fontWeight: 700,
                              background: 'rgba(183, 255, 99, 0.15)',
                              color: '#b7ff63',
                              border: '1px solid rgba(183, 255, 99, 0.4)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Star style={{ width: '10px', height: '10px', fill: 'currentColor' }} /> FEATURED
                          </span>
                        )}

                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '99px',
                            fontSize: '9px',
                            fontWeight: 600,
                            background: item.is_published !== false ? 'rgba(183, 255, 99, 0.08)' : 'rgba(156, 163, 175, 0.1)',
                            color: item.is_published !== false ? '#b7ff63' : '#9ca3af',
                          }}
                        >
                          {item.is_published !== false ? 'Published' : 'Draft / Hidden'}
                        </span>

                        <span className="category-badge" style={{ fontSize: '8px' }}>
                          {info.platformName}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#7e8a93' }}>
                        {item.caption && <span style={{ color: '#b5c0c8', marginRight: '8px' }}>{item.caption}</span>}
                        {item.description && <span style={{ maxWidth: '400px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</span>}
                      </div>

                      <div style={{ fontSize: '10px', color: '#55616b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Order #{item.display_order || index + 1}</span>
                        {item.video_url && (
                          <a
                            href={item.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#72b8ff', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            Source link <ExternalLink style={{ width: '9px', height: '9px' }} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Reorder Buttons */}
                    <div style={{ display: 'flex', gap: '2px', marginRight: '6px' }}>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={isFirst}
                        onClick={() => handleMoveOrder(index, 'up')}
                        style={{ width: '30px', height: '30px', borderColor: '#2d373f', color: '#c5ced4' }}
                        title="Move Up"
                      >
                        <ArrowUp style={{ width: '12px' }} />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        disabled={isLast}
                        onClick={() => handleMoveOrder(index, 'down')}
                        style={{ width: '30px', height: '30px', borderColor: '#2d373f', color: '#c5ced4' }}
                        title="Move Down"
                      >
                        <ArrowDown style={{ width: '12px' }} />
                      </Button>
                    </div>

                    {/* Preview Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewItem(item)}
                      style={{ borderColor: '#2d373f', color: '#b7ff63', fontSize: '11px' }}
                      title="Preview playable video"
                    >
                      <Play style={{ width: '11px', marginRight: '4px' }} /> Preview
                    </Button>

                    {/* Feature Button */}
                    {!item.is_featured && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetFeatured(item.id, item.title)}
                        style={{ borderColor: '#2d373f', color: '#eef1f4', fontSize: '11px' }}
                        title="Set as featured hero video"
                      >
                        <Star style={{ width: '11px', marginRight: '4px' }} /> Feature
                      </Button>
                    )}

                    {/* Publish Toggle Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublished(item)}
                      style={{ borderColor: '#2d373f', color: item.is_published !== false ? '#9ca3af' : '#b7ff63', fontSize: '11px' }}
                      title={item.is_published !== false ? 'Hide video' : 'Publish video'}
                    >
                      {item.is_published !== false ? (
                        <>
                          <EyeOff style={{ width: '11px', marginRight: '4px' }} /> Hide
                        </>
                      ) : (
                        <>
                          <Eye style={{ width: '11px', marginRight: '4px' }} /> Publish
                        </>
                      )}
                    </Button>

                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(item)}
                      style={{ borderColor: '#2d373f', color: '#eef1f4', fontSize: '11px' }}
                    >
                      <Edit2 style={{ width: '11px', marginRight: '4px' }} /> Edit
                    </Button>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id, item.title)}
                      style={{ borderColor: '#452626', color: '#f87171', background: 'rgba(239, 68, 68, 0.05)', fontSize: '11px' }}
                      title="Delete video"
                    >
                      <Trash2 style={{ width: '11px' }} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Video Modal */}
      {(isCreating || editingItem) && (
        <div className="modal-backdrop" onClick={() => { setIsCreating(false); setEditingItem(null) }}>
          <div
            className="product-modal"
            style={{ width: 'min(100%, 780px)', background: '#10161b', border: '1px solid #334149', padding: '28px', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => { setIsCreating(false); setEditingItem(null) }}
              aria-label="Close form"
            >
              <X />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <div className="section-label" style={{ marginBottom: '4px' }}>
                <span className="section-dot" /> {isCreating ? 'NEW VIDEO SHOWCASE' : 'EDIT VIDEO DEMO'}
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
                {isCreating ? 'Add Video Demo' : `Edit: ${editingItem?.title}`}
              </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Title & Caption */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Building SignalDesk AI"
                    style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                    Caption Badge Label
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="FIELD DEMO / 03:42"
                    style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                  Description Copy
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of this demo walkthrough..."
                  style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
              </div>

              {/* Provider & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                    Video Provider
                  </label>
                  <select
                    value={videoType}
                    onChange={(e) => setVideoType(e.target.value as VideoType)}
                    style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                  >
                    <option value="youtube">YouTube / YouTube Shorts</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="facebook">Facebook Video / Reel</option>
                    <option value="instagram">Instagram Video / Reel</option>
                    <option value="uploaded">Direct MP4/WebM Video Stream</option>
                    <option value="none">None (In-Preparation placeholder)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                    Duration Label (e.g. 03:42 or 0:45)
                  </label>
                  <input
                    type="text"
                    value={durationLabel}
                    onChange={(e) => setDurationLabel(e.target.value)}
                    placeholder="03:42"
                    style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Video URL or Direct Upload Box */}
              {videoType !== 'none' && (
                <div style={{ background: '#0a0e12', border: '1px solid #242e36', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#b7ff63', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                      Video URL (Auto-detects YouTube, Shorts, Vimeo, Facebook, Instagram, or direct MP4/WebM link)
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                      style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#11171d', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                    />
                  </div>

                  {/* Or Direct Video Upload */}
                  <div style={{ borderTop: '1px dashed #283139', paddingTop: '12px' }}>
                    <label style={{ display: 'block', color: '#9ba4ac', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                      Or Upload Direct Video File (MP4, WebM, QuickTime — max 50 MB)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      disabled={uploadStatus === 'uploading'}
                      onChange={handleDirectVideoUpload}
                      style={{ display: 'block', color: '#9ca5ad', fontSize: '12px' }}
                    />

                    {uploadStatus === 'uploading' && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#72b8ff', marginBottom: '4px' }}>
                          {uploadMessage} ({uploadProgressPercent}%)
                        </div>
                        <div style={{ width: '100%', height: '4px', background: '#1c252d', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgressPercent}%`, height: '100%', background: '#72b8ff', transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )}

                    {uploadStatus === 'error' && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '11px' }}>
                        {uploadError}
                      </div>
                    )}

                    {uploadStatus === 'success' && (
                      <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '6px', background: 'rgba(183,255,99,0.1)', border: '1px solid rgba(183,255,99,0.3)', color: '#b7ff63', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                        <span>{uploadMessage}</span>
                      </div>
                    )}
                  </div>

                  {/* Playable preview if uploaded video */}
                  {videoType === 'uploaded' && videoUrl && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#7e8b94', display: 'block', marginBottom: '6px' }}>
                        Playable direct video preview:
                      </span>
                      <video
                        controls
                        src={videoUrl}
                        style={{ width: '100%', maxHeight: '200px', borderRadius: '6px', background: '#000' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Thumbnail URL */}
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                  Video Thumbnail Image URL *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '16px' }}>
                  <input
                    type="url"
                    required
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                  />
                  <div style={{ height: '70px', borderRadius: '6px', overflow: 'hidden', background: '#0a0e12', border: '1px solid #222b31' }}>
                    <img src={thumbnailUrl} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>

              {/* Toggles: Featured & Published */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#0a0e12', padding: '14px', borderRadius: '8px', border: '1px solid #202a31' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#b7ff63' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#eef1f4' }}>Featured Showcase</div>
                    <div style={{ fontSize: '10px', color: '#7e8a93' }}>Displays in the primary hero video section</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#b7ff63' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#eef1f4' }}>Publish Live</div>
                    <div style={{ fontSize: '10px', color: '#7e8a93' }}>Uncheck to save as draft / hidden</div>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsCreating(false); setEditingItem(null) }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="primary-button"
                  disabled={saving || uploadStatus === 'uploading'}
                >
                  <Save style={{ width: '15px', marginRight: '6px' }} />
                  {saving ? 'Saving...' : uploadStatus === 'uploading' ? 'Uploading...' : 'Save Video Demo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accessible Video Player Modal Dialog for Previewing */}
      <VideoModal
        highlight={previewItem}
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  )
}
