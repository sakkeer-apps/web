import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Package, ExternalLink, ArrowUpRight, Edit3, Trash2, Layers, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import { getCurrentAdminUser } from '@/lib/auth'
import { getProducts } from '@/lib/data'
import { Button } from '@/components/ui/button'

export default async function AdminProductsPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login?next=/admin/products')

  const products = await getProducts({ status: 'all' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <Link href="/admin" style={{ color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
          ← Dashboard
        </Link>
        <span style={{ color: '#52606d' }}>/</span>
        <span style={{ color: '#89939d' }}>Applications & Releases</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '6px' }}>
            <span className="section-dot" /> SOFTWARE CATALOG
          </div>
          <h1 style={{ fontSize: '26px', letterSpacing: '-0.05em', color: '#eef1f4', margin: 0, fontWeight: 700 }}>
            Products & Packages
          </h1>
          <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
            Manage showcase items, release binaries, download links, and platform requirements.
          </p>
        </div>

        <Button asChild className="primary-button">
          <Link href="/admin/products/new">
            <Plus data-icon="inline-start" /> Create product
          </Link>
        </Button>
      </div>

      {/* Product Table / Cards */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a0e12', borderBottom: '1px solid #202930', color: '#74808a', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10px' }}>
                <th style={{ padding: '14px 20px' }}>Product</th>
                <th style={{ padding: '14px 16px' }}>Category</th>
                <th style={{ padding: '14px 16px' }}>Accent</th>
                <th style={{ padding: '14px 16px' }}>Version</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Order</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: '#68737c' }}>
                    No products found. Click "Create product" above to add your first software item.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const currentVer = p.current_release?.version || 'None'
                  const releaseCount = p.releases?.length || 0

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #1c242a',
                        transition: 'background .15s',
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              background: '#192229',
                              flexShrink: 0,
                            }}
                          >
                            <img src={p.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#eef1f4', fontSize: '13px' }}>{p.title}</div>
                            <div style={{ color: '#74808a', fontSize: '11px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.short_description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <span className="category-badge" style={{ fontSize: '8px' }}>
                          {p.category}
                        </span>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            background:
                              p.accent === 'cyan'
                                ? 'rgba(6, 182, 212, 0.15)'
                                : p.accent === 'violet'
                                ? 'rgba(139, 92, 246, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color:
                              p.accent === 'cyan'
                                ? '#67e8f9'
                                : p.accent === 'violet'
                                ? '#c4b5fd'
                                : '#fcd34d',
                          }}
                        >
                          {p.accent}
                        </span>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ color: '#d1d8dc', fontWeight: 500 }}>{currentVer}</div>
                        <Link
                          href={`/admin/products/${p.id}/releases`}
                          style={{ fontSize: '10px', color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                        >
                          {releaseCount} releases →
                        </Link>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '99px',
                            fontSize: '10px',
                            fontWeight: 600,
                            background:
                              p.status === 'published'
                                ? 'rgba(183, 255, 99, 0.1)'
                                : p.status === 'draft'
                                ? 'rgba(234, 179, 8, 0.1)'
                                : 'rgba(156, 163, 175, 0.1)',
                            color:
                              p.status === 'published'
                                ? '#b7ff63'
                                : p.status === 'draft'
                                ? '#facc15'
                                : '#9ca3af',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td style={{ padding: '16px 16px', color: '#89939d' }}>#{p.display_order}</td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Button asChild size="sm" className="primary-button" style={{ fontSize: '11px', height: '30px', padding: '0 10px' }}>
                            <Link href={`/admin/products/${p.id}?tab=upload`}>
                              <Upload style={{ width: '12px', marginRight: '4px' }} /> Upload version
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" style={{ borderColor: '#2b353d', fontSize: '11px', height: '30px', padding: '0 10px', color: '#c5ced4' }}>
                            <Link href={`/admin/products/${p.id}`}>Edit</Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" style={{ borderColor: '#2b353d', fontSize: '11px', height: '30px', padding: '0 10px', color: '#b7ff63' }}>
                            <Link href={`/admin/products/${p.id}/releases`}>Releases ({releaseCount})</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
