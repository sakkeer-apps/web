'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  contactEmail: string
}

export function ContactModal({ isOpen, onClose, contactEmail }: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      modalRef.current?.focus()
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website_hp: honeypot,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to deliver message.')
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  function handleResetAndClose() {
    onClose()
    setTimeout(() => {
      setSubmitted(false)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setError(null)
    }, 300)
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={handleResetAndClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        className="admin-modal"
        style={{ width: 'min(100%, 540px)', padding: '36px 32px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={handleResetAndClose} aria-label="Close contact dialog">
          <X />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(183, 255, 99, 0.1)',
                border: '1px solid rgba(183, 255, 99, 0.3)',
                color: '#b7ff63',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 style={{ width: '28px', height: '28px' }} />
            </div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px', color: '#eef1f4' }}>Message Received</h2>
            <p style={{ color: '#9ba4ac', fontSize: '13px', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 24px' }}>
              Thank you for reaching out. Your conversation request has been logged directly into Muhammed Sakkeer's workspace inbox.
            </p>
            <Button className="primary-button" style={{ width: '100%' }} onClick={handleResetAndClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="section-label" style={{ marginBottom: '6px' }}>
              <span className="section-dot" /> START A CONVERSATION
            </div>
            <h2 id="contact-modal-title" style={{ fontSize: '26px', margin: '0 0 6px', color: '#eef1f4' }}>
              Let's make an impact.
            </h2>
            <p style={{ color: '#89939d', fontSize: '13px', margin: '0 0 20px', lineHeight: 1.5 }}>
              Share your project vision or enterprise challenge. Inquiries dispatch directly to{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: '#b7ff63' }}>
                {contactEmail}
              </a>
              .
            </p>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle style={{ width: '14px' }} />
                <span>{error}</span>
              </div>
            )}

            {/* Honeypot field (hidden from screen reader & visitors) */}
            <div style={{ display: 'none' }} aria-hidden="true">
              <label htmlFor="website_hp">Leave empty</label>
              <input
                id="website_hp"
                type="text"
                tabIndex={-1}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label htmlFor="contact-name" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #303b43', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
              </div>

              <div>
                <label htmlFor="contact-email-input" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                  Your Work Email *
                </label>
                <input
                  id="contact-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #303b43', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label htmlFor="contact-subject" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                Subject / Project Focus
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enterprise AI Deployment / Software Licensing"
                style={{ width: '100%', minHeight: '42px', padding: '0 12px', background: '#0a0e12', border: '1px solid #303b43', borderRadius: '6px', color: '#eef1f4', fontSize: '13px' }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label htmlFor="contact-message" style={{ display: 'block', color: '#a8b2b8', fontSize: '11px', marginBottom: '6px' }}>
                How can we collaborate? *
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your team, your current challenges, or the software you're looking to build..."
                style={{ width: '100%', padding: '10px 12px', background: '#0a0e12', border: '1px solid #303b43', borderRadius: '6px', color: '#eef1f4', fontSize: '13px', resize: 'vertical' }}
              />
            </div>

            <Button type="submit" className="primary-button" style={{ width: '100%' }} size="lg" disabled={submitting}>
              <Send data-icon="inline-start" /> {submitting ? 'Transmitting message...' : 'Send Message'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
