# Production Deployment & Maintenance Guide

This document details deployment, rollback, domain configuration, and backup strategies for the Muhammed Sakkeer Portfolio & Software Download Portal.

---

## 1. Hosting Architecture Overview

The system is built on **Next.js (App Router)** with a persistent **Supabase PostgreSQL & Storage** backend.

- **Frontend & Serverless Edge**: Hosted on Vercel, AWS Amplify, or a standalone Node.js container.
- **Database & Storage**: Managed Supabase PostgreSQL with Row Level Security (RLS) and object storage for binary releases.
- **Cache Invalidation**: On-demand tag-based and path-based revalidation (`revalidatePath('/')`, `revalidatePath('/insights')`).

---

## 2. Deploying to Vercel (Recommended)

1. Push your code to your GitHub/GitLab repository.
2. In the [Vercel Dashboard](https://vercel.com/new), import the repository.
3. In **Project Settings > Environment Variables**, add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-secret-service-role-key>
   NEXT_PUBLIC_SITE_URL=https://muhammedsakkeer.com
   ADMIN_EMAIL=techsakeer@gmail.com
   RATE_LIMIT_SALT=<random-long-secret-salt>
   RESEND_API_KEY=<optional-for-email-notifications>
   CONTACT_NOTIFICATION_EMAIL=techsakeer@gmail.com
   ```
4. Set Build Command: `pnpm build`
5. Click **Deploy**.

---

## 3. Database & Storage Setup in Supabase

1. Open your [Supabase Project Dashboard](https://supabase.com).
2. Go to the **SQL Editor** and execute the migration files in order:
   - `supabase/migrations/20261024000001_initial_schema.sql`
   - `supabase/migrations/20261024000002_rls_and_storage.sql`
   - `supabase/migrations/20261024000003_seed_data.sql`
3. Under **Storage**, ensure the following buckets are present:
   - `releases` (Private bucket: public downloads are routed securely through `/api/download/[releaseId]`)
   - `media` (Public bucket for cover images, screenshots, and thumbnails)
4. Run the owner provisioning script on your local machine pointing to production credentials:
   ```bash
   pnpm run seed:admin
   ```

---

## 4. Custom Domains & Second Domain Setup

### Primary Domain Configuration:
In your DNS provider (Cloudflare, Namecheap, GoDaddy):
- Add an **A Record**: `@` points to `76.76.21.21` (or your host IP)
- Add a **CNAME Record**: `www` points to `cname.vercel-dns.com`

### Second Domain / Subdomain:
1. **Redirect Mode (Recommended)**: Point your secondary domain (e.g. `sakkeer.ai`) to Vercel and configure a 301 Permanent Redirect to `muhammedsakkeer.com`.
2. **Dual-Serving Mode**: If you want both domains to serve the site directly, add both in Vercel. Canonical URLs in `lib/data/index.ts` automatically declare your primary domain as canonical to prevent SEO duplicate content penalties.

---

## 5. Rollback Procedures

### Rollback Code Deployments
In Vercel or your hosting platform:
1. Navigate to **Deployments**.
2. Select the previously known stable deployment.
3. Click the three dots icon and select **Instant Rollback**.
4. Traffic is redirected immediately to the previous build without rebuilding.

### Rollback Database Schema / Content
1. Supabase automatically takes daily backups under **Database > Backups**.
2. To restore point-in-time state, click **Restore** on the target snapshot in Supabase.
3. For selective rollback of site settings, the `audit_logs` table maintains a complete timestamped history of all changes made through the admin portal.

---

## 6. Backups & Disaster Recovery

### Database Dump:
Run a manual backup of your database using pg_dump:
```bash
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql
```

### Storage Backups:
Use the Supabase CLI to synchronize uploaded binary releases and images:
```bash
supabase storage download releases ./backups/releases
supabase storage download media ./backups/media
```

---

## 7. Security Hardening Checklist

- [x] Zero server secrets exposed in client bundles (verified via Next.js analyzer).
- [x] TypeScript build error bypasses removed (`ignoreBuildErrors: false`).
- [x] Row Level Security (RLS) active on all tables preventing anonymous writes.
- [x] Storage policies block unauthorized bucket uploads.
- [x] Contact endpoint protected with honeypot spam detection and sliding-window rate limiting.
- [x] Downloads tracked with SHA-256 IP hashing and 1-hour duplicate protection.
- [x] Markdown content sanitized with disabled dangerous protocols.
- [x] Admin routes protected with server-side authentication and session validation.
- [x] Responsive layout with accessible zoom enabled (`maximumScale` removed).
