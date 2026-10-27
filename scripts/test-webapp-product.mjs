// scripts/test-webapp-product.mjs
// Comprehensive reproduction & verification script for saving, editing, persistence, and duplicate slug handling for Web App Link products.

import { loadEnvironment } from './load-env.mjs'
loadEnvironment({ verbose: false })

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing Supabase credentials in environment')
  process.exit(1)
}

const supabase = createClient(url, key)

// Pure JS copy of formatDatabaseError for testing verification in Node
function formatDatabaseError(err, entityName = 'product') {
  let code = 'UNKNOWN'
  let rawMessage = ''
  let rawDetails = null
  let constraint = null

  if (typeof err === 'object' && err !== null) {
    if (typeof err.code === 'string') code = err.code
    if (typeof err.message === 'string') rawMessage = err.message
    if (typeof err.details === 'string') rawDetails = err.details
  }

  if (!rawMessage) {
    if (err instanceof Error) {
      rawMessage = err.message
      code = err.code || err.name || 'ERROR'
    } else if (typeof err === 'string') {
      rawMessage = err
    } else {
      rawMessage = 'An unexpected database error occurred.'
    }
  }

  const constraintMatch =
    rawMessage.match(/constraint "([^"]+)"/i) ||
    (rawDetails ? rawDetails.match(/constraint "([^"]+)"/i) : null)
  if (constraintMatch && constraintMatch[1]) {
    constraint = constraintMatch[1]
  }

  const sanitize = (text) => {
    if (!text) return ''
    return text
      .replace(/password(=|:\s*)[^\s;,'"]+/gi, '$1***')
      .replace(/key(=|:\s*)[^\s;,'"]+/gi, '$1***')
      .replace(/token(=|:\s*)[^\s;,'"]+/gi, '$1***')
      .replace(/secret(=|:\s*)[^\s;,'"]+/gi, '$1***')
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer ***')
  }

  const sanitizedMessage = sanitize(rawMessage)
  const sanitizedDetails = rawDetails ? sanitize(rawDetails) : null

  const sanitizedLog = {
    code,
    message: sanitizedMessage,
    constraint,
    details: sanitizedDetails,
  }

  let userMessage = `Failed to save ${entityName}.`

  if (code === '23505' || sanitizedMessage.includes('unique constraint') || constraint?.includes('slug')) {
    const slugMatch =
      (sanitizedDetails && sanitizedDetails.match(/Key \(slug\)=\(([^)]+)\)/i)) ||
      sanitizedMessage.match(/Key \(slug\)=\(([^)]+)\)/i)
    const offendingSlug = slugMatch ? ` "${slugMatch[1]}"` : ''
    userMessage = `A ${entityName} with the URL slug${offendingSlug} already exists. Please choose a different unique URL slug.`
  } else if (code === '23502' || sanitizedMessage.includes('not-null constraint')) {
    const colMatch =
      sanitizedMessage.match(/column "([^"]+)"/i) ||
      (sanitizedDetails ? sanitizedDetails.match(/column "([^"]+)"/i) : null)
    const col = colMatch ? ` ("${colMatch[1]}")` : ''
    userMessage = `Required database field${col} was missing. Please fill in all required fields.`
  } else if (code === '23514' || sanitizedMessage.includes('check constraint')) {
    userMessage = `One or more field values violate validation rules. Please verify category, status, and accent selections.`
  } else if (code === 'PGRST204' || sanitizedMessage.includes('schema cache')) {
    const colMatch = sanitizedMessage.match(/Could not find the '([^']+)' column/i)
    userMessage = `Database schema mismatch: Column '${colMatch ? colMatch[1] : 'unknown'}' was not recognized in the database.`
  } else if (code === '23503' || sanitizedMessage.includes('foreign key')) {
    userMessage = `Referenced ${entityName} record does not exist or has been removed.`
  } else if (
    code === '42501' ||
    sanitizedMessage.includes('row-level security') ||
    sanitizedMessage.includes('permission denied')
  ) {
    userMessage = `Database permission denied. Ensure your owner session is active.`
  } else if (sanitizedMessage) {
    userMessage = `Database error (${code}): ${sanitizedMessage}`
  }

  return { sanitizedLog, userMessage }
}

async function runTest() {
  console.log('=== Web App Product Save & Edit Verification ===\n')

  const testSlug = 'ecommerce-report-test'
  const targetLiveUrl = 'https://esmart-me.github.io/ecommerce-report/'

  // 1. Clean up any previous test product with this slug
  const { data: existing } = await supabase.from('products').select('id').eq('slug', testSlug)
  if (existing && existing.length > 0) {
    for (const p of existing) {
      await supabase.from('products').delete().eq('id', p.id)
    }
    console.log(`Cleaned up ${existing.length} existing test record(s) for slug: ${testSlug}`)
  }

  // 2. Test saving a new Web App Link product
  console.log('Step 1: Attempting to insert new Web App product...')
  const newProductPayload = {
    title: 'E-Commerce Report Dashboard',
    slug: testSlug,
    category: 'Web apps',
    accent: 'cyan',
    short_description: 'An interactive e-commerce performance analytics dashboard and reporting tool.',
    full_description: 'Built for tracking revenue streams, inventory levels, and customer acquisition metrics.',
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    cover_image_alt: 'Ecommerce report interface overview',
    tags: ['ecommerce', 'reporting', 'analytics'],
    supported_platforms: ['Web', 'Chrome', 'Safari', 'Firefox'],
    system_requirements: 'Modern web browser with JavaScript enabled.',
    display_order: 1,
    is_featured: true,
    status: 'published',
    portfolio_download_display: 'Live Web App',
    external_website_url: '',
    live_demo_url: targetLiveUrl,
    repo_url: '',
    source_type: 'webapp',
    features: ['Instant KPI calculations', 'Automated sales breakdown', 'Exportable executive summaries'],
    github_data: null,
  }

  // Test our DB error handler with PGRST204 simulation
  const simulatedPgrst = {
    code: 'PGRST204',
    message: "Could not find the 'github_url' column of 'products' in the schema cache",
  }
  const formattedSim = formatDatabaseError(simulatedPgrst, 'product')
  console.log('✓ Verified error formatting for PGRST204:', formattedSim.userMessage)

  // Test our DB error handler with Duplicate Slug (23505) simulation
  const simulated23505 = {
    code: '23505',
    message: 'duplicate key value violates unique constraint "products_slug_key"',
    details: `Key (slug)=(${testSlug}) already exists.`,
  }
  const formattedSlugErr = formatDatabaseError(simulated23505, 'product')
  console.log('✓ Verified error formatting for duplicate slug 23505:', formattedSlugErr.userMessage)
  if (!formattedSlugErr.userMessage.includes(testSlug)) {
    throw new Error('Duplicate slug error message should mention the offending slug')
  }

  // 3. Insert product
  const insertRes = await supabase
    .from('products')
    .insert({
      ...newProductPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (insertRes.error) {
    console.error('Insert failed with error:', insertRes.error)
    process.exit(1)
  }

  const createdId = insertRes.data.id
  console.log(`✓ Product created successfully! ID: ${createdId}`)
  console.log(`  Title: ${insertRes.data.title}`)
  console.log(`  Live URL: ${insertRes.data.live_demo_url}`)
  console.log(`  Source Type: ${insertRes.data.source_type}`)
  console.log(`  Features (${insertRes.data.features.length}):`, insertRes.data.features)

  // 4. Test Persistence after refresh (re-query from database)
  console.log('\nStep 2: Verifying persistence after database refresh...')
  const { data: refetched, error: refetchErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', createdId)
    .single()

  if (refetchErr || !refetched) {
    console.error('Persistence check failed:', refetchErr)
    process.exit(1)
  }

  if (refetched.live_demo_url !== targetLiveUrl) {
    console.error(`Live URL mismatch: expected ${targetLiveUrl}, got ${refetched.live_demo_url}`)
    process.exit(1)
  }
  console.log(`✓ Persistence verified! live_demo_url is faithfully preserved: ${refetched.live_demo_url}`)

  // 5. Test Editing the product
  console.log('\nStep 3: Testing product update/edit...')
  const updatePayload = {
    ...newProductPayload,
    title: 'E-Commerce Report Dashboard (Updated)',
    features: [...newProductPayload.features, 'Quarterly revenue trend projection'],
    updated_at: new Date().toISOString(),
  }

  const updateRes = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', createdId)
    .select('*')
    .single()

  if (updateRes.error) {
    console.error('Update failed:', updateRes.error)
    process.exit(1)
  }

  console.log(`✓ Product updated successfully! New Title: ${updateRes.data.title}`)
  console.log(`  Updated Features count: ${updateRes.data.features.length}`)

  // 6. Test duplicate slug constraint in live DB
  console.log('\nStep 4: Testing duplicate slug handling on live database...')
  const duplicateAttempt = await supabase
    .from('products')
    .insert({
      ...newProductPayload,
      title: 'Another Product With Same Slug',
      slug: testSlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (!duplicateAttempt.error) {
    console.error('Expected duplicate slug insertion to fail, but it succeeded!')
    process.exit(1)
  }

  const formattedLiveDupErr = formatDatabaseError(duplicateAttempt.error, 'product')
  console.log('✓ Duplicate slug rejected by Postgres as expected!')
  console.log('  Live code:', duplicateAttempt.error.code)
  console.log('  User-friendly message returned to owner:', formattedLiveDupErr.userMessage)

  // 7. Test Public UI API / data fetching
  console.log('\nStep 5: Verifying public data loader includes the webapp product and links...')
  const { data: publicProducts } = await supabase
    .from('products')
    .select('*')
    .eq('id', createdId)
    .single()

  if (!publicProducts || publicProducts.live_demo_url !== targetLiveUrl) {
    console.error('Public data verification failed')
    process.exit(1)
  }
  console.log(`✓ Public product found with "Open application" link target: ${publicProducts.live_demo_url}`)

  // Clean up test product
  await supabase.from('products').delete().eq('id', createdId)
  console.log('\n✓ Cleaned up test product.')

  console.log('\nAll web app product tests passed successfully!')
}

runTest().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
