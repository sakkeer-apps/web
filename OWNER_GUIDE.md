# Muhammed Sakkeer — Owner & Administrator Guide

Welcome to your production-ready portfolio and software download portal. This guide details how to configure your persistent database, log into your admin workspace, manage software releases, update website content, review contact inquiries, and configure custom domains.

---

## 1. Quick Setup & Initial Provisioning

### Step 1: Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials (from your [Supabase Dashboard](https://supabase.com/dashboard) under **Project Settings > API**):
- `NEXT_PUBLIC_SUPABASE_URL`: e.g. `https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your project's anonymous public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your project's secret service_role key (server-only)
- `ADMIN_EMAIL`: Your login email address (e.g. `techsakeer@gmail.com`)

### Step 2: Run Database Migrations
Execute the SQL files located in `supabase/migrations/` in sequence in your Supabase SQL Editor:
1. `supabase/migrations/20261024000001_initial_schema.sql` (Creates tables, triggers, indexes, and download tracking)
2. `supabase/migrations/20261024000002_rls_and_storage.sql` (Enables Row-Level Security and storage bucket permissions)
3. `supabase/migrations/20261024000003_seed_data.sql` (Populates your existing SignalDesk AI, FieldFlow, LedgerLens products and articles)

### Step 3: Provision Your Owner Account
Run the secure provisioning command:
```bash
pnpm run seed:admin
```
Follow the interactive prompt to set your confidential owner password. This creates your account directly inside Supabase Auth with verified email status without public signups.

---

## 2. Accessing the Owner Portal

1. Navigate to: `http://localhost:3000/admin` (or `https://yourdomain.com/admin`)
2. Enter your owner email and password.
3. You will enter the **System Dashboard** showing real-time statistics:
   - Total Published Products & Binary Releases
   - Real Tracked Downloads (with IP deduplication and hourly rate limiting)
   - Published Field Notes & Articles
   - Unread Client Inquiries
   - Audit Trail of recent administrative actions

---

## 3. Product & Software Release Management

### Adding a New Product
1. Go to **Products > New Product** (`/admin/products/new`).
2. Enter:
   - **Title & Slug**: e.g. `SignalDesk AI`, slug `signaldesk-ai`.
   - **Category**: AI tools, Web apps, Mobile APK, or Windows EXE.
   - **Short Description**: Punchy 1-2 sentence overview for the card.
   - **Full Description**: Detailed capabilities and technical notes.
   - **Cover Image & Gallery**: Image URLs with accessible alt text.
   - **System Requirements & Supported OS**: e.g. `Windows 10/11 (64-bit)`, `Android 11+`.
   - **External Links**: Live Demo URL, Repository, or Website.
   - **Accent Style**: Lime accent, emerald, or indigo to match the design.
3. Click **Save Product**.

### Uploading Software Releases (APK, EXE, MSI, ZIP)
1. In the product list, click **Releases & Files** on the desired product.
2. Select your release file (`.apk`, `.exe`, `.msi`, `.zip`, `.tar.gz`, `.dmg`, `.pkg`).
3. The release manager automatically:
   - Calculates the exact file size (in bytes and MB).
   - Generates a cryptographic **SHA-256 Checksum** directly in your browser.
   - Sets the release version (e.g. `1.2.0`).
4. Click **Publish Release**.
5. Public visitors can now download this binary via `/api/download/[releaseId]`.
   - Web applications can instead display an **"Open application"** button directing users to the live web app.

---

## 4. Website Copy & Imagery Control

Navigate to **Site Content** (`/admin/content`) to update any part of the website without editing code:

- **Brand & Header**: Brand name (`Muhammed Sakkeer`), title, logo, favicon, and availability badge text.
- **Hero Section**: Headline lines, green accent words, descriptions, primary and secondary CTA button labels and targets.
- **Hero Statistics**: Manually curated numbers and labels (e.g. `12+` Years enterprise experience, `8` Production AI tools).
- **Section Headlines**: Change titles and descriptions for Work, Field Notes, Media, and Contact.
- **Social Links**: Update or toggle LinkedIn, GitHub, WhatsApp, YouTube, and email links.
- **Footer & SEO**: Copyright, meta title, meta description, and social share image.

Click **Save & Publish** to instantly update the public site with automatic cache revalidation.

---

## 5. Media Library

Navigate to **Media Library** (`/admin/media`):
- Upload cover images, screenshots, and thumbnails.
- Add descriptive alt text for accessibility.
- The system checks if an image is currently referenced by any product, article, or site setting before allowing deletion to prevent broken images.

---

## 6. Field Notes & Insights (Articles)

Navigate to **Field Notes** (`/admin/insights`):
- **Create Articles**: Title, slug, category, excerpt, reading time, and markdown body.
- **Draft / Published Toggle**: Keep works-in-progress private until ready.
- **Public URL**: Automatically accessible at `/insights/[slug]`.
- **Honest States**: Articles with excerpts but without full markdown bodies show an honest in-preparation notice to readers.

---

## 7. Media Showcase (Video Demos)

Navigate to **Media Section** (`/admin/media-section`):
- Configure the featured video demo displayed on the homepage.
- Supports **YouTube** (`https://www.youtube.com/watch?v=...`), **Vimeo**, or direct MP4 files.
- Setting video type to **None** cleanly presents the video card without fake playable controls.
- Clicking the video card on the public website opens an accessible, responsive video modal with Escape-to-close and focus trapping.

---

## 8. Client Conversations & Contact Inbox

Navigate to **Inbox** (`/admin/messages`):
- View messages submitted through the "Start a conversation" public portal.
- Submissions are protected by a hidden honeypot field and IP rate-limiting to prevent spam.
- Mark messages as **Read**, **Unread**, or **Archived**.
- Delete completed inquiries.
- Optionally configure `RESEND_API_KEY` in `.env.local` to receive email notifications when a client reaches out.

---

## 9. Custom Domains & Second Domain Setup

Navigate to **Domains & DNS** (`/admin/settings/domains`):
- **Primary Domain**: e.g. `muhammedsakkeer.com`
- **Secondary Domain**: e.g. `sakkeer.ai` or `app.muhammedsakkeer.com`
- Run the **Live DNS Diagnostic Check** to verify your A and CNAME records against Google DNS before announcing your domain live.
- See the in-app guidance for configuring 301 permanent redirects versus dual-serving.
