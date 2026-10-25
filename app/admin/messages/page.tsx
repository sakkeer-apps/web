import { redirect } from 'next/navigation'
import { getCurrentAdminUser } from '@/lib/auth'
import { getContactMessages } from '@/lib/data'
import { MessagesInbox } from '@/components/admin/messages-inbox'

export default async function AdminMessagesPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const messages = await getContactMessages('all')

  return <MessagesInbox initialMessages={messages} />
}
