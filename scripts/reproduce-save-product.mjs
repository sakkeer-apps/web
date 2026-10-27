import { loadEnvironment } from './load-env.mjs'
loadEnvironment({ verbose: false })

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Supabase URL:', url ? 'Defined' : 'Missing')
console.log('Service Role Key:', key ? 'Defined' : 'Missing')

const client = createClient(url, key)

async function testSave() {
  const testPayload = {
    title: 'E-Commerce Report Dashboard',
    slug: 'ecommerce-report',
    category: 'Web apps',
    accent: 'cyan',
    short_description: 'An interactive e-commerce performance analytics dashboard and reporting tool.',
    full_description: 'Full description of the ecommerce reporting dashboard.',
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    cover_image_alt: 'Ecommerce report cover',
    tags: ['analytics', 'ecommerce', 'dashboard'],
    supported_platforms: ['Web', 'Chrome', 'Safari'],
    system_requirements: 'Modern Web Browser',
    display_order: 1,
    is_featured: true,
    status: 'published',
    portfolio_download_display: 'Launch App',
    external_website_url: '',
    live_demo_url: 'https://esmart-me.github.io/ecommerce-report/',
    repo_url: '',
    source_type: 'webapp',
    features: ['Real-time metrics', 'Sales conversion tracking', 'CSV Export'],
    github_url: '',
    github_data: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  console.log('Attempting insert with testPayload...')
  const insertRes = await client
    .from('products')
    .insert(testPayload)
    .select('id')
    .single()

  console.log('Insert Result:', {
    data: insertRes.data,
    error: insertRes.error,
    errorIsInstanceOfError: insertRes.error instanceof Error,
  })

  if (insertRes.error) {
    console.log('Error details:', JSON.stringify(insertRes.error, null, 2))
  } else {
    console.log('Insert successful! ID:', insertRes.data?.id)
    // Clean up test record
    await client.from('products').delete().eq('id', insertRes.data.id)
    console.log('Cleaned up test record.')
  }
}

testSave().catch(console.error)
