-- Palama developer API console (run once in Supabase Dashboard → SQL Editor)
-- API keys (hashed) + per-call usage log.

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Default key',
  key_hash text not null unique,
  prefix text not null default '',
  last_used_at timestamptz,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_api_keys_user on public.api_keys (user_id);
create index if not exists idx_api_keys_hash on public.api_keys (key_hash);

alter table public.api_keys enable row level security;

drop policy if exists "api_keys_select_own" on public.api_keys;
create policy "api_keys_select_own"
  on public.api_keys for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "api_keys_insert_own" on public.api_keys;
create policy "api_keys_insert_own"
  on public.api_keys for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "api_keys_update_own" on public.api_keys;
create policy "api_keys_update_own"
  on public.api_keys for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.api_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null default '',
  model text not null default '',
  created_at timestamptz not null default now()
);
-- If the table already exists from an earlier version, add the column:
alter table public.api_usage add column if not exists model text not null default '';
create index if not exists idx_api_usage_user_time on public.api_usage (user_id, created_at desc);

-- Owner ids are platform strings (uuid, "sb:<uuid>", or local hashes),
-- so user_id is TEXT (a uuid column would reject every write).
-- Bulletproof migration from ANY previous state:
DO $$
DECLARE
  cname text;
BEGIN
  -- Drop every foreign key touching api_usage.user_id, whatever its name
  FOR cname IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY (con.conkey)
    WHERE con.conrelid = 'public.api_usage'::regclass
      AND con.contype = 'f'
      AND att.attname = 'user_id'
  LOOP
    EXECUTE format('ALTER TABLE public.api_usage DROP CONSTRAINT IF EXISTS %I', cname);
  END LOOP;
  -- Convert the column (no-op if already text)
  BEGIN
    ALTER TABLE public.api_usage ALTER COLUMN user_id TYPE text USING user_id::text;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'user_id type migration skipped: %', SQLERRM;
  END;
END
$$;

alter table public.api_usage enable row level security;

drop policy if exists "api_usage_select_own" on public.api_usage;
create policy "api_usage_select_own"
  on public.api_usage for select
  to authenticated
  using (auth.uid()::text = user_id::text);

drop policy if exists "api_usage_insert_own" on public.api_usage;
create policy "api_usage_insert_own"
  on public.api_usage for insert
  to authenticated
  with check (auth.uid()::text = user_id::text);

-- Key validation for desktop login / API auth WITHOUT service role.
-- SECURITY DEFINER: checks the hash, touches last_used, reveals nothing else.
create or replace function public.validate_api_key(p_hash text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_user uuid;
begin
  select id, user_id into v_id, v_user
  from public.api_keys
  where key_hash = p_hash and revoked = false;
  if v_id is null then
    return null;
  end if;
  update public.api_keys set last_used_at = now() where id = v_id;
  return v_user;
end;
$$;

grant execute on function public.validate_api_key(text) to anon, authenticated;

-- Usage logging callable from server routes (engine / api-key callers have
-- no cookie session, so plain RLS insert would fail — this function is the
-- only writer and validates nothing secret).
drop function if exists public.log_api_usage(uuid, text, text);
create or replace function public.log_api_usage(p_user_id text, p_endpoint text, p_model text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.api_usage (user_id, endpoint, model) values (p_user_id, p_endpoint, p_model);
end;
$$;

grant execute on function public.log_api_usage(text, text, text) to anon, authenticated;
