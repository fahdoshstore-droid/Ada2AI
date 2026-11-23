-- Saved team formations for the coach workspace («تشكيل الفريق»).
-- A row stores the formation key, which player stands in each position
-- (array index = position index, null = vacant) and any position the coach
-- dragged away from the default shape.

create table if not exists public.coach_formations (
  id           uuid primary key default gen_random_uuid(),
  coach_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name         text not null check (char_length(name) between 1 and 80),
  formation    text not null check (formation in ('4-3-3','4-4-2','4-2-3-1','3-5-2','3-4-3','5-3-2')),
  -- uuid of public.players per position, or null for a vacant position
  assignment   jsonb not null default '[]'::jsonb check (jsonb_typeof(assignment) = 'array'),
  -- {"<position index>": {"x": 0-100, "y": 0-100}} for dragged positions only
  positions    jsonb not null default '{}'::jsonb check (jsonb_typeof(positions) = 'object'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists coach_formations_coach_idx
  on public.coach_formations (coach_id, updated_at desc);

alter table public.coach_formations enable row level security;

revoke all on public.coach_formations from anon;
grant select, insert, update, delete on public.coach_formations to authenticated;

-- A coach sees and changes only his own formations.
create policy "Coaches read own formations"
  on public.coach_formations for select to authenticated
  using (coach_id = auth.uid());

create policy "Coaches insert own formations"
  on public.coach_formations for insert to authenticated
  with check (
    coach_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'coach')
  );

create policy "Coaches update own formations"
  on public.coach_formations for update to authenticated
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy "Coaches delete own formations"
  on public.coach_formations for delete to authenticated
  using (coach_id = auth.uid());
