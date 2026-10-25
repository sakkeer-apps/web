'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent, getProducts, getArticles, getMediaHighlights, getSiteSettings } from '@/lib/data'

export async function checkAssetReferences(assetUrl: string): Promise<string[]> {
  const references: string[] = []
  if (!assetUrl) return references

  try {
    const [products, articles, mediaHighlights, settings] = await Promise.all([
      getProducts({ status: 'all' }),
      getArticles({ publishedOnly: false }),
      getMediaHighlights(),
      getSiteSettings(),
    ])

    // Check products
    products.forEach((p) => {
      if (p.cover_image_url === assetUrl) {
        references.push(`Product: ${p.title} (Cover image)`)
      }
      p.gallery?.forEach((g) => {
        if (g.url === assetUrl) {
          references.push(`Product: ${p.title} (Gallery image)`)
        }
      })
    })

    // Check articles
    articles.forEach((a) => {
      if (a.cover_image_url === assetUrl) {
        references.push(`Field Note: ${a.title}`)
      }
    })

    // Check media highlights
    mediaHighlights.forEach((m) => {
      if (m.thumbnail_url === assetUrl) {
        references.push(`Media Highlight: ${m.title}`)
      }
    })

    // Check site settings
    if (settings.logo_url === assetUrl) references.push('Site Logo')
    if (settings.favicon_url === assetUrl) references.push('Favicon')
    if (settings.seo_og_image === assetUrl) references.push('SEO Share Image')
  } catch (err) {
    console.error('Error checking asset references:', err)
  }

  return references
}

export async function deleteMediaAsset(assetId: string, assetUrl: string, storagePath?: string) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Check references first
  const refs = await checkAssetReferences(assetUrl)
  if (refs.length > 0) {
    return {
      success: false,
      error: `Cannot delete asset. It is currently referenced by: ${refs.join(', ')}. Please replace or remove references before deleting.`,
      references: refs,
    }
  }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    if (storagePath) {
      await adminClient.storage.from('media').remove([storagePath])
    }

    await adminClient.from('media_assets').delete().eq('id', assetId)
    await logAuditEvent('MEDIA_ASSET_DELETED', 'MEDIA', assetId, { assetUrl }, user.email)

    revalidatePath('/admin/media')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}

export async function saveMediaAssetRecord(payload: {
  file_name: string
  storage_path: string
  public_url: string
  mime_type: string
  file_size_bytes: number
  alt_text: string
}) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { data, error } = await adminClient
      .from('media_assets')
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    await logAuditEvent('MEDIA_ASSET_UPLOADED', 'MEDIA', data.id, { file_name: payload.file_name }, user.email)

    revalidatePath('/admin/media')
    return { success: true, asset: data }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Save asset failed' }
  }
}
