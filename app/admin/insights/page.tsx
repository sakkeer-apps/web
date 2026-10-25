import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, ArrowUpRight, Edit3, Eye, Trash2 } from 'lucide-react'
import { getCurrentAdminUser } from '@/lib/auth'
import { getArticles } from '@/lib/data'
import { Button } from '@/components/ui/button'

export default async function AdminInsightsPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login')

  const articles = await getArticles({ publishedOnly: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '4px' }}>
            <span className="section-dot" /> PERSPECTIVES & WRITING
          </div>
          <h1 style={{ fontSize: '26px', letterSpacing: '-0.05em', color: '#eef1f4', margin: 0, fontWeight: 700 }}>
            Field Notes / Insights
          </h1>
          <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
            Publish deep-dives, strategic revenue analyses, and technology thought leadership.
          </p>
        </div>

        <Button asChild className="primary-button">
          <Link href="/admin/insights/new">
            <Plus data-icon="inline-start" /> Write new note
          </Link>
        </Button>
      </div>

      {/* Articles Table */}
      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a0e12', borderBottom: '1px solid #202930', color: '#74808a', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10px' }}>
                <th style={{ padding: '14px 20px' }}>Article</th>
                <th style={{ padding: '14px 16px' }}>Category</th>
                <th style={{ padding: '14px 16px' }}>Published Date</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Body State</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#68737c' }}>
                    No field notes found. Click "Write new note" above to draft your first article.
                  </td>
                </tr>
              ) : (
                articles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: '1px solid #1c242a' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#eef1f4', fontSize: '13px' }}>{art.title}</div>
                      <div style={{ color: '#74808a', fontSize: '11px', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {art.excerpt}
                      </div>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span className="category-badge" style={{ fontSize: '8px' }}>
                        {art.category}
                      </span>
                    </td>

                    <td style={{ padding: '16px 16px', color: '#b5c0c8' }}>
                      {art.published_date_formatted} ({art.reading_time_minutes} min read)
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '99px',
                          fontSize: '10px',
                          fontWeight: 600,
                          background: art.is_published ? 'rgba(183, 255, 99, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                          color: art.is_published ? '#b7ff63' : '#9ca3af',
                        }}
                      >
                        {art.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 16px' }}>
                      <span style={{ fontSize: '11px', color: art.body_markdown ? '#adf28b' : '#ffbf7b' }}>
                        {art.body_markdown ? 'Full Text Ready' : 'Summary Only (In-progress)'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Button asChild size="sm" variant="outline" style={{ borderColor: '#2b353d', fontSize: '11px', color: '#c5ced4' }}>
                          <Link href={`/admin/insights/${art.id}`}>Edit</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" style={{ borderColor: '#2b353d', fontSize: '11px', color: '#b7ff63' }}>
                          <Link href={`/insights/${art.slug}`} target="_blank">
                            <Eye style={{ width: '11px', marginRight: '4px' }} /> View live
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
