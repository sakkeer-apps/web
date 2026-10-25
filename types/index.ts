// types/index.ts - Application TypeScript definitions

export type AppCategory = 'All' | 'AI tools' | 'Web apps' | 'Mobile APK' | 'Windows EXE'
export type ProductStatus = 'draft' | 'published' | 'archived'
export type AccentColor = 'cyan' | 'violet' | 'amber' | 'emerald' | 'blue' | 'rose'
export type PackageType = 'apk' | 'exe' | 'msi' | 'zip' | 'external_web'
export type VideoType = 'youtube' | 'vimeo' | 'facebook' | 'instagram' | 'uploaded' | 'none'
export type SafetyScanStatus = 'unscanned' | 'pending' | 'clean' | 'flagged'

export interface HeroStat {
  value: string
  suffix: string
  label: string
}

export interface SocialLink {
  platform: 'email' | 'linkedin' | 'github' | 'whatsapp' | 'facebook' | 'instagram' | 'youtube' | 'snapchat' | 'twitter' | 'website'
  url: string
  enabled: boolean
}

export interface GalleryItem {
  url: string
  alt: string
}

export interface SiteSettings {
  id: string
  brand_name: string
  brand_title: string
  logo_url?: string | null
  favicon_url?: string | null
  availability_badge_text: string
  availability_badge_active: boolean
  hero_eyebrow: string
  hero_title_line1: string
  hero_title_accent: string
  hero_title_line2: string
  hero_title_dot: string
  hero_description: string
  hero_primary_cta_text: string
  hero_primary_cta_target: string
  hero_secondary_cta_text: string
  hero_secondary_cta_target: string
  hero_stats: HeroStat[]
  work_section_label: string
  work_title: string
  work_title_accent: string
  work_description: string
  insights_section_label: string
  insights_title: string
  insights_title_accent: string
  insights_description: string
  media_section_label: string
  media_title: string
  media_title_accent: string
  media_description: string
  media_cta_text: string
  contact_section_label: string
  contact_title: string
  contact_title_accent: string
  contact_description: string
  contact_email: string
  footer_note: string
  copyright_text: string
  social_links: SocialLink[]
  seo_title: string
  seo_description: string
  seo_og_image?: string | null
  primary_domain: string
  secondary_domains: string[]
  updated_at?: string
}

export interface Product {
  id: string
  slug: string
  title: string
  short_description: string
  full_description: string
  category: Exclude<AppCategory, 'All'>
  accent: AccentColor
  cover_image_url: string
  cover_image_alt: string
  gallery: GalleryItem[]
  tags: string[]
  display_order: number
  is_featured: boolean
  supported_platforms: string[]
  system_requirements: string
  status: ProductStatus
  portfolio_download_display: string
  external_website_url?: string
  live_demo_url?: string
  repo_url?: string
  created_at?: string
  updated_at?: string
  // Virtual / joined
  current_release?: Release | null
  releases?: Release[]
  actual_download_count?: number
}

export interface Release {
  id: string
  product_id: string
  version: string
  release_notes: string
  release_date: string
  package_type: PackageType
  file_name: string
  storage_path: string
  file_size_bytes: number
  file_size_formatted: string
  file_checksum_sha256: string
  external_launch_url?: string
  is_published: boolean
  safety_scan_status: SafetyScanStatus
  safety_scan_provider: string
  safety_scan_notes: string
  download_count: number
  created_at?: string
  updated_at?: string
}

export interface Article {
  id: string
  slug: string
  title: string
  category: string
  excerpt: string
  body_markdown: string
  cover_image_url: string
  reading_time_minutes: number
  published_date_formatted: string
  published_at: string
  is_published: boolean
  seo_title?: string
  seo_description?: string
  display_order: number
  created_at?: string
  updated_at?: string
}

export interface MediaHighlight {
  id: string
  title: string
  description: string
  caption: string
  thumbnail_url: string
  video_type: VideoType
  video_url: string
  duration_label: string
  display_order: number
  is_featured: boolean
  is_published?: boolean
  created_at?: string
  updated_at?: string
}


export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'unread' | 'read' | 'archived'
  ip_hash: string
  spam_score: number
  created_at: string
}

export interface MediaAsset {
  id: string
  file_name: string
  storage_path: string
  public_url: string
  mime_type: string
  file_size_bytes: number
  alt_text: string
  created_at: string
}

export interface AuditLog {
  id: string
  actor_email: string
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown>
  created_at: string
}
