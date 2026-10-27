// lib/social-helpers.ts - Social profile link normalization, validation, and safe testing helpers

export interface NormalizedSocialResult {
  valid: boolean
  normalizedUrl: string
  error?: string
}

const DANGEROUS_SCHEMES = ['javascript:', 'vbscript:', 'data:', 'file:']

const KNOWN_SOCIAL_HOSTS = new Set([
  'linkedin.com',
  'www.linkedin.com',
  'github.com',
  'www.github.com',
  'twitter.com',
  'www.twitter.com',
  'x.com',
  'www.x.com',
  'instagram.com',
  'www.instagram.com',
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'snapchat.com',
  'www.snapchat.com',
])

/**
 * Normalizes user-supplied social profile URLs to safe, canonical HTTPS/mailto/wa.me destinations.
 * Converts bare domains and usernames into functional links and rejects unsafe schemes.
 */
export function normalizeSocialUrl(platform: string, rawInput: string): NormalizedSocialResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: true, normalizedUrl: '' }
  }

  const trimmed = rawInput.trim()
  if (!trimmed) {
    return { valid: true, normalizedUrl: '' }
  }

  const lower = trimmed.toLowerCase()

  // Reject dangerous injection schemes
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return { valid: false, normalizedUrl: '', error: `Unsafe scheme "${scheme}" is rejected.` }
    }
  }

  const normPlatform = platform.toLowerCase().trim()

  // 1. Email Handler
  if (normPlatform === 'email') {
    const emailStr = lower.startsWith('mailto:') ? trimmed.slice(7).trim() : trimmed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailStr)) {
      return { valid: false, normalizedUrl: trimmed, error: 'Please enter a valid email address.' }
    }
    return { valid: true, normalizedUrl: `mailto:${emailStr}` }
  }

  // 2. WhatsApp Handler
  if (normPlatform === 'whatsapp') {
    if (lower.startsWith('https://wa.me/') || lower.startsWith('https://api.whatsapp.com/')) {
      return { valid: true, normalizedUrl: trimmed }
    }
    if (lower.startsWith('http://wa.me/')) {
      return { valid: true, normalizedUrl: `https://${trimmed.slice(7)}` }
    }
    if (lower.startsWith('wa.me/')) {
      return { valid: true, normalizedUrl: `https://${trimmed}` }
    }

    // Clean phone number (strip spaces, dashes, parentheses)
    const digitsOnly = trimmed.replace(/[^0-9]/g, '')
    if (digitsOnly.length >= 7) {
      return { valid: true, normalizedUrl: `https://wa.me/${digitsOnly}` }
    }

    return { valid: false, normalizedUrl: trimmed, error: 'Please enter a valid international phone number or wa.me link.' }
  }

  // 3. Web & Brand Social Platforms (LinkedIn, GitHub, X/Twitter, Instagram, Facebook, YouTube, Snapchat)
  let url = trimmed

  // Handle handles e.g. @username
  if (url.startsWith('@')) {
    const handle = url.slice(1).trim()
    switch (normPlatform) {
      case 'linkedin':
        return { valid: true, normalizedUrl: `https://linkedin.com/in/${handle}` }
      case 'github':
        return { valid: true, normalizedUrl: `https://github.com/${handle}` }
      case 'twitter':
      case 'x':
        return { valid: true, normalizedUrl: `https://x.com/${handle}` }
      case 'instagram':
        return { valid: true, normalizedUrl: `https://instagram.com/${handle}` }
      case 'facebook':
        return { valid: true, normalizedUrl: `https://facebook.com/${handle}` }
      case 'youtube':
        return { valid: true, normalizedUrl: `https://youtube.com/@${handle}` }
      case 'snapchat':
        return { valid: true, normalizedUrl: `https://snapchat.com/add/${handle}` }
    }
  }

  // Prepend HTTPS if bare domain or missing protocol (case-insensitive check)
  const lowerUrl = url.toLowerCase()
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    const isKnownHost = KNOWN_SOCIAL_HOSTS.has(lowerUrl)

    // Inputs without a slash are treated as handles unless they are known social hosts (e.g. "john.doe" is a handle)
    if (!url.includes('/') && !isKnownHost) {
      switch (normPlatform) {
        case 'linkedin':
          return { valid: true, normalizedUrl: `https://linkedin.com/in/${url}` }
        case 'github':
          return { valid: true, normalizedUrl: `https://github.com/${url}` }
        case 'twitter':
        case 'x':
          return { valid: true, normalizedUrl: `https://x.com/${url}` }
        case 'instagram':
          return { valid: true, normalizedUrl: `https://instagram.com/${url}` }
        case 'facebook':
          return { valid: true, normalizedUrl: `https://facebook.com/${url}` }
        case 'youtube':
          return { valid: true, normalizedUrl: `https://youtube.com/@${url}` }
        case 'snapchat':
          return { valid: true, normalizedUrl: `https://snapchat.com/add/${url}` }
      }
    }
    url = `https://${url}`
  } else if (lowerUrl.startsWith('http://')) {
    // Upgrade http to https for social hostnames while preserving remaining string
    url = `https://${url.slice(7)}`
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') {
      return { valid: false, normalizedUrl: url, error: 'Social links must use secure HTTPS protocol.' }
    }
    return { valid: true, normalizedUrl: url }
  } catch {
    return { valid: false, normalizedUrl: url, error: 'Invalid URL format.' }
  }
}
