'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error)
  }, [error])

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <div
        className="admin-modal"
        style={{
          width: 'min(100%, 480px)',
          background: 'rgba(17, 23, 28, 0.95)',
          border: '1px solid #4a2828',
          borderRadius: '16px',
          padding: '48px 36px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#f87171',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 20px',
          }}
        >
          <AlertCircle style={{ width: '24px' }} />
        </div>

        <div className="section-label" style={{ justifyContent: 'center', marginBottom: '8px', color: '#f87171' }}>
          <span className="section-dot" style={{ background: '#f87171' }} /> SYSTEM RECOVERY
        </div>

        <h1 style={{ fontSize: '26px', color: '#eef1f4', margin: '0 0 10px', fontWeight: 700 }}>
          Temporary Interruption
        </h1>

        <p style={{ color: '#89939d', fontSize: '13px', lineHeight: 1.6, margin: '0 0 28px' }}>
          An unexpected condition occurred while rendering this interface. Our resilient fallback protocols have prevented state corruption.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button variant="outline" onClick={() => reset()} style={{ borderColor: '#33404a' }}>
            <RefreshCw data-icon="inline-start" /> Retry action
          </Button>
          <Button asChild className="primary-button">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" /> Return home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
