-- Migration: 20261024000001_initial_schema.sql
-- Description: Core schema for portfolio, software releases, CMS, contact inbox, and audit logs.

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Site Settings
create table if not exists public.site_settings (
  id text primary key default 'default',
  brand_name text not null default 'Muhammed Sakkeer',
  brand_title text not null default 'AI Builder & IT Sales Specialist',
  logo_url text,
  favicon_url text,
  availability_badge_text text not null default 'Available for select projects',
  availability_badge_active boolean not null default true,
  hero_eyebrow text not null default 'AI BUILDER / IT SALES SPECIALIST',
  hero_title_line1 text not null default 'Building what''s',
  hero_title_accent text not null default 'next.',
  hero_title_line2 text not null default 'Selling what',
  hero_title_dot text not null default 'matters.',
  hero_description text not null default 'I design intelligent software and create the strategic conversations that move enterprise teams forward.',
  hero_primary_cta_text text not null default 'Explore software',
  hero_primary_cta_target text not null default '#work',
  hero_secondary_cta_text text not null default 'Let''s build something',
  hero_secondary_cta_target text not null default '#contact',
  hero_stats jsonb not null default '[
    {"value": "24", "suffix": "+", "label": "Apps shipped"},
    {"value": "18", "suffix": "+", "label": "Solutions delivered"},
    {"value": "96", "suffix": "%", "label": "Client satisfaction"}
  ]'::jsonb,
  work_section_label text not null default 'THE LAB / SOFTWARE SHOWCASE',
  work_title text not null default 'Tools for the',
  work_title_accent text not null default 'uncommonly curious.',
  work_description text not null default 'Small, sharp products built to solve real problems. Explore the latest releases from my lab.',
  insights_section_label text not null default 'FIELD NOTES / INSIGHTS',
  insights_title text not null default 'Thinking out',
  insights_title_accent text not null default 'loud.',
  insights_description text not null default 'Perspectives on artificial intelligence, enterprise revenue architecture, and human systems.',
  media_section_label text not null default 'BEYOND THE SCREEN / MEDIA',
  media_title text not null default 'Ideas are better',
  media_title_accent text not null default 'when shared.',
  media_description text not null default 'A look inside the process: the demos, decisions, and conversations behind the work.',
  media_cta_text text not null default 'Watch the latest demo',
  contact_section_label text not null default 'LET''S MAKE AN IMPACT',
  contact_title text not null default 'Have a hard problem?',
  contact_title_accent text not null default 'Let''s talk.',
  contact_description text not null default 'Whether you''re scaling a sales org or shaping a new product, I''d love to hear where you''re headed.',
  contact_email text not null default 'techsakeer@gmail.com',
  footer_note text not null default 'Designed for the next move.',
  copyright_text text not null default '© 2026 MS / ALL RIGHTS RESERVED',
  social_links jsonb not null default '[
    {"platform": "email", "url": "mailto:techsakeer@gmail.com", "enabled": true},
    {"platform": "linkedin", "url": "", "enabled": false},
    {"platform": "github", "url": "", "enabled": false},
    {"platform": "whatsapp", "url": "", "enabled": false},
    {"platform": "facebook", "url": "", "enabled": false},
    {"platform": "instagram", "url": "", "enabled": false},
    {"platform": "youtube", "url": "", "enabled": false},
    {"platform": "snapchat", "url": "", "enabled": false}
  ]'::jsonb,
  seo_title text not null default 'Muhammed Sakkeer — AI Builder & IT Sales Specialist',
  seo_description text not null default 'Building intelligent software and creating the strategic conversations that move enterprise teams forward.',
  seo_og_image text,
  primary_domain text not null default 'muhammedsakkeer.com',
  secondary_domains jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  short_description text not null,
  full_description text default '',
  category text not null check (category in ('AI tools', 'Web apps', 'Mobile APK', 'Windows EXE')),
  accent text not null default 'cyan' check (accent in ('cyan', 'violet', 'amber', 'emerald', 'blue', 'rose')),
  cover_image_url text not null,
  cover_image_alt text default '',
  gallery jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  display_order integer not null default 0,
  is_featured boolean not null default false,
  supported_platforms text[] not null default '{}',
  system_requirements text default '',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  portfolio_download_display text default '',
  external_website_url text default '',
  live_demo_url text default '',
  repo_url text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Releases
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  version text not null,
  release_notes text default '',
  release_date date not null default current_date,
  package_type text not null check (package_type in ('apk', 'exe', 'msi', 'zip', 'external_web')),
  file_name text default '',
  storage_path text default '',
  file_size_bytes bigint not null default 0,
  file_size_formatted text default '',
  file_checksum_sha256 text default '',
  external_launch_url text default '',
  is_published boolean not null default true,
  safety_scan_status text not null default 'unscanned' check (safety_scan_status in ('unscanned', 'pending', 'clean', 'flagged')),
  safety_scan_provider text default 'Self-hosted (unscanned by 3rd-party vendor)',
  safety_scan_notes text default 'Binary uploaded directly by software author.',
  download_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Download Events (Honest tracking with IP deduplication)
create table if not exists public.download_events (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  ip_hash text not null,
  user_agent text default '',
  downloaded_at timestamptz not null default now()
);

-- Create index on download events for rate-limiting and deduplication queries
create index if not exists idx_download_events_dedup on public.download_events(release_id, ip_hash, downloaded_at desc);

-- 5. Articles (Field Notes / Insights)
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  excerpt text not null,
  body_markdown text default '',
  cover_image_url text default '',
  reading_time_minutes integer not null default 5,
  published_date_formatted text not null default '',
  published_at timestamptz not null default now(),
  is_published boolean not null default true,
  seo_title text default '',
  seo_description text default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Media Highlights (Beyond the screen)
create table if not exists public.media_highlights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  caption text default '',
  thumbnail_url text not null,
  video_type text not null default 'youtube' check (video_type in ('youtube', 'vimeo', 'uploaded', 'none')),
  video_url text default '',
  duration_label text default '',
  display_order integer not null default 0,
  is_featured boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Contact Messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text default '',
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  ip_hash text default '',
  spam_score numeric not null default 0,
  created_at timestamptz not null default now()
);

-- 8. Media Assets (Media Library)
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text default '',
  file_size_bytes bigint not null default 0,
  alt_text text default '',
  created_at timestamptz not null default now()
);

-- 9. Audit Logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
