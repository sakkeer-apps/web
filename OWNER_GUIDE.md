# Muhammed Sakkeer — Owner & Administrator Guide

Welcome to your production-ready portfolio and software download portal. This guide details how to manage software releases, edit website content, publish media highlights and insights, review buyer inquiries, and manage your custom domain settings.

> **Key Rule**: All content, products, releases, articles, and media highlights are stored persistently in your Supabase database. You can edit, publish, and delete content anytime directly from the Owner Portal **without creating Git commits or redeploying on Vercel**. Code changes and deployment are only needed when modifying application source code.

---

## 1. Accessing the Owner Portal

1. **URL**: Navigate to `https://muhammedsakkeer.com/admin` (or `http://localhost:3000/admin` in local development).
2. **Credentials**:
   - **Email**: `techsakeer@gmail.com`
   - **Password**: Your confidential owner password.
3. **Session Security**:
   - Access is restricted strictly to accounts verified with server-controlled `role: 'owner'` in Supabase `app_metadata`. Unprivileged authenticated users are rejected immediately with HTTP 403 Forbidden.
   - Secure HTTP-only cookies are used with automatic session expiration and refresh.

---

## 2. System Dashboard (`/admin`)

The central control center displays real-time telemetry:
- **Total Applications & Builds**: Number of published software products and versioned application releases.
- **Tracked Downloads**: Genuine binary download requests (deduplicated by client IP and rate-limited to 1 request per hour per release to prevent metric inflation).
- **Published Articles**: Live field notes and technical writeups.
- **Client Inquiries**: Unread incoming messages from the public "Start a conversation" portal.
- **Audit Logs**: Chronological trail of administrative logins, edits, and deletions.

---

## 3. Website Content & Brand CMS (`/admin/content`)

Manage all text, statistics, headlines, and social channels without touching source code:

### Tabs:
1. **Brand & Identity**:
   - **Brand Name**: e.g., `Muhammed Sakkeer`
   - **Professional Title**: e.g., `AI Builder & IT Sales Specialist`
   - **Logo & Favicon URLs**: Enter durable storage URLs.
   - **Availability Badge**: Toggle active state and customize text (e.g., `Available for AI advisory & enterprise deployments`).
2. **Hero Section**:
   - Eyebrow text, title lines, and lime accent text.
   - Dynamic Hero Statistics: Add, edit, or reorder metric counters (e.g., `10+` `Years Experience`, `50k+` `Active Users`).
3. **Section Headlines**:
   - Customize labels, headlines, accent words, and descriptions for **Work / Products**, **Insights**, **Media / Field Demos**, and **Contact**.
4. **Socials & Footer**:
   - Configure official channels: **Email (`mailto:`)**, **LinkedIn**, **GitHub**, **WhatsApp (`wa.me`)**, **Facebook**, **Instagram**, **YouTube**, **Snapchat**, and **X / Twitter**.
   - **Automatic Normalization**: Bare domains (e.g., `linkedin.com/in/...`) are automatically formatted to secure `https://`.
   - **Accurate Brand SVGs**: Each platform renders its official monochrome SVG brand mark in the dark theme.
   - **Open / Test Link**: Click the **Test link** button next to any configured channel to test the link in a new tab before publishing.
   - **Footer Note & Copyright**: Customize copyright notice and footer statement.
5. **SEO & Sharing**:
   - Custom OpenGraph share image URL and canonical domain configuration.

Click **Save & Publish Live** at the top or bottom to persist changes instantly.

---

## 4. Products & Application Downloads (`/admin/products`)

### Adding / Editing a Product:
1. Navigate to **Products** and click **New Product** (`/admin/products/new`).
2. **Category Selection**:
   - `AI tools` / `Windows EXE` / `Mobile APK`: For downloadable binary packages.
   - `Web apps`: For cloud-hosted SaaS tools with a direct launch URL.
3. **Product Fields**:
   - **Title & Slug**: e.g., `SignalDesk AI`, slug `signaldesk-ai`.
   - **Short Description**: Clean summary displayed on the public card.
   - **Full Description**: Multi-paragraph breakdown of architecture, models, and capabilities.
   - **Cover Image & Screenshot Gallery**: Image URLs with accessible alt text.
   - **Supported Platforms & System Requirements**: e.g., `Windows 10/11 (64-bit)`, `16GB RAM`.
   - **External Links**: Live Demo / Web App URL, External Website, and Source Repository.
   - **Portfolio Download Display**: Manual aesthetic label (e.g., `2.8k`, `1.4k`) displayed on the card to preserve your original visual design while real binary download events are separately recorded.
4. **Publication Status**:
   - Set to `Published` to display on the live homepage, or `Draft` to keep private.
   - Click **Save Product**.

