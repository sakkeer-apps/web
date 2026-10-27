-- Migration: 20261027000001_owner_authorization_and_security.sql
-- Description: Harden Row Level Security to require server-controlled app_metadata owner role,
--              protect all admin tables and storage buckets from ordinary authenticated users,
--              and clean up demo defaults.

-- 1. Helper function to check if the caller is the verified owner
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'owner',
    false
  );
$$;

-- 2. Update site_settings RLS: only verified owner can update
drop policy if exists "Owner can update site settings" on public.site_settings;
create policy "Owner can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 3. Update products RLS: only verified owner has full access
drop policy if exists "Owner has full access to products" on public.products;
create policy "Owner has full access to products"
  on public.products for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 4. Update releases RLS: only verified owner has full access
drop policy if exists "Owner has full access to releases" on public.releases;
create policy "Owner has full access to releases"
  on public.releases for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 5. Update download_events RLS: only verified owner can view
drop policy if exists "Owner can view download events" on public.download_events;
create policy "Owner can view download events"
  on public.download_events for select
  to authenticated
  using (public.is_owner());

-- 6. Update articles RLS: only verified owner has full access
drop policy if exists "Owner has full access to articles" on public.articles;
create policy "Owner has full access to articles"
  on public.articles for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 7. Update media_highlights RLS: only verified owner has full access
drop policy if exists "Owner has full access to media highlights" on public.media_highlights;
create policy "Owner has full access to media highlights"
  on public.media_highlights for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 8. Update contact_messages RLS: only verified owner can view, update, delete
drop policy if exists "Owner can view contact messages" on public.contact_messages;
drop policy if exists "Owner can update contact messages" on public.contact_messages;
drop policy if exists "Owner can delete contact messages" on public.contact_messages;

create policy "Owner can view contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_owner());

create policy "Owner can update contact messages"
  on public.contact_messages for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

create policy "Owner can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (public.is_owner());

-- 9. Update media_assets RLS: only verified owner has full access
drop policy if exists "Owner has full access to media assets" on public.media_assets;
create policy "Owner has full access to media assets"
  on public.media_assets for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());

-- 10. Update audit_logs RLS: only verified owner can view or insert
drop policy if exists "Owner can view audit logs" on public.audit_logs;
drop policy if exists "Owner can insert audit logs" on public.audit_logs;

create policy "Owner can view audit logs"
  on public.audit_logs for select
  to authenticated
  using (public.is_owner());

create policy "Owner can insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (public.is_owner());

-- 11. Storage Policies Hardening
-- 'media' bucket: public can read, but only verified owner can insert, update, or delete
drop policy if exists "Owner can upload media" on storage.objects;
drop policy if exists "Owner can update media" on storage.objects;
drop policy if exists "Owner can delete media" on storage.objects;

create policy "Owner can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_owner());

create policy "Owner can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_owner());

create policy "Owner can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_owner());

-- 'releases' bucket: only verified owner can upload, download directly, or manage
drop policy if exists "Owner can manage releases bucket" on storage.objects;

create policy "Owner can manage releases bucket"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'releases' and public.is_owner())
  with check (bucket_id = 'releases' and public.is_owner());

-- 12. Remove unrelated demo video defaults (Rickroll video URL replaced with clean in-production state)
update public.media_highlights
set 
  video_type = 'none',
  video_url = '',
  description = 'A look inside the engineering process: the architecture, technical decisions, and live demos behind the software.',
  updated_at = now()
where id = 'd1000000-0000-0000-0000-000000000001'
  and (video_url like '%dQw4w9WgXcQ%' or video_url like '%rickroll%');
