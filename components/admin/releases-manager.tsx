'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Download,
  Trash2,
  FileCheck,
  ShieldAlert,
  Shield,
  Upload,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Product, Release, PackageType } from '@/types'
import { saveRelease, deleteRelease, toggleReleasePublished } from '@/app/admin/products/[id]/releases/actions'
import { createClient } from '@/lib/supabase/client'

interface ReleasesManagerProps {
  product: Product
  releases: Release[]
}

export function ReleasesManager({ product, releases }: ReleasesManagerProps) {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Form states
  const [version, setVersion] = useState('')
  const [packageType, setPackageType] = useState<PackageType>(
    product.category === 'Mobile APK'
      ? 'apk'
      : product.category === 'Windows EXE'
      ? 'exe'
      : product.category === 'Web apps'
      ? 'external_web'
      : 'zip'
  )
  const [releaseNotes, setReleaseNotes] = useState('')
  const [releaseDate, setReleaseDate] = useState(() => new Date().toISOString().split('T')[0])
  const [externalLaunchUrl, setExternalLaunchUrl] = useState(product.live_demo_url || '')
  const [fileName, setFileName] = useState('')
  const [storagePath, setStoragePath] = useState('')
  const [fileSizeBytes, setFileSizeBytes] = useState(0)
  const [fileSizeFormatted, setFileSizeFormatted] = useState('')
  const [sha256, setSha256] = useState('')
  const [isPublished, setIsPublished] = useState(true)

  // Upload progress & states
  const [calculatingHash, setCalculatingHash] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'computing_hash' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Handle file selection, SHA-256 calculation, and upload with actual error handling
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileSizeBytes(file.size)
    setUploadError(null)
    setStoragePath('')

    // Format file size
    const mb = file.size / (1024 * 1024)
    const formatted = mb >= 1 ? `${mb.toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`
    setFileSizeFormatted(formatted)

    setCalculatingHash(true)
    setUploadStatus('computing_hash')
    setUploadProgress('Computing cryptographic SHA-256 checksum from bytes...')

    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      setSha256(hashHex)
      setCalculatingHash(false)

      // Direct-to-storage upload to 'releases' bucket
      const supabase = createClient()
      if (!supabase) {
        setUploadStatus('error')
        setUploadError('Supabase storage is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or anon key.')
        return
      }

      setUploadStatus('uploading')
      setUploadProgress(`Uploading ${file.name} directly to secure releases storage bucket...`)

      const uniquePath = `${product.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      const { error: uploadErr } = await supabase.storage.from('releases').upload(uniquePath, file, {
        cacheControl: '3600',
        upsert: true,
      })

      if (uploadErr) {
        setUploadStatus('error')
        setUploadError(`Storage upload failed: ${uploadErr.message}`)
        setStoragePath('')
        setUploadProgress(null)
        return
      }

      // Verify the uploaded object exists in storage before declaring success
      const { error: verifyErr } = await supabase.storage.from('releases').createSignedUrl(uniquePath, 60)
      if (verifyErr) {
        setUploadStatus('error')
        setUploadError(`Uploaded file verification failed: ${verifyErr.message}`)
        setStoragePath('')
        setUploadProgress(null)
        return
      }

      // Success
      setStoragePath(uniquePath)
      setUploadStatus('success')
      setUploadProgress(`Binary successfully uploaded & verified in storage bucket! (${formatted})`)
    } catch (err: unknown) {
      console.error('File upload error:', err)
      setUploadStatus('error')
      setUploadError(err instanceof Error ? err.message : 'Error processing binary package file')
      setStoragePath('')
    } finally {
      setCalculatingHash(false)
    }
  }

  async function handleAddRelease(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    // Requirement 6: Prevent publishing while uploading or after failure
    if (packageType !== 'external_web') {
      if (calculatingHash || uploadStatus === 'uploading') {
        setMessage({ type: 'error', text: 'Please wait for file hash computation and binary upload to finish.' })
        setSaving(false)
        return
      }

      if (uploadStatus === 'error') {
        setMessage({
          type: 'error',
          text: `Cannot publish build: ${uploadError || 'Storage upload failed'}. Please select a file to retry upload.`,
        })
        setSaving(false)
        return
      }

      if (!storagePath) {
        setMessage({
          type: 'error',
          text: 'A binary package file must be uploaded to storage before publishing this build.',
        })
        setSaving(false)
        return
      }
    }

    const payload = {
      product_id: product.id,
      version: version.trim(),
      release_notes: releaseNotes.trim(),
      release_date: releaseDate,
      package_type: packageType,
      file_name: fileName.trim(),
      storage_path: storagePath.trim(),
      file_size_bytes: fileSizeBytes,
      file_size_formatted: fileSizeFormatted || (fileSizeBytes ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '0 MB'),
      file_checksum_sha256: sha256.trim(),
      external_launch_url: externalLaunchUrl.trim(),
      is_published: isPublished,
      safety_scan_status: 'unscanned',
      safety_scan_provider: 'Self-hosted Author Upload',
      safety_scan_notes: 'Binary uploaded directly by software author.',
    }

    const res = await saveRelease(payload)
    if (res.success) {
      setMessage({ type: 'success', text: `Release ${version} published successfully!` })
      setShowAddForm(false)
      setVersion('')
      setReleaseNotes('')
      setFileName('')
      setStoragePath('')
      setSha256('')
      setFileSizeBytes(0)
      setFileSizeFormatted('')
      setUploadStatus('idle')
      setUploadProgress(null)
      setUploadError(null)
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save release' })
    }
    setSaving(false)
  }

  async function handleDeleteRelease(relId: string, relVer: string) {
    const confirmed = window.confirm(`Permanently remove release ${relVer}?`)
    if (!confirmed) return

    const res = await deleteRelease(relId, product.id)
    if (res.success) {
      setMessage({ type: 'success', text: `Release ${relVer} deleted` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Delete failed' })
    }
  }

  async function handleTogglePublished(relId: string, current: boolean) {
    const res = await toggleReleasePublished(relId, product.id, !current)
    if (res.success) {
      setMessage({ type: 'success', text: `Release ${!current ? 'published' : 'hidden'} successfully.` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Status update failed' })
    }
  }

  const isUploadBlocked =
    packageType !== 'external_web' &&
    (calculatingHash || uploadStatus === 'uploading' || uploadStatus === 'error' || !storagePath)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button asChild variant="outline" size="icon" style={{ width: '36px', height: '36px', borderColor: '#2b353d' }}>
            <Link href="/admin/products">
              <ArrowLeft style={{ width: '16px' }} />
            </Link>
          </Button>
          <div>
            <div className="section-label" style={{ marginBottom: '4px' }}>
              <span className="section-dot" /> RELEASE MANAGEMENT
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
              {product.title} — Releases & Builds
            </h1>
            <span style={{ fontSize: '11px', color: '#74808a' }}>
              {product.category} • {releases.length} total versions recorded
            </span>
          </div>
        </div>

        <Button className="primary-button" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus data-icon="inline-start" /> {showAddForm ? 'Cancel' : 'New release build'}
        </Button>
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

      {/* Add Release Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddRelease}
          style={{
            background: '#10161b',
            border: '1px solid #b7ff63',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#b7ff63' }}>Publish New Release Build</h3>
            <span style={{ fontSize: '11px', color: '#8d98a2' }}>All checksums are verified from file bytes</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Version String *
              </label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v2.5.0"
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Package Format *
              </label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value as PackageType)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              >
                <option value="apk">Android APK (.apk)</option>
                <option value="exe">Windows Executable (.exe)</option>
                <option value="msi">Windows Installer (.msi)</option>
                <option value="zip">ZIP Archive (.zip)</option>
                <option value="external_web">Hosted Web Application (URL)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Release Date *
              </label>
              <input
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Package File Upload or External Link */}
          {packageType === 'external_web' ? (
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Web Application Launch URL *
              </label>
              <input
                type="url"
                required
                value={externalLaunchUrl}
                onChange={(e) => setExternalLaunchUrl(e.target.value)}
                placeholder="https://app.signaldesk.com"
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>
          ) : (
            <div style={{ background: '#0a0e12', border: '1px solid #252f36', borderRadius: '8px', padding: '16px' }}>
              <label style={{ display: 'block', color: '#b7ff63', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Upload Binary Package ({packageType.toUpperCase()}) *
              </label>
              <input
                type="file"
                disabled={uploadStatus === 'uploading' || calculatingHash}
                onChange={handleFileSelect}
                style={{ display: 'block', color: '#9ca5ad', fontSize: '12px', marginBottom: '12px' }}
              />

              {/* Status and Progress Alerts */}
              {uploadStatus === 'computing_hash' && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255, 191, 123, 0.1)', border: '1px solid rgba(255, 191, 123, 0.3)', color: '#ffbf7b', fontSize: '11px', marginBottom: '10px' }}>
                  {uploadProgress}
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(114, 184, 255, 0.1)', border: '1px solid rgba(114, 184, 255, 0.3)', color: '#72b8ff', fontSize: '11px', marginBottom: '10px' }}>
                  {uploadProgress}
                </div>
              )}

              {uploadStatus === 'error' && (
                <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#f87171' }}>
                    <AlertCircle style={{ width: '14px', height: '14px' }} />
                    <span>Upload Error (Publishing Blocked):</span>
                  </div>
                  <div style={{ marginTop: '4px' }}>{uploadError}</div>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#d1d5db' }}>
                    Please select a file again to retry upload. Publishing is prevented until storage upload succeeds.
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(183, 255, 99, 0.1)', border: '1px solid rgba(183, 255, 99, 0.3)', color: '#b7ff63', fontSize: '11px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                  <span>{uploadProgress}</span>
                </div>
              )}

              {fileName && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11px', color: '#9ba4ac', marginTop: '8px' }}>
                  <div>File: <strong style={{ color: '#eef1f4' }}>{fileName}</strong></div>
                  <div>Calculated Size: <strong style={{ color: '#eef1f4' }}>{fileSizeFormatted}</strong></div>
                  <div style={{ gridColumn: '1 / -1', wordBreak: 'break-all' }}>
                    SHA-256 Checksum: <code style={{ color: '#b7ff63' }}>{sha256 || 'Calculating...'}</code>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Release Notes & Changelog
            </label>
            <textarea
              rows={3}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Summary of improvements, bug fixes, or new features in this version..."
              style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px', resize: 'vertical' }}
            />
          </div>

          {/* Publication Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#0a0e12', borderRadius: '6px', border: '1px solid #252e35' }}>
            <input
              type="checkbox"
              id="isPublishedCheck"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#b7ff63', cursor: 'pointer' }}
            />
            <label htmlFor="isPublishedCheck" style={{ fontSize: '12px', color: '#eef1f4', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Publish this release build immediately</span>
              <span style={{ fontSize: '10px', color: '#74808a' }}>(Uncheck to preserve as internal draft / hidden)</span>
            </label>
          </div>

          {/* Safety Scan Disclosure */}
          <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid #252e35', borderRadius: '6px', fontSize: '11px', color: '#89939d', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield style={{ width: '14px', color: '#b7ff63' }} />
            <span>
              Safety Disclosure: This file is labeled honestly as <strong>Self-hosted author upload (Unscanned by 3rd-party vendor)</strong>.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="primary-button"
              disabled={saving || isUploadBlocked}
              title={isUploadBlocked ? 'Upload binary file before publishing' : 'Publish release'}
            >
              {saving ? 'Publishing build...' : uploadStatus === 'uploading' ? 'Uploading file...' : 'Publish Build'}
            </Button>
          </div>
        </form>
      )}

      {/* Release History List */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #202930', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#eef1f4' }}>Release History</h3>
          <span style={{ fontSize: '11px', color: '#68737c' }}>Newest builds listed first</span>
        </div>

        {releases.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#68737c', fontSize: '12px' }}>
            No release packages have been uploaded yet for {product.title}. Click "New release build" to publish version 1.0.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {releases.map((rel) => (
              <div
                key={rel.id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #1c242a',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#eef1f4' }}>{rel.version}</span>
                    <span className="category-badge" style={{ fontSize: '8px' }}>
                      {rel.package_type.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '11px', color: '#74808a' }}>• {rel.release_date}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '99px',
                        fontSize: '9px',
                        fontWeight: 600,
                        background: rel.is_published ? 'rgba(183, 255, 99, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                        color: rel.is_published ? '#b7ff63' : '#9ca3af',
                      }}
                    >
                      {rel.is_published ? 'Published' : 'Hidden'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#919ca4', lineHeight: 1.5 }}>
                    {rel.release_notes || 'No changelog notes provided.'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '11px', color: '#68737c' }}>
                    {rel.file_name && <div>Package: <span style={{ color: '#b5c0c8' }}>{rel.file_name}</span></div>}
                    <div>Size: <span style={{ color: '#b5c0c8' }}>{rel.file_size_formatted || 'N/A'}</span></div>
                    <div>Tracked Downloads: <span style={{ color: '#b7ff63' }}>{rel.download_count}</span></div>
                    {rel.file_checksum_sha256 && (
                      <div style={{ width: '100%' }}>
                        SHA-256: <code style={{ color: '#72b8ff', fontSize: '10px' }}>{rel.file_checksum_sha256}</code>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {rel.package_type === 'external_web' ? (
                    <Button asChild size="sm" variant="outline" style={{ borderColor: '#2d3841', color: '#b7ff63', fontSize: '11px' }}>
                      <a href={rel.external_launch_url || product.live_demo_url || '#'} target="_blank" rel="noopener noreferrer">
                        Open Web App <ExternalLink style={{ width: '11px', marginLeft: '4px' }} />
                      </a>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" style={{ borderColor: '#2d3841', color: '#b7ff63', fontSize: '11px' }}>
                      <a href={`/api/download/${rel.id}`} target="_blank" rel="noopener noreferrer">
                        <Download style={{ width: '11px', marginRight: '4px' }} /> Test download
                      </a>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublished(rel.id, rel.is_published)}
                    style={{ borderColor: '#2d3841', fontSize: '11px', color: '#c5ced4' }}
                    title={rel.is_published ? 'Unpublish build (hide from public)' : 'Publish build'}
                  >
                    {rel.is_published ? (
                      <>
                        <EyeOff style={{ width: '11px', marginRight: '4px' }} /> Unpublish
                      </>
                    ) : (
                      <>
                        <Eye style={{ width: '11px', marginRight: '4px' }} /> Publish
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRelease(rel.id, rel.version)}
                    style={{ borderColor: '#452626', color: '#f87171', background: 'rgba(239, 68, 68, 0.05)', fontSize: '11px' }}
                  >
                    <Trash2 style={{ width: '11px' }} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
