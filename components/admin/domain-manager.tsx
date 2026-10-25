'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Save,
  ArrowRight,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteSettings } from '@/types'
import { saveContentSettings } from '@/app/admin/content/actions'

interface DomainManagerProps {
  settings: SiteSettings
}

export function DomainManager({ settings }: DomainManagerProps) {
  const router = useRouter()
  const [primaryDomain, setPrimaryDomain] = useState(settings.primary_domain || 'muhammedsakkeer.com')
  const [secondaryDomain, setSecondaryDomain] = useState(
    (settings.secondary_domains && settings.secondary_domains[0]) || ''
  )
  const [redirectMode, setRedirectMode] = useState<'301_redirect' | 'alias'>('301_redirect')

  const [saving, setSaving] = useState(false)
  const [checkingPrimary, setCheckingPrimary] = useState(false)
  const [checkingSecondary, setCheckingSecondary] = useState(false)
  const [primaryResult, setPrimaryResult] = useState<{ verified: boolean; status: string; details?: any } | null>(null)
  const [secondaryResult, setSecondaryResult] = useState<{ verified: boolean; status: string; details?: any } | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const payload: Partial<SiteSettings> = {
      ...settings,
      primary_domain: primaryDomain.trim().toLowerCase(),
      secondary_domains: secondaryDomain.trim() ? [secondaryDomain.trim().toLowerCase()] : [],
    }

    const res = await saveContentSettings(payload)
    if (res.success) {
      setMessage({ type: 'success', text: 'Domain configurations saved successfully.' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save domain settings' })
    }
    setSaving(false)
  }

  async function verifyDomain(domain: string, type: 'primary' | 'secondary') {
    if (!domain) return
    if (type === 'primary') setCheckingPrimary(true)
    else setCheckingSecondary(true)

    try {
      const res = await fetch('/api/admin/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })
      const data = await res.json()
      if (type === 'primary') setPrimaryResult(data)
      else setSecondaryResult(data)
    } catch {
      if (type === 'primary') setPrimaryResult({ verified: false, status: 'Check query failed' })
      else setSecondaryResult({ verified: false, status: 'Check query failed' })
    } finally {
      if (type === 'primary') setCheckingPrimary(false)
      else setCheckingSecondary(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px' }}>
      <div>
        <div className="section-label" style={{ marginBottom: '4px' }}>
          <span className="section-dot" /> HOSTING & DNS ARCHITECTURE
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
          Custom Domains & Second Domain Setup
        </h1>
        <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
          Configure your primary domain (e.g. muhammedsakkeer.com) and an additional alias domain or subdomain.
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

      {/* Domain Configuration Form */}
      <form onSubmit={handleSaveSettings} style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>Hostname Management</h3>

        {/* Primary Domain */}
        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Primary Custom Domain * (Canonical URL)
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              required
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              placeholder="muhammedsakkeer.com"
              style={{ flex: 1, minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => verifyDomain(primaryDomain, 'primary')}
              disabled={checkingPrimary}
              style={{ borderColor: '#2b353d', fontSize: '11px' }}
            >
              <RefreshCw style={{ width: '12px', marginRight: '6px', animation: checkingPrimary ? 'spin 1s linear infinite' : 'none' }} />
              {checkingPrimary ? 'Checking DNS...' : 'Check DNS Status'}
            </Button>
          </div>

          {primaryResult && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 14px',
                background: primaryResult.verified ? 'rgba(183, 255, 99, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                border: `1px solid ${primaryResult.verified ? 'rgba(183, 255, 99, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: primaryResult.verified ? '#b7ff63' : '#fef08a',
              }}
            >
              {primaryResult.verified ? <CheckCircle2 style={{ width: '16px' }} /> : <AlertTriangle style={{ width: '16px' }} />}
              <span>
                <strong>{primaryDomain}</strong>: {primaryResult.status}. Detected IP records: {primaryResult.details?.a_records?.join(', ') || 'None yet'}.
              </span>
            </div>
          )}
        </div>

        {/* Secondary Domain */}
        <div>
          <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
            Secondary Domain / Subdomain (e.g. sakkeer.ai or www.muhammedsakkeer.com)
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={secondaryDomain}
              onChange={(e) => setSecondaryDomain(e.target.value)}
              placeholder="sakkeer.ai"
              style={{ flex: 1, minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => verifyDomain(secondaryDomain, 'secondary')}
              disabled={checkingSecondary || !secondaryDomain}
              style={{ borderColor: '#2b353d', fontSize: '11px' }}
            >
              <RefreshCw style={{ width: '12px', marginRight: '6px', animation: checkingSecondary ? 'spin 1s linear infinite' : 'none' }} />
              {checkingSecondary ? 'Checking DNS...' : 'Check DNS Status'}
            </Button>
          </div>

          {secondaryResult && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 14px',
                background: secondaryResult.verified ? 'rgba(183, 255, 99, 0.08)' : 'rgba(234, 179, 8, 0.08)',
                border: `1px solid ${secondaryResult.verified ? 'rgba(183, 255, 99, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: secondaryResult.verified ? '#b7ff63' : '#fef08a',
              }}
            >
              {secondaryResult.verified ? <CheckCircle2 style={{ width: '16px' }} /> : <AlertTriangle style={{ width: '16px' }} />}
              <span>
                <strong>{secondaryDomain}</strong>: {secondaryResult.status}.
              </span>
            </div>
          )}
        </div>

        {/* Second Domain Routing Mode */}
        <div style={{ padding: '16px', background: '#0a0e12', border: '1px solid #232c33', borderRadius: '8px' }}>
          <label style={{ display: 'block', color: '#b7ff63', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            Second Domain Routing Mode
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#d1d8dc' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="routing_mode"
                checked={redirectMode === '301_redirect'}
                onChange={() => setRedirectMode('301_redirect')}
                style={{ accentColor: '#b7ff63' }}
              />
              <span>
                <strong>Permanent 301 Redirect to Primary Domain (Default & Recommended)</strong> — Preserves unified SEO authority and avoids duplicate-content indexing penalties.
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="routing_mode"
                checked={redirectMode === 'alias'}
                onChange={() => setRedirectMode('alias')}
                style={{ accentColor: '#b7ff63' }}
              />
              <span>
                <strong>Serve Same Content (Alias Domain)</strong> — Both hostnames serve the portal directly with primary canonical meta tags.
              </span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" className="primary-button" disabled={saving}>
            <Save style={{ width: '14px', marginRight: '6px' }} /> {saving ? 'Saving...' : 'Save Domain Settings'}
          </Button>
        </div>
      </form>

      {/* Provider-Specific DNS Records Guide */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>
          Required DNS Records (Registrar Configuration)
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#8d98a2', lineHeight: 1.5 }}>
          Enter these DNS records at your domain registrar (e.g. Namecheap, Cloudflare, GoDaddy, Google Domains) to connect your custom domains to this application:
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a0e12', borderBottom: '1px solid #202930', color: '#74808a', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10px' }}>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Name / Host</th>
                <th style={{ padding: '12px 16px' }}>Target Value</th>
                <th style={{ padding: '12px 16px' }}>TTL</th>
                <th style={{ padding: '12px 16px' }}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #1c242a' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#b7ff63' }}>A</td>
                <td style={{ padding: '12px 16px', color: '#eef1f4' }}>@ (apex)</td>
                <td style={{ padding: '12px 16px' }}><code>76.76.21.21</code></td>
                <td style={{ padding: '12px 16px', color: '#8d98a2' }}>Automatic / 3600</td>
                <td style={{ padding: '12px 16px', color: '#8d98a2' }}>Apex primary domain routing</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1c242a' }}>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#b7ff63' }}>CNAME</td>
                <td style={{ padding: '12px 16px', color: '#eef1f4' }}>www</td>
                <td style={{ padding: '12px 16px' }}><code>cname.vercel-dns.com</code></td>
                <td style={{ padding: '12px 16px', color: '#8d98a2' }}>Automatic / 3600</td>
                <td style={{ padding: '12px 16px', color: '#8d98a2' }}>www subdomain routing</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#b7ff63' }}>CNAME</td>
                <td style={{ padding: '12px 16px', color: '#eef1f4' }}>second-domain / sub</td>
                <td style={{ padding: '12px 16px' }}><code>cname.vercel-dns.com</code></td>
                <td style={{ padding: '12px 16px', color: '#8d98a2' }}>Automatic / 3600</td>
                <td style={{ padding: '12px 16px', color: '#8d98a2' }}>Second domain alias / 301 redirect</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #202930', borderRadius: '8px', fontSize: '11px', color: '#9ba4ac', lineHeight: 1.6 }}>
          <strong style={{ color: '#eef1f4' }}>Important Setup Steps:</strong>
          <ol style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
            <li>Log into your domain registrar and add the A / CNAME records above.</li>
            <li>In your hosting dashboard (Vercel, Railway, Netlify), add <code>{primaryDomain}</code> to project domains.</li>
            <li>HTTPS SSL/TLS certificates will automatically issue within 5–15 minutes of DNS propagation.</li>
            <li>In Supabase Auth settings, add <code>https://{primaryDomain}/admin/login</code> to the Redirect URLs list.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
