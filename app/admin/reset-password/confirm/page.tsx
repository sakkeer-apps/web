'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Lock, ShieldCheck, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error('Supabase client is not configured')
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin')
      }, 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
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
        }}
      >
        <div className="admin-icon" style={{ marginBottom: '20px' }}>
          <Terminal />
        </div>
        <h1 style={{ fontSize: '26px', color: '#eef1f4', margin: '0 0 8px' }}>Set new password</h1>
        <p style={{ color: '#89939d', fontSize: '13px', margin: '0 0 24px' }}>
          Enter a secure replacement password for your owner account.
        </p>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', color: '#b7ff63', padding: '20px 0' }}>
            <ShieldCheck style={{ width: '40px', height: '40px', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600 }}>Password updated successfully!</p>
            <p style={{ color: '#9ba4ac', fontSize: '12px' }}>Redirecting to your workspace...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            <label htmlFor="new-pass" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              New Password
            </label>
            <input
              id="new-pass"
              type="password"
              required
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
                marginBottom: '16px',
              }}
            />

            <label htmlFor="confirm-pass" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <input
              id="confirm-pass"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                marginBottom: '24px',
              }}
            />

            <Button className="primary-button" style={{ width: '100%' }} size="lg" disabled={loading}>
              {loading ? 'Updating...' : 'Save and sign in'} <ArrowUpRight data-icon="inline-end" />
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
