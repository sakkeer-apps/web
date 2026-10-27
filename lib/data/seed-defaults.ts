// lib/data/seed-defaults.ts - Baseline content matching original v0 portfolio

import { SiteSettings, Product, Release, Article, MediaHighlight } from '@/types'

export const defaultSiteSettings: SiteSettings = {
  id: 'default',
  brand_name: 'Muhammed Sakkeer',
  brand_title: 'AI Builder & IT Sales Specialist',
  logo_url: null,
  favicon_url: null,
  availability_badge_text: 'Available for select projects',
  availability_badge_active: true,
  hero_eyebrow: 'AI BUILDER / IT SALES SPECIALIST',
  hero_title_line1: "Building what's",
  hero_title_accent: 'next.',
  hero_title_line2: 'Selling what',
  hero_title_dot: 'matters.',
  hero_description: 'I design intelligent software and create the strategic conversations that move enterprise teams forward.',
  hero_primary_cta_text: 'Explore software',
  hero_primary_cta_target: '#work',
  hero_secondary_cta_text: "Let's build something",
  hero_secondary_cta_target: '#contact',
  hero_stats: [
    { value: '24', suffix: '+', label: 'Apps shipped' },
    { value: '18', suffix: '+', label: 'Solutions delivered' },
    { value: '96', suffix: '%', label: 'Client satisfaction' },
  ],
  work_section_label: 'THE LAB / SOFTWARE SHOWCASE',
  work_title: 'Tools for the',
  work_title_accent: 'uncommonly curious.',
  work_description: 'Small, sharp products built to solve real problems. Explore the latest releases from my lab.',
  insights_section_label: 'FIELD NOTES / INSIGHTS',
  insights_title: 'Thinking out',
  insights_title_accent: 'loud.',
  insights_description: 'Perspectives on artificial intelligence, enterprise revenue architecture, and human systems.',
  media_section_label: 'BEYOND THE SCREEN / MEDIA',
  media_title: 'Ideas are better',
  media_title_accent: 'when shared.',
  media_description: 'A look inside the process: the demos, decisions, and conversations behind the work.',
  media_cta_text: 'Watch the latest demo',
  contact_section_label: "LET'S MAKE AN IMPACT",
  contact_title: 'Have a hard problem?',
  contact_title_accent: "Let's talk.",
  contact_description: "Whether you're scaling a sales org or shaping a new product, I'd love to hear where you're headed.",
  contact_email: 'techsakeer@gmail.com',
  footer_note: 'Designed for the next move.',
  copyright_text: '© 2026 MS / ALL RIGHTS RESERVED',
  social_links: [
    { platform: 'email', url: 'mailto:techsakeer@gmail.com', enabled: true },
    { platform: 'linkedin', url: 'https://linkedin.com/in/sakkeer', enabled: true },
    { platform: 'github', url: 'https://github.com/sakkeer', enabled: true },
    { platform: 'whatsapp', url: 'https://wa.me/971500000000', enabled: true },
    { platform: 'facebook', url: '', enabled: false },
    { platform: 'instagram', url: '', enabled: false },
    { platform: 'youtube', url: '', enabled: false },
    { platform: 'snapchat', url: '', enabled: false },
    { platform: 'twitter', url: '', enabled: false },
  ],
  seo_title: 'Muhammed Sakkeer — AI Builder & IT Sales Specialist',
  seo_description: 'Building intelligent software and creating the strategic conversations that move enterprise teams forward.',
  seo_og_image: null,
  primary_domain: 'muhammedsakkeer.com',
  secondary_domains: [],
}

export const defaultReleases: Release[] = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    product_id: 'a1000000-0000-0000-0000-000000000001',
    version: 'v2.4.1',
    release_notes: 'Enhanced revenue signal extraction, multi-tenant workspace isolation, and automated meeting summarizer.',
    release_date: '2026-10-15',
    package_type: 'external_web',
    file_name: '',
    storage_path: '',
    file_size_bytes: 88080384,
    file_size_formatted: '84 MB',
    file_checksum_sha256: '',
    external_launch_url: 'https://demo.signaldesk.example.com',
    is_published: true,
    safety_scan_status: 'unscanned',
    safety_scan_provider: 'Cloud Web App (Hosted)',
    safety_scan_notes: 'Web application accessible directly via browser. No executable download required.',
    download_count: 0,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    product_id: 'a1000000-0000-0000-0000-000000000002',
    version: 'v1.8.0',
    release_notes: 'Added offline vector tile maps, rapid image batch compression, and Bluetooth barcode scanner support.',
    release_date: '2026-09-20',
    package_type: 'apk',
    file_name: 'FieldFlow-v1.8.0-release.apk',
    storage_path: '',
    file_size_bytes: 50331648,
    file_size_formatted: '48 MB',
    file_checksum_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    external_launch_url: '',
    is_published: true,
    safety_scan_status: 'unscanned',
    safety_scan_provider: 'Self-hosted Author Upload',
    safety_scan_notes: 'Standalone Android APK binary package. Uploaded by author.',
    download_count: 0,
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    product_id: 'a1000000-0000-0000-0000-000000000003',
    version: 'v3.1.0',
    release_notes: 'Introduced multi-currency pivot tables, zero-latency search across 500k row datasets, and dark mode UI.',
    release_date: '2026-08-30',
    package_type: 'exe',
    file_name: 'LedgerLens-Setup-3.1.0.exe',
    storage_path: '',
    file_size_bytes: 117440512,
    file_size_formatted: '112 MB',
    file_checksum_sha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    external_launch_url: '',
    is_published: true,
    safety_scan_status: 'unscanned',
    safety_scan_provider: 'Self-hosted Author Upload',
    safety_scan_notes: 'Windows x64 installer executable. Uploaded by author.',
    download_count: 0,
  },
]

