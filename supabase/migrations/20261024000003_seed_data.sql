-- Migration: 20261024000003_seed_data.sql
-- Description: Safe, repeatable initial content seeding preserving existing site data.

-- Seed Site Settings
insert into public.site_settings (
  id,
  brand_name,
  brand_title,
  availability_badge_text,
  availability_badge_active,
  hero_eyebrow,
  hero_title_line1,
  hero_title_accent,
  hero_title_line2,
  hero_title_dot,
  hero_description,
  hero_primary_cta_text,
  hero_primary_cta_target,
  hero_secondary_cta_text,
  hero_secondary_cta_target,
  hero_stats,
  work_section_label,
  work_title,
  work_title_accent,
  work_description,
  insights_section_label,
  insights_title,
  insights_title_accent,
  insights_description,
  media_section_label,
  media_title,
  media_title_accent,
  media_description,
  media_cta_text,
  contact_section_label,
  contact_title,
  contact_title_accent,
  contact_description,
  contact_email,
  footer_note,
  copyright_text,
  social_links,
  seo_title,
  seo_description
) values (
  'default',
  'Muhammed Sakkeer',
  'AI Builder & IT Sales Specialist',
  'Available for select projects',
  true,
  'AI BUILDER / IT SALES SPECIALIST',
  'Building what''s',
  'next.',
  'Selling what',
  'matters.',
  'I design intelligent software and create the strategic conversations that move enterprise teams forward.',
  'Explore software',
  '#work',
  'Let''s build something',
  '#contact',
  '[
    {"value": "24", "suffix": "+", "label": "Apps shipped"},
    {"value": "18", "suffix": "+", "label": "Solutions delivered"},
    {"value": "96", "suffix": "%", "label": "Client satisfaction"}
  ]'::jsonb,
  'THE LAB / SOFTWARE SHOWCASE',
  'Tools for the',
  'uncommonly curious.',
  'Small, sharp products built to solve real problems. Explore the latest releases from my lab.',
  'FIELD NOTES / INSIGHTS',
  'Thinking out',
  'loud.',
  'Perspectives on artificial intelligence, enterprise revenue architecture, and human systems.',
  'BEYOND THE SCREEN / MEDIA',
  'Ideas are better',
  'when shared.',
  'A look inside the process: the demos, decisions, and conversations behind the work.',
  'Watch the latest demo',
  'LET''S MAKE AN IMPACT',
  'Have a hard problem?',
  'Let''s talk.',
  'Whether you''re scaling a sales org or shaping a new product, I''d love to hear where you''re headed.',
  'techsakeer@gmail.com',
  'Designed for the next move.',
  '© 2026 MS / ALL RIGHTS RESERVED',
  '[
    {"platform": "email", "url": "mailto:techsakeer@gmail.com", "enabled": true},
    {"platform": "linkedin", "url": "", "enabled": false},
    {"platform": "github", "url": "", "enabled": false},
    {"platform": "whatsapp", "url": "", "enabled": false},
    {"platform": "facebook", "url": "", "enabled": false},
    {"platform": "instagram", "url": "", "enabled": false},
    {"platform": "youtube", "url": "", "enabled": false},
    {"platform": "snapchat", "url": "", "enabled": false}
  ]'::jsonb,
  'Muhammed Sakkeer — AI Builder & IT Sales Specialist',
  'Building intelligent software and creating the strategic conversations that move enterprise teams forward.'
)
on conflict (id) do nothing;

