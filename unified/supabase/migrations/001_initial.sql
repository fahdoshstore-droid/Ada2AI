-- ============================================================
-- Ada2AI Unified — Supabase Schema Migration
-- Multi-tenant: organizations + memberships + RLS
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations (clubs & academies)
create table if not exists public.organizations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  type          text not null check (type in ('club', 'academy')),
  created_at    timestamptz not null default now()
);

-- Memberships (users ↔ organizations with roles)
create table if not exists public.memberships (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role            text not null check (role in ('admin', 'coach', 'player')),
  created_at      timestamptz not null default now(),
  unique (user_id, organization_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists memberships_user_id_idx on public.memberships(user_id);
create index if not exists memberships_org_id_idx   on public.memberships(organization_id);
create index if not exists memberships_role_idx   on public.memberships(role);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.organizations enable row level security;
alter table public.memberships  enable row level security;

-- Organizations: anyone can read, only auth users can insert (via app)
create policy "organizations_select"
  on public.organizations for select
  using (true);

create policy "organizations_insert"
  on public.organizations for insert
  with check (auth.role() = 'authenticated');

create policy "organizations_update"
  on public.organizations for update
  using (auth.uid() in (
    select user_id from public.memberships
    where role = 'admin'
  ));

create policy "organizations_delete"
  on public.organizations for delete
  using (auth.uid() in (
    select user_id from public.memberships
    where role = 'admin'
  ));

-- Memberships: users can only see/manage their own memberships
create policy "memberships_select"
  on public.memberships for select
  using (auth.uid() = user_id);

create policy "memberships_insert"
  on public.memberships for insert
  with check (auth.uid() = user_id);

create policy "memberships_update"
  on public.memberships for update
  using (auth.uid() = user_id);

create policy "memberships_delete"
  on public.memberships for delete
  using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create membership on user signup
-- (Optional — create membership manually via app for now)
-- ============================================================

-- Helper function to get user's organization
create or replace function public.user_organization(p_user_id uuid)
returns public.organizations
language sql
security definer
stable
as $$
  select o.*
  from public.organizations o
  join public.memberships m on m.organization_id = o.id
  where m.user_id = p_user_id
  limit 1;
$$;

-- Helper function to get user's role
create or replace function public.user_role(p_user_id uuid)
returns text
language sql
security definer
stable
as $$
  select m.role
  from public.memberships m
  where m.user_id = p_user_id
  limit 1;
$$;