export const defaultProducts: Product[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    slug: 'signaldesk-ai',
    title: 'SignalDesk AI',
    short_description: 'An intelligent command center for turning messy sales conversations into clear next steps.',
    full_description: 'SignalDesk AI synthesizes incoming sales conversations, extracts action items, identifies risk points, and drafts high-conviction next steps directly for deal leaders.',
    category: 'AI tools',
    accent: 'cyan',
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    cover_image_alt: 'SignalDesk AI interface preview',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85', alt: 'Analytics and revenue overview' },
    ],
    tags: ['Next.js', 'AI SDK', 'Postgres'],
    display_order: 1,
    is_featured: true,
    supported_platforms: ['Web Browser', 'Cloud API'],
    system_requirements: 'Modern browser (Chrome, Edge, Safari, Firefox). Recommended 1080p+ display resolution.',
    status: 'published',
    portfolio_download_display: '2.8k',
    external_website_url: 'https://signaldesk.example.com',
    live_demo_url: 'https://demo.signaldesk.example.com',
    repo_url: 'https://github.com/example/signaldesk-ai',
    source_type: 'webapp',
    features: [
      'Automated revenue risk extraction from client calls',
      'Instant action item synthesis for deal leaders',
      'Multi-tenant workspace isolation with role controls'
    ],
    current_release: defaultReleases[0],
    releases: [defaultReleases[0]],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    slug: 'fieldflow',
    title: 'FieldFlow',
    short_description: 'Mobile-first operations software for teams that move between the desk and the field.',
    full_description: 'Designed for technical teams, surveyors, and field executives who need offline-first synchronization, structured photo documentation, and instant field report generation.',
    category: 'Mobile APK',
    accent: 'violet',
    cover_image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=85',
    cover_image_alt: 'FieldFlow mobile interface preview',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=85', alt: 'Mobile app screen' },
    ],
    tags: ['React Native', 'Expo', 'Supabase'],
    display_order: 2,
    is_featured: true,
    supported_platforms: ['Android 9.0+'],
    system_requirements: 'Android 9.0 (Pie) or higher. Minimum 2GB RAM. Camera access required for field documentation.',
    status: 'published',
    portfolio_download_display: '1.4k',
    external_website_url: '',
    live_demo_url: '',
    repo_url: 'https://github.com/example/fieldflow',
    source_type: 'upload',
    features: [
      'Offline-first synchronization with conflict resolution',
      'Structured geotagged photo documentation',
      'Instant PDF field report generation and sharing'
    ],
    current_release: defaultReleases[1],
    releases: [defaultReleases[1]],
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    slug: 'ledgerlens',
    title: 'LedgerLens',
    short_description: 'A focused Windows utility that makes complex business reporting feel effortless.',
    full_description: 'Lightweight desktop companion for financial operators and analysts. Offline-capable local SQLite analysis engine with instant spreadsheet ingestion and clean presentation-ready exports.',
    category: 'Windows EXE',
    accent: 'amber',
    cover_image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
    cover_image_alt: 'LedgerLens desktop interface preview',
    gallery: [
      { url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85', alt: 'Desktop reporting app' },
    ],
    tags: ['Electron', 'TypeScript', 'SQLite'],
    display_order: 3,
    is_featured: true,
    supported_platforms: ['Windows 10 / 11 64-bit'],
    system_requirements: 'Windows 10 or 11 (64-bit). Minimum 4GB RAM. 350MB available storage.',
    status: 'published',
    portfolio_download_display: '936',
    external_website_url: '',
    live_demo_url: '',
    repo_url: 'https://github.com/example/ledgerlens',
    source_type: 'upload',
    features: [
      'Local SQLite analysis engine with zero network latency',
      'Instant spreadsheet ingestion up to 500k rows',
      'One-click presentation-ready PDF & CSV financial exports'
    ],
    current_release: defaultReleases[2],
    releases: [defaultReleases[2]],
  },
]

