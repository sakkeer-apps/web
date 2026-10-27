'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Globe,
  ExternalLink,
  Code2,
  Sparkles,
  Package,
  FileCheck,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Plus,
  X,
  ImageIcon,
  Check,
  Info,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveProduct, deleteProduct, fetchGitHubDetails } from '@/app/admin/products/actions'
import { saveRelease } from '@/app/admin/products/[id]/releases/actions'
import { Product, Release, AccentColor, AppCategory, ProductSourceType, GitHubRepoData, PackageType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { MediaPickerModal } from '@/components/admin/media-picker-modal'

interface ProductFormProps {
  initialData?: Product | null
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditing = Boolean(initialData?.id)

  // Current product ID (stateful in case created as draft during upload)
  const [productId, setProductId] = useState<string | undefined>(initialData?.id)

  // Source Type Tab ('upload' | 'webapp' | 'github')
  const initialTab = (searchParams.get('tab') as ProductSourceType) || initialData?.source_type || 'upload'
  const [activeTab, setActiveTab] = useState<ProductSourceType>(
    initialTab === 'webapp' || initialTab === 'github' ? initialTab : 'upload'
  )

  // Core fields
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [category, setCategory] = useState<AppCategory>(initialData?.category || 'AI tools')
  const [accent, setAccent] = useState<AccentColor>(initialData?.accent || 'cyan')
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || '')
  const [fullDesc, setFullDesc] = useState(initialData?.full_description || '')
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(initialData?.status || 'published')
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 1)
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? true)

  // Media & Imagery
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '')
  const [coverImageAlt, setCoverImageAlt] = useState(initialData?.cover_image_alt || '')
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  // Features list
  const [features, setFeatures] = useState<string[]>(initialData?.features || [])
  const [newFeatureText, setNewFeatureText] = useState('')

  // Web App Link Tab
  const [liveDemo, setLiveDemo] = useState(initialData?.live_demo_url || '')
  const [externalWebsite, setExternalWebsite] = useState(initialData?.external_website_url || '')

  // GitHub Project Tab
  const [repoUrl, setRepoUrl] = useState(initialData?.repo_url || initialData?.github_url || '')
  const [githubData, setGithubData] = useState<GitHubRepoData | null>(initialData?.github_data || null)
  const [fetchingGitHub, setFetchingGitHub] = useState(false)
  const [githubMessage, setGithubMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Technical Specs & Tags
  const [tagsStr, setTagsStr] = useState((initialData?.tags || []).join(', '))
  const [platformsStr, setPlatformsStr] = useState((initialData?.supported_platforms || []).join(', '))
  const [systemReqs, setSystemReqs] = useState(initialData?.system_requirements || '')
  const [portfolioDownloadDisplay, setPortfolioDownloadDisplay] = useState(initialData?.portfolio_download_display || '')

  // Releases management inside form
  const [existingReleases, setExistingReleases] = useState<Release[]>(initialData?.releases || [])
  const [showUploadPanel, setShowUploadPanel] = useState(!isEditing || existingReleases.length === 0)

  // File Upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadVersion, setUploadVersion] = useState('')
  const [uploadNotes, setUploadNotes] = useState('')
  const [uploadPackageType, setUploadPackageType] = useState<PackageType>('apk')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'computing_hash' | 'uploading' | 'verifying' | 'success' | 'error'>('idle')
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadChecksum, setUploadChecksum] = useState('')
  const [uploadedStoragePath, setUploadedStoragePath] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileDropInputRef = useRef<HTMLInputElement>(null)

  // Form saving states
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Auto-slug when title changes on new product
  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEditing && !productId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      )
    }
  }

  // Handle direct file selection
  function processSelectedFile(file: File) {
    setUploadFile(file)
    setUploadError(null)
    setUploadChecksum('')
    setUploadedStoragePath('')
    setUploadStatus('idle')

    // Detect package type from extension
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (ext === 'apk') {
      setUploadPackageType('apk')
      if (category !== 'Mobile APK') setCategory('Mobile APK')
    } else if (ext === 'exe') {
      setUploadPackageType('exe')
      if (category !== 'Windows EXE') setCategory('Windows EXE')
    } else if (ext === 'msi') {
      setUploadPackageType('msi')
      if (category !== 'Windows EXE') setCategory('Windows EXE')
    } else if (ext === 'zip') {
      setUploadPackageType('zip')
    }

    // Default version suggestion if empty
    if (!uploadVersion) {
      const match = file.name.match(/v?(\d+\.\d+(?:\.\d+)?)/i)
      if (match && match[1]) {
        setUploadVersion(`v${match[1]}`)
      } else {
        setUploadVersion('v1.0.0')
      }
    }
  }

  // Drag and drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processSelectedFile(file)
  }

  // Cover image direct file upload
  async function handleCoverDirectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setMessage(null)

    try {
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client not initialized')

      const uniquePath = `products/cover-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const { error: uploadErr } = await supabase.storage.from('media').upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(uniquePath)
      setCoverImageUrl(urlData.publicUrl)
      if (!coverImageAlt) {
        setCoverImageAlt(`${title || 'Product'} cover image`)
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: `Cover upload failed: ${err instanceof Error ? err.message : 'Unknown error'}` })
    } finally {
      setUploadingCover(false)
      if (coverFileInputRef.current) coverFileInputRef.current.value = ''
    }
  }

  // Fetch GitHub Repo Details
  async function handleFetchGitHub() {
    if (!repoUrl) {
      setGithubMessage({ type: 'error', text: 'Please enter a GitHub repository URL first.' })
      return
    }

    setFetchingGitHub(true)
    setGithubMessage(null)

    const res = await fetchGitHubDetails(repoUrl)

    if (res.success && res.data) {
      setGithubData(res.data)
      setGithubMessage({ type: 'success', text: `Fetched details for ${res.data.full_name} successfully!` })

      // Auto-populate fields if empty
      if (!title && res.data.name) setTitle(res.data.name)
      if (!shortDesc && res.data.description) setShortDesc(res.data.description)
      if (!liveDemo && res.data.homepage && res.data.homepage.startsWith('http')) {
        setLiveDemo(res.data.homepage)
      }
      if (res.data.topics && res.data.topics.length > 0 && !tagsStr) {
        setTagsStr(res.data.topics.slice(0, 5).join(', '))
      }
    } else {
      setGithubMessage({ type: 'error', text: res.error || 'Failed to fetch GitHub details.' })
    }
    setFetchingGitHub(false)
  }

  // Add a feature
  function handleAddFeature() {
    const text = newFeatureText.trim()
    if (!text) return
    if (!features.includes(text)) {
      setFeatures([...features, text])
    }
    setNewFeatureText('')
  }

  // Remove a feature
  function handleRemoveFeature(index: number) {
    setFeatures(features.filter((_, i) => i !== index))
  }

  // Execute binary file upload & attach release
  async function handleUploadBinaryRelease(targetProductId: string): Promise<boolean> {
    if (!uploadFile) return false

    setUploadStatus('computing_hash')
    setUploadProgressText('Computing SHA-256 cryptographic checksum...')
    setUploadError(null)

    try {
      const buffer = await uploadFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      setUploadChecksum(hashHex)

      setUploadStatus('uploading')
      setUploadProgressText(`Uploading ${uploadFile.name} (${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB) to private releases storage...`)

      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client is not available. Check configuration.')

      const uniquePath = `${targetProductId}/${Date.now()}-${uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      const { error: uploadErr } = await supabase.storage.from('releases').upload(uniquePath, uploadFile, {
        cacheControl: '3600',
        upsert: true,
      })

      if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`)

      setUploadStatus('verifying')
      setUploadProgressText('Verifying stored object...')

      // Verify the storage object exists
      const { error: verifyErr } = await supabase.storage.from('releases').createSignedUrl(uniquePath, 60)
      if (verifyErr) throw new Error(`Verification error: Uploaded package could not be confirmed in storage.`)

      setUploadedStoragePath(uniquePath)

      // Save release record in database
      const mb = uploadFile.size / (1024 * 1024)
      const formattedSize = mb >= 1 ? `${mb.toFixed(1)} MB` : `${(uploadFile.size / 1024).toFixed(0)} KB`

      const releasePayload = {
        product_id: targetProductId,
        version: uploadVersion.trim() || 'v1.0.0',
        release_notes: uploadNotes.trim() || `Release ${uploadVersion.trim() || 'v1.0.0'} published by author.`,
        release_date: new Date().toISOString().split('T')[0],
        package_type: uploadPackageType,
        file_name: uploadFile.name,
        storage_path: uniquePath,
        file_size_bytes: uploadFile.size,
        file_size_formatted: formattedSize,
        file_checksum_sha256: hashHex,
        is_published: true,
      }

      const relRes = await saveRelease(releasePayload)
      if (!relRes.success) {
        throw new Error(relRes.error || 'Failed to save release record')
      }

      setUploadStatus('success')
      setUploadProgressText(`File verified and release attached successfully!`)
      setUploadFile(null)
      setShowUploadPanel(false)
      return true
    } catch (err: unknown) {
      setUploadStatus('error')
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      setUploadProgressText(null)
      return false
    }
  }

  // Handle Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Prevent publication while upload is active or failed
    if (uploadStatus === 'uploading' || uploadStatus === 'computing_hash' || uploadStatus === 'verifying') {
      setMessage({ type: 'error', text: 'Please wait for the current file upload to complete before saving.' })
      return
    }

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

    // Build product payload
    const payload = {
      id: productId,
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
      source_type: activeTab,
      features,
      github_data: githubData,
    }

    // If uploading a binary package with a new product, ensure product is created first in draft status
    if (uploadFile && !productId) {
      // Temporarily mark as draft during upload to protect against failed uploads
      const draftPayload = { ...payload, status: 'draft' }
      const createRes = await saveProduct(draftPayload)
      if (!createRes.success || !createRes.id) {
        setMessage({ type: 'error', text: `Failed to create initial product draft: ${createRes.error}` })
        setSaving(false)
        return
      }

      setProductId(createRes.id)
      const uploadOk = await handleUploadBinaryRelease(createRes.id)
      if (!uploadOk) {
        setMessage({
          type: 'error',
          text: 'File upload failed. The product was saved as a Draft and remains protected from public display until a valid release is uploaded.',
        })
        setSaving(false)
        return
      }

      // If user chose 'published', update status now that upload succeeded
      if (status === 'published') {
        await saveProduct({ ...payload, id: createRes.id, status: 'published' })
      }

      setMessage({ type: 'success', text: 'Product created and release package uploaded successfully!' })
      router.push('/admin/products')
      router.refresh()
      setSaving(false)
      return
    }

    // Normal save for existing product or webapp/github sources
    const res = await saveProduct(payload)

    if (res.success) {
      const targetId = productId || res.id
      if (targetId) setProductId(targetId)

      // If there was a pending file to upload for an existing product
      if (uploadFile && targetId) {
        const uploadOk = await handleUploadBinaryRelease(targetId)
        if (!uploadOk) {
          setMessage({ type: 'error', text: 'Product details saved, but the file upload failed. Please retry the upload.' })
          setSaving(false)
          return
        }
      }

      setMessage({ type: 'success', text: 'Product saved successfully!' })
      router.push('/admin/products')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save product' })
    }
    setSaving(false)
  }

  // Handle Delete
  async function handleDelete() {
    if (!productId) return
    const confirmed = window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)
    if (!confirmed) return

    setDeleting(true)
    const res = await deleteProduct(productId)
    if (res.success) {
      router.push('/admin/products')
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete product' })
      setDeleting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '960px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <Link href="/admin" style={{ color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
            ← Dashboard
          </Link>
          <span style={{ color: '#52606d' }}>/</span>
          <Link href="/admin/products" style={{ color: '#a1abb2', textDecoration: 'none' }}>
            Applications
          </Link>
          <span style={{ color: '#52606d' }}>/</span>
          <span style={{ color: '#74808a' }}>{isEditing ? 'Edit' : 'New'}</span>
        </div>

        {/* Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button asChild variant="outline" size="icon" style={{ width: '36px', height: '36px', borderColor: '#2b353d' }}>
              <Link href="/admin/products">
                <ArrowLeft style={{ width: '16px' }} />
              </Link>
            </Button>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
                {isEditing ? `Edit: ${title || initialData?.title}` : 'Create New Product'}
              </h1>
              <span style={{ fontSize: '11px', color: '#74808a' }}>
                {productId ? `ID: ${productId} • Slug: ${slug}` : 'Add a new software project, release build, or live showcase'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {productId && (
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
            <Button
              type="submit"
              className="primary-button"
              disabled={saving || uploadStatus === 'uploading' || uploadStatus === 'computing_hash'}
            >
              <Save style={{ width: '14px', marginRight: '6px' }} /> {saving ? 'Saving...' : 'Save & Publish Product'}
            </Button>
          </div>
        </div>

        {/* Global Feedback Banner */}
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
            {message.type === 'error' ? <AlertCircle style={{ width: '16px', flexShrink: 0 }} /> : <CheckCircle2 style={{ width: '16px', flexShrink: 0 }} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION: Application Source Tabs (Requirement 1, 2, 3, 4)                  */}
        {/* ------------------------------------------------------------------------- */}
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b7ff63' }} />
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#eef1f4' }}>Application Source & Distribution</h2>
              </div>
              <span style={{ fontSize: '11px', color: '#74808a' }}>Select primary source (a product can support all three)</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#89939d' }}>
              Choose how users acquire or access this software. You can upload an installable binary package, connect a hosted web app, or showcase a GitHub repository.
            </p>
          </div>

          {/* Source Tabs Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              background: '#0a0e12',
              padding: '6px',
              borderRadius: '10px',
              border: '1px solid #202930',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'upload' ? '#182128' : 'transparent',
                color: activeTab === 'upload' ? '#b7ff63' : '#89939d',
                fontWeight: activeTab === 'upload' ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Upload style={{ width: '15px', height: '15px' }} /> Upload App File
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('webapp')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'webapp' ? '#182128' : 'transparent',
                color: activeTab === 'webapp' ? '#b7ff63' : '#89939d',
                fontWeight: activeTab === 'webapp' ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Globe style={{ width: '15px', height: '15px' }} /> Web App Link
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('github')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'github' ? '#182128' : 'transparent',
                color: activeTab === 'github' ? '#b7ff63' : '#89939d',
                fontWeight: activeTab === 'github' ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Code2 style={{ width: '15px', height: '15px' }} /> GitHub Project
            </button>
          </div>

          {/* TAB 1: UPLOAD APP FILE (Requirement 2) */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#c5ced4', fontWeight: 500 }}>
                  Upload an APK, EXE, MSI, or ZIP package directly from your computer or phone.
                </span>
                {productId && (
                  <Link
                    href={`/admin/products/${productId}/releases`}
                    style={{ fontSize: '11px', color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View version history ({existingReleases.length}) <ExternalLink style={{ width: '11px' }} />
                  </Link>
                )}
              </div>

              {/* Existing Releases Quick View for Existing Products */}
              {productId && existingReleases.length > 0 && !showUploadPanel && (
                <div style={{ background: '#0a0e12', border: '1px solid #1c242a', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package style={{ width: '16px', color: '#b7ff63' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#eef1f4' }}>
                        Active Release: {existingReleases[0]?.version} ({existingReleases[0]?.file_name})
                      </span>
                      <span style={{ fontSize: '11px', color: '#74808a' }}>{existingReleases[0]?.file_size_formatted}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUploadPanel(true)}
                      style={{ borderColor: 'rgba(183, 255, 99, 0.4)', color: '#b7ff63' }}
                    >
                      <Upload style={{ width: '13px', marginRight: '6px' }} /> Upload New Version
                    </Button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#89939d' }}>
                    SHA-256: <code style={{ color: '#d1d8dc' }}>{existingReleases[0]?.file_checksum_sha256?.substring(0, 24)}...</code>
                  </div>
                </div>
              )}

              {/* Upload Drop Zone & Controls */}
              {showUploadPanel && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${isDragOver ? '#b7ff63' : '#283139'}`,
                    background: isDragOver ? 'rgba(183, 255, 99, 0.05)' : '#0a0e12',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    ref={fileDropInputRef}
                    type="file"
                    accept=".apk,.exe,.msi,.zip,.dmg,.tar.gz,.gz,application/vnd.android.package-archive,application/x-msdownload,application/zip"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) processSelectedFile(file)
                    }}
                  />

                  {!uploadFile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'rgba(183, 255, 99, 0.08)',
                          border: '1px solid rgba(183, 255, 99, 0.2)',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#b7ff63',
                        }}
                      >
                        <Upload style={{ width: '22px', height: '22px' }} />
                      </div>

                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>
                          Drag & drop application package here, or click to browse
                        </div>
                        <div style={{ fontSize: '11px', color: '#74808a', marginTop: '4px' }}>
                          Supported file formats: <strong>.apk, .exe, .msi, .zip, .dmg, .tar.gz</strong> • Max size: <strong>500 MB</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <Button
                          type="button"
                          className="primary-button"
                          onClick={() => fileDropInputRef.current?.click()}
                        >
                          <Upload style={{ width: '14px', marginRight: '6px' }} /> Choose file from device
                        </Button>
                        {productId && existingReleases.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowUploadPanel(false)}
                            style={{ borderColor: '#2b353d' }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Selected File Details & Inputs */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c242a', paddingBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: 'rgba(183, 255, 99, 0.1)',
                              border: '1px solid rgba(183, 255, 99, 0.25)',
                              display: 'grid',
                              placeItems: 'center',
                              color: '#b7ff63',
                            }}
                          >
                            <FileCheck style={{ width: '18px', height: '18px' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#eef1f4' }}>{uploadFile.name}</div>
                            <div style={{ fontSize: '11px', color: '#74808a' }}>
                              {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB • Detected format: {uploadPackageType.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadFile(null)
                            setUploadStatus('idle')
                            setUploadError(null)
                            setUploadProgressText(null)
                          }}
                          style={{ borderColor: '#2b353d' }}
                        >
                          <X style={{ width: '13px', marginRight: '4px' }} /> Remove file
                        </Button>
                      </div>

                      {/* Version & Notes */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                            Release Version *
                          </label>
                          <input
                            type="text"
                            value={uploadVersion}
                            onChange={(e) => setUploadVersion(e.target.value)}
                            placeholder="v1.0.0"
                            style={{
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              background: '#12181f',
                              border: '1px solid #283139',
                              borderRadius: '6px',
                              color: '#eef1f4',
                              fontSize: '12px',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                            Package Type
                          </label>
                          <select
                            value={uploadPackageType}
                            onChange={(e) => setUploadPackageType(e.target.value as PackageType)}
                            style={{
                              width: '100%',
                              height: '38px',
                              padding: '0 12px',
                              background: '#12181f',
                              border: '1px solid #283139',
                              borderRadius: '6px',
                              color: '#eef1f4',
                              fontSize: '12px',
                            }}
                          >
                            <option value="apk">Android APK (.apk)</option>
                            <option value="exe">Windows Installer (.exe)</option>
                            <option value="msi">Windows Package (.msi)</option>
                            <option value="zip">Archive / Portable (.zip)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                          Release Notes (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={uploadNotes}
                          onChange={(e) => setUploadNotes(e.target.value)}
                          placeholder="What changed in this build: offline sync, performance boost, UI polish..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: '#12181f',
                            border: '1px solid #283139',
                            borderRadius: '6px',
                            color: '#eef1f4',
                            fontSize: '12px',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      {/* Status / Progress indicators */}
                      {uploadProgressText && (
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: '6px',
                            background: uploadStatus === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(183, 255, 99, 0.1)',
                            border: `1px solid ${uploadStatus === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(183, 255, 99, 0.25)'}`,
                            color: uploadStatus === 'error' ? '#fca5a5' : '#b7ff63',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          {uploadStatus === 'uploading' || uploadStatus === 'computing_hash' || uploadStatus === 'verifying' ? (
                            <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
                          ) : uploadStatus === 'success' ? (
                            <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                          ) : (
                            <AlertCircle style={{ width: '14px', height: '14px' }} />
                          )}
                          <span>{uploadProgressText}</span>
                        </div>
                      )}

                      {uploadError && (
                        <div style={{ color: '#f87171', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle style={{ width: '13px' }} /> {uploadError}
                        </div>
                      )}

                      <div style={{ fontSize: '11px', color: '#74808a' }}>
                        * This package will be encrypted and stored durably in your private Supabase storage bucket upon clicking <strong>Save & Publish Product</strong>.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WEB APP LINK (Requirement 3) */}
          {activeTab === 'webapp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '8px',
                  color: '#67e8f9',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <Info style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Web Application Hosting Notice:</strong> A source ZIP file or GitHub repository URL does not itself host a running application. Please provide a live, deployed HTTPS URL where visitors can immediately launch and interact with your software.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                    Live Application URL (HTTPS) *
                  </label>
                  <input
                    type="url"
                    value={liveDemo}
                    onChange={(e) => {
                      const val = e.target.value
                      setLiveDemo(val)
                      if (!title && !isEditing && val) {
                        try {
                          const parsed = new URL(val)
                          const pathSegments = parsed.pathname.split('/').filter(Boolean)
                          const candidate = pathSegments[pathSegments.length - 1] || parsed.hostname.split('.')[0]
                          if (candidate && candidate.length > 2) {
                            const formatted = candidate
                              .split(/[-_]+/)
                              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ')
                            setTitle(formatted)
                            if (!slug) {
                              setSlug(candidate.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
                            }
                          }
                        } catch {
                          // Invalid URL while typing, ignore
                        }
                      }
                    }}
                    placeholder="https://app.muhammedsakkeer.com or https://signaldesk.vercel.app"
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '0 12px',
                      background: '#0a0e12',
                      border: '1px solid #2d373f',
                      borderRadius: '6px',
                      color: '#eef1f4',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={!liveDemo}
                  onClick={() => {
                    if (liveDemo) window.open(liveDemo, '_blank', 'noopener,noreferrer')
                  }}
                  style={{ minHeight: '42px', borderColor: '#2b353d', color: liveDemo ? '#b7ff63' : '#74808a' }}
                >
                  <ExternalLink style={{ width: '14px', marginRight: '6px' }} /> Open / test link
                </Button>
              </div>

              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                  Marketing / Product Landing Page URL (Optional)
                </label>
                <input
                  type="url"
                  value={externalWebsite}
                  onChange={(e) => setExternalWebsite(e.target.value)}
                  placeholder="https://signaldesk.com"
                  style={{
                    width: '100%',
                    minHeight: '42px',
                    padding: '0 12px',
                    background: '#0a0e12',
                    border: '1px solid #2d373f',
                    borderRadius: '6px',
                    color: '#eef1f4',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB PROJECT (Requirement 4) */}
          {activeTab === 'github' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                    GitHub Repository URL *
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '0 12px',
                      background: '#0a0e12',
                      border: '1px solid #2d373f',
                      borderRadius: '6px',
                      color: '#eef1f4',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <Button
                  type="button"
                  className="primary-button"
                  disabled={fetchingGitHub || !repoUrl}
                  onClick={handleFetchGitHub}
                  style={{ minHeight: '42px' }}
                >
                  {fetchingGitHub ? (
                    <>
                      <Loader2 style={{ width: '14px', height: '14px', marginRight: '6px' }} className="animate-spin" /> Fetching...
                    </>
                  ) : (
                    <>
                      <RefreshCw style={{ width: '14px', marginRight: '6px' }} /> Fetch repository details
                    </>
                  )}
                </Button>
              </div>

              {githubMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: githubMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(183, 255, 99, 0.1)',
                    border: `1px solid ${githubMessage.type === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(183, 255, 99, 0.25)'}`,
                    color: githubMessage.type === 'error' ? '#fca5a5' : '#b7ff63',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {githubMessage.type === 'error' ? <AlertCircle style={{ width: '14px' }} /> : <CheckCircle2 style={{ width: '14px' }} />}
                  <span>{githubMessage.text}</span>
                </div>
              )}

              {/* GitHub Details Preview / Editable Metadata */}
              {githubData && (
                <div style={{ background: '#0a0e12', border: '1px solid #202930', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c242a', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Code2 style={{ width: '18px', color: '#b7ff63' }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#eef1f4' }}>{githubData.full_name}</span>
                      {githubData.language && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: '#d1d8dc' }}>
                          {githubData.language}
                        </span>
                      )}
                    </div>

                    <a
                      href={githubData.html_url || repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '11px', color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      View on GitHub <ExternalLink style={{ width: '11px' }} />
                    </a>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: '#74808a' }}>STARS:</span>{' '}
                      <strong style={{ color: '#eef1f4' }}>{githubData.stargazers_count ?? 0}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#74808a' }}>FORKS:</span>{' '}
                      <strong style={{ color: '#eef1f4' }}>{githubData.forks_count ?? 0}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#74808a' }}>LICENSE:</span>{' '}
                      <strong style={{ color: '#eef1f4' }}>{githubData.license || 'Custom'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#74808a' }}>BRANCH:</span>{' '}
                      <strong style={{ color: '#eef1f4' }}>{githubData.default_branch || 'main'}</strong>
                    </div>
                  </div>

                  {githubData.description && (
                    <div style={{ fontSize: '12px', color: '#c5ced4', background: '#12181f', padding: '10px 12px', borderRadius: '6px' }}>
                      {githubData.description}
                    </div>
                  )}

                  {githubData.latest_release_tag && (
                    <div style={{ fontSize: '11px', color: '#89939d' }}>
                      Latest release: <strong style={{ color: '#b7ff63' }}>{githubData.latest_release_tag}</strong> ({githubData.latest_release_name || 'Asset'})
                    </div>
                  )}
                </div>
              )}

              <div style={{ fontSize: '11px', color: '#74808a' }}>
                Note: Private repositories require authenticated personal access. For private repositories, leave metadata fields for manual editing. Text from repositories is treated as untrusted and never executed.
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION: Features List (Requirement 4 & 5)                                */}
        {/* ------------------------------------------------------------------------- */}
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#b7ff63' }}>Product Features & Highlights</h3>
            <span style={{ fontSize: '11px', color: '#74808a' }}>
              Add confirmed capabilities and highlights shown on the public product modal
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature()
                }
              }}
              placeholder="e.g. Offline-first local SQLite engine with zero network latency"
              style={{
                flex: 1,
                minHeight: '38px',
                padding: '0 12px',
                background: '#0a0e12',
                border: '1px solid #2d373f',
                borderRadius: '6px',
                color: '#eef1f4',
                fontSize: '12px',
              }}
            />
            <Button type="button" variant="outline" onClick={handleAddFeature} style={{ borderColor: '#2b353d', color: '#b7ff63' }}>
              <Plus style={{ width: '14px', marginRight: '4px' }} /> Add Feature
            </Button>
          </div>

          {features.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    background: '#0a0e12',
                    border: '1px solid #1c242a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#eef1f4',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check style={{ width: '14px', color: '#b7ff63', flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                    aria-label="Remove feature"
                  >
                    <X style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#68737c', fontStyle: 'italic' }}>
              No specific features listed yet. Add items above to showcase key capabilities in the public modal.
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION: Core Information                                                 */}
        {/* ------------------------------------------------------------------------- */}
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION: Imagery & Media (Requirement 6 - Easy image selection)            */}
        {/* ------------------------------------------------------------------------- */}
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#b7ff63' }}>Cover Image & Media</h3>
            <span style={{ fontSize: '11px', color: '#74808a' }}>
              Choose from Media Library, upload directly from your phone/desktop, or paste an external image URL
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Supabase storage URL"
                  style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
              </div>

              {/* Easy Image Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMediaPicker(true)}
                  style={{ borderColor: 'rgba(183, 255, 99, 0.4)', color: '#b7ff63', fontSize: '11px' }}
                >
                  <ImageIcon style={{ width: '13px', marginRight: '6px' }} /> Select from Media Library
                </Button>

                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleCoverDirectUpload}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingCover}
                  onClick={() => coverFileInputRef.current?.click()}
                  style={{ borderColor: '#2b353d', fontSize: '11px' }}
                >
                  {uploadingCover ? (
                    <>
                      <Loader2 style={{ width: '13px', marginRight: '6px' }} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload style={{ width: '13px', marginRight: '6px' }} /> Upload from device
                    </>
                  )}
                </Button>

                {!coverImageUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCoverImageUrl('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85')
                      if (!coverImageAlt) setCoverImageAlt(`${title || 'Product'} cover preview`)
                    }}
                    style={{ borderColor: '#2b353d', fontSize: '11px', color: '#89939d' }}
                  >
                    Use Sample Cover
                  </Button>
                )}
              </div>

              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                  Cover Image Alt Text
                </label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => setCoverImageAlt(e.target.value)}
                  placeholder="SignalDesk AI interface preview"
                  style={{ width: '100%', minHeight: '38px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Live Preview Box */}
            <div style={{ background: '#0a0e12', border: '1px solid #202930', borderRadius: '10px', overflow: 'hidden', height: '160px', display: 'grid', placeItems: 'center', position: 'relative' }}>
              {coverImageUrl ? (
                <img src={coverImageUrl} alt={coverImageAlt || 'Preview'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: '#68737c', fontSize: '11px' }}>
                  <ImageIcon style={{ width: '28px', height: '28px', margin: '0 auto 6px', opacity: 0.5 }} />
                  <span>Cover preview will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------------- */}
        {/* SECTION: Technical Specifications & Platforms                              */}
        {/* ------------------------------------------------------------------------- */}
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#b7ff63' }}>Technical Specifications</h3>

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

          {/* Portfolio Manual Stats Preservation */}
          <div style={{ padding: '16px', background: '#0a0e12', border: '1px solid #1e262c', borderRadius: '8px' }}>
            <label style={{ display: 'block', color: '#b7ff63', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
              Portfolio Download Display Metric
            </label>
            <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#74808a' }}>
              Original portfolio label (e.g. "2.8k", "1.4k"). Preserves original visual identity while actual downloads are logged separately.
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

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '10px' }}>
          <Button asChild variant="outline" style={{ borderColor: '#2b353d', color: '#9ba4ac' }}>
            <Link href="/admin/products">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="primary-button"
            size="lg"
            disabled={saving || uploadStatus === 'uploading' || uploadStatus === 'computing_hash'}
          >
            <Save style={{ width: '16px', marginRight: '8px' }} /> {saving ? 'Saving...' : 'Save & Publish Product'}
          </Button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url, alt) => {
          setCoverImageUrl(url)
          if (alt && !coverImageAlt) setCoverImageAlt(alt)
        }}
      />
    </>
  )
}
