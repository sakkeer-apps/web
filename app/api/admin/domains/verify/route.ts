// app/api/admin/domains/verify/route.ts - Live DNS verification diagnostic checker

import { NextResponse } from 'next/server'
import { getCurrentAdminUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentAdminUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain } = await request.json()
    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 })
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')

    // Query Google DNS over HTTPS for A and CNAME records
    const [aRes, cnameRes] = await Promise.all([
      fetch(`https://dns.google/resolve?name=${cleanDomain}&type=A`, { cache: 'no-store' }),
      fetch(`https://dns.google/resolve?name=${cleanDomain}&type=CNAME`, { cache: 'no-store' }),
    ])

    const aData = await aRes.json()
    const cnameData = await cnameRes.json()

    const answersA = aData?.Answer || []
    const answersCNAME = cnameData?.Answer || []

    const hasVercelA = answersA.some((a: { data: string }) => a.data === '76.76.21.21')
    const hasVercelCNAME = answersCNAME.some((c: { data: string }) => c.data?.includes('vercel-dns.com'))

    const isConnected = hasVercelA || hasVercelCNAME || answersA.length > 0

    return NextResponse.json({
      domain: cleanDomain,
      verified: isConnected,
      status: isConnected ? 'DNS Configured' : 'Pending DNS Setup',
      details: {
        a_records: answersA.map((a: { data: string }) => a.data),
        cname_records: answersCNAME.map((c: { data: string }) => c.data),
        has_expected_target: hasVercelA || hasVercelCNAME,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'DNS check failed'
    return NextResponse.json({ error: msg, verified: false, status: 'Check Failed' }, { status: 500 })
  }
}
