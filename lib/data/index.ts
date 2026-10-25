// lib/data/index.ts - Unified, resilient data access layer

import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  defaultSiteSettings,
  defaultProducts,
  defaultReleases,
  defaultArticles,
  defaultMediaHighlights,
} from './seed-defaults'
import {
  SiteSettings,
  Product,
  Release,
  Article,
  MediaHighlight,
  ContactMessage,
  MediaAsset,
  AuditLog,
} from '@/types'

// Check if Supabase credentials are configured in environment
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// -----------------------------------------------------------------------------
// Site Settings
// -----------------------------------------------------------------------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createServerClient()
  if (!supabase) return defaultSiteSettings

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single()

    if (error || !data) {
      return defaultSiteSettings
    }

    return {
      ...defaultSiteSettings,
      ...data,
      hero_stats: Array.isArray(data.hero_stats) ? data.hero_stats : defaultSiteSettings.hero_stats,
      social_links: Array.isArray(data.social_links) ? data.social_links : defaultSiteSettings.social_links,
      secondary_domains: Array.isArray(data.secondary_domains) ? data.secondary_domains : [],
    }
  } catch (err) {
    console.error('Error fetching site settings from Supabase:', err)
    return defaultSiteSettings
  }
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()
  if (!adminClient) {
    return { success: false, error: 'Database credentials not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local.' }
  }

  try {
    const { error } = await adminClient
      .from('site_settings')
      .upsert({
        id: 'default',
        ...updates,
        updated_at: new Date().toISOString(),
      })

    if (error) throw error
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update settings'
    return { success: false, error: message }
  }
}

// -----------------------------------------------------------------------------
// Products
// -----------------------------------------------------------------------------
export async function getProducts(options?: {
  category?: string
  status?: 'published' | 'draft' | 'archived' | 'all'
}): Promise<Product[]> {
  const supabase = await createServerClient()
  if (!supabase) {
    let prods = [...defaultProducts]
    if (options?.category && options.category !== 'All') {
      prods = prods.filter((p) => p.category === options.category)
    }
    if (options?.status && options.status !== 'all') {
      prods = prods.filter((p) => p.status === options.status)
    }
    return prods
  }

  try {
    let query = supabase
      .from('products')
      .select('*, releases(*)')
      .order('display_order', { ascending: true })

    if (options?.category && options.category !== 'All') {
      query = query.eq('category', options.category)
    }

    if (!options?.status || options.status === 'published') {
      query = query.eq('status', 'published')
    } else if (options.status !== 'all') {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) {
      return defaultProducts
    }

    return data.map((item) => {
      const proReleases: Release[] = (item.releases || []).filter((r: Release) => r.is_published)
      const currentRel = proReleases[0] || null
      return {
        ...item,
        current_release: currentRel,
      }
    })
  } catch (err) {
    console.error('Error fetching products from Supabase:', err)
    return defaultProducts
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createServerClient()
  if (!supabase) {
    return defaultProducts.find((p) => p.slug === slug) || null
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, releases(*)')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return defaultProducts.find((p) => p.slug === slug) || null
    }

    const proReleases: Release[] = (data.releases || [])
    return {
      ...data,
      releases: proReleases,
      current_release: proReleases.find((r) => r.is_published) || proReleases[0] || null,
    }
  } catch {
    return defaultProducts.find((p) => p.slug === slug) || null
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const adminClient = createAdminClient()
  if (!adminClient) {
    return defaultProducts.find((p) => p.id === id) || null
  }

  try {
    const { data, error } = await adminClient
      .from('products')
      .select('*, releases(*)')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

// -----------------------------------------------------------------------------
// Releases
// -----------------------------------------------------------------------------
export async function getReleases(productId: string): Promise<Release[]> {
  const supabase = await createServerClient()
  if (!supabase) {
    return defaultReleases.filter((r) => r.product_id === productId)
  }

  try {
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .eq('product_id', productId)
      .order('release_date', { ascending: false })

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

export async function getReleaseById(id: string): Promise<Release | null> {
  const supabase = await createServerClient()
  if (!supabase) {
    return defaultReleases.find((r) => r.id === id) || null
  }

  try {
    const { data, error } = await supabase
      .from('releases')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

// -----------------------------------------------------------------------------
// Articles (Field Notes / Insights)
// -----------------------------------------------------------------------------
export async function getArticles(options?: { publishedOnly?: boolean }): Promise<Article[]> {
  const supabase = await createServerClient()
  if (!supabase) {
    let arts = [...defaultArticles]
    if (options?.publishedOnly) {
      arts = arts.filter((a) => a.is_published)
    }
    return arts
  }

  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('display_order', { ascending: true })

    if (options?.publishedOnly !== false) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) {
      return defaultArticles
    }
    return data
  } catch {
    return defaultArticles
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createServerClient()
  if (!supabase) {
    return defaultArticles.find((a) => a.slug === slug) || null
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return defaultArticles.find((a) => a.slug === slug) || null
    }
    return data
  } catch {
    return defaultArticles.find((a) => a.slug === slug) || null
  }
}

// -----------------------------------------------------------------------------
// Media Highlights
// -----------------------------------------------------------------------------
export async function getMediaHighlights(options?: { publishedOnly?: boolean }): Promise<MediaHighlight[]> {
  const supabase = await createServerClient()
  if (!supabase) {
    if (options?.publishedOnly !== false) {
      return defaultMediaHighlights.filter((m) => m.is_published !== false)
    }
    return defaultMediaHighlights
  }

  try {
    if (options?.publishedOnly !== false) {
      // First try filtering by is_published = true
      const { data, error } = await supabase
        .from('media_highlights')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (!error && data) {
        return data
      }

      // If is_published column does not exist yet (pre-migration), fallback gracefully
      if (error && error.message && error.message.includes('is_published')) {
        const fallback = await supabase
          .from('media_highlights')
          .select('*')
          .order('display_order', { ascending: true })
        if (!fallback.error && fallback.data) {
          return fallback.data
        }
      }
      return []
    }

    const { data, error } = await supabase
      .from('media_highlights')
      .select('*')
      .order('display_order', { ascending: true })

    if (error || !data) {
      return []
    }
    return data
  } catch (err) {
    console.error('Error fetching media highlights:', err)
    return []
  }
}

export async function getMediaHighlightById(id: string): Promise<MediaHighlight | null> {
  const supabase = await createServerClient()
  if (!supabase) {
    return defaultMediaHighlights.find((m) => m.id === id) || null
  }

  try {
    const { data, error } = await supabase
      .from('media_highlights')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}


// -----------------------------------------------------------------------------
// Contact Messages (Inbox)
// -----------------------------------------------------------------------------
export async function getContactMessages(statusFilter?: 'unread' | 'read' | 'archived' | 'all'): Promise<ContactMessage[]> {
  const adminClient = createAdminClient()
  if (!adminClient) return []

  try {
    let query = adminClient
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data, error } = await query
    if (error || !data) return []
    return data
  } catch {
    return []
  }
}

// -----------------------------------------------------------------------------
// Audit Logs
// -----------------------------------------------------------------------------
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown>,
  actorEmail: string = 'owner'
): Promise<void> {
  const adminClient = createAdminClient()
  if (!adminClient) return

  try {
    await adminClient.from('audit_logs').insert({
      actor_email: actorEmail,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Failed to write audit log:', err)
  }
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const adminClient = createAdminClient()
  if (!adminClient) return []

  try {
    const { data, error } = await adminClient
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data
  } catch {
    return []
  }
}
