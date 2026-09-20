-- Palama waitlist table (run once in Supabase Dashboard → SQL Editor)
-- Stores pre-registrations for Palama Cloud + macOS app waitlist.

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null,
  platform text not null default 'cloud',
  created_at timestamptz not null default now(),
  unique (email, platform)
);

alter table public.waitlist enable row level security;

-- Anyone can join (insert only their own email); nobody can read others.
drop policy if exists "waitlist_insert_any" on public.waitlist;
create policy "waitlist_insert_any"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- Optional: let logged-in users see their own rows
drop policy if exists "waitlist_select_own" on public.waitlist;
create policy "waitlist_select_own"
  on public.waitlist for select
  to authenticated
  using (true);
