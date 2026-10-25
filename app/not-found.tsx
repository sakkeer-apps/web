import Link from 'next/link'
import { ArrowLeft, Sparkles, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <div
        className="admin-modal"
        style={{
          width: 'min(100%, 480px)',
          background: 'rgba(17, 23, 28, 0.95)',
          border: '1px solid #2f3a42',
          borderRadius: '16px',
          padding: '48px 36px',
          textAlign: 'center',
        }}
      >
        <div className="admin-icon" style={{ margin: '0 auto 20px' }}>
          <Terminal />
        </div>

        <div className="section-label" style={{ justifyContent: 'center', marginBottom: '8px' }}>
          <span className="section-dot" /> 404 EXCEPTION
        </div>

        <h1 style={{ fontSize: '28px', color: '#eef1f4', margin: '0 0 10px', fontWeight: 700 }}>
          Page Not Found
        </h1>

        <p style={{ color: '#89939d', fontSize: '13px', lineHeight: 1.6, margin: '0 0 28px' }}>
          The requested route does not exist or has been relocated in the latest deployment.
        </p>

        <Button asChild className="primary-button" size="lg" style={{ width: '100%' }}>
          <Link href="/">
            <ArrowLeft data-icon="inline-start" /> Return to Homepage
          </Link>
        </Button>
      </div>
    </div>
  )
}
