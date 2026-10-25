'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaAsset } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { checkAssetReferences, deleteMediaAsset, saveMediaAssetRecord } from '@/app/admin/media/actions'

interface MediaLibraryProps {
  initialAssets: MediaAsset[]
}

export function MediaLibrary({ initialAssets }: MediaLibraryProps) {
  const router = useRouter()
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets)
  const [uploading, setUploading] = useState(false)
  const [altText, setAltText] = useState('')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [checkingRefs, setCheckingRefs] = useState<string | null>(null)
  const [assetReferences, setAssetReferences] = useState<Record<string, string[]>>({})

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      let publicUrl = ''
      let storagePath = ''

      if (supabase) {
        const uniquePath = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const { error: uploadErr } = await supabase.storage.from('media').upload(uniquePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

        if (uploadErr) throw uploadErr

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(uniquePath)
        publicUrl = urlData.publicUrl
        storagePath = uniquePath
      } else {
        // Fallback simulated local preview url
        publicUrl = URL.createObjectURL(file)
        storagePath = `local/${file.name}`
      }

      const res = await saveMediaAssetRecord({
        file_name: file.name,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: file.type,
        file_size_bytes: file.size,
        alt_text: altText.trim() || file.name,
      })

      if (res.success && res.asset) {
        setAssets([res.asset, ...assets])
        setMessage({ type: 'success', text: `Uploaded ${file.name} successfully!` })
        setAltText('')
        router.refresh()
      } else {
        setMessage({ type: 'error', text: res.error || 'Upload record failed' })
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  async function handleCheckReferences(asset: MediaAsset) {
    setCheckingRefs(asset.id)
    const refs = await checkAssetReferences(asset.public_url)
    setAssetReferences((prev) => ({ ...prev, [asset.id]: refs }))
    setCheckingRefs(null)
  }

  async function handleDelete(asset: MediaAsset) {
    const confirmed = window.confirm(`Delete media asset "${asset.file_name}"?`)
    if (!confirmed) return

    const res = await deleteMediaAsset(asset.id, asset.public_url, asset.storage_path)
    if (res.success) {
      setAssets(assets.filter((a) => a.id !== asset.id))
      setMessage({ type: 'success', text: `Asset ${asset.file_name} deleted` })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete asset' })
      if (res.references) {
        setAssetReferences((prev) => ({ ...prev, [asset.id]: res.references }))
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px' }}>
      {/* Header */}
      <div>
        <div className="section-label" style={{ marginBottom: '4px' }}>
          <span className="section-dot" /> ASSET REPOSITORY
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
          Media Library
        </h1>
        <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
          Upload screenshots, product covers, and brand graphics with automatic reference checks before deletion.
        </p>
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

      {/* Upload Zone */}
      <div
        style={{
          background: '#10161b',
          border: '1px dashed #34404a',
          borderRadius: '14px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(183, 255, 99, 0.1)',
            color: '#b7ff63',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Upload style={{ width: '20px' }} />
        </div>

        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#eef1f4' }}>
            Upload Media to Durable Object Storage
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#8d98a2' }}>
            PNG, JPG, WebP, SVG, and MP4 up to 15MB. Aspect ratio is preserved.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: 'min(100%, 460px)', marginTop: '8px' }}>
          <input
            type="text"
            placeholder="Alt text description (optional)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            style={{
              flex: 1,
              height: '38px',
              padding: '0 12px',
              background: '#0a0e12',
              border: '1px solid #2d373f',
              borderRadius: '6px',
              color: '#eef1f4',
              fontSize: '12px',
            }}
          />
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 16px',
              height: '38px',
              background: '#b7ff63',
              color: '#0c1108',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {uploading ? 'Uploading...' : 'Browse file'}
            <input
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Media Grid */}
      <div>
        <h3 style={{ fontSize: '15px', color: '#eef1f4', marginBottom: '14px' }}>
          Stored Assets ({assets.length})
        </h3>

        {assets.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              background: '#10161b',
              border: '1px solid #222b31',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#68737c',
              fontSize: '12px',
            }}
          >
            No media assets uploaded to the library yet. Upload images above or use existing URLs in product settings.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {assets.map((asset) => {
              const refs = assetReferences[asset.id]
              const isReferenced = refs && refs.length > 0

              return (
                <div
                  key={asset.id}
                  style={{
                    background: '#10161b',
                    border: '1px solid #283139',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ height: '140px', background: '#0a0e12', position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={asset.public_url}
                      alt={asset.alt_text || asset.file_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#eef1f4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {asset.file_name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#74808a', marginTop: '2px' }}>
                        {(asset.file_size_bytes / 1024).toFixed(0)} KB • {asset.alt_text || 'No alt text'}
                      </div>
                    </div>

                    {/* Reference Badges */}
                    {isReferenced && (
                      <div style={{ padding: '6px 8px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: '4px', fontSize: '10px', color: '#fef08a' }}>
                        Referenced in: {refs.join(', ')}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(asset.public_url)}
                        style={{ flex: 1, borderColor: '#2b353d', fontSize: '10px', height: '30px' }}
                      >
                        {copiedUrl === asset.public_url ? (
                          <>
                            <Check style={{ width: '10px', marginRight: '4px', color: '#b7ff63' }} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: '10px', marginRight: '4px' }} /> Copy URL
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckReferences(asset)}
                        disabled={checkingRefs === asset.id}
                        title="Check if used on site"
                        style={{ borderColor: '#2b353d', fontSize: '10px', height: '30px', padding: '0 8px' }}
                      >
                        <Info style={{ width: '11px' }} />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(asset)}
                        title="Safe delete"
                        style={{ borderColor: '#452626', color: '#f87171', background: 'rgba(239,68,68,0.05)', fontSize: '10px', height: '30px', padding: '0 8px' }}
                      >
                        <Trash2 style={{ width: '11px' }} />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
