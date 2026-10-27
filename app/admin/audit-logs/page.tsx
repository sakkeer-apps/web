import { redirect } from 'next/navigation'
import Link from 'next/link'
import { History, Shield, Clock, User } from 'lucide-react'
import { getCurrentAdminUser } from '@/lib/auth'
import { getAuditLogs } from '@/lib/data'

export default async function AdminAuditLogsPage() {
  const user = await getCurrentAdminUser()
  if (!user) redirect('/admin/login?next=/admin/audit-logs')

  const logs = await getAuditLogs(100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <Link href="/admin" style={{ color: '#b7ff63', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}>
          ← Dashboard
        </Link>
        <span style={{ color: '#52606d' }}>/</span>
        <span style={{ color: '#89939d' }}>Audit Trail</span>
      </div>

      <div>
        <div className="section-label" style={{ marginBottom: '4px' }}>
          <span className="section-dot" /> SECURITY & AUDIT TRAIL
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#eef1f4' }}>
          Administrative Audit Logs
        </h1>
        <p style={{ color: '#89939d', fontSize: '13px', margin: '4px 0 0' }}>
          Immutable records of content edits, release updates, logins, and settings changes.
        </p>
      </div>

      <div style={{ background: '#10161b', border: '1px solid #283139', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: '#0a0e12', borderBottom: '1px solid #202930', color: '#74808a', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10px' }}>
                <th style={{ padding: '14px 20px' }}>Timestamp</th>
                <th style={{ padding: '14px 16px' }}>Action</th>
                <th style={{ padding: '14px 16px' }}>Entity Type</th>
                <th style={{ padding: '14px 16px' }}>Actor</th>
                <th style={{ padding: '14px 20px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#68737c' }}>
                    No audit records registered yet. Administrative actions will automatically log here.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #1c242a' }}>
                    <td style={{ padding: '14px 20px', color: '#89939d', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 700,
                          background: 'rgba(183, 255, 99, 0.08)',
                          color: '#b7ff63',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#b5c0c8', textTransform: 'uppercase', fontSize: '11px' }}>
                      {log.entity_type}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#eef1f4' }}>
                      {log.actor_email}
                    </td>

                    <td style={{ padding: '14px 20px', color: '#74808a', fontFamily: 'monospace', fontSize: '11px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {JSON.stringify(log.details)}
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
