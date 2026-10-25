'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/data'
import { articleSchema } from '@/lib/validations'

export async function saveArticle(formData: Record<string, unknown>) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const id = formData.id as string | undefined
  const validation = articleSchema.safeParse(formData)

  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const payload = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    }

    if (id) {
      const { error } = await adminClient
        .from('articles')
        .update(payload)
        .eq('id', id)

      if (error) throw error
      await logAuditEvent('ARTICLE_UPDATED', 'ARTICLE', id, { title: payload.title }, user.email)
    } else {
      const { data, error } = await adminClient
        .from('articles')
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) throw error
      await logAuditEvent('ARTICLE_CREATED', 'ARTICLE', data?.id || '', { title: payload.title }, user.email)
    }

    revalidatePath('/')
    revalidatePath('/insights')
    revalidatePath(`/insights/${validation.data.slug}`)
    revalidatePath('/admin/insights')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Save article failed' }
  }
}

export async function deleteArticle(id: string) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { error } = await adminClient.from('articles').delete().eq('id', id)
    if (error) throw error
    await logAuditEvent('ARTICLE_DELETED', 'ARTICLE', id, {}, user.email)

    revalidatePath('/')
    revalidatePath('/insights')
    revalidatePath('/admin/insights')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}
