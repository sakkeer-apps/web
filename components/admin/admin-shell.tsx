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
  Plus,
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
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Manage Applications', href: '/admin/products', icon: Package },
    { label: 'Add Application', href: '/admin/products/new', icon: Plus },
    { label: 'Website Content', href: '/admin/content', icon: Layers },
    { label: 'Photo Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Field Notes & Articles', href: '/admin/insights', icon: FileText },
    { label: 'Video & Demos', href: '/admin/media-section', icon: Video },
    { label: 'Contact Messages', href: '/admin/messages', icon: Mail },
    { label: 'Domain Settings', href: '/admin/settings/domains', icon: Globe },
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

  // Get readable section title for breadcrumbs
  const getBreadcrumbTitle = (path: string) => {
    if (path === '/admin') return 'Dashboard'
    if (path === '/admin/products/new') return 'New Application'
    if (path.startsWith('/admin/products/')) return 'Edit Product'
    if (path === '/admin/products') return 'Applications'
    if (path === '/admin/content') return 'Website Content'
    if (path === '/admin/media') return 'Photo Library'
    if (path === '/admin/insights/new') return 'New Article'
    if (path.startsWith('/admin/insights/')) return 'Edit Article'
    if (path === '/admin/insights') return 'Field Notes'
    if (path === '/admin/media-section') return 'Video & Demos'
    if (path === '/admin/messages') return 'Contact Messages'
    if (path === '/admin/settings/domains') return 'Domain Settings'
    if (path === '/admin/audit-logs') return 'Audit Trail'
    return 'Administration'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080b0f', color: '#eef1f4' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '270px',
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
            <span className="brand-mark" style={{ width: '28px', height: '28px' }}>
              <Sparkles />
            </span>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.03em', display: 'block' }}>
                Muhammed Sakkeer
              </span>
              <span style={{ fontSize: '10px', color: '#b7ff63', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Owner Administration
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Add Button in Sidebar */}
        <div style={{ padding: '14px 14px 4px' }}>
          <Button asChild size="sm" className="primary-button" style={{ width: '100%', height: '36px', fontSize: '12px', justifyContent: 'center' }}>
            <Link href="/admin/products/new">
              <Plus style={{ width: '14px', marginRight: '6px' }} /> Add Application
            </Link>
          </Button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isDashboard = item.href === '/admin'
            const active = isDashboard ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#b7ff63' : '#8d98a2',
                  background: active ? 'rgba(183, 255, 99, 0.08)' : 'transparent',
                  border: active ? '1px solid rgba(183, 255, 99, 0.2)' : '1px solid transparent',
                  transition: 'all .15s ease',
                  minHeight: '40px',
                }}
              >
                <Icon style={{ width: '16px', height: '16px', flexShrink: 0, color: active ? '#b7ff63' : undefined }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isDashboard && (
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', padding: '1px 5px', borderRadius: '4px', background: 'rgba(183, 255, 99, 0.1)', color: '#b7ff63' }}>
                    Home
                  </span>
                )}
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
                fontSize: '11px',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #252e35',
                color: '#a1abb2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                minHeight: '36px',
              }}
            >
              Live site <ExternalLink style={{ width: '10px' }} />
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{
                fontSize: '11px',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #3d2525',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
                minHeight: '36px',
              }}
            >
              <LogOut style={{ width: '11px' }} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar Navigation Header */}
        <header
          style={{
            height: '64px',
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
          {/* Left Navigation: Mobile Menu + Return to Dashboard */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Menu Button - readable label & 44px min touch target */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: '#11171d',
                border: '1px solid #2c363d',
                color: '#eef1f4',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                minHeight: '44px',
                minWidth: '44px',
              }}
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
              <span>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            </button>

            {/* Persistent Dashboard Link */}
            {pathname !== '/admin' ? (
              <Link
                href="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(183, 255, 99, 0.12)',
                  border: '1px solid rgba(183, 255, 99, 0.35)',
                  color: '#b7ff63',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  minHeight: '44px',
                }}
              >
                <LayoutDashboard style={{ width: '16px', height: '16px' }} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <span style={{ fontSize: '13px', color: '#b7ff63', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <LayoutDashboard style={{ width: '15px', height: '15px' }} /> Dashboard
              </span>
            )}

            {/* Breadcrumb section display */}
            {pathname !== '/admin' && (
              <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '6px', fontSize: '12px', color: '#74808a' }}>
                <span>/</span>
                <span style={{ color: '#eef1f4', fontWeight: 500 }}>{getBreadcrumbTitle(pathname)}</span>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button asChild size="sm" className="primary-button hidden sm:inline-flex" style={{ height: '36px', fontSize: '12px' }}>
              <Link href="/admin/products/new">
                <Plus style={{ width: '14px', marginRight: '6px' }} /> Add App
              </Link>
            </Button>
            <Link
              href="/"
              target="_blank"
              style={{
                fontSize: '12px',
                color: '#9ca5ad',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: '1px solid #283139',
                borderRadius: '8px',
                minHeight: '40px',
              }}
            >
              <span>View site</span>
              <ExternalLink style={{ width: '12px' }} />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              inset: '64px 0 0 0',
              background: 'rgba(8, 11, 15, 0.98)',
              zIndex: 50,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              overflowY: 'auto',
              borderBottom: '1px solid #252e35',
            }}
            className="md:hidden"
          >
            {/* Top Quick Action */}
            <Button
              asChild
              className="primary-button"
              style={{ height: '48px', fontSize: '14px', marginBottom: '8px', justifyContent: 'center' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/admin/products/new">
                <Plus style={{ width: '16px', marginRight: '8px' }} /> Add Application (APK, Web, GitHub)
              </Link>
            </Button>

            {/* Mobile Nav Links with large touch targets (min 48px) and readable labels */}
            {navItems.map((item) => {
              const Icon = item.icon
              const isDashboard = item.href === '/admin'
              const active = isDashboard ? pathname === '/admin' : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#b7ff63' : '#d2dbe2',
                    background: active ? 'rgba(183, 255, 99, 0.12)' : '#10161b',
                    border: active ? '1px solid rgba(183, 255, 99, 0.35)' : '1px solid #222b31',
                    minHeight: '52px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon style={{ width: '18px', height: '18px', color: active ? '#b7ff63' : '#89939d' }} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight style={{ width: '16px', opacity: 0.5 }} />
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                minHeight: '48px',
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
