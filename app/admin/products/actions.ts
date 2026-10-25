'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/data'
import { productSchema } from '@/lib/validations'

export async function saveProduct(formData: Record<string, unknown>) {
  const user = await getCurrentAdminUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  const id = formData.id as string | undefined

  // Validate fields with Zod
  const validation = productSchema.safeParse(formData)
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return { success: false, error: 'Database connection not configured. Check SUPABASE_SERVICE_ROLE_KEY in .env.local.' }
  }

  try {
    const payload = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    }

    if (id) {
      const { error } = await adminClient
        .from('products')
        .update(payload)
        .eq('id', id)

      if (error) throw error
      await logAuditEvent('PRODUCT_UPDATED', 'PRODUCT', id, { title: payload.title }, user.email)
    } else {
      const { data, error } = await adminClient
        .from('products')
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) throw error
      await logAuditEvent('PRODUCT_CREATED', 'PRODUCT', data?.id || '', { title: payload.title }, user.email)
    }

    revalidatePath('/')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save product'
    return { success: false, error: msg }
  }
}

export async function deleteProduct(id: string) {
  const user = await getCurrentAdminUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return { success: false, error: 'Database connection not configured' }
  }

  try {
    const { error } = await adminClient
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    await logAuditEvent('PRODUCT_DELETED', 'PRODUCT', id, {}, user.email)

    revalidatePath('/')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}

export async function toggleProductStatus(id: string, newStatus: 'published' | 'draft' | 'archived') {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { error } = await adminClient
      .from('products')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    await logAuditEvent('PRODUCT_STATUS_CHANGED', 'PRODUCT', id, { newStatus }, user.email)

    revalidatePath('/')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Status update failed' }
  }
}
