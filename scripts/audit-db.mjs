// scripts/audit-db.mjs
// Audits the live database schema for media_highlights against migration 20261025000001_media_social_and_release_fixes.sql

import './load-env.mjs'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Supabase URL or Service Role Key missing in environment.')
  process.exit(1)
}

const client = createClient(supabaseUrl, serviceRoleKey)

async function audit() {
  console.log('Auditing live Supabase database...')

  // 1. Check if is_published exists on media_highlights
  const { data: testSelect, error: colError } = await client
    .from('media_highlights')
    .select('id, title, is_published, video_type')
    .limit(1)

  const isPublishedExists = !colError || !colError.message.includes('is_published')
  console.log(`Column 'is_published' exists: ${isPublishedExists ? 'YES' : 'NO'}`)
  if (colError) {
    console.log(`Select result detail: ${colError.message}`)
  } else {
    console.log(`Select sample record:`, JSON.stringify(testSelect))
  }

  // 2. Check if video_type allows 'facebook' or 'instagram'
  // Try updating or checking with a non-matching ID to test constraint without touching existing data
  const { error: testConstraintError } = await client
    .from('media_highlights')
    .update({ video_type: 'facebook' })
    .eq('id', '00000000-0000-0000-0000-000000000000')

  const constraintAllowsFacebook = !testConstraintError || !testConstraintError.message.includes('check constraint')
  console.log(`Check constraint allows 'facebook': ${constraintAllowsFacebook ? 'YES' : 'NO'}`)
  if (testConstraintError) {
    console.log(`Constraint test detail: ${testConstraintError.message}`)
  }

  // 3. Check storage bucket config
  const { data: buckets, error: bError } = await client.storage.listBuckets()
  if (bError) {
    console.log(`Storage bucket check error: ${bError.message}`)
  } else {
    const mediaBucket = buckets.find(b => b.id === 'media')
    console.log(`Media bucket file_size_limit: ${mediaBucket?.file_size_limit} bytes (~${Math.round((mediaBucket?.file_size_limit || 0) / 1024 / 1024)}MB)`)
    console.log(`Media bucket allowed_mime_types:`, mediaBucket?.allowed_mime_types)
  }

  // 4. Check whether we can execute SQL via RPC (e.g. exec_sql or similar if preconfigured)
  const { error: rpcError } = await client.rpc('exec_sql', { sql: 'select 1;' })
  const rpcAvailable = !rpcError || !rpcError.message.includes('Could not find the function')
  console.log(`RPC exec_sql function available: ${rpcAvailable ? 'YES' : 'NO'}`)
}

audit().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})
