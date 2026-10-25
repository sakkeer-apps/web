'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentAdminUser } from '@/lib/auth'
import { updateSiteSettings, logAuditEvent } from '@/lib/data'
import { siteSettingsSchema } from '@/lib/validations'
import { SiteSettings } from '@/types'

export async function saveContentSettings(formData: Partial<SiteSettings>) {
  const user = await getCurrentAdminUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  const validation = siteSettingsSchema.safeParse(formData)
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    return { success: false, error: errorMsg }
  }

  const res = await updateSiteSettings(validation.data)
  if (!res.success) {
    return { success: false, error: res.error }
  }

  await logAuditEvent('SITE_SETTINGS_UPDATED', 'SETTINGS', 'default', { brand: validation.data.brand_name }, user.email)

  revalidatePath('/')
  revalidatePath('/insights')
  revalidatePath('/admin/content')
  return { success: true }
}