### Adding Versioned Release Builds (`/admin/products/[id]/releases`):
1. On any product in the admin list, click **Releases**.
2. Click **New release build**.
3. Fill in:
   - **Version String**: e.g., `v2.5.0`
   - **Package Format**: `EXE`, `APK`, `MSI`, `DMG`, `ZIP`, or `External Web App`.
   - **For Binary Uploads (`EXE`, `APK`, etc.)**:
     - Choose a file (up to 250MB supported).
     - The browser computes the exact file size and **SHA-256 checksum** from the raw bytes.
     - Progress is displayed during upload to the private `releases` Supabase bucket.
     - Release publication is prevented if an upload fails or is incomplete.
   - **For Web Apps**: Enter a validated HTTPS launch URL (`https://app.yourdomain.com`).
   - **Release Notes**: Markdown-supported changelog and highlights.
   - **Publishing Control**: Check "Publish this release build immediately" or leave unchecked as draft.
4. **Honest Safety Disclosure**: Uploaded binaries are honestly labeled as `Self-hosted author upload (Unscanned by 3rd-party vendor)` rather than making false automated malware scan claims.
5. **Draft Protection**: Draft releases and releases belonging to draft products are strictly blocked from public download with HTTP 403 Forbidden.

---

## 5. Media Highlights & Field Demos (`/admin/media-section`)

Showcase your builds, field deployments, and presentations:
1. Go to **Media Highlights** (`/admin/media-section`).
2. Click **Add Video Demo**.
3. **Supported Providers**:
   - **YouTube**: Standard watch URLs (`youtube.com/watch?v=...`), shortened links (`youtu.be/...`), embed URLs, and **YouTube Shorts** (`youtube.com/shorts/...`).
   - **Vimeo**: Standard Vimeo URLs (`vimeo.com/...`).
   - **Facebook Video**: Facebook watch and video URLs with an honest fallback ("Watch on Facebook" button if embedded playback is restricted by the platform).
   - **Instagram Reels & Posts**: Instagram reel and post URLs with native aspect ratio (9:16 vertical) and platform fallback.
   - **Direct Video Upload**: Upload `.mp4`, `.webm`, or `.mov` files up to 50MB directly into the public `media` storage bucket.
4. **Thumbnail & Caption**:
   - Provide a cover image thumbnail or upload an image.
   - Add a caption badge (e.g., `FIELD DEMO / 03:42`).
5. **Featured Item**: Toggle "Set as Featured Showcase Video" to display in the hero media slot. Multiple videos form the matching gallery grid below.
6. **Preview**: Click the preview button to test video playback inside the accessible modal dialog.

---

## 6. Field Notes & Articles (`/admin/insights`)

Publish technical insights, sales playbooks, and architecture breakdowns:
1. Go to **Field Notes** and click **New Article** (`/admin/insights/new`).
2. Enter:
   - **Title & Slug**: e.g., `The Practical AI Stack for Modern Revenue Teams`.
   - **Excerpt**: 2-sentence summary shown on the `/insights` index card.
   - **Cover Image URL**: Banner image.
   - **Estimated Reading Time**: e.g., `6 min read`.
   - **Markdown Content**: Full Markdown editor supporting headings (`##`), lists, bold text, code blocks, and blockquotes.
   - **Live Preview Tab**: Switch between "Editor" and "Live Preview" to inspect formatting in real time before publishing.
   - **SEO Metadata**: Custom SEO title and description for search engines.
3. Toggle status to `Published` or `Draft` and click **Save Article**.

---

## 7. Client Inquiries & Inbox (`/admin/messages`)

Review messages sent through the public "Start a conversation" modal:
1. Go to **Conversations** (`/admin/messages`).
2. Filter by **All**, **Unread**, **Read**, or **Archived**.
3. Click any message row to view full details (Sender Name, Email, Subject, Message body, and Submission Timestamp).
4. **Actions**:
   - **Reply via Email**: Opens your default email client with a pre-filled subject line.
   - **Mark Unread / Archive**: Keep your inbox organized.
   - **Delete**: Permanently removes spam or test entries.
5. **Spam Protection**: The public form includes an invisible honeypot field (`website_hp`) and IP rate limiting. Automated spam submissions are rejected immediately.

---

## 8. Custom Domains & Second Domain (`/admin/settings/domains`)

1. Go to **Domain Settings** (`/admin/settings/domains`).
2. **Primary Domain**: `muhammedsakkeer.com`
3. **Second Domain**: `sakkeer.ai` (configured as an alias or 301 redirect).
4. **Live Verification**: Click **Verify DNS Status** to query live Google DNS over HTTPS and check whether your A and CNAME records are propagating.

---

## 9. മലയാളം ഗൈഡ് (Malayalam Quick-Start Guide)

മുഹമ്മദ് സക്കീർ, നിങ്ങളുടെ അഡ്മിൻ പാനൽ എളുപ്പത്തിൽ ഉപയോഗിക്കുന്നതിനുള്ള ലളിതമായ നിർദ്ദേശങ്ങൾ താഴെ നൽകുന്നു:

### 1. ലോഗിൻ ചെയ്യുക:
- ബ്രൗസറിൽ `https://muhammedsakkeer.com/admin` തുറക്കുക.
- നിങ്ങളുടെ ഇമെയിൽ (`techsakeer@gmail.com`) പാസ്‌വേഡും നൽകി **Sign in to workspace** ക്ലിക്ക് ചെയ്യുക.