export const defaultArticles: Article[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    slug: 'the-practical-ai-stack-for-modern-revenue-teams',
    title: 'The practical AI stack for modern revenue teams',
    category: 'AI INNOVATION',
    excerpt: 'How pragmatic revenue leaders are deploying agentic pipelines and small language models to eliminate manual CRM hygiene and accelerate deal velocity.',
    body_markdown: `# The Practical AI Stack for Modern Revenue Teams

When technical founders and revenue executives speak about artificial intelligence in the sales cycle, the discussion too often shifts towards speculative chatbots. 

In enterprise software sales, the highest return on invested engineering time almost always comes from **deterministic extraction** combined with **focused reasoning**:

1. **Ambient Conversation Ingestion**: Automatically pulling transcripts and key moments from buyer touchpoints.
2. **Signal Disambiguation**: Detecting budget, authority, timing, and competitive threats before they stall in the pipeline.
3. **Execution Velocity**: Generating draft responses and internal alignment documents before the call ends.

> "The winning teams of the next cycle will not be the ones with the largest models, but those with the shortest cycle time between buyer intent and seller response."

### Where Teams Fail

The biggest mistake is building a monolithic "AI sales assistant" that attempts to hold freeform discussions with potential buyers. High-performing revenue teams instead apply AI as invisible glue across existing enterprise infrastructure:

- Auto-updating deal qualification criteria from call notes.
- Generating tailored executive summaries for economic buyers.
- Flagging discrepancies between contract promises and product roadmap milestones.

*For deep-dive discussions on custom enterprise deployment, reach out via the conversation link below.*`,
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
    reading_time_minutes: 6,
    published_date_formatted: 'Oct 14, 2026',
    published_at: '2026-10-14T10:00:00Z',
    is_published: true,
    display_order: 1,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    slug: 'how-to-sell-transformation-before-you-sell-software',
    title: 'How to sell transformation before you sell software',
    category: 'SALES STRATEGY',
    excerpt: 'Why enterprise buyers hesitate on tech capabilities until the narrative addresses team risk, political capital, and immediate time-to-value.',
    body_markdown: `# How to Sell Transformation Before You Sell Software

Every enterprise deal is fundamentally a negotiation between two forces: the pain of the current state and the career risk of taking on a failed rollout.

When entering high-stakes enterprise sales conversations:
- **Lead with the human friction**: Identify where frontline teams are losing hours every week.
- **De-risk the initial footprint**: Offer an isolated proof-of-value that demonstrates measurable outcomes within 14 days.
- **Arm your internal champion**: Build the narrative decks and financial calculations they need to defend your solution to their executive committee.

### The Power of Political Safety

Technical specifications rarely close enterprise agreements on their own. What closes an agreement is the buyer's confidence that their reputation will be enhanced, not compromised, by partnering with you.

*Full field notes and case studies in development. Check back for future updates.*`,
    cover_image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
    reading_time_minutes: 8,
    published_date_formatted: 'Sep 28, 2026',
    published_at: '2026-09-28T10:00:00Z',
    is_published: true,
    display_order: 2,
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    slug: 'what-the-next-wave-of-builders-will-automate-first',
    title: 'What the next wave of builders will automate first',
    category: 'TECH NEWS',
    excerpt: 'A breakdown of workflow intersections where deterministic automation meets probabilistic reasoning for high-impact results.',
    body_markdown: `# What the Next Wave of Builders Will Automate First

The boundary between traditional code and probabilistic AI models has fundamentally shifted. Software engineers no longer need to write complex heuristic parsers when structured JSON outputs can be reliably requested from inference endpoints.

Key automation surfaces to watch:
1. **Complex Document Reconciliation**: Real-time cross-referencing between invoices, vendor contracts, and regulatory filings.
2. **Autonomous Code Migrations**: Automated refactoring with comprehensive test generation and semantic verification.
3. **Cross-Platform Workflow Orchestration**: Bridging legacy desktop utilities and cloud microservices without invasive API re-writes.

*Editorial note: Full article body currently undergoing final technical review.*`,
    cover_image_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=85',
    reading_time_minutes: 5,
    published_date_formatted: 'Sep 09, 2026',
    published_at: '2026-09-09T10:00:00Z',
    is_published: true,
    display_order: 3,
  },
]

export const defaultMediaHighlights: MediaHighlight[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    title: 'Building SignalDesk AI',
    description: 'A look inside the process: the demos, architectural decisions, and conversations behind the software.',
    caption: 'BUILDING SIGNALDESK AI / 03:42',
    thumbnail_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=85',
    video_type: 'none',
    video_url: '',
    duration_label: '03:42',
    display_order: 1,
    is_featured: true,
    is_published: true,
  },
]