-- Seed Products
insert into public.products (
  id,
  slug,
  title,
  short_description,
  full_description,
  category,
  accent,
  cover_image_url,
  cover_image_alt,
  tags,
  display_order,
  is_featured,
  supported_platforms,
  system_requirements,
  status,
  portfolio_download_display,
  external_website_url,
  live_demo_url,
  repo_url
) values
(
  'a1000000-0000-0000-0000-000000000001',
  'signaldesk-ai',
  'SignalDesk AI',
  'An intelligent command center for turning messy sales conversations into clear next steps.',
  'SignalDesk AI synthesizes incoming sales conversations, extracts action items, identifies risk points, and drafts high-conviction next steps directly for deal leaders.',
  'AI tools',
  'cyan',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
  'SignalDesk AI interface preview',
  array['Next.js', 'AI SDK', 'Postgres'],
  1,
  true,
  array['Web Browser', 'Cloud API'],
  'Modern browser (Chrome, Edge, Safari, Firefox). Recommended 1080p+ display resolution.',
  'published',
  '2.8k',
  'https://signaldesk.example.com',
  'https://demo.signaldesk.example.com',
  'https://github.com/example/signaldesk-ai'
),
(
  'a1000000-0000-0000-0000-000000000002',
  'fieldflow',
  'FieldFlow',
  'Mobile-first operations software for teams that move between the desk and the field.',
  'Designed for technical teams, surveyors, and field executives who need offline-first synchronization, structured photo documentation, and instant field report generation.',
  'Mobile APK',
  'violet',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=85',
  'FieldFlow mobile interface preview',
  array['React Native', 'Expo', 'Supabase'],
  2,
  true,
  array['Android 9.0+'],
  'Android 9.0 (Pie) or higher. Minimum 2GB RAM. Camera access required for field documentation.',
  'published',
  '1.4k',
  '',
  '',
  'https://github.com/example/fieldflow'
),
(
  'a1000000-0000-0000-0000-000000000003',
  'ledgerlens',
  'LedgerLens',
  'A focused Windows utility that makes complex business reporting feel effortless.',
  'Lightweight desktop companion for financial operators and analysts. Offline-capable local SQLite analysis engine with instant spreadsheet ingestion and clean presentation-ready exports.',
  'Windows EXE',
  'amber',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  'LedgerLens desktop interface preview',
  array['Electron', 'TypeScript', 'SQLite'],
  3,
  true,
  array['Windows 10 / 11 64-bit'],
  'Windows 10 or 11 (64-bit). Minimum 4GB RAM. 350MB available storage.',
  'published',
  '936',
  '',
  '',
  'https://github.com/example/ledgerlens'
)
on conflict (slug) do nothing;

-- Seed Initial Releases
insert into public.releases (
  id,
  product_id,
  version,
  release_notes,
  release_date,
  package_type,
  file_name,
  storage_path,
  file_size_bytes,
  file_size_formatted,
  file_checksum_sha256,
  external_launch_url,
  is_published,
  safety_scan_status,
  safety_scan_provider,
  safety_scan_notes,
  download_count
) values
(
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'v2.4.1',
  'Enhanced revenue signal extraction, multi-tenant workspace isolation, and automated meeting summarizer.',
  '2026-10-15',
  'external_web',
  '',
  '',
  88080384,
  '84 MB',
  '',
  'https://demo.signaldesk.example.com',
  true,
  'unscanned',
  'Cloud Web App (Hosted)',
  'Web application accessible directly via browser. No executable download required.',
  0
),
(
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  'v1.8.0',
  'Added offline vector tile maps, rapid image batch compression, and Bluetooth barcode scanner support.',
  '2026-09-20',
  'apk',
  'FieldFlow-v1.8.0-release.apk',
  '',
  50331648,
  '48 MB',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  '',
  true,
  'unscanned',
  'Self-hosted Author Upload',
  'Standalone Android APK binary package. Uploaded by author.',
  0
),
(
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000003',
  'v3.1.0',
  'Introduced multi-currency pivot tables, zero-latency search across 500k row datasets, and dark mode UI.',
  '2026-08-30',
  'exe',
  'LedgerLens-Setup-3.1.0.exe',
  '',
  117440512,
  '112 MB',
  '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  '',
  true,
  'unscanned',
  'Self-hosted Author Upload',
  'Windows x64 installer executable. Uploaded by author.',
  0
)
on conflict (id) do nothing;

