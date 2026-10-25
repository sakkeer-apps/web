import React from 'react'
import { ExternalLink, Mail } from 'lucide-react'

interface SocialBrandIconProps {
  platform: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Official monochrome brand SVG icons for social media platforms.
 * Formatted to standard 24x24 viewBox with 13x13 default sizing matching the dark theme.
 */
export function SocialBrandIcon({ platform, className, style }: SocialBrandIconProps) {
  const norm = platform.toLowerCase().trim()
  const iconStyle: React.CSSProperties = {
    width: '13px',
    height: '13px',
    display: 'block',
    flexShrink: 0,
    ...style,
  }

  switch (norm) {
    case 'email':
      // Official envelope icon (stroke-based)
      return (
        <Mail
          className={className}
          style={iconStyle}
          strokeWidth={2}
          aria-hidden="true"
        />
      )

    case 'linkedin':
      // Official LinkedIn monogram brand mark (Simple Icons standard)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
        </svg>
      )

    case 'github':
      // Official GitHub Octocat silhouette mark
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )

    case 'facebook':
      // Official Facebook "f" logo mark
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.704 0-1.398.156-1.745.474-.464.423-.621 1.157-.621 2.373v1.133h4.341l-.547 3.667h-3.794v7.98z" />
        </svg>
      )

    case 'instagram':
      // Official Instagram camera logo glyph
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )

    case 'whatsapp':
      // Official WhatsApp icon (bubble with phone handset)
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.176.2-.352.226-.653.076-.301-.15-1.272-.469-2.423-1.497-.896-.799-1.501-1.787-1.677-2.088-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.3-.502.101-.2.05-.376-.025-.526-.075-.151-.678-1.635-.93-2.242-.244-.588-.493-.509-.678-.518l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.08 2.912 1.23 3.113c.15.2 2.127 3.249 5.152 4.557.72.311 1.282.497 1.72.636.724.23 1.383.197 1.904.119.58-.088 1.78-.728 2.031-1.431.251-.703.251-1.306.176-1.431-.075-.125-.276-.201-.577-.351zM12.042 22.082h-.002a9.983 9.983 0 0 1-5.088-1.39l-.365-.216-3.78.991 1.008-3.685-.237-.377A9.983 9.983 0 0 1 2.056 12.04C2.056 6.52 6.536 2.04 12.058 2.04a9.96 9.96 0 0 1 7.075 2.932 9.96 9.96 0 0 1 2.927 7.068c0 5.522-4.48 10.042-10.018 10.042zm8.487-18.498A11.932 11.932 0 0 0 12.058.04C5.433.04.04 5.432.04 12.058c0 2.115.553 4.181 1.602 6.002L0 24l6.103-1.601a11.954 11.954 0 0 0 5.94 1.564h.005c6.623 0 12.017-5.393 12.017-12.02 0-3.212-1.251-6.232-3.536-8.459z" />
        </svg>
      )

    case 'youtube':
      // Official YouTube play button rounded rectangle
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )

    case 'snapchat':
      // Official Snapchat ghost silhouette
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M12.065 0C7.147 0 4.19 3.57 4.19 7.82c0 1.28.43 2.87.64 3.51.15.48-.12.83-.51 1-.85.37-2.06 1.11-2.27 2.81-.13.97.59 1.76 1.51 2.03.67.2 1.16.17 1.64.57.6.5.41 1.36-.2 1.81-.95.7-2.14 1.38-1.92 2.69.2 1.13 1.42 1.5 2.64 1.68 1.28.18 2.4-.32 3.39.72.78.84 1.21 2.14 3.23 2.14 2.02 0 2.45-1.3 3.23-2.14.99-1.04 2.11-.54 3.39-.72 1.22-.18 2.44-.55 2.64-1.68.22-1.31-.97-1.99-1.92-2.69-.61-.45-.8-1.31-.2-1.81.48-.4.97-.37 1.64-.57.92-.27 1.64-1.06 1.51-2.03-.21-1.7-1.42-2.44-2.27-2.81-.39-.17-.66-.52-.51-1 .21-.64.64-2.23.64-3.51C19.94 3.57 16.983 0 12.065 0z" />
        </svg>
      )

    case 'twitter':
    case 'x':
      // Official X (formerly Twitter) brand mark
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={iconStyle}
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )

    default:
      return (
        <ExternalLink
          className={className}
          style={iconStyle}
          strokeWidth={2}
          aria-hidden="true"
        />
      )
  }
}

/**
 * Human-readable accessible platform labels for aria-label and title.
 */
export function getPlatformLabel(platform: string): string {
  switch (platform.toLowerCase().trim()) {
    case 'email':
      return 'Email Muhammed Sakkeer'
    case 'linkedin':
      return 'LinkedIn'
    case 'github':
      return 'GitHub'
    case 'whatsapp':
      return 'WhatsApp'
    case 'facebook':
      return 'Facebook'
    case 'instagram':
      return 'Instagram'
    case 'youtube':
      return 'YouTube'
    case 'snapchat':
      return 'Snapchat'
    case 'twitter':
      return 'X (Twitter)'
    case 'x':
      return 'X'
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1)
  }
}
