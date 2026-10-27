import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Download,
  FileText,
  Mail,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Layers,
  Database,
  Globe,
  Sparkles,
  Video,
} from 'lucide-react'
import { getCurrentAdminUser } from '@/lib/auth'
import {
  getProducts,
  getArticles,
  getContactMessages,
  getAuditLogs,
  getSiteSettings,
  isSupabaseConfigured,
} from '@/lib/data'
import { Button } from '@/components/ui/button'
import { DashboardQuickActions } from '@/components/admin/dashboard-quick-actions'

export default async function AdminDashboardPage() {
  const user = await getCurrentAdminUser()
  if (!user) {
    redirect('/admin/login?next=/admin')
  }

  const [products, articles, messages, auditLogs, siteSettings] = await Promise.all([
    getProducts({ status: 'all' }),
    getArticles({ publishedOnly: false }),
    getContactMessages('all'),
    getAuditLogs(10),
    getSiteSettings(),
  ])

  const publishedProducts = products.filter((p) => p.status === 'published')
  const totalReleases = products.reduce((acc, p) => acc + (p.releases?.length || 0), 0)
  const unreadMessages = messages.filter((m) => m.status === 'unread')
  const supabaseConnected = isSupabaseConfigured()

  // Calculate actual tracked download events across all releases
  const totalRealDownloads = products.reduce(
    (acc, p) => acc + (p.releases?.reduce((rAcc, r) => rAcc + (r.download_count || 0), 0) || 0),
    0
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner & Welcome */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          paddingBottom: '24px',
          borderBottom: '1px solid #1f272e',
        }}
      >
        <div>
          <div className="section-label" style={{ marginBottom: '6px' }}>
            <span className="section-dot" /> SYSTEM DASHBOARD
          </div>
          <h1 style={{ fontSize: '28px', letterSpacing: '-0.05em', color: '#eef1f4', margin: '0 0 6px', fontWeight: 700 }}>
            Welcome back, Muhammed.
          </h1>
          <p style={{ color: '#89939d', fontSize: '13px', margin: 0 }}>
            Manage software releases, public field notes, media demos, and incoming enterprise conversations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button asChild className="primary-button">
            <Link href="/admin/products/new">
              <Plus data-icon="inline-start" /> New product
            </Link>
          </Button>
          <Button asChild variant="outline" style={{ background: '#10161b', borderColor: '#2d373f', color: '#c5ced4' }}>
            <Link href="/admin/content">
              <Layers data-icon="inline-start" /> Edit website
            </Link>
          </Button>
        </div>
      </div>

      {/* Backend & Deployment Status Callout */}
      {!supabaseConnected && (
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(234, 179, 8, 0.08)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <AlertTriangle style={{ color: '#eab308', width: '20px', height: '20px', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#fef08a' }}>
              Database & Storage: Setup Checklist Pending
            </h4>
            <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#d1d5db', lineHeight: 1.5 }}>
              The portal is currently rendering using initial baseline defaults. To enable persistent live database updates, binary package storage, and audit logs, configure your Supabase keys in <code>.env.local</code>.
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
              <span style={{ color: '#9ca3af' }}>1. Copy <code>.env.example</code> to <code>.env.local</code></span>
              <span style={{ color: '#9ca3af' }}>2. Run <code>pnpm run seed:admin</code></span>
            </div>
          </div>
        </div>
      )}

      {/* All-in-one Quick Management Actions with 11 primary actions & version upload selector */}
      <DashboardQuickActions products={products} unreadMessagesCount={unreadMessages.length} />


      {/* Real Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Products Card */}
        <div
          style={{
            background: '#10161b',
            border: '1px solid #283139',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#89939d', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Showcase Products</span>
            <Package style={{ width: '16px', color: '#b7ff63' }} />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.06em', color: '#eef1f4' }}>
              {publishedProducts.length}
              <span style={{ fontSize: '16px', color: '#68737c', fontWeight: 400 }}> / {products.length}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#74808a', marginTop: '4px' }}>
              {publishedProducts.length} published across {totalReleases} releases
            </div>
          </div>
          <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#b7ff63', marginTop: '16px' }}>
            Manage catalog <ArrowUpRight style={{ width: '12px' }} />
          </Link>
        </div>

        {/* Real Downloads Card */}
        <div
          style={{
            background: '#10161b',
            border: '1px solid #283139',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#89939d', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Logged Downloads</span>
            <Download style={{ width: '16px', color: '#72b8ff' }} />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.06em', color: '#eef1f4' }}>
              {totalRealDownloads}
            </div>
            <div style={{ fontSize: '11px', color: '#74808a', marginTop: '4px' }}>
              Real deduplicated download requests
            </div>
          </div>
          <span style={{ fontSize: '10px', color: '#596570', marginTop: '16px' }}>
            Note: Separate from manual portfolio metrics
          </span>
        </div>

        {/* Field Notes Card */}
        <div
          style={{
            background: '#10161b',
            border: '1px solid #283139',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#89939d', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Field Notes</span>
            <FileText style={{ width: '16px', color: '#c691ff' }} />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.06em', color: '#eef1f4' }}>
              {articles.filter((a) => a.is_published).length}
            </div>
            <div style={{ fontSize: '11px', color: '#74808a', marginTop: '4px' }}>
              {articles.length} total articles recorded
            </div>
          </div>
          <Link href="/admin/insights" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#b7ff63', marginTop: '16px' }}>
            View articles <ArrowUpRight style={{ width: '12px' }} />
          </Link>
        </div>

        {/* Inquiries Card */}
        <div
          style={{
            background: '#10161b',
            border: '1px solid #283139',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#89939d', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inquiries Inbox</span>
            <Mail style={{ width: '16px', color: '#ffbf7b' }} />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.06em', color: unreadMessages.length > 0 ? '#b7ff63' : '#eef1f4' }}>
              {unreadMessages.length}
            </div>
            <div style={{ fontSize: '11px', color: '#74808a', marginTop: '4px' }}>
              Unread inquiries awaiting review
            </div>
          </div>
          <Link href="/admin/messages" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#b7ff63', marginTop: '16px' }}>
            Open inbox <ArrowUpRight style={{ width: '12px' }} />
          </Link>
        </div>
      </div>

      {/* Two Column Section: Products Overview & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Products Quick Table */}
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Active Lab Software</h3>
            <Link href="/admin/products" style={{ fontSize: '12px', color: '#b7ff63' }}>
              All products →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#0c1115',
                  border: '1px solid #202830',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#eef1f4' }}>{p.title}</div>
                  <div style={{ fontSize: '11px', color: '#77828c' }}>
                    {p.category} • {p.current_release?.version || 'No release'} • {p.status}
                  </div>
                </div>
                <Button asChild size="sm" variant="outline" style={{ borderColor: '#2d3841', color: '#b5c0c8', fontSize: '11px' }}>
                  <Link href={`/admin/products/${p.id}`}>Edit</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* System & Audit Trail */}
        <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Audit Records</h3>
            <Link href="/admin/audit-logs" style={{ fontSize: '12px', color: '#b7ff63' }}>
              Full audit trail →
            </Link>
          </div>

          {auditLogs.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#77828c', fontSize: '12px' }}>
              No administrative changes recorded yet. Future changes will be logged here automatically.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {auditLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  style={{
                    fontSize: '11px',
                    padding: '8px 12px',
                    background: '#0c1115',
                    borderRadius: '6px',
                    border: '1px solid #1c242a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ color: '#b7ff63', fontWeight: 600 }}>{log.action}</span>
                    <span style={{ color: '#77818a', marginLeft: '6px' }}>on {log.entity_type}</span>
                  </div>
                  <span style={{ color: '#59636c' }}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
