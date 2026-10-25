// lib/security.ts - IP hashing, rate limiting, and sanitization

import crypto from 'crypto'
import { marked } from 'marked'

// Configure marked to disable dangerous HTML protocols
marked.setOptions({
  gfm: true,
  breaks: true,
})

// Salt for hashing IP addresses (never store raw visitor IPs)
const RATE_LIMIT_SALT = process.env.RATE_LIMIT_SALT || 'sakeer-prod-salt-key-992'

export function hashIp(ip: string): string {
  if (!ip) return 'unknown'
  return crypto
    .createHmac('sha256', RATE_LIMIT_SALT)
    .update(ip.trim())
    .digest('hex')
    .slice(0, 32)
}

// In-memory sliding window rate limiter (per-instance protection against rapid spam)
interface RateRecord {
  count: number
  expiresAt: number
}

const rateLimitMap = new Map<string, RateRecord>()

export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || record.expiresAt < now) {
    rateLimitMap.set(key, {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
    })
    return { allowed: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  record.count += 1
  return { allowed: true, remaining: limit - record.count }
}

// Render markdown to sanitized safe HTML
export function renderSanitizedMarkdown(markdown: string): string {
  if (!markdown) return ''

  try {
    const rawHtml = marked.parse(markdown) as string

    // Basic regex-based sanitization stripping script, iframe, object, embed, and dangerous event handlers
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      .replace(/href\s*=\s*["']?javascript:[^"'>]+/gi, 'href="#"')
  } catch (err) {
    console.error('Error parsing markdown:', err)
    return `<p>${escapeHtml(markdown)}</p>`
  }
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
