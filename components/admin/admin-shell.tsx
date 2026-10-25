'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sparkles,
  LayoutDashboard,
  Package,
  Layers,
  FileText,
  Image as ImageIcon,
  Video,
  Mail,
  Globe,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminShellProps {
  userEmail: string
  children: React.ReactNode
}

export function AdminShell({ userEmail, children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products & Releases', href: '/admin/products', icon: Package },
    { label: 'Website Content', href: '/admin/content', icon: Layers },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Field Notes / Insights', href: '/admin/insights', icon: FileText },
    { label: 'Media Highlights', href: '/admin/media-section', icon: Video },
    { label: 'Inquiries Inbox', href: '/admin/messages', icon: Mail },
    { label: 'Domains & DNS', href: '/admin/settings/domains', icon: Globe },
    { label: 'Audit Trail', href: '/admin/audit-logs', icon: History },
  ]

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch {
      router.push('/admin/login')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080b0f', color: '#eef1f4' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '260px',
          flexShrink: 0,
          background: '#0d1217',
          borderRight: '1px solid #1f272e',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10,
        }}
        className="hidden md:flex"
      >
        {/* Brand Header */}
        <div style={{ height: '70px', padding: '0 20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #1a2229' }}>
          <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <span className="brand-mark" style={{ width: '26px', height: '26px' }}>
              <Sparkles />
            </span>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.03em', display: 'block' }}>
                Muhammed Sakkeer
              </span>
              <span style={{ fontSize: '10px', color: '#b7ff63', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Owner CMS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#b7ff63' : '#8d98a2',
                  background: active ? 'rgba(183, 255, 99, 0.08)' : 'transparent',
                  border: active ? '1px solid rgba(183, 255, 99, 0.2)' : '1px solid transparent',
                  transition: 'all .15s ease',
                }}
              >
                <Icon style={{ width: '15px', height: '15px' }} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid #1a2229', background: '#0a0e12' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1c252d', border: '1px solid #2e3840', display: 'grid', placeItems: 'center', fontSize: '11px', color: '#b7ff63' }}>
              MS
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', color: '#eef1f4', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {userEmail}
              </div>
              <div style={{ fontSize: '9px', color: '#74808a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck style={{ width: '10px', color: '#b7ff63' }} /> Verified Owner
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: '10px',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #252e35',
                color: '#a1abb2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}
            >
              Live site <ExternalLink style={{ width: '10px' }} />
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                fontSize: '10px',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #3d2525',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <LogOut style={{ width: '10px' }} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile / Responsive Topbar */}
        <header
          style={{
            height: '60px',
            borderBottom: '1px solid #1f272e',
            background: 'rgba(8, 11, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            position: 'sticky',
            top: 0,
            zIndex: 9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: '1px solid #2c363d',
                color: '#eef1f4',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X style={{ width: '18px' }} /> : <Menu style={{ width: '18px' }} />}
            </button>
            <span style={{ fontSize: '11px', color: '#68737c', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Workspace / {pathname.replace('/admin', '') || 'Dashboard'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: '11px',
                color: '#9ca5ad',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                border: '1px solid #283139',
                borderRadius: '4px',
              }}
            >
              View site <ExternalLink style={{ width: '11px' }} />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              inset: '60px 0 0 0',
              background: 'rgba(8, 11, 15, 0.98)',
              zIndex: 20,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderBottom: '1px solid #252e35',
            }}
            className="md:hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: active ? '#b7ff63' : '#a1abb2',
                    background: active ? 'rgba(183, 255, 99, 0.08)' : '#10161b',
                    border: '1px solid #222b31',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon style={{ width: '18px', height: '18px' }} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight style={{ width: '14px', opacity: 0.5 }} />
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              style={{
                marginTop: 'auto',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <LogOut style={{ width: '16px' }} /> Sign out of workspace
            </button>
          </div>
        )}

        {/* Workspace Page Content */}
        <main style={{ flex: 1, padding: '28px min(32px, 4vw)', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
