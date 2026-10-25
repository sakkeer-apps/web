-- Migration: 20261024000002_rls_and_storage.sql
-- Description: Row Level Security policies and Supabase Storage bucket configurations.

-- Enable Row Level Security on all application tables
alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.releases enable row level security;
alter table public.download_events enable row level security;
alter table public.articles enable row level security;
alter table public.media_highlights enable row level security;
alter table public.contact_messages enable row level security;
alter table public.media_assets enable row level security;
alter table public.audit_logs enable row level security;

-- 1. Site Settings Policies
-- Anyone can view site settings
create policy "Public can view site settings"
  on public.site_settings for select
  using (true);

-- Only authenticated owner can update site settings
create policy "Owner can update site settings"
  on public.site_settings for update
  to authenticated
  using (true)
  with check (true);

-- 2. Products Policies
-- Public can view published products
create policy "Public can view published products"
  on public.products for select
  using (status = 'published');

-- Authenticated owner has full access to products (all statuses)
create policy "Owner has full access to products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

-- 3. Releases Policies
-- Public can view published releases
create policy "Public can view published releases"
  on public.releases for select
  using (is_published = true);

-- Authenticated owner has full access to releases
create policy "Owner has full access to releases"
  on public.releases for all
  to authenticated
  using (true)
  with check (true);

-- 4. Download Events Policies
-- Public can insert download events (via server route or anon client with rate check)
create policy "Allow insert download events"
  on public.download_events for insert
  with check (true);

-- Only authenticated owner can view download events
create policy "Owner can view download events"
  on public.download_events for select
  to authenticated
  using (true);

-- 5. Articles Policies
-- Public can view published articles
create policy "Public can view published articles"
  on public.articles for select
  using (is_published = true);

-- Authenticated owner has full access to articles
create policy "Owner has full access to articles"
  on public.articles for all
  to authenticated
  using (true)
  with check (true);

-- 6. Media Highlights Policies
-- Public can view media highlights
create policy "Public can view media highlights"
  on public.media_highlights for select
  using (true);

-- Authenticated owner has full access to media highlights
create policy "Owner has full access to media highlights"
  on public.media_highlights for all
  to authenticated
  using (true)
  with check (true);

-- 7. Contact Messages Policies
-- Public can submit contact messages
create policy "Public can submit contact messages"
  on public.contact_messages for insert
  with check (true);

-- Only authenticated owner can view, update, and delete contact messages
create policy "Owner can view contact messages"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "Owner can update contact messages"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

create policy "Owner can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (true);

-- 8. Media Assets Policies
-- Public can view media asset metadata
create policy "Public can view media assets"
  on public.media_assets for select
  using (true);

-- Authenticated owner has full access to media assets
create policy "Owner has full access to media assets"
  on public.media_assets for all
  to authenticated
  using (true)
  with check (true);

-- 9. Audit Logs Policies
-- Only authenticated owner can view and insert audit logs
create policy "Owner can view audit logs"
  on public.audit_logs for select
  to authenticated
  using (true);

create policy "Owner can insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (true);

-- Storage Buckets Configuration (Executed if storage schema exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('media', 'media', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'video/mp4']),
  ('releases', 'releases', false, 524288000, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

-- Storage Policies for 'media' bucket
-- Public read access for media
create policy "Public read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

-- Authenticated insert/update/delete for media bucket
create policy "Owner can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "Owner can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

create policy "Owner can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

-- Storage Policies for 'releases' bucket
-- Authenticated upload and management
create policy "Owner can manage releases bucket"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'releases')
  with check (bucket_id = 'releases');
