'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAuditEvent } from '@/lib/data'

export async function updateMessageStatus(id: string, status: 'unread' | 'read' | 'archived') {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { error } = await adminClient
      .from('contact_messages')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    await logAuditEvent('MESSAGE_STATUS_UPDATED', 'CONTACT', id, { status }, user.email)

    revalidatePath('/admin/messages')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
  }
}

export async function deleteMessage(id: string) {
  const user = await getCurrentAdminUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const adminClient = createAdminClient()
  if (!adminClient) return { success: false, error: 'Database connection not configured' }

  try {
    const { error } = await adminClient.from('contact_messages').delete().eq('id', id)
    if (error) throw error
    await logAuditEvent('MESSAGE_DELETED', 'CONTACT', id, {}, user.email)

    revalidatePath('/admin/messages')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}
