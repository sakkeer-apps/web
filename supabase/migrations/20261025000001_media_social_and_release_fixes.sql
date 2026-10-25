-- Migration: 20261025000001_media_social_and_release_fixes.sql
-- Description: Expand media highlights with is_published, support YouTube Shorts, Facebook, and Instagram video types, and configure media bucket.

-- 1. Add is_published column to media_highlights if it does not already exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'media_highlights' 
      and column_name = 'is_published'
  ) then
    alter table public.media_highlights add column is_published boolean not null default true;
  end if;
end $$;

-- 2. Update check constraint on video_type to support facebook and instagram
alter table public.media_highlights drop constraint if exists media_highlights_video_type_check;

alter table public.media_highlights
  add constraint media_highlights_video_type_check 
  check (video_type in ('youtube', 'vimeo', 'facebook', 'instagram', 'uploaded', 'none'));

-- 3. Update Row Level Security on media_highlights: public queries only see published items
drop policy if exists "Public can view media highlights" on public.media_highlights;

create policy "Public can view media highlights"
  on public.media_highlights for select
  using (is_published = true);

-- 4. Ensure owner policy remains intact (full access to all statuses)
drop policy if exists "Owner has full access to media highlights" on public.media_highlights;

create policy "Owner has full access to media highlights"
  on public.media_highlights for all
  to authenticated
  using (true)
  with check (true);

-- 5. Update media storage bucket to allow video files up to 50MB and webm/quicktime formats
update storage.buckets
set 
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ]
where id = 'media';