-- Seed Articles (Field Notes / Insights)
insert into public.articles (
  id,
  slug,
  title,
  category,
  excerpt,
  body_markdown,
  cover_image_url,
  reading_time_minutes,
  published_date_formatted,
  published_at,
  is_published,
  display_order
) values
(
  'c1000000-0000-0000-0000-000000000001',
  'the-practical-ai-stack-for-modern-revenue-teams',
  'The practical AI stack for modern revenue teams',
  'AI INNOVATION',
  'How pragmatic revenue leaders are deploying agentic pipelines and small language models to eliminate manual CRM hygiene and accelerate deal velocity.',
  '# The Practical AI Stack for Modern Revenue Teams

When technical founders and revenue executives speak about artificial intelligence in the sales cycle, the discussion too often shifts towards speculative chatbots. 

In enterprise software sales, the highest return on invested engineering time almost always comes from **deterministic extraction** combined with **focused reasoning**:

1. **Ambient Conversation Ingestion**: Automatically pulling transcripts and key moments from buyer touchpoints.
2. **Signal Disambiguation**: Detecting budget, authority, timing, and competitive threats before they stall in the pipeline.
3. **Execution Velocity**: Generating draft responses and internal alignment documents before the call ends.

> "The winning teams of the next cycle will not be the ones with the largest models, but those with the shortest cycle time between buyer intent and seller response."

*Full strategic whitepaper is currently being finalized. For deep-dive discussions on custom enterprise deployment, reach out via the conversation link below.*',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
  6,
  'Oct 14, 2026',
  '2026-10-14 10:00:00+00',
  true,
  1
),
(
  'c1000000-0000-0000-0000-000000000002',
  'how-to-sell-transformation-before-you-sell-software',
  'How to sell transformation before you sell software',
  'SALES STRATEGY',
  'Why enterprise buyers hesitate on tech capabilities until the narrative addresses team risk, political capital, and immediate time-to-value.',
  '# How to Sell Transformation Before You Sell Software

Every enterprise deal is fundamentally a negotiation between two forces: the pain of the current state and the career risk of taking on a failed rollout.

When entering high-stakes enterprise sales conversations:
- **Lead with the human friction**: Identify where frontline teams are losing hours every week.
- **De-risk the initial footprint**: Offer an isolated proof-of-value that demonstrates measurable outcomes within 14 days.
- **Arm your internal champion**: Build the narrative decks and financial calculations they need to defend your solution to their executive committee.

*Full field notes and case studies in development. Check back for future updates.*',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  8,
  'Sep 28, 2026',
  '2026-09-28 10:00:00+00',
  true,
  2
),
(
  'c1000000-0000-0000-0000-000000000003',
  'what-the-next-wave-of-builders-will-automate-first',
  'What the next wave of builders will automate first',
  'TECH NEWS',
  'A breakdown of workflow intersections where deterministic automation meets probabilistic reasoning for high-impact results.',
  '# What the Next Wave of Builders Will Automate First

The boundary between traditional code and probabilistic AI models has fundamentally shifted. Software engineers no longer need to write complex heuristic parsers when structured JSON outputs can be reliably requested from inference endpoints.

Key automation surfaces to watch:
1. Complex document reconciliation (invoices, contracts, regulatory filings).
2. Autonomous code migrations and modernization test generation.
3. Cross-platform workflow orchestration.

*Editorial note: Full article body currently undergoing final technical review.*',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=85',
  5,
  'Sep 09, 2026',
  '2026-09-09 10:00:00+00',
  true,
  3
)
on conflict (slug) do nothing;

-- Seed Media Highlights
insert into public.media_highlights (
  id,
  title,
  description,
  caption,
  thumbnail_url,
  video_type,
  video_url,
  duration_label,
  display_order,
  is_featured
) values (
  'd1000000-0000-0000-0000-000000000001',
  'Building SignalDesk AI',
  'A look inside the process: the demos, decisions, and conversations behind the work.',
  'BUILDING SIGNALDESK AI / 03:42',
  'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=85',
  'youtube',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '03:42',
  1,
  true
)
on conflict (id) do nothing;
