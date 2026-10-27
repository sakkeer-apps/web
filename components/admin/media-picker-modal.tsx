'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, Upload, Check, ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaAsset } from '@/types'
import { fetchMediaAssetsList, saveMediaAssetRecord } from '@/app/admin/media/actions'
import { createClient } from '@/lib/supabase/client'

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string, altText?: string) => void
  title?: string
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Image from Media Library',
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setUploadError(null)
      fetchMediaAssetsList()
        .then((data) => setAssets(data))
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredAssets = assets.filter((a) => {
    const q = search.toLowerCase()
    return (
      a.file_name.toLowerCase().includes(q) ||
      (a.alt_text && a.alt_text.toLowerCase().includes(q))
    )
  })

  async function handleDirectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (PNG, JPG, WebP, SVG, GIF).')
      return
    }

    setUploading(true)
    setUploadError(null)

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
        publicUrl = URL.createObjectURL(file)
        storagePath = `local/${file.name}`
      }

      const res = await saveMediaAssetRecord({
        file_name: file.name,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: file.type,
        file_size_bytes: file.size,
        alt_text: file.name.replace(/\.[^/.]+$/, ''),
      })

      if (res.success && res.asset) {
        setAssets((prev) => [res.asset!, ...prev])
        onSelect(res.asset.public_url, res.asset.alt_text)
        onClose()
      } else {
        setUploadError(res.error || 'Failed to save asset record')
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="admin-modal"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '85vh',
          background: '#0d1217',
          border: '1px solid #283139',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #202930',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#10161b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(183, 255, 99, 0.1)',
                border: '1px solid rgba(183, 255, 99, 0.25)',
                display: 'grid',
                placeItems: 'center',
                color: '#b7ff63',
              }}
            >
              <ImageIcon style={{ width: '16px', height: '16px' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#eef1f4' }}>{title}</h2>
              <span style={{ fontSize: '11px', color: '#74808a' }}>Click an image to select, or upload a new one directly</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#89939d',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Action bar: Search + Upload New */}
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid #1c242a',
            background: '#0a0e12',
          }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '14px',
                height: '14px',
                color: '#74808a',
              }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by name or alt..."
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '34px',
                paddingRight: '12px',
                background: '#12181f',
                border: '1px solid #283139',
                borderRadius: '8px',
                color: '#eef1f4',
                fontSize: '12px',
              }}
            />
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              style={{ display: 'none' }}
              onChange={handleDirectUpload}
            />
            <Button
              type="button"
              className="primary-button"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 style={{ width: '13px', height: '13px', marginRight: '6px' }} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload style={{ width: '13px', height: '13px', marginRight: '6px' }} /> Upload New Image
                </>
              )}
            </Button>
          </div>
        </div>

        {uploadError && (
          <div
            style={{
              padding: '10px 24px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '12px',
            }}
          >
            {uploadError}
          </div>
        )}

        {/* Image Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#74808a', fontSize: '13px' }}>
              <Loader2 style={{ width: '24px', height: '24px', margin: '0 auto 10px' }} className="animate-spin" />
              Loading media library assets...
            </div>
          ) : filteredAssets.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                border: '1px dashed #283139',
                borderRadius: '12px',
                color: '#74808a',
                fontSize: '13px',
              }}
            >
              {search ? 'No images match your search term.' : 'No images in media library yet.'}
              <div style={{ marginTop: '12px' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderColor: '#2b353d' }}
                >
                  <Upload style={{ width: '13px', marginRight: '6px' }} /> Upload image from device
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                gap: '14px',
              }}
            >
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset.public_url, asset.alt_text)
                    onClose()
                  }}
                  style={{
                    cursor: 'pointer',
                    background: '#10161b',
                    border: '1px solid #202930',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#b7ff63'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#202930'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100px',
                      background: '#080b0f',
                      overflow: 'hidden',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <img
                      src={asset.public_url}
                      alt={asset.alt_text || asset.file_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '8px 10px', fontSize: '11px' }}>
                    <div
                      style={{
                        color: '#d1d8dc',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={asset.file_name}
                    >
                      {asset.file_name}
                    </div>
                    {asset.alt_text && (
                      <div
                        style={{
                          color: '#74808a',
                          fontSize: '10px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                      >
                        {asset.alt_text}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #202930',
            display: 'flex',
            justifyContent: 'flex-end',
            background: '#10161b',
          }}
        >
          <Button type="button" variant="outline" size="sm" onClick={onClose} style={{ borderColor: '#2b353d' }}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
