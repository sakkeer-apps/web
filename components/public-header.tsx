'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteSettings } from '@/types'

interface PublicHeaderProps {
  settings: SiteSettings
}

export function PublicHeader({ settings }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="site-header">
      <Link className="brand" href="/#top" aria-label={`${settings.brand_name} home`}>
        <span className="brand-mark">
          <Sparkles />
        </span>
        <span>{settings.brand_name}</span>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/#work">Work</Link>
        <Link href="/#insights">Insights</Link>
        <Link href="/#media">Media</Link>
        <Link href="/#contact">Contact</Link>
      </nav>

      <div className="header-actions">
        {settings.availability_badge_active && (
          <a className="availability" href="/#contact">
            <span />
            {settings.availability_badge_text}
          </a>
        )}

        <Button asChild className="header-cta" variant="outline">
          <Link href="/admin">
            Admin portal <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>

        <Button
          className="menu-button"
          variant="outline"
          size="icon"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link href="/#work" onClick={() => setMobileOpen(false)}>
            Work
          </Link>
          <Link href="/#insights" onClick={() => setMobileOpen(false)}>
            Insights
          </Link>
          <Link href="/#media" onClick={() => setMobileOpen(false)}>
            Media
          </Link>
          <Link href="/#contact" onClick={() => setMobileOpen(false)}>
            Contact
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            style={{ color: '#b7ff63', fontWeight: 600 }}
          >
            Admin portal →
          </Link>
        </nav>
      )}
    </header>
  )
}
