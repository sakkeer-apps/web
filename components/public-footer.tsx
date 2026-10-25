import Link from 'next/link'
import { Sparkles, Mail } from 'lucide-react'
import { SiteSettings } from '@/types'
import { SocialBrandIcon, getPlatformLabel } from '@/components/social-brand-icons'

interface PublicFooterProps {
  settings: SiteSettings
}

export function PublicFooter({ settings }: PublicFooterProps) {
  const activeSocials = (settings.social_links || []).filter((s) => s.enabled && s.url.trim().length > 0)

  return (
    <footer className="site-footer container">
      <Link className="brand" href="/#top">
        <span className="brand-mark">
          <Sparkles />
        </span>
        <span>{settings.brand_name}</span>
      </Link>

      <span className="footer-note">{settings.footer_note}</span>

      <div className="social-links" aria-label="Social media links">
        {activeSocials.length > 0 ? (
          activeSocials.map((social) => {
            const label = getPlatformLabel(social.platform)
            const isEmail = social.platform.toLowerCase() === 'email' || social.url.startsWith('mailto:')
            return (
              <a
                key={social.platform}
                href={social.url}
                target={isEmail ? undefined : '_blank'}
                rel={isEmail ? undefined : 'noopener noreferrer'}
                aria-label={label}
                title={label}
              >
                <SocialBrandIcon platform={social.platform} />
              </a>
            )
          })
        ) : (
          <a
            href={`mailto:${settings.contact_email}`}
            aria-label={`Email ${settings.contact_email}`}
            title="Email Muhammed Sakkeer"
          >
            <Mail style={{ width: '13px', height: '13px' }} strokeWidth={2} aria-hidden="true" />
          </a>
        )}
      </div>

      <span className="copyright">{settings.copyright_text}</span>
    </footer>
  )
}
