// scripts/create-backup.mjs
// Creates a safe local JSON snapshot backup of all tables and storage metadata
// NEVER prints secrets or keys

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Supabase credentials missing from environment.')
  process.exit(1)
}

const client = createClient(supabaseUrl, serviceRoleKey)

async function backup() {
  console.log('Starting pre-operation database & storage snapshot backup...')
  
  const tables = [
    'site_settings',
    'products',
    'releases',
    'articles',
    'media_highlights',
    'contact_messages',
    'audit_logs',
  ]

  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {},
    storage: {},
  }

  for (const table of tables) {
    const { data, error } = await client.from(table).select('*')
    if (error) {
      console.warn(`Warning: Table ${table} query: ${error.message}`)
      backupData.tables[table] = { error: error.message }
    } else {
      backupData.tables[table] = data
      console.log(`- Backed up ${table}: ${data.length} records`)
    }
  }

  // Storage buckets
  const { data: buckets, error: bError } = await client.storage.listBuckets()
  if (bError) {
    console.warn(`Warning: Could not list storage buckets: ${bError.message}`)
  } else {
    for (const b of buckets) {
      const { data: files } = await client.storage.from(b.id).list()
      backupData.storage[b.id] = {
        bucketInfo: b,
        files: files || [],
      }
      console.log(`- Backed up storage bucket "${b.id}": ${files?.length || 0} top-level items`)
    }
  }

  const backupDir = path.resolve(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const filename = `backup-${Date.now()}.json`
  const filePath = path.join(backupDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8')

  console.log(`\nBackup successfully written to: backups/${filename}`)
}

backup().catch((err) => {
  console.error('Backup failed:', err)
  process.exit(1)
})
