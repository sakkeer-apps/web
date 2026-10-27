'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Globe,
  Share2,
  Info,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteSettings, HeroStat, SocialLink } from '@/types'
import { saveContentSettings } from '@/app/admin/content/actions'
import { SocialBrandIcon, getPlatformLabel } from '@/components/social-brand-icons'
import { normalizeSocialUrl } from '@/lib/social-helpers'

const STANDARD_SOCIAL_PLATFORMS: SocialLink['platform'][] = [
  'email',
  'linkedin',
  'github',
  'whatsapp',
  'facebook',
  'instagram',
  'youtube',
  'snapchat',
  'twitter',
]

interface ContentEditorProps {
  initialSettings: SiteSettings
}

export function ContentEditor({ initialSettings }: ContentEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'brand' | 'hero' | 'sections' | 'socials' | 'seo'>('brand')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Brand
  const [brandName, setBrandName] = useState(initialSettings.brand_name)
  const [brandTitle, setBrandTitle] = useState(initialSettings.brand_title)
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url || '')
  const [faviconUrl, setFaviconUrl] = useState(initialSettings.favicon_url || '')
  const [availText, setAvailText] = useState(initialSettings.availability_badge_text)
  const [availActive, setAvailActive] = useState(initialSettings.availability_badge_active)

  // Hero
  const [heroEyebrow, setHeroEyebrow] = useState(initialSettings.hero_eyebrow)
  const [heroLine1, setHeroLine1] = useState(initialSettings.hero_title_line1)
  const [heroAccent, setHeroAccent] = useState(initialSettings.hero_title_accent)
  const [heroLine2, setHeroLine2] = useState(initialSettings.hero_title_line2)
  const [heroDot, setHeroDot] = useState(initialSettings.hero_title_dot)
  const [heroDesc, setHeroDesc] = useState(initialSettings.hero_description)
  const [heroPriCtaText, setHeroPriCtaText] = useState(initialSettings.hero_primary_cta_text)
  const [heroPriCtaTarget, setHeroPriCtaTarget] = useState(initialSettings.hero_primary_cta_target)
  const [heroSecCtaText, setHeroSecCtaText] = useState(initialSettings.hero_secondary_cta_text)
  const [heroSecCtaTarget, setHeroSecCtaTarget] = useState(initialSettings.hero_secondary_cta_target)
  const [heroStats, setHeroStats] = useState<HeroStat[]>(initialSettings.hero_stats || [])

  // Sections
  const [workLabel, setWorkLabel] = useState(initialSettings.work_section_label)
  const [workTitle, setWorkTitle] = useState(initialSettings.work_title)
  const [workAccent, setWorkAccent] = useState(initialSettings.work_title_accent)
  const [workDesc, setWorkDesc] = useState(initialSettings.work_description)

  const [insightsLabel, setInsightsLabel] = useState(initialSettings.insights_section_label)
  const [insightsTitle, setInsightsTitle] = useState(initialSettings.insights_title)
  const [insightsAccent, setInsightsAccent] = useState(initialSettings.insights_title_accent)
  const [insightsDesc, setInsightsDesc] = useState(initialSettings.insights_description)

  const [mediaLabel, setMediaLabel] = useState(initialSettings.media_section_label)
  const [mediaTitle, setMediaTitle] = useState(initialSettings.media_title)
  const [mediaAccent, setMediaAccent] = useState(initialSettings.media_title_accent)
  const [mediaDesc, setMediaDesc] = useState(initialSettings.media_description)

  const [contactLabel, setContactLabel] = useState(initialSettings.contact_section_label)
  const [contactTitle, setContactTitle] = useState(initialSettings.contact_title)
  const [contactAccent, setContactAccent] = useState(initialSettings.contact_title_accent)
  const [contactDesc, setContactDesc] = useState(initialSettings.contact_description)
  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email)

  // Socials & Footer
  const [footerNote, setFooterNote] = useState(initialSettings.footer_note)
  const [copyrightText, setCopyrightText] = useState(initialSettings.copyright_text)

  const initialSocialMap = new Map(
    (initialSettings.social_links || []).map((s) => [s.platform.toLowerCase(), s])
  )
  const mergedSocialLinks: SocialLink[] = STANDARD_SOCIAL_PLATFORMS.map((platform) => {
    const existing = initialSocialMap.get(platform)
    if (existing) return existing
    return {
      platform,
      url: platform === 'email' ? `mailto:${initialSettings.contact_email || 'techsakeer@gmail.com'}` : '',
      enabled: false,
    }
  })
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(mergedSocialLinks)

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialSettings.seo_title)
  const [seoDesc, setSeoDesc] = useState(initialSettings.seo_description)
  const [seoOgImage, setSeoOgImage] = useState(initialSettings.seo_og_image || '')
  const [primaryDomain, setPrimaryDomain] = useState(initialSettings.primary_domain)

  function updateHeroStat(index: number, field: keyof HeroStat, value: string) {
    const next = [...heroStats]
    next[index] = { ...next[index], [field]: value }
    setHeroStats(next)
  }

  function addHeroStat() {
    setHeroStats([...heroStats, { value: '10', suffix: '+', label: 'New Metric' }])
  }

  function removeHeroStat(index: number) {
    setHeroStats(heroStats.filter((_, i) => i !== index))
  }

  function updateSocialLink(platform: string, field: 'url' | 'enabled', value: unknown) {
    setSocialLinks(
      socialLinks.map((s) => (s.platform === platform ? { ...s, [field]: value } : s))
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    // Normalize and validate all social links before saving
    const normalizedSocials: SocialLink[] = []
    for (const s of socialLinks) {
      if (s.enabled && s.url && s.url.trim().length > 0) {
        const norm = normalizeSocialUrl(s.platform, s.url)
        if (!norm.valid) {
          setMessage({
            type: 'error',
            text: `Invalid link for ${getPlatformLabel(s.platform)}: ${norm.error || 'Please provide a valid URL'}`,
          })
          setSaving(false)
          return
        }
        normalizedSocials.push({ ...s, url: norm.normalizedUrl })
      } else {
        const norm = normalizeSocialUrl(s.platform, s.url)
        normalizedSocials.push({ ...s, url: norm.valid ? norm.normalizedUrl : s.url.trim() })
      }
    }

    const payload: Partial<SiteSettings> = {
      brand_name: brandName.trim(),
      brand_title: brandTitle.trim(),
      logo_url: logoUrl.trim() || null,
      favicon_url: faviconUrl.trim() || null,
      availability_badge_text: availText.trim(),
      availability_badge_active: availActive,
      hero_eyebrow: heroEyebrow.trim(),
      hero_title_line1: heroLine1.trim(),
      hero_title_accent: heroAccent.trim(),
      hero_title_line2: heroLine2.trim(),
      hero_title_dot: heroDot.trim(),
      hero_description: heroDesc.trim(),
      hero_primary_cta_text: heroPriCtaText.trim(),
      hero_primary_cta_target: heroPriCtaTarget.trim(),
      hero_secondary_cta_text: heroSecCtaText.trim(),
      hero_secondary_cta_target: heroSecCtaTarget.trim(),
      hero_stats: heroStats,
      work_section_label: workLabel.trim(),
      work_title: workTitle.trim(),
      work_title_accent: workAccent.trim(),
      work_description: workDesc.trim(),
      insights_section_label: insightsLabel.trim(),
      insights_title: insightsTitle.trim(),
      insights_title_accent: insightsAccent.trim(),
      insights_description: insightsDesc.trim(),
      media_section_label: mediaLabel.trim(),
      media_title: mediaTitle.trim(),
      media_title_accent: mediaAccent.trim(),
      media_description: mediaDesc.trim(),
      media_cta_text: initialSettings.media_cta_text || 'Watch the latest demo',
      contact_section_label: contactLabel.trim(),
      contact_title: contactTitle.trim(),
      contact_title_accent: contactAccent.trim(),
      contact_description: contactDesc.trim(),
      contact_email: contactEmail.trim(),
      footer_note: footerNote.trim(),
      copyright_text: copyrightText.trim(),
      social_links: normalizedSocials,
      seo_title: seoTitle.trim(),
      seo_description: seoDesc.trim(),
      seo_og_image: seoOgImage.trim() || null,
      primary_domain: primaryDomain.trim(),
      secondary_domains: initialSettings.secondary_domains || [],
    }

    const res = await saveContentSettings(payload)
    if (res.success) {
      setMessage({ type: 'success', text: 'Website content updated and published live!' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update settings' })
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '4px' }}>
            <span className="section-dot" /> LIVE CMS CONTROLS
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
            Website Content & Brand
          </h1>
          <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
            Edit live texts, hero statistics, section headlines, and social links without touching code.
          </p>
        </div>

        <Button type="submit" className="primary-button" size="lg" disabled={saving}>
          <Save style={{ width: '16px', marginRight: '6px' }} /> {saving ? 'Publishing...' : 'Save & Publish'}
        </Button>
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {message.type === 'error' ? <AlertCircle style={{ width: '16px' }} /> : <CheckCircle2 style={{ width: '16px' }} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #202930', paddingBottom: '12px', overflowX: 'auto' }}>
        {(
          [
            { id: 'brand', label: 'Brand & Header' },
            { id: 'hero', label: 'Hero & Stats' },
            { id: 'sections', label: 'Section Headlines' },
            { id: 'socials', label: 'Socials & Footer' },
            { id: 'seo', label: 'SEO & Meta' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '99px',
              border: activeTab === tab.id ? '1px solid #b7ff63' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(183, 255, 99, 0.08)' : 'transparent',
              color: activeTab === tab.id ? '#b7ff63' : '#8c97a0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Brand & Header */}
      {activeTab === 'brand' && (
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>Brand Identity & Header</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Brand Display Name *
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Professional Subtitle *
              </label>
              <input
                type="text"
                required
                value={brandTitle}
                onChange={(e) => setBrandTitle(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Availability Status Message *
              </label>
              <input
                type="text"
                required
                value={availText}
                onChange={(e) => setAvailText(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
              <input
                id="avail-active"
                type="checkbox"
                checked={availActive}
                onChange={(e) => setAvailActive(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#b7ff63' }}
              />
              <label htmlFor="avail-active" style={{ fontSize: '12px', color: '#d1d8dc', cursor: 'pointer' }}>
                Show Availability Pulse Badge
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Hero & Stats */}
      {activeTab === 'hero' && (
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>Hero Section Typography & Call To Actions</h3>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Eyebrow Label *
            </label>
            <input
              type="text"
              required
              value={heroEyebrow}
              onChange={(e) => setHeroEyebrow(e.target.value)}
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Line 1 Text (e.g. "Building what's") *
              </label>
              <input
                type="text"
                required
                value={heroLine1}
                onChange={(e) => setHeroLine1(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Italic Serif Accent Word (e.g. "next.") *
              </label>
              <input
                type="text"
                required
                value={heroAccent}
                onChange={(e) => setHeroAccent(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Line 2 Outline Text (e.g. "Selling what") *
              </label>
              <input
                type="text"
                required
                value={heroLine2}
                onChange={(e) => setHeroLine2(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Accent Word With Dot (e.g. "matters.") *
              </label>
              <input
                type="text"
                required
                value={heroDot}
                onChange={(e) => setHeroDot(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Hero Description Paragraph *
            </label>
            <textarea
              required
              rows={3}
              value={heroDesc}
              onChange={(e) => setHeroDesc(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Primary Button Label & Target
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={heroPriCtaText}
                  onChange={(e) => setHeroPriCtaText(e.target.value)}
                  placeholder="Explore software"
                  style={{ width: '50%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
                <input
                  type="text"
                  value={heroPriCtaTarget}
                  onChange={(e) => setHeroPriCtaTarget(e.target.value)}
                  placeholder="#work"
                  style={{ width: '50%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Secondary Button Label & Target
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={heroSecCtaText}
                  onChange={(e) => setHeroSecCtaText(e.target.value)}
                  placeholder="Let's build something"
                  style={{ width: '50%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
                <input
                  type="text"
                  value={heroSecCtaTarget}
                  onChange={(e) => setHeroSecCtaTarget(e.target.value)}
                  placeholder="#contact"
                  style={{ width: '50%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Hero Statistics */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ color: '#b7ff63', fontSize: '12px', fontWeight: 600 }}>
                Hero Display Metrics (Portfolio Statistics)
              </label>
              <Button type="button" size="sm" variant="outline" onClick={addHeroStat} style={{ borderColor: '#2b363d', fontSize: '11px' }}>
                <Plus style={{ width: '12px', marginRight: '4px' }} /> Add metric
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {heroStats.map((stat, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    background: '#0a0e12',
                    border: '1px solid #232c33',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateHeroStat(idx, 'value', e.target.value)}
                    placeholder="24"
                    style={{ width: '60px', height: '36px', padding: '0 8px', background: '#11161c', border: '1px solid #2e3840', borderRadius: '4px', color: '#eef1f4', fontWeight: 700 }}
                  />
                  <input
                    type="text"
                    value={stat.suffix}
                    onChange={(e) => updateHeroStat(idx, 'suffix', e.target.value)}
                    placeholder="+"
                    style={{ width: '40px', height: '36px', padding: '0 8px', background: '#11161c', border: '1px solid #2e3840', borderRadius: '4px', color: '#b7ff63' }}
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateHeroStat(idx, 'label', e.target.value)}
                    placeholder="Apps shipped"
                    style={{ flex: 1, height: '36px', padding: '0 8px', background: '#11161c', border: '1px solid #2e3840', borderRadius: '4px', color: '#9ba4ac', fontSize: '11px' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeHeroStat(idx)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 style={{ width: '14px' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Section Headlines */}
      {activeTab === 'sections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Work Section */}
          <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ margin: 0, color: '#b7ff63', fontSize: '14px' }}>Software Showcase / Lab Section</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Section Tag Label</label>
                <input
                  type="text"
                  value={workLabel}
                  onChange={(e) => setWorkLabel(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Title Accent</label>
                <input
                  type="text"
                  value={workAccent}
                  onChange={(e) => setWorkAccent(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Description</label>
              <textarea
                rows={2}
                value={workDesc}
                onChange={(e) => setWorkDesc(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Insights Section */}
          <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ margin: 0, color: '#b7ff63', fontSize: '14px' }}>Field Notes / Insights Section</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Section Tag Label</label>
                <input
                  type="text"
                  value={insightsLabel}
                  onChange={(e) => setInsightsLabel(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Title Accent</label>
                <input
                  type="text"
                  value={insightsAccent}
                  onChange={(e) => setInsightsAccent(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Description</label>
              <textarea
                rows={2}
                value={insightsDesc}
                onChange={(e) => setInsightsDesc(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Media Section */}
          <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ margin: 0, color: '#b7ff63', fontSize: '14px' }}>Beyond The Screen / Media Section</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Section Tag Label</label>
                <input
                  type="text"
                  value={mediaLabel}
                  onChange={(e) => setMediaLabel(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Title Accent</label>
                <input
                  type="text"
                  value={mediaAccent}
                  onChange={(e) => setMediaAccent(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '4px' }}>Description</label>
              <textarea
                rows={2}
                value={mediaDesc}
                onChange={(e) => setMediaDesc(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Socials & Footer */}
      {activeTab === 'socials' && (
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>Direct Contact & Social Profiles</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Displayed Contact Email Address *
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Footer Tagline Note
              </label>
              <input
                type="text"
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#b7ff63', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
              Configured Social Channels (Unconfigured profiles are cleanly hidden)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {socialLinks.map((s) => {
                const norm = s.url ? normalizeSocialUrl(s.platform, s.url) : null
                const testUrl = norm?.valid ? norm.normalizedUrl : s.url.trim()

                return (
                  <div
                    key={s.platform}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      background: '#0a0e12',
                      border: '1px solid #232c33',
                      borderRadius: '8px',
                    }}
                  >
                    <input
                      id={`soc-${s.platform}`}
                      type="checkbox"
                      checked={s.enabled}
                      onChange={(e) => updateSocialLink(s.platform, 'enabled', e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#b7ff63', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '130px', flexShrink: 0 }}>
                      <SocialBrandIcon
                        platform={s.platform}
                        style={{
                          width: '15px',
                          height: '15px',
                          color: s.enabled ? '#b7ff63' : '#68737c',
                        }}
                      />
                      <label
                        htmlFor={`soc-${s.platform}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: s.enabled ? '#eef1f4' : '#68737c',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={getPlatformLabel(s.platform)}
                      >
                        {getPlatformLabel(s.platform)}
                      </label>
                    </div>
                    <input
                      type="text"
                      value={s.url}
                      onChange={(e) => updateSocialLink(s.platform, 'url', e.target.value)}
                      onBlur={() => {
                        if (s.url.trim()) {
                          const result = normalizeSocialUrl(s.platform, s.url)
                          if (result.valid && result.normalizedUrl !== s.url) {
                            updateSocialLink(s.platform, 'url', result.normalizedUrl)
                          }
                        }
                      }}
                      placeholder={
                        s.platform === 'email'
                          ? 'mailto:techsakeer@gmail.com'
                          : s.platform === 'whatsapp'
                          ? '+971 50 ... or https://wa.me/...'
                          : `https://${s.platform}.com/...`
                      }
                      style={{
                        flex: 1,
                        height: '36px',
                        padding: '0 10px',
                        background: '#11161c',
                        border: '1px solid #283138',
                        borderRadius: '6px',
                        color: '#eef1f4',
                        fontSize: '12px',
                        opacity: s.enabled ? 1 : 0.4,
                      }}
                    />
                    {s.url.trim() && (
                      <a
                        href={testUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          height: '32px',
                          padding: '0 10px',
                          background: '#151d24',
                          border: '1px solid #2a3742',
                          borderRadius: '6px',
                          color: '#b7ff63',
                          fontSize: '11px',
                          fontWeight: 500,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          transition: 'background 0.15s ease',
                        }}
                        title={`Open and test ${getPlatformLabel(s.platform)} link`}
                      >
                        <span>Test link</span>
                        <ExternalLink style={{ width: '11px', height: '11px' }} />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: SEO & Meta */}
      {activeTab === 'seo' && (
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#b7ff63' }}>Search Engine Optimization & Social Sharing Cards</h3>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Default Meta Title *
            </label>
            <input
              type="text"
              required
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Default Meta Description *
            </label>
            <textarea
              required
              rows={3}
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Social Share Image URL (OpenGraph / Twitter Card)
            </label>
            <input
              type="url"
              value={seoOgImage}
              onChange={(e) => setSeoOgImage(e.target.value)}
              placeholder="https://your-domain.com/og-image.jpg"
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
              Canonical Primary Domain
            </label>
            <input
              type="text"
              required
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              placeholder="muhammedsakkeer.com"
              style={{ width: '100%', minHeight: '40px', padding: '0 12px', background: '#0a0e12', border: '1px solid #2d373f', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
            />
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button type="submit" className="primary-button" size="lg" disabled={saving}>
          <Save style={{ width: '16px', marginRight: '6px' }} /> {saving ? 'Publishing...' : 'Save & Publish Live'}
        </Button>
      </div>
    </form>
  )
}
