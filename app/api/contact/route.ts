// app/api/contact/route.ts - Secure Contact Submission Endpoint

import { NextResponse } from 'next/server'
import { contactSubmissionSchema } from '@/lib/validations'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, hashIp } from '@/lib/security'
import { logAuditEvent } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const ipH = hashIp(ip)

    // Rate limiting: max 5 messages per hour per IP
    const rateCheck = checkRateLimit(`contact:${ipH}`, 5, 3600)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'You have submitted several messages recently. Please wait a while before sending another.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate with Zod
    const validation = contactSubmissionSchema.safeParse(body)
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { name, email, subject, message, website_hp } = validation.data

    // Honeypot check
    if (website_hp && website_hp.length > 0) {
      // Bot detected - return fake success without storing
      return NextResponse.json({ success: true, message: 'Message received.' })
    }

    const adminClient = createAdminClient()
    if (adminClient) {
      const { error: insertErr } = await adminClient.from('contact_messages').insert({
        name,
        email,
        subject: subject || 'New Portfolio Inquiry',
        message,
        status: 'unread',
        ip_hash: ipH,
        created_at: new Date().toISOString(),
      })

      if (insertErr) {
        console.error('Error storing contact message:', insertErr.message)
      } else {
        await logAuditEvent('CONTACT_MESSAGE_RECEIVED', 'CONTACT', email, { name, subject }, 'visitor')
      }
    }

    // Optional email dispatch via Resend if RESEND_API_KEY is configured
    const resendKey = process.env.RESEND_API_KEY
    const recipientEmail = process.env.NOTIFICATION_RECIPIENT_EMAIL || 'techsakeer@gmail.com'
    const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'onboarding@resend.dev'

    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipientEmail,
            subject: `[Portfolio Inquiry] ${subject || name}`,
            text: `New conversation request from ${name} (${email}):\n\n${message}`,
          }),
        })
      } catch (err) {
        // Log warning but ensure visitor message is still considered sent since it was persisted
        console.warn('Optional email alert dispatch failed:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. Your message has been received.',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Submission failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
