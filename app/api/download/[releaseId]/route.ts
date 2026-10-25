// app/api/download/[releaseId]/route.ts - Secure package download & honest tracking handler

import { NextResponse } from 'next/server'
import { getReleaseById } from '@/lib/data'
import { getCurrentAdminUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashIp, checkRateLimit } from '@/lib/security'

interface RouteParams {
  params: Promise<{ releaseId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { releaseId } = await params
    const adminClient = createAdminClient()

    let release = null
    if (adminClient) {
      const { data } = await adminClient.from('releases').select('*').eq('id', releaseId).maybeSingle()
      release = data
    }
    if (!release) {
      release = await getReleaseById(releaseId)
    }

    if (!release) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 })
    }

    const adminUser = await getCurrentAdminUser()

    // Protect unpublished packages from public access
    if (!release.is_published && !adminUser) {
      return NextResponse.json({ error: 'This release is not published.' }, { status: 403 })
    }

    // Protect releases belonging to draft or archived products from public access
    let parentProduct = null
    if (adminClient) {
      const { data } = await adminClient.from('products').select('*').eq('id', release.product_id).maybeSingle()
      parentProduct = data
    }
    if (!parentProduct) {
      const { getProductById } = await import('@/lib/data')
      parentProduct = await getProductById(release.product_id)
    }

    if (!adminUser && parentProduct && parentProduct.status !== 'published') {
      return NextResponse.json({ error: 'This product and its releases are not publicly accessible.' }, { status: 403 })
    }


    // If external web application, redirect to external launch URL
    if (release.package_type === 'external_web' && release.external_launch_url) {
      return NextResponse.redirect(release.external_launch_url, { status: 302 })
    }

    // Rate limiting: max 15 download requests per minute per IP to prevent spam attacks
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const ipH = hashIp(ip)
    const rateCheck = checkRateLimit(`dl:${ipH}`, 15, 60)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Download request rate limit exceeded. Please wait a minute.' },
        { status: 429 }
      )
    }

    // Honest download tracking with deduplication (same IP hash within 1 hour is not counted twice)
    if (adminClient) {
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        const { data: recentEvents } = await adminClient
          .from('download_events')
          .select('id')
          .eq('release_id', release.id)
          .eq('ip_hash', ipH)
          .gte('downloaded_at', oneHourAgo)
          .limit(1)

        // Only log and increment if not already downloaded by this IP in the past hour
        if (!recentEvents || recentEvents.length === 0) {
          await adminClient.from('download_events').insert({
            release_id: release.id,
            product_id: release.product_id,
            ip_hash: ipH,
            user_agent: request.headers.get('user-agent') || '',
            downloaded_at: new Date().toISOString(),
          })

          // Increment counter honestly
          const { error: rpcErr } = await adminClient.rpc('increment_release_downloads', { rel_id: release.id })
          if (rpcErr) {
            // Fallback manual increment
            await adminClient
              .from('releases')
              .update({ download_count: (release.download_count || 0) + 1 })
              .eq('id', release.id)
          }
        }
      } catch (err) {
        console.warn('Failed to record download event:', err)
      }
    }

    // If storage path exists in Supabase Storage, generate signed download URL
    if (release.storage_path && adminClient) {
      const { data: signedData, error: signedErr } = await adminClient.storage
        .from('releases')
        .createSignedUrl(release.storage_path, 300, {
          download: release.file_name || 'download',
        })

      if (!signedErr && signedData?.signedUrl) {
        return NextResponse.redirect(signedData.signedUrl, { status: 302 })
      }
    }

    // If binary file is not yet uploaded to durable object storage
    // Requirement 3: "Missing content must have an honest unavailable state until the owner supplies it."
    return new NextResponse(
      JSON.stringify({
        message: 'Binary package file is currently in preparation by the software author.',
        details: {
          product_id: release.product_id,
          version: release.version,
          format: release.package_type,
          expected_size: release.file_size_formatted,
          checksum_sha256: release.file_checksum_sha256 || 'Pending author upload',
          safety_scan_status: release.safety_scan_status,
          disclosure: 'No binary has been uploaded for this version yet in storage.',
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Download failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
