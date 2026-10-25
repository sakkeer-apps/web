// scripts/provision-owner.ts - Secure owner account provisioning script

import { createClient } from '@supabase/supabase-js'
import * as crypto from 'crypto'
import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'

// Helper to load .env.local if present
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadEnvLocal()

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close()
      resolve(ans)
    })
  )
}

async function main() {
  console.log('\n======================================================')
  console.log(' Muhammed Sakkeer Portfolio - Owner Account Provisioning')
  console.log('======================================================\n')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase credentials are missing.')
    console.error('Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file.\n')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  let email = process.env.OWNER_EMAIL || 'techsakeer@gmail.com'
  let password = process.env.OWNER_INITIAL_PASSWORD

  if (!email) {
    email = await askQuestion('Enter Owner Email (e.g. techsakeer@gmail.com): ')
  }

  if (!password) {
    const promptPass = await askQuestion(
      'Enter Initial Password (or press Enter to generate a secure random password): '
    )
    if (promptPass.trim()) {
      password = promptPass.trim()
    } else {
      password = crypto.randomBytes(16).toString('hex') + '!Aa1'
      console.log(`\n🔑 Generated Secure Password: ${password}`)
      console.log('⚠️ Please save this password securely now! It will not be shown again.\n')
    }
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters long.')
    process.exit(1)
  }

  console.log(`\n⏳ Provisioning owner account for: ${email}...`)

  // Check if user already exists
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error('❌ Failed to connect to Supabase Auth:', listErr.message)
    process.exit(1)
  }

  const existingUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  if (existingUser) {
    console.log(`ℹ️ Account already exists (ID: ${existingUser.id}). Updating password and confirming email...`)
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: { role: 'owner', name: 'Muhammed Sakkeer' },
    })

    if (updateErr) {
      console.error('❌ Failed to update owner account:', updateErr.message)
      process.exit(1)
    }
    console.log('✅ Owner account password updated successfully!')
  } else {
    const { error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'owner', name: 'Muhammed Sakkeer' },
    })

    if (createErr) {
      console.error('❌ Failed to create owner account:', createErr.message)
      process.exit(1)
    }
    console.log('✅ Owner account created and confirmed successfully!')
  }

  console.log('\n------------------------------------------------------')
  console.log(`Owner Email: ${email}`)
  console.log('Login URL:   http://localhost:3000/admin/login')
  console.log('------------------------------------------------------\n')
}

main().catch((err) => {
  console.error('Unexpected error during provisioning:', err)
  process.exit(1)
})
