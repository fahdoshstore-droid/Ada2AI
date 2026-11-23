-- Coach evaluations of players.
-- Used by: /coach/evaluate/:playerId (insert), /player-analysis, /rankings,
-- player profile (read). The frontend already queried this table but it was
-- never created, so every evaluation save failed with PGRST205.

create table if not exists public.evaluations (
  id               uuid primary key default gen_random_uuid(),
  player_id        uuid not null references public.players(id) on delete cascade,
  coach_id         uuid references auth.users(id) on delete set null default auth.uid(),
  technical        smallint not null default 0 check (technical between 0 and 100),
  tactical         smallint not null default 0 check (tactical  between 0 and 100),
  physical         smallint not null default 0 check (physical  between 0 and 100),
  mental           smallint not null default 0 check (mental    between 0 and 100),
  overall          smallint not null default 0 check (overall   between 0 and 100),
  notes            text,
  evaluation_date  date not null default current_date,
  created_at       timestamptz not null default now()
);

create index if not exists evaluations_player_date_idx
  on public.evaluations (player_id, evaluation_date desc);

alter table public.evaluations enable row level security;

revoke all on public.evaluations from anon;
grant select, insert, update, delete on public.evaluations to authenticated;

-- Any signed-in user (coach, scout, player) can read evaluations.
create policy "Authenticated users can read evaluations"
  on public.evaluations for select to authenticated
  using (true);

-- Only coaches can create evaluations, and only as themselves.
create policy "Coaches can insert own evaluations"
  on public.evaluations for insert to authenticated
  with check (
    coach_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'coach')
  );

create policy "Coaches can update own evaluations"
  on public.evaluations for update to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy "Coaches can delete own evaluations"
  on public.evaluations for delete to authenticated
  using (coach_id = auth.uid());
