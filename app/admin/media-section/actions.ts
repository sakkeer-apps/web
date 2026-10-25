'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/data'
import { mediaHighlightSchema } from '@/lib/validations'

function sanitizeDatabaseError(err: unknown): string {
  if (!err) return 'An unknown database error occurred.'
  const message = err instanceof Error ? err.message : String(err)

  if (message.includes('media_highlights_video_type_check')) {
    return 'Database constraint error: Please execute migration 20261025000001_media_social_and_release_fixes.sql in your Supabase SQL editor to enable Facebook, Instagram, and YouTube Shorts.'
  }
  if (message.includes('column media_highlights.is_published does not exist') || message.includes('is_published')) {
    return 'Database column is_published not found. Please execute migration 20261025000001_media_social_and_release_fixes.sql in your Supabase SQL editor.'
  }
  return message
}

export async function saveMediaHighlight(formData: Record<string, unknown>) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized. Please log in as owner.' }

  const id = formData.id as string | undefined
  const validation = mediaHighlightSchema.safeParse(formData)

  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured. Check SUPABASE_SERVICE_ROLE_KEY in .env.local.' }

  try {
    const payload: Record<string, unknown> = {
      title: validation.data.title,
      description: validation.data.description,
      caption: validation.data.caption,
      thumbnail_url: validation.data.thumbnail_url,
      video_type: validation.data.video_type,
      video_url: validation.data.video_url,
      duration_label: validation.data.duration_label,
      display_order: validation.data.display_order,
      is_featured: validation.data.is_featured,
      is_published: validation.data.is_published,
      updated_at: new Date().toISOString(),
    }

    // If marked featured, un-feature other items first
    if (payload.is_featured) {
      await adminClient
        .from('media_highlights')
        .update({ is_featured: false })
        .neq('id', id || '00000000-0000-0000-0000-000000000000')
    }

    if (id) {
      // First attempt full update
      let { data, error } = await adminClient
        .from('media_highlights')
        .update(payload)
        .eq('id', id)
        .select()

      // If is_published column doesn't exist yet in DB, retry without is_published
      if (error && error.message.includes('is_published')) {
        const fallbackPayload = { ...payload }
        delete fallbackPayload.is_published
        const retry = await adminClient
          .from('media_highlights')
          .update(fallbackPayload)
          .eq('id', id)
          .select()
        data = retry.data
        error = retry.error
      }

      if (error) {
        return { success: false, error: sanitizeDatabaseError(error) }
      }

      if (!data || data.length === 0) {
        return { success: false, error: `No media highlight found with ID "${id}" to update. No changes were saved.` }
      }

      await logAuditEvent('MEDIA_HIGHLIGHT_UPDATED', 'MEDIA_HIGHLIGHT', id, { title: payload.title }, user.email)
    } else {
      // Insert new highlight
      const insertPayload: Record<string, unknown> = {
        ...payload,
        created_at: new Date().toISOString(),
      }

      let { data, error } = await adminClient
        .from('media_highlights')
        .insert(insertPayload)
        .select('id')
        .single()

      if (error && error.message.includes('is_published')) {
        const fallbackInsert: Record<string, unknown> = { ...insertPayload }
        delete fallbackInsert.is_published
        const retry = await adminClient
          .from('media_highlights')
          .insert(fallbackInsert)
          .select('id')
          .single()
        data = retry.data
        error = retry.error
      }

      if (error) {
        return { success: false, error: sanitizeDatabaseError(error) }
      }

      if (!data || !data.id) {
        return { success: false, error: 'Database insert returned no record ID. Highlight could not be confirmed saved.' }
      }

      await logAuditEvent('MEDIA_HIGHLIGHT_CREATED', 'MEDIA_HIGHLIGHT', data.id, { title: payload.title }, user.email)
    }

    revalidatePath('/')
    revalidatePath('/admin/media-section')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}

export async function deleteMediaHighlight(id: string) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { data, error } = await adminClient
      .from('media_highlights')
      .delete()
      .eq('id', id)
      .select('id, title')

    if (error) {
      return { success: false, error: sanitizeDatabaseError(error) }
    }

    if (!data || data.length === 0) {
      return { success: false, error: `No media item found with ID "${id}" to delete.` }
    }

    await logAuditEvent('MEDIA_HIGHLIGHT_DELETED', 'MEDIA_HIGHLIGHT', id, { title: data[0]?.title }, user.email)

    revalidatePath('/')
    revalidatePath('/admin/media-section')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}

export async function toggleMediaHighlightPublished(id: string, isPublished: boolean) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { data, error } = await adminClient
      .from('media_highlights')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, is_published')

    if (error) {
      return { success: false, error: sanitizeDatabaseError(error) }
    }

    if (!data || data.length === 0) {
      return { success: false, error: `No media item found with ID "${id}" to update status.` }
    }

    await logAuditEvent('MEDIA_HIGHLIGHT_PUBLISHED_TOGGLED', 'MEDIA_HIGHLIGHT', id, { isPublished }, user.email)

    revalidatePath('/')
    revalidatePath('/admin/media-section')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}

export async function setMediaHighlightFeatured(id: string) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    // Un-feature all first
    await adminClient
      .from('media_highlights')
      .update({ is_featured: false })
      .neq('id', id)

    // Feature target item
    const { data, error } = await adminClient
      .from('media_highlights')
      .update({ is_featured: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, is_featured')

    if (error) {
      return { success: false, error: sanitizeDatabaseError(error) }
    }

    if (!data || data.length === 0) {
      return { success: false, error: `No media item found with ID "${id}" to set as featured.` }
    }

    await logAuditEvent('MEDIA_HIGHLIGHT_FEATURED_SET', 'MEDIA_HIGHLIGHT', id, {}, user.email)

    revalidatePath('/')
    revalidatePath('/admin/media-section')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}

export async function reorderMediaHighlights(orderedIds: string[]) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const updates = orderedIds.map((id, index) =>
      adminClient
        .from('media_highlights')
        .update({ display_order: index + 1, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id')
    )

    const results = await Promise.all(updates)
    const anyError = results.find((r) => r.error)
    if (anyError?.error) {
      return { success: false, error: sanitizeDatabaseError(anyError.error) }
    }

    await logAuditEvent('MEDIA_HIGHLIGHTS_REORDERED', 'MEDIA_HIGHLIGHT', 'batch', { count: orderedIds.length }, user.email)

    revalidatePath('/')
    revalidatePath('/admin/media-section')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}
