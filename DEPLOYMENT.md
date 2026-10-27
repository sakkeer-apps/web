# Production Deployment & Operations Guide

This guide details the complete deployment, configuration, custom domain setup, and disaster recovery procedures for the **Muhammed Sakkeer Portfolio & Software Portal**.

---

## 1. Architecture Overview

- **Frontend & Edge Routing**: Next.js 16 (App Router with Turbopack & Proxy) hosted on **Vercel**.
- **Backend Database & Storage**: **Supabase** Managed PostgreSQL with Row Level Security (RLS) and S3-compatible Object Storage for application releases and media assets.
- **Owner Authentication**: Supabase Auth with server-controlled `role: 'owner'` stored in protected `app_metadata` (read-only to clients).
- **DNS & CDN**: Vercel Global Edge Network with automatic Let's Encrypt SSL/TLS certificates.

---

## 2. GitHub Repository Preparation

1. **Create a Private GitHub Repository**:
   - Go to [GitHub > New Repository](https://github.com/new).
   - Name: `sakeer-web` (or `muhammedsakkeer-portfolio`).
   - Visibility: **Private** (recommended to protect proprietary release management and deployment logic).
   - Do NOT initialize with a README, .gitignore, or license (these already exist in this repository).

2. **Verify `.gitignore` Security**:
   - Ensure credentials and uploads are never committed:
     ```
     .env
     .env*.local
     .env.local
     node_modules
     .next/
     backups/
     *.apk
     *.exe
     *.msi
     *.dmg
     *.zip
     *.tar.gz
     ```

3. **Stage, Commit, and Push**:
   ```bash
   # From your local workspace directory (d:\sakeer web):
   git add .
   git commit -m "Prepare portfolio and software portal for production deployment"
   git remote add origin https://github.com/<your-github-username>/sakeer-web.git
   git branch -M master
   git push -u origin master
   ```

4. **Continuous Integration (CI)**:
   - The included workflow `.github/workflows/ci.yml` will automatically run type checking (`tsc --noEmit`) and production build checks on every push and pull request without exposing any production secrets.

---

## 3. Vercel Deployment Instructions

### Step 1: Import Project
1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New... > Project**.
3. Select your private GitHub repository `sakeer-web` and click **Import**.

### Step 2: Configure Project Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `pnpm build` (or leave default `next build`)
- **Output Directory**: `.next` (default)
- **Install Command**: `pnpm install`

### Step 3: Configure Environment Variables
In the **Environment Variables** section, configure the following keys:

| Variable Name | Environment | Description | Example / Required Value |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Dev | Public URL of your Supabase project | `https://otobzxgbelburcuztagd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Dev | Public browser-safe anonymous API key | `eyJhbGciOiJIUzI1NiIsInR5c...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Dev | **Secret** Server-only Supabase admin key | `eyJhbGciOiJIUzI1NiIsInR5c...` (Keep strictly confidential) |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical public site URL | `https://muhammedsakkeer.com` |
| `OWNER_EMAIL` | Production, Preview, Dev | Verified owner login email address | `techsakeer@gmail.com` |
| `SECONDARY_DOMAIN` | Production | Optional alias or redirect domain | `sakkeer.ai` |
| `RATE_LIMIT_SALT` | Production, Preview, Dev | Random salt string for IP hashing | (Generate any 32+ character random string) |
| `RESEND_API_KEY` | Production | Optional Resend key for contact emails | `re_...` (Optional; inbox saves to DB regardless) |
| `CONTACT_NOTIFICATION_EMAIL`| Production | Destination email for contact alerts | `techsakeer@gmail.com` |

> **Security Note**: Never add `OWNER_INITIAL_PASSWORD` to Vercel production environment variables. Your owner account is already provisioned and securely stored directly inside Supabase Auth.

### Step 4: Deploy and Verify
1. Click **Deploy**.
2. Once the build finishes, Vercel will provide an active `https://<project-name>.vercel.app` preview URL.
3. Test logging into the owner portal (`/admin`) and verify product and media display.

---

## 4. Supabase Auth & Redirect URLs Configuration

To ensure password reset links and authentication callbacks function properly in production:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **Authentication > URL Configuration**.
3. **Site URL**:
   - Set to: `https://muhammedsakkeer.com`
4. **Redirect URLs**:
   Add the following exact URLs to the allowed list:
   - `https://muhammedsakkeer.com/api/auth/callback`
   - `https://muhammedsakkeer.com/admin/reset-password/confirm`
   - `https://*.vercel.app/api/auth/callback` (for Vercel deployment previews)
   - `http://localhost:3000/api/auth/callback` (for local development)
   - `http://localhost:3000/admin/reset-password/confirm`
5. Click **Save**.

---

## 5. Safe Database Migrations

### Execution Status:
- Migrations 1 through 3 (`20261024000001_initial_schema.sql`, `20261024000002_rls_and_storage.sql`, `20261024000003_seed_data.sql`) and Migration `20261025000001_media_social_and_release_fixes.sql` are **already executed** on your live database.
- **New Incremental Migration**:
  `supabase/migrations/20261027000001_owner_authorization_and_security.sql`
  - Purpose: Enforces server-controlled owner authorization (`is_owner()`) across all tables and storage buckets, replacing open `authenticated` access so ordinary users cannot modify site data.
  - How to apply:
    1. Open Supabase **SQL Editor**.
    2. Open file `supabase/migrations/20261027000001_owner_authorization_and_security.sql`.
    3. Copy and run the SQL content. It executes idempotently without dropping tables or overwriting owner content.

---

## 6. Custom Domain & DNS Setup

### Primary Canonical Domain: `muhammedsakkeer.com`
1. In your **Vercel Project Dashboard**, navigate to **Settings > Domains**.
2. Enter `muhammedsakkeer.com` and click **Add**.
3. Configure the following DNS records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

| Type | Name / Host | Value / Target | TTL | Purpose |
|---|---|---|---|---|
| **A** | `@` (apex) | `76.76.21.21` | 3600 (Automatic) | Directs apex domain to Vercel edge |
| **CNAME** | `www` | `cname.vercel-dns.com` | 3600 (Automatic) | Directs www subdomain to Vercel edge |

4. In Vercel, select **Redirect `www.muhammedsakkeer.com` to `muhammedsakkeer.com`** (Status 308 permanent redirect) to establish canonical SEO authority.

### Second Domain: `sakkeer.ai`
1. In Vercel **Settings > Domains**, add `sakkeer.ai`.
2. Configure DNS records at your registrar:
   - **A Record**: `@` -> `76.76.21.21`
   - **CNAME Record**: `www` -> `cname.vercel-dns.com`
3. Configure the domain in Vercel to **Redirect to `muhammedsakkeer.com`** (or serve as an alias).
4. Our Next.js proxy (`proxy.ts`) automatically validates incoming hosts and ensures canonical headers and redirects are preserved.

> **Important**: Do NOT delete existing MX, SPF, or DKIM records at your domain registrar. DNS A and CNAME records only route web traffic (HTTP/HTTPS) and will not interfere with your email delivery.

---

## 7. Preview Data Isolation

By default, Vercel assigns environment variables to **Production**, **Preview**, and **Development**.
- If Preview deployments use the same `NEXT_PUBLIC_SUPABASE_URL` and service role key as Production, changes made during PR testing will modify production data.
- **Recommended Strategy**:
  1. In Supabase, enable **Supabase Branching** (or create a secondary free Supabase staging project for previews).
  2. In Vercel **Settings > Environment Variables**, assign the staging project URL and keys specifically to the **Preview** environment scope.
  3. This guarantees that test pull requests or preview builds cannot alter live production content, products, or client messages.

---

## 8. Backups & Rollback Procedures

### Local Database & Storage Snapshot:
Run the automated snapshot script at any time before major changes:
```bash
node scripts/create-backup.mjs
```
This exports a complete, timestamped JSON snapshot of all tables (`site_settings`, `products`, `releases`, `articles`, `media_highlights`, `contact_messages`, `audit_logs`) and storage metadata into the local `backups/` directory (git-ignored for security).

### Instant Rollback on Vercel:
If an issue occurs after a deployment:
1. Open your Vercel Dashboard.
2. Go to the **Deployments** tab.
3. Locate the previous healthy deployment.
4. Click the three dots (`...`) and select **Instant Rollback**.
5. Traffic will be routed back to the previous build in under 5 seconds with zero downtime.
