'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Lock, Mail, ShieldAlert, Sparkles, Terminal, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Reset failed')

      setResetSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="site-shell" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <div
        className="admin-modal"
        style={{
          width: 'min(100%, 460px)',
          background: 'rgba(17, 23, 28, 0.96)',
          border: '1px solid #2f3a42',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div className="admin-icon" style={{ margin: 0 }}>
            <Terminal />
          </div>
          <Link
            href="/"
            style={{
              fontSize: '12px',
              color: '#9ca5ad',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color .2s',
            }}
          >
            ← Back to portfolio
          </Link>
        </div>

        <div className="section-label" style={{ marginBottom: '8px' }}>
          <span className="section-dot" /> INTERNAL CMS
        </div>
        <h1 style={{ fontSize: '28px', letterSpacing: '-0.05em', margin: '0 0 8px', color: '#eef1f4', fontWeight: 700 }}>
          {showReset ? 'Reset password' : 'Owner portal'}
        </h1>
        <p style={{ color: '#89939d', fontSize: '13px', lineHeight: 1.5, margin: '0 0 24px' }}>
          {showReset
            ? 'Enter your verified owner email to receive a password recovery link.'
            : 'Secure authenticated workspace for Muhammed Sakkeer portfolio and release management.'}
        </p>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '20px',
            }}
            role="alert"
          >
            <ShieldAlert style={{ width: '16px', flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {resetSent ? (
          <div
            style={{
              padding: '16px',
              background: 'rgba(183, 255, 99, 0.08)',
              border: '1px solid rgba(183, 255, 99, 0.3)',
              borderRadius: '8px',
              color: '#d6ffd6',
              fontSize: '13px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 style={{ width: '24px', height: '24px', color: '#b7ff63', margin: '0 auto 8px' }} />
            <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Reset link dispatched</p>
            <p style={{ color: '#9ba4ac', fontSize: '12px', margin: '0 0 16px' }}>
              If an account matches {email}, you will receive recovery instructions shortly.
            </p>
            <Button
              className="primary-button"
              style={{ width: '100%' }}
              onClick={() => {
                setShowReset(false)
                setResetSent(false)
              }}
            >
              Return to sign in
            </Button>
          </div>
        ) : showReset ? (
          <form onSubmit={handlePasswordReset}>
            <label htmlFor="reset-email" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '8px' }}>
              Verified Owner Email
            </label>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="techsakeer@gmail.com"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  padding: '0 14px',
                  color: '#eef1f4',
                  background: '#0a0e12',
                  border: '1px solid #303b43',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <Button type="submit" className="primary-button" style={{ width: '100%' }} size="lg" disabled={loading}>
              {loading ? 'Sending link...' : 'Send reset instructions'}
            </Button>

            <button
              type="button"
              onClick={() => setShowReset(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#89939d',
                fontSize: '12px',
                width: '100%',
                marginTop: '16px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Cancel and return to login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <label htmlFor="login-email" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '8px' }}>
              Work Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="techsakeer@gmail.com"
              style={{
                width: '100%',
                minHeight: '46px',
                padding: '0 14px',
                color: '#eef1f4',
                background: '#0a0e12',
                border: '1px solid #303b43',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                marginBottom: '18px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label htmlFor="login-password" style={{ color: '#a8b2b8', fontSize: '11px' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowReset(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca5ad',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                minHeight: '46px',
                padding: '0 14px',
                color: '#eef1f4',
                background: '#0a0e12',
                border: '1px solid #303b43',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                marginBottom: '24px',
              }}
            />

            <Button type="submit" className="primary-button" style={{ width: '100%' }} size="lg" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign in to workspace'} <ArrowUpRight data-icon="inline-end" />
            </Button>

            <div style={{ marginTop: '20px', padding: '12px', background: '#0a0e12', borderRadius: '8px', border: '1px solid #1e262c' }}>
              <div style={{ fontSize: '11px', color: '#77818b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock style={{ width: '12px' }} />
                <span>Protected by Server-Side Session Auth & RLS</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
