-- 0001 — First database schema for Racik Reels.
-- Not applied yet: the app currently runs in demo mode (data in the browser).
-- Run this in Supabase once the project is created (SQL editor or `supabase db push`).

-- ---------- Profiles: one row per signed-in user, holds the credit balance ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  plan_credits integer not null default 3 check (plan_credits >= 0),   -- expire monthly
  topup_credits integer not null default 0 check (topup_credits >= 0), -- last 12 months
  created_at timestamptz not null default now()
);

-- ---------- Reel projects: one uploaded video → one reel ----------
create table public.reel_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  status text not null default 'processing'
    check (status in ('processing', 'ready', 'exported', 'failed')),
  source_file_name text not null,
  source_storage_key text,          -- R2 object key of the uploaded video
  source_duration_seconds numeric(6, 2) not null check (source_duration_seconds <= 180),
  style jsonb not null,             -- caption style, length, hook style, language, toggles
  draft jsonb,                      -- hooks, captions, B-roll, music, effects, post caption
  rendered_storage_key text,        -- R2 object key of the final MP4
  credits_charged integer not null default 1,
  regenerations_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reel_projects_owner_created_idx on public.reel_projects (owner_id, created_at desc);

-- ---------- Generation jobs: progress of each pipeline step, written by the worker ----------
create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.reel_projects (id) on delete cascade,
  kind text not null default 'generate' check (kind in ('generate', 'regenerate', 'final-render')),
  current_step text,                -- matches ids in src/lib/reel-options/generation-pipeline-steps.ts
  completed_steps integer not null default 0,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  error_message text,
  cost_log jsonb not null default '{}'::jsonb, -- per-job cost (transcription, AI, stock, render) in IDR
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);
create index generation_jobs_project_idx on public.generation_jobs (project_id, created_at desc);

-- ---------- Credit ledger: every credit added or spent ----------
create table public.credit_ledger (
  id bigint generated always as identity primary key,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  project_id uuid references public.reel_projects (id) on delete set null,
  change integer not null,          -- negative = spent, positive = added
  reason text not null check (reason in ('plan-renewal', 'topup', 'generation', 'refund', 'adjustment')),
  created_at timestamptz not null default now()
);

-- ---------- Row-level security: users only see their own data ----------
alter table public.profiles enable row level security;
alter table public.reel_projects enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.credit_ledger enable row level security;

create policy "Own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Own projects: read" on public.reel_projects
  for select using (auth.uid() = owner_id);
create policy "Own projects: update" on public.reel_projects
  for update using (auth.uid() = owner_id);

create policy "Own jobs: read" on public.generation_jobs
  for select using (
    exists (select 1 from public.reel_projects p where p.id = project_id and p.owner_id = auth.uid())
  );

create policy "Own ledger: read" on public.credit_ledger
  for select using (auth.uid() = owner_id);

-- Inserting projects, charging credits and writing jobs happen on the server
-- with the service role key, so the hard credit check cannot be skipped from the browser.

-- ---------- New user → profile row ----------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
