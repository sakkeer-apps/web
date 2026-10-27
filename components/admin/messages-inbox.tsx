'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Reply,
  CheckCircle2,
  Calendar,
  User,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContactMessage } from '@/types'
import { updateMessageStatus, deleteMessage } from '@/app/admin/messages/actions'

interface MessagesInboxProps {
  initialMessages: ContactMessage[]
}

export function MessagesInbox({ initialMessages }: MessagesInboxProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read' | 'archived'>('all')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedMessage) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSelectedMessage(null)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedMessage])

  const filtered = messages.filter((m) => {
    if (activeTab === 'all') return true
    return m.status === activeTab
  })

  async function handleStatusChange(id: string, newStatus: 'unread' | 'read' | 'archived') {
    setLoading(true)
    const res = await updateMessageStatus(id, newStatus)
    if (res.success) {
      setMessages(messages.map((m) => (m.id === id ? { ...m, status: newStatus } : m)))
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus })
      }
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Permanently delete this message?')
    if (!confirmed) return

    setLoading(true)
    const res = await deleteMessage(id)
    if (res.success) {
      setMessages(messages.filter((m) => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
      router.refresh()
    }
    setLoading(false)
  }

  function handleSelectMessage(msg: ContactMessage) {
    setSelectedMessage(msg)
    if (msg.status === 'unread') {
      handleStatusChange(msg.id, 'read')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <Link href="/admin" style={{ color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
          ← Dashboard
        </Link>
        <span style={{ color: '#52606d' }}>/</span>
        <span style={{ color: '#89939d' }}>Contact Messages</span>
      </div>

      <div>
        <div className="section-label" style={{ marginBottom: '4px' }}>
          <span className="section-dot" /> CLIENT & BUYER INQUIRIES
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
          Conversations & Inbox
        </h1>
        <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
          Submissions from the "Start a conversation" public portal, protected with honeypot verification.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #202930', paddingBottom: '12px' }}>
        {(
          [
            { id: 'all', label: `All (${messages.length})` },
            { id: 'unread', label: `Unread (${messages.filter((m) => m.status === 'unread').length})` },
            { id: 'read', label: 'Read' },
            { id: 'archived', label: 'Archived' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '99px',
              border: activeTab === tab.id ? '1px solid #b7ff63' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(183, 255, 99, 0.08)' : 'transparent',
              color: activeTab === tab.id ? '#b7ff63' : '#8c97a0',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#68737c', fontSize: '13px' }}>
            No inquiries in this category yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                style={{
                  padding: '18px 20px',
                  borderBottom: '1px solid #1c242a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  cursor: 'pointer',
                  background: msg.status === 'unread' ? 'rgba(183, 255, 99, 0.03)' : 'transparent',
                  transition: 'background .15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: msg.status === 'unread' ? 'rgba(183, 255, 99, 0.15)' : '#192229',
                      color: msg.status === 'unread' ? '#b7ff63' : '#84909a',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {msg.status === 'unread' ? <Mail style={{ width: '14px' }} /> : <MailOpen style={{ width: '14px' }} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: msg.status === 'unread' ? 700 : 500, color: '#eef1f4' }}>
                        {msg.name}
                      </span>
                      <span style={{ fontSize: '11px', color: '#68737c' }}>• {msg.email}</span>
                      {msg.status === 'unread' && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#b7ff63' }} />
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ba4ac', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong style={{ color: '#d1d8dc' }}>{msg.subject || 'Inquiry'}</strong> — {msg.message}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#59636c', whiteSpace: 'nowrap' }}>
                  {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal Dialog */}
      {selectedMessage && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedMessage(null)}
          role="presentation"
        >
          <div
            className="admin-modal"
            style={{ width: 'min(100%, 640px)', padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="msg-title"
          >
            <button type="button" className="modal-close" onClick={() => setSelectedMessage(null)} aria-label="Close message">
              <X />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span className="category-badge" style={{ fontSize: '9px' }}>
                STATUS: {selectedMessage.status.toUpperCase()}
              </span>
              <span style={{ fontSize: '11px', color: '#74808a' }}>
                {new Date(selectedMessage.created_at).toLocaleString()}
              </span>
            </div>

            <h2 id="msg-title" style={{ fontSize: '22px', margin: '0 0 16px', color: '#eef1f4' }}>
              {selectedMessage.subject || 'Direct Portfolio Inquiry'}
            </h2>

            <div style={{ padding: '14px', background: '#0a0e12', border: '1px solid #232c33', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#eef1f4', fontWeight: 600 }}>{selectedMessage.name}</div>
              <a href={`mailto:${selectedMessage.email}`} style={{ fontSize: '12px', color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                {selectedMessage.email} <Reply style={{ width: '12px' }} />
              </a>
            </div>

            <div
              style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: '#d1d8dc',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '16px',
                background: '#0d1318',
                borderRadius: '8px',
                border: '1px solid #1f272e',
                marginBottom: '24px',
              }}
            >
              {selectedMessage.message}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(selectedMessage.id)}
                style={{ borderColor: '#452626', color: '#f87171', background: 'rgba(239, 68, 68, 0.05)' }}
              >
                <Trash2 style={{ width: '12px', marginRight: '6px' }} /> Delete
              </Button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedMessage.status !== 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                    style={{ borderColor: '#2b363d' }}
                  >
                    <Archive style={{ width: '12px', marginRight: '6px' }} /> Archive
                  </Button>
                )}
                {selectedMessage.status !== 'unread' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedMessage.id, 'unread')}
                    style={{ borderColor: '#2b363d' }}
                  >
                    Mark unread
                  </Button>
                )}
                <Button asChild className="primary-button" size="sm">
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Portfolio Inquiry')}`}>
                    <Reply style={{ width: '12px', marginRight: '6px' }} /> Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
