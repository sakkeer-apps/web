'use client'

import { useEffect, useRef } from 'react'
import { X, AlertCircle, ExternalLink, ShieldAlert, Sparkles, Play } from 'lucide-react'
import { MediaHighlight } from '@/types'
import { parseVideoEmbedInfo } from '@/lib/video-helpers'

interface VideoModalProps {
  highlight: MediaHighlight | null
  isOpen: boolean
  onClose: () => void
}

export function VideoModal({ highlight, isOpen, onClose }: VideoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      modalRef.current?.focus()
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !highlight) return null

  const info = parseVideoEmbedInfo(highlight.video_url, highlight.video_type)
  const isDirectVideo = info.provider === 'uploaded' && Boolean(highlight.video_url)
  const hasEmbed = Boolean(info.embedUrl)
  const isVertical = info.isShortOrReel

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="product-modal"
        style={{
          width: isVertical ? 'min(100%, 460px)' : 'min(100%, 860px)',
          background: '#0d1318',
          border: '1px solid #334149',
          outline: 'none',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(183, 255, 99, 0.1)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close video player">
          <X />
        </button>

        {/* Modal Header */}
        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #1c252d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="section-dot" />
            <span className="section-label" style={{ margin: 0 }}>
              {highlight.caption || 'DEMO VIDEO'}
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'rgba(183, 255, 99, 0.08)',
                color: '#b7ff63',
                border: '1px solid rgba(183, 255, 99, 0.25)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {info.platformName}
            </span>
          </div>
          <h2 id="video-title" style={{ fontSize: '20px', margin: '4px 0 0', color: '#eef1f4', fontWeight: 700 }}>
            {highlight.title || 'System Walkthrough'}
          </h2>
        </div>

        {/* Player Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: isVertical ? '9/16' : '16/9',
            maxHeight: isVertical ? '72vh' : 'auto',
            background: '#000',
            overflow: 'hidden',
          }}
        >
          {hasEmbed ? (
            <iframe
              src={info.embedUrl!}
              title={highlight.title || 'Video Player'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : isDirectVideo ? (
            <video
              controls
              autoPlay
              playsInline
              src={highlight.video_url}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px',
                textAlign: 'center',
                background: '#0a0e12',
                color: '#9ba4ac',
              }}
            >
              <AlertCircle style={{ width: '38px', height: '38px', color: '#b7ff63', marginBottom: '14px' }} />
              <h3 style={{ margin: '0 0 8px', color: '#eef1f4', fontSize: '18px', fontWeight: 600 }}>
                Walkthrough Video in Production
              </h3>
              <p style={{ margin: 0, fontSize: '13px', maxWidth: '440px', lineHeight: 1.6, color: '#89939d' }}>
                {highlight.description ||
                  'The live demo for this project is currently being recorded by the author. When ready, playback will stream right here.'}
              </p>
            </div>
          )}
        </div>

        {/* Honest Disclosure & Watch on Platform Bar */}
        <div
          style={{
            padding: '14px 20px',
            background: '#0a0f13',
            borderTop: '1px solid #1c252d',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '11px',
            color: '#7b8790',
          }}
        >
          <div style={{ flex: '1 1 240px', lineHeight: 1.4 }}>
            {info.restrictionNotice ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert style={{ width: '13px', height: '13px', color: '#f59e0b', flexShrink: 0 }} />
                <span>{info.restrictionNotice}</span>
              </span>
            ) : (
              <span>Streaming authentic author demo walkthrough.</span>
            )}
          </div>

          {info.platformUrl && info.provider !== 'uploaded' && info.provider !== 'none' && (
            <a
              href={info.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#b7ff63',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                background: 'rgba(183, 255, 99, 0.08)',
                border: '1px solid rgba(183, 255, 99, 0.25)',
                whiteSpace: 'nowrap',
              }}
            >
              Watch on {info.platformName.replace(' Reel', '').replace(' Shorts', '')}{' '}
              <ExternalLink style={{ width: '12px', height: '12px' }} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
