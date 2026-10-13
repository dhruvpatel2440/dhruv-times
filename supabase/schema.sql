-- =====================================================================
-- The Dhruv Times — Supabase schema, security rules and storage
-- Run ONCE in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- Safe to re-run: every statement is idempotent.
--
-- Security model
--   * Every table has Row Level Security (RLS) ON.
--   * Visitors (anon key) can only READ rows where published = true.
--   * Only users listed in public.admins can read drafts or write anything.
--   * anon has no write privileges at all (revoked), as defence in depth.
--   * Every change is recorded in an append-only audit_log.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- admins ---------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- No policies on purpose: nobody can read or change this table through the API.
-- You add yourself with the SQL at the bottom of this file.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- helpers --------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;

-- URL must be https/http/mailto or a site-relative path (blocks javascript: etc.)
create or replace function public.safe_url(u text)
returns boolean language sql immutable as $$
  select u is null or u = '' or u ~* '^(https?://|mailto:)' or u ~ '^[A-Za-z0-9_./#-][^:]*$';
$$;

-- ---------- content tables ------------------------------------------
create table if not exists public.settings (
  id               int primary key default 1 check (id = 1),
  headline_phrases text[]  not null default '{}',
  deck             text    not null default '' check (char_length(deck) <= 600),
  about            text    not null default '' check (char_length(about) <= 6000),
  ticker           text[]  not null default '{}',
  email            text    not null default '' check (email = '' or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  github_url       text    not null default '' check (public.safe_url(github_url)),
  linkedin_url     text    not null default '' check (public.safe_url(linkedin_url)),
  resume_url       text    not null default '' check (public.safe_url(resume_url)),
  photo_url        text    not null default '' check (public.safe_url(photo_url)),
  cert_folder_url  text    not null default '' check (public.safe_url(cert_folder_url)),
  published        boolean not null default true,
  updated_at       timestamptz not null default now()
);

create table if not exists public.projects (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  exhibit    text not null default '' check (char_length(exhibit) <= 3),
  kicker     text not null default '' check (char_length(kicker) <= 80),
  title      text not null check (char_length(title) between 1 and 120),
  summary    text not null default '' check (char_length(summary) <= 500),
  meta       text not null default '' check (char_length(meta) <= 120),
  deck       text not null default '' check (char_length(deck) <= 800),
  caption    text not null default '' check (char_length(caption) <= 200),
  icon       text not null default 'ic-pc' check (icon in ('ic-pc','ic-lock','ic-flame','ic-binoc','ic-cam','ic-glass','ic-skull','ic-star','ic-mega','ic-q')),
  facts      jsonb not null default '{}'::jsonb check (jsonb_typeof(facts) = 'object'),
  stack      text[] not null default '{}',
  body       text not null default '' check (char_length(body) <= 20000),
  github_url text not null default '' check (public.safe_url(github_url)),
  live_url   text not null default '' check (public.safe_url(live_url)),
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id         uuid primary key default gen_random_uuid(),
  role       text not null check (role in ('lead','sec','intern','award','nss')),
  role_label text not null default '' check (char_length(role_label) <= 60),
  title      text not null check (char_length(title) between 1 and 160),
  issuer     text not null default '' check (char_length(issuer) <= 160),
  date_label text not null default '' check (char_length(date_label) <= 60),
  cert_type  text not null default '' check (char_length(cert_type) <= 60),
  note       text not null default '' check (char_length(note) <= 600),
  image_url  text not null default '' check (public.safe_url(image_url)),
  drive_id   text not null default '' check (drive_id ~ '^[A-Za-z0-9_-]{0,80}$'),
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 160),
  subtitle   text not null default '' check (char_length(subtitle) <= 80),
  provider   text not null default '' check (char_length(provider) <= 120),
  mark       text not null default '' check (char_length(mark) <= 30),
  topics     text[] not null default '{}',
  note       text not null default '' check (char_length(note) <= 600),
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.press_cards (
  id         uuid primary key default gen_random_uuid(),
  kicker     text not null default '' check (char_length(kicker) <= 80),
  title      text not null check (char_length(title) between 1 and 120),
  summary    text not null default '' check (char_length(summary) <= 500),
  meta       text not null default '' check (char_length(meta) <= 120),
  url        text not null default '' check (public.safe_url(url)),
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_groups (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 80),
  tags       text[] not null default '{}',
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline (
  id         uuid primary key default gen_random_uuid(),
  when_label text not null default '' check (char_length(when_label) <= 80),
  title      text not null check (char_length(title) between 1 and 160),
  place      text not null default '' check (char_length(place) <= 160),
  body       text not null default '' check (char_length(body) <= 1000),
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- audit log (append-only) ----------------------------------
create table if not exists public.audit_log (
  id        bigint generated always as identity primary key,
  at        timestamptz not null default now(),
  actor     uuid,
  tbl       text not null,
  op        text not null,
  row_id    text
);
alter table public.audit_log enable row level security;
drop policy if exists "admins read audit" on public.audit_log;
create policy "admins read audit" on public.audit_log for select to authenticated using (public.is_admin());

create or replace function public.audit_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor, tbl, op, row_id)
  values (auth.uid(), tg_table_name, tg_op,
          coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id'));
  return coalesce(new, old);
end; $$;

-- ---------- RLS policies + triggers for every content table ----------
do $$
declare t text;
begin
  foreach t in array array['settings','projects','certificates','courses','press_cards','skill_groups','timeline'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format('create policy "public read published" on public.%I for select to anon, authenticated using (published = true or public.is_admin())', t);

    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())', t);

    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);

    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())', t);

    -- defence in depth: the public key can never write, even if a policy is misconfigured
    execute format('revoke insert, update, delete, truncate on public.%I from anon', t);

    execute format('drop trigger if exists touch on public.%I', t);
    execute format('create trigger touch before update on public.%I for each row execute function public.touch_updated_at()', t);

    execute format('drop trigger if exists audit on public.%I', t);
    execute format('create trigger audit after insert or update or delete on public.%I for each row execute function public.audit_change()', t);
  end loop;
end $$;

revoke insert, update, delete, truncate on public.audit_log, public.admins from anon, authenticated;

-- ---------- storage: one public-read bucket for site media -----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read"  on storage.objects;
drop policy if exists "media admin insert" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media public read"  on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- =====================================================================
-- LAST STEP (run separately, after creating your user in
-- Authentication -> Users -> Add user): make yourself the admin.
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR-EMAIL@example.com';
-- =====================================================================
