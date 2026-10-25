// lib/video-helpers.ts - Video provider detection, URL parsing, and official embed generator

import { VideoType } from '@/types'

export interface VideoParsedInfo {
  provider: VideoType
  platformName: string
  id?: string
  embedUrl: string | null
  platformUrl: string
  isShortOrReel: boolean
  restrictionNotice: string | null
  suggestedThumbnail?: string
}

/**
 * Automatically detects the video provider from a given URL string.
 */
export function detectVideoProvider(rawUrl: string): VideoType {
  if (!rawUrl || typeof rawUrl !== 'string') return 'none'
  const url = rawUrl.trim()
  if (!url) return 'none'

  // YouTube & Shorts
  if (
    /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url) ||
    /youtube\.com\/shorts\//i.test(url)
  ) {
    return 'youtube'
  }

  // Vimeo
  if (/^(https?:\/\/)?(www\.)?(vimeo\.com|player\.vimeo\.com)\//i.test(url)) {
    return 'vimeo'
  }

  // Facebook (Videos, Watch, Reels, fb.watch)
  if (
    /^(https?:\/\/)?(www\.|m\.|web\.)?(facebook\.com|fb\.watch)\//i.test(url) ||
    /facebook\.com\/(?:watch|reel|\w+\/videos)/i.test(url)
  ) {
    return 'facebook'
  }

  // Instagram (Posts, Reels)
  if (/^(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\//i.test(url)) {
    return 'instagram'
  }

  // Direct video file or Supabase storage public URL
  if (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) ||
    url.includes('/storage/v1/object/public/media/')
  ) {
    return 'uploaded'
  }

  return 'none'
}

/**
 * Extracts video ID and generates compliant embed parameters following official provider documentation.
 */
export function parseVideoEmbedInfo(rawUrl: string, explicitType?: VideoType): VideoParsedInfo {
  const url = (rawUrl || '').trim()
  const provider = (explicitType && explicitType !== 'none') ? explicitType : detectVideoProvider(url)

  if (!url || provider === 'none') {
    return {
      provider: 'none',
      platformName: 'None / Direct',
      embedUrl: null,
      platformUrl: url,
      isShortOrReel: false,
      restrictionNotice: 'No playable video stream configured.',
    }
  }

  // 1. YouTube & YouTube Shorts
  if (provider === 'youtube') {
    const isShorts = /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i.test(url)
    let videoId: string | null = null

    if (isShorts) {
      const match = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i)
      videoId = match ? match[1] : null
    } else {
      const match = url.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i
      )
      videoId = match ? match[1] : null
    }

    if (videoId) {
      return {
        provider: 'youtube',
        platformName: isShorts ? 'YouTube Shorts' : 'YouTube',
        id: videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
        platformUrl: isShorts ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
        isShortOrReel: isShorts,
        restrictionNotice: 'If this video is unlisted, age-restricted, or embedding is disabled by the uploader, watch directly on YouTube.',
        suggestedThumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      }
    }

    return {
      provider: 'youtube',
      platformName: 'YouTube',
      embedUrl: null,
      platformUrl: url,
      isShortOrReel: false,
      restrictionNotice: 'Invalid YouTube URL format. Please ensure you supply a valid youtube.com or youtu.be link.',
    }
  }

  // 2. Vimeo
  if (provider === 'vimeo') {
    const match = url.match(
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i
    )
    const videoId = match ? match[1] : null

    if (videoId) {
      return {
        provider: 'vimeo',
        platformName: 'Vimeo',
        id: videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
        platformUrl: `https://vimeo.com/${videoId}`,
        isShortOrReel: false,
        restrictionNotice: 'If the video has domain-level privacy restrictions or requires a password, please view directly on Vimeo.',
      }
    }

    return {
      provider: 'vimeo',
      platformName: 'Vimeo',
      embedUrl: null,
      platformUrl: url,
      isShortOrReel: false,
      restrictionNotice: 'Invalid Vimeo link format. Expected format: https://vimeo.com/123456789',
    }
  }

  // 3. Facebook Videos & Reels
  if (provider === 'facebook') {
    const isReel = url.includes('/reel/')
    // Clean and validate URL for Facebook Video Player plugin
    const encodedUrl = encodeURIComponent(url)
    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&width=500`

    return {
      provider: 'facebook',
      platformName: isReel ? 'Facebook Reel' : 'Facebook Video',
      embedUrl,
      platformUrl: url,
      isShortOrReel: isReel,
      restrictionNotice: 'Facebook video embeds require public visibility. If this content is private, audience-restricted, or removed, watch directly on Facebook.',
    }
  }

  // 4. Instagram Posts & Reels
  if (provider === 'instagram') {
    const isReel = url.includes('/reel/') || url.includes('/reels/')
    const shortcodeMatch = url.match(/instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/i)
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : null

    if (shortcode) {
      const embedUrl = isReel
        ? `https://www.instagram.com/reel/${shortcode}/embed/`
        : `https://www.instagram.com/p/${shortcode}/embed/`

      return {
        provider: 'instagram',
        platformName: isReel ? 'Instagram Reel' : 'Instagram Video',
        id: shortcode,
        embedUrl,
        platformUrl: isReel ? `https://www.instagram.com/reel/${shortcode}/` : `https://www.instagram.com/p/${shortcode}/`,
        isShortOrReel: isReel,
        restrictionNotice: 'Instagram requires content to be publicly accessible from a public creator account. Private reels or copyrighted music tracks may restrict third-party playback.',
      }
    }

    return {
      provider: 'instagram',
      platformName: 'Instagram',
      embedUrl: null,
      platformUrl: url,
      isShortOrReel: false,
      restrictionNotice: 'Invalid Instagram URL format. Expected format: https://www.instagram.com/reel/CODE/ or https://www.instagram.com/p/CODE/',
    }
  }

  // 5. Uploaded / Direct MP4 or WebM
  if (provider === 'uploaded') {
    return {
      provider: 'uploaded',
      platformName: 'Direct Video Stream',
      embedUrl: null,
      platformUrl: url,
      isShortOrReel: false,
      restrictionNotice: null,
    }
  }

  return {
    provider: 'none',
    platformName: 'Unknown',
    embedUrl: null,
    platformUrl: url,
    isShortOrReel: false,
    restrictionNotice: 'Unrecognized video provider format.',
  }
}
