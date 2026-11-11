-- Scout evaluation reports (نموذج تقييم الكشاف)
-- Four pillars (technical / tactical / physical / mental), eight criteria each, rated 1–5.
-- total_score is always recomputed by the database: sum of ratings / 160 * 100.
-- Idempotent.

create table if not exists public.scout_reports (
  id uuid primary key default gen_random_uuid(),
  scout_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  player_name text not null check (length(btrim(player_name)) > 0),
  birth_year int check (birth_year is null or birth_year between 1950 and 2100),
  club text not null default '',
  position text not null default '',
  pitch_positions text[] not null default '{}',
  target_category text not null default '',
  discovery_date date not null default current_date,
  match text not null default '',
  ratings jsonb not null default '{}'::jsonb,
  notes jsonb not null default '{}'::jsonb,
  scout_opinion text not null default '',
  scout_name text not null default '',
  total_score int not null default 0 check (total_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists scout_reports_scout_idx on public.scout_reports (scout_id, discovery_date desc);
create index if not exists scout_reports_player_idx on public.scout_reports (player_id) where player_id is not null;

create or replace function public.scout_reports_before_write()
returns trigger language plpgsql set search_path = public, pg_temp as $$
declare
  v_pillar text;
  v_key text;
  v_val jsonb;
  v_num numeric;
  v_sum int := 0;
begin
  if jsonb_typeof(new.ratings) is distinct from 'object' then
    raise exception 'ratings must be a JSON object';
  end if;

  foreach v_pillar in array array['technical','tactical','physical','mental'] loop
    if new.ratings ? v_pillar then
      if jsonb_typeof(new.ratings -> v_pillar) <> 'object' then
        raise exception 'ratings.% must be a JSON object', v_pillar;
      end if;
      if (select count(*) from jsonb_object_keys(new.ratings -> v_pillar)) > 8 then
        raise exception 'ratings.% has more than 8 criteria', v_pillar;
      end if;
      for v_key, v_val in select key, value from jsonb_each(new.ratings -> v_pillar) loop
        if jsonb_typeof(v_val) <> 'number' then
          raise exception 'rating %.% must be a number', v_pillar, v_key;
        end if;
        v_num := v_val::text::numeric;
        if v_num <> trunc(v_num) or v_num < 1 or v_num > 5 then
          raise exception 'rating %.% must be an integer from 1 to 5', v_pillar, v_key;
        end if;
        v_sum := v_sum + v_num::int;
      end loop;
    end if;
  end loop;

  new.total_score := round(v_sum::numeric / 160 * 100);
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    new.scout_id := old.scout_id;
    new.created_at := old.created_at;
  end if;
  return new;
end; $$;

drop trigger if exists trg_scout_reports_before_write on public.scout_reports;
create trigger trg_scout_reports_before_write
  before insert or update on public.scout_reports
  for each row execute function public.scout_reports_before_write();

alter table public.scout_reports enable row level security;

-- A report is private to the scout who wrote it.
drop policy if exists scout_reports_select_own on public.scout_reports;
create policy scout_reports_select_own on public.scout_reports
  for select to authenticated using (auth.uid() = scout_id);

drop policy if exists scout_reports_insert_own on public.scout_reports;
create policy scout_reports_insert_own on public.scout_reports
  for insert to authenticated with check (
    auth.uid() = scout_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.user_type = 'scout')
  );

drop policy if exists scout_reports_update_own on public.scout_reports;
create policy scout_reports_update_own on public.scout_reports
  for update to authenticated using (auth.uid() = scout_id) with check (auth.uid() = scout_id);

drop policy if exists scout_reports_delete_own on public.scout_reports;
create policy scout_reports_delete_own on public.scout_reports
  for delete to authenticated using (auth.uid() = scout_id);

grant select, insert, update, delete on public.scout_reports to authenticated;
