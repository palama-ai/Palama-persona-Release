-- Palama training dataset (run in Supabase Dashboard → SQL Editor)
-- One row per finished desktop task: cleaned conversations, thinking,
-- actions, tokens, and (cloud mode only) screenshots.
-- Reads are team-only (no public policies); writes go through the
-- ingest_training_event() function so RLS never blocks the engine.

create table if not exists public.training_events (
  id bigint generated always as identity primary key,
  owner_id text not null default '',
  task_id text not null default '',
  kind text not null default 'task',
  consent_training boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_training_owner_time
  on public.training_events (owner_id, created_at desc);
create index if not exists idx_training_consent_time
  on public.training_events (consent_training, created_at desc);

alter table public.training_events enable row level security;
-- NOTE: intentionally NO public policies: only SECURITY DEFINER
-- functions and the service role can read/write.

create or replace function public.ingest_training_event(
  p_owner text,
  p_task_id text,
  p_kind text,
  p_consent boolean,
  p_payload jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  insert into public.training_events (owner_id, task_id, kind, consent_training, payload)
  values (
    left(coalesce(p_owner, ''), 128),
    left(coalesce(p_task_id, ''), 128),
    left(coalesce(p_kind, 'task'), 32),
    coalesce(p_consent, true),
    coalesce(p_payload, '{}'::jsonb)
  )
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.ingest_training_event(text, text, text, boolean, jsonb) to anon, authenticated;