### 2. വെബ്സൈറ്റ് വിവരങ്ങളും സോഷ്യൽ ലിങ്കുകളും മാറ്റാൻ:
- മെനുവിൽ നിന്ന് **Website Content** (`/admin/content`) തിരഞ്ഞെടുക്കുക.
- **Brand & Identity**: പേര്, തലക്കെട്ട്, ലോഗോ എന്നിവ മാറ്റാം.
- **Hero Section**: പ്രധാന തലക്കെട്ടുകളും സ്റ്റാറ്റിസ്റ്റിക്സ് നമ്പറുകളും (ഉദാ: `10+ Years`, `50k+ Users`) മാറ്റാം.
- **Socials & Footer**: ലിങ്ക്ഡ്ഇൻ, വാട്ട്സ്ആപ്പ്, യൂട്യൂബ്, ഫേസ്ബുക്ക്, ഇൻസ്റ്റാഗ്രാം ലിങ്കുകൾ നൽകുക. ലിങ്ക് ശരിയാണോ എന്ന് പരിശോധിക്കാൻ **Test link** ക്ലിക്ക് ചെയ്യാം.
- മാറ്റങ്ങൾ വരുത്തിയ ശേഷം മുകളിലോ താഴെയോ ഉള്ള **Save & Publish Live** ബട്ടൺ അമർത്തുക.

### 3. പുതിയ ആപ്ലിക്കേഷനുകൾ ചേർക്കാൻ (Products):
- മെനുവിൽ നിന്ന് **Products** തിരഞ്ഞെടുത്ത് **New Product** ക്ലിക്ക് ചെയ്യുക.
- ടൈറ്റിൽ, വിവരണം (Description), കാറ്റഗറി, സിസ്റ്റം റിക്വയർമെന്റുകൾ എന്നിവ നൽകുക.
- പുതിയ വേർഷനുകൾ അപ്‌ലോഡ് ചെയ്യാൻ പ്രൊഡക്റ്റ് ലിസ്റ്റിലെ **Releases** ക്ലിക്ക് ചെയ്യുക.
- **New release build** അമർത്തി വേർഷൻ നമ്പർ നൽകി APK അല്ലെങ്കിൽ EXE ഫയൽ നേരിട്ട് അപ്‌ലോഡ് ചെയ്യാം. സൈസ്, SHA-256 ചെക്ക്‌സം എന്നിവ സിസ്റ്റം സ്വയം കണക്കാക്കും.

### 4. പുതിയ വീഡിയോ ഡെമോകൾ ചേർക്കാൻ (Media Highlights):
- മെനുവിൽ നിന്ന് **Media Highlights** (`/admin/media-section`) തിരഞ്ഞെടുക്കുക.
- **Add Video Demo** ക്ലിക്ക് ചെയ്യുക.
- YouTube, YouTube Shorts, Vimeo, Instagram Reel, Facebook വീഡിയോ ലിങ്കുകൾ നൽകാം, അല്ലെങ്കിൽ കമ്പ്യൂട്ടറിൽ നിന്ന് നേരിട്ട് MP4 വീഡിയോ അപ്‌ലോഡ് ചെയ്യാം.
- **Save Video Demo** ക്ലിക്ക് ചെയ്താൽ വെബ്സൈറ്റിൽ തത്സമയം കാണാം.

### 5. പുതിയ ആർട്ടിക്കിളുകൾ എഴുതാൻ (Field Notes):
- മെനുവിൽ നിന്ന് **Field Notes** തിരഞ്ഞെടുത്ത് **New Article** ക്ലിക്ക് ചെയ്യുക.
- തലക്കെട്ടും കണ്ടന്റും നൽകുക. ഫോർമാറ്റിംഗ് ശരിയാണോ എന്ന് നോക്കാൻ **Live Preview** ടാബ് ഉപയോഗിക്കാം.
- **Published** ഓപ്ഷൻ സെലക്ട് ചെയ്ത് **Save Article** അമർത്തുക.

### 6. കസ്റ്റമർ മെസ്സേജുകൾ പരിശോധിക്കാൻ (Conversations):
- മെനുവിലെ **Conversations** (`/admin/messages`) തുറക്കുക.
- പുതിയ മെസ്സേജുകൾ ക്ലിക്ക് ചെയ്ത് വായിക്കാം. **Reply via Email** അമർത്തി മറുപടി അയക്കാം.

> **ഓർക്കുക**: വെബ്സൈറ്റിലെ വിവരങ്ങൾ, പ്രൊഡക്റ്റുകൾ, വീഡിയോകൾ, ആർട്ടിക്കിളുകൾ എന്നിവ മാറ്റുമ്പോൾ വീണ്ടും ഗിറ്റ്‌ഹബ്ബിൽ പുഷ് ചെയ്യുകയോ വേർസെലിൽ റീഡിപ്ലോയ് ചെയ്യുകയോ **വേണ്ടതില്ല**. അഡ്മിൻ പാനലിൽ സേവ് ചെയ്യുമ്പോൾ തന്നെ മാറ്റങ്ങൾ ലൈവായി മാറും.
