-- Migration: 20261027000002_product_sources_and_github.sql
-- Description: Expand products table with features list, github_data JSONB, and source_type

-- 1. Add features list column if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'products' 
      and column_name = 'features'
  ) then
    alter table public.products add column features text[] not null default '{}';
  end if;
end $$;

-- 2. Add github_data jsonb column if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'products' 
      and column_name = 'github_data'
  ) then
    alter table public.products add column github_data jsonb default '{}'::jsonb;
  end if;
end $$;

-- 3. Add source_type column if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
      and table_name = 'products' 
      and column_name = 'source_type'
  ) then
    alter table public.products add column source_type text default 'upload';
  end if;
end $$;

-- 4. Ensure source_type check constraint exists
alter table public.products drop constraint if exists products_source_type_check;

alter table public.products
  add constraint products_source_type_check 
  check (source_type in ('upload', 'webapp', 'github'));
