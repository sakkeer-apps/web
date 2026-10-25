'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/data'
import { releaseSchema } from '@/lib/validations'

function sanitizeDatabaseError(err: unknown): string {
  if (!err) return 'An unexpected database error occurred.'
  const message = err instanceof Error ? err.message : String(err)
  return message
}

export async function saveRelease(formData: Record<string, unknown>) {
  const user = await getCurrentAdminUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in as owner.' }
  }

  const id = formData.id as string | undefined
  const validation = releaseSchema.safeParse(formData)

  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return { success: false, error: 'Database connection not configured' }
  }

  const data = validation.data

  // Requirement 6: Verify the uploaded object exists before publishing
  if (data.package_type !== 'external_web') {
    if (data.storage_path) {
      try {
        const { error: signedErr } = await adminClient.storage
          .from('releases')
          .createSignedUrl(data.storage_path, 60)

        if (signedErr) {
          return {
            success: false,
            error: `Storage verification failed: The file "${data.file_name || data.storage_path}" does not exist in the releases storage bucket. Upload must complete before publishing.`,
          }
        }
      } catch (err) {
        return {
          success: false,
          error: `Storage verification error: ${err instanceof Error ? err.message : 'File not found in storage.'}`,
        }
      }
    } else if (data.is_published) {
      return {
        success: false,
        error: 'Cannot publish a binary package without an uploaded file in storage. Please upload the file or uncheck Publish.',
      }
    }
  }

  try {
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
    }

    if (id) {
      const { data: updatedRows, error } = await adminClient
        .from('releases')
        .update(payload)
        .eq('id', id)
        .select('id, version')

      if (error) throw error
      if (!updatedRows || updatedRows.length === 0) {
        return { success: false, error: `Release record "${id}" was not found. No changes were saved.` }
      }

      await logAuditEvent('RELEASE_UPDATED', 'RELEASE', id, { version: payload.version }, user.email)
    } else {
      const { data: insertedRow, error } = await adminClient
        .from('releases')
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select('id, version')
        .single()

      if (error) throw error
      if (!insertedRow || !insertedRow.id) {
        return { success: false, error: 'Failed to create release record in database.' }
      }

      await logAuditEvent('RELEASE_CREATED', 'RELEASE', insertedRow.id, { version: payload.version }, user.email)
    }

    revalidatePath('/')
    revalidatePath(`/admin/products/${validation.data.product_id}/releases`)
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}

export async function deleteRelease(releaseId: string, productId: string) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { data, error } = await adminClient
      .from('releases')
      .delete()
      .eq('id', releaseId)
      .select('id, storage_path, version')

    if (error) throw error
    if (!data || data.length === 0) {
      return { success: false, error: `Release "${releaseId}" was not found to delete.` }
    }

    // Clean up associated file from private releases bucket if present
    const storagePath = data[0]?.storage_path
    if (storagePath) {
      try {
        await adminClient.storage.from('releases').remove([storagePath])
      } catch (storageErr) {
        console.warn('Failed to clean up release storage object:', storageErr)
      }
    }

    await logAuditEvent('RELEASE_DELETED', 'RELEASE', releaseId, { productId, version: data[0]?.version }, user.email)

    revalidatePath('/')
    revalidatePath(`/admin/products/${productId}/releases`)
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}

export async function toggleReleasePublished(releaseId: string, productId: string, isPublished: boolean) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    // If attempting to publish a binary package, verify that storage object exists
    if (isPublished) {
      const { data: rel, error: fetchErr } = await adminClient
        .from('releases')
        .select('package_type, storage_path, file_name')
        .eq('id', releaseId)
        .single()

      if (fetchErr || !rel) {
        return { success: false, error: 'Release record not found.' }
      }

      if (rel.package_type !== 'external_web' && rel.storage_path) {
        const { error: signedErr } = await adminClient.storage
          .from('releases')
          .createSignedUrl(rel.storage_path, 60)

        if (signedErr) {
          return {
            success: false,
            error: `Cannot publish: Binary package "${rel.file_name || rel.storage_path}" is not found in storage.`,
          }
        }
      }
    }

    const { data, error } = await adminClient
      .from('releases')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', releaseId)
      .select('id, is_published')

    if (error) throw error
    if (!data || data.length === 0) {
      return { success: false, error: `Release "${releaseId}" was not found to update status.` }
    }

    await logAuditEvent('RELEASE_STATUS_TOGGLED', 'RELEASE', releaseId, { isPublished }, user.email)

    revalidatePath('/')
    revalidatePath(`/admin/products/${productId}/releases`)
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: sanitizeDatabaseError(err) }
  }
}
