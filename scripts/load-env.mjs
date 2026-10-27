// scripts/load-env.mjs
// Unified, robust environment variable loader for all maintenance and verification scripts.
// Detects duplicates, missing values, and placeholders without leaking secrets.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

export function loadEnvironment(options = { verbose: false }) {
  const envFiles = ['.env.local', '.env']
  const foundKeys = new Map()
  const duplicateKeys = new Set()
  let loadedCount = 0

  for (const envFile of envFiles) {
    const fullPath = path.join(rootDir, envFile)
    if (!fs.existsSync(fullPath)) continue

    const content = fs.readFileSync(fullPath, 'utf8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('#')) continue

      const eqIdx = line.indexOf('=')
      if (eqIdx === -1) continue

      const key = line.slice(0, eqIdx).trim()
      let val = line.slice(eqIdx + 1).trim()
      // Remove surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }

      if (foundKeys.has(key)) {
        duplicateKeys.add(key)
      } else {
        foundKeys.set(key, val)
      }

      // Populate into process.env if not already set by system
      if (process.env[key] === undefined) {
        process.env[key] = val
        loadedCount++
      }
    }
  }

  if (duplicateKeys.size > 0 && options.verbose) {
    console.warn(`[env-loader] Warning: Detected duplicate environment variable names: ${Array.from(duplicateKeys).join(', ')}`)
  }

  return {
    loaded: loadedCount,
    duplicates: Array.from(duplicateKeys),
  }
}

export function validateRequiredEnv(options = { requireServiceKey: true }) {
  loadEnvironment()

  const required = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Anon Key' },
  ]

  if (options.requireServiceKey) {
    required.push({ key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'Supabase Service Role Key' })
  }

  const missing = []
  const placeholders = []

  for (const { key, label } of required) {
    const val = process.env[key]
    if (!val || val.trim().length === 0) {
      missing.push(label)
    } else if (val.includes('your-project') || val.includes('your-anon-key') || val.includes('your-service-role')) {
      placeholders.push(label)
    }
  }

  if (missing.length > 0 || placeholders.length > 0) {
    console.error('\n❌ Environment Configuration Error:')
    if (missing.length > 0) {
      console.error(`   Missing required values: ${missing.join(', ')}`)
    }
    if (placeholders.length > 0) {
      console.error(`   Contains placeholder values: ${placeholders.join(', ')}`)
    }
    console.error('   Please check your .env.local file. Never commit real keys to version control.\n')
    return false
  }

  return true
}

// Automatically load when imported as a script module
loadEnvironment()
