-- Reconciles the production Ada2Physique request/notification schema.
-- These objects already exist in production; this migration is intentionally idempotent.

create table if not exists public.physique_coach_requests (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.physique_athletes(athlete_id) on delete cascade,
  coach_id uuid not null references public.physique_coaches(coach_id) on delete cascade,
  offer_id uuid,
  message text,
  status text not null default 'pending',
  rejection_reason text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.physique_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists physique_coach_requests_athlete_status_idx on public.physique_coach_requests (athlete_id, status, created_at desc);
create index if not exists physique_coach_requests_coach_status_idx on public.physique_coach_requests (coach_id, status, created_at desc);
create unique index if not exists physique_coach_requests_one_pending_idx on public.physique_coach_requests (athlete_id, coach_id) where status = 'pending';
create index if not exists physique_notifications_recipient_idx on public.physique_notifications (recipient_id, read_at, created_at desc);

alter table public.physique_coach_requests enable row level security;
alter table public.physique_notifications enable row level security;

drop policy if exists physique_coach_requests_select_own_or_coach on public.physique_coach_requests;
create policy physique_coach_requests_select_own_or_coach on public.physique_coach_requests for select using (auth.uid() = athlete_id or auth.uid() = coach_id or public.physique_is_admin());
drop policy if exists physique_coach_requests_insert_athlete on public.physique_coach_requests;
create policy physique_coach_requests_insert_athlete on public.physique_coach_requests for insert with check (auth.uid() = athlete_id);
drop policy if exists physique_coach_requests_update_athlete_cancel on public.physique_coach_requests;
create policy physique_coach_requests_update_athlete_cancel on public.physique_coach_requests for update using (auth.uid() = athlete_id and status = 'pending') with check (auth.uid() = athlete_id and status = 'cancelled');
drop policy if exists physique_coach_requests_update_coach_decision on public.physique_coach_requests;
create policy physique_coach_requests_update_coach_decision on public.physique_coach_requests for update using (auth.uid() = coach_id and status = 'pending') with check (auth.uid() = coach_id and status in ('accepted','rejected'));
drop policy if exists physique_notifications_select_own on public.physique_notifications;
create policy physique_notifications_select_own on public.physique_notifications for select using (auth.uid() = recipient_id);
drop policy if exists physique_notifications_update_own on public.physique_notifications;
create policy physique_notifications_update_own on public.physique_notifications for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

create or replace function private.guard_physique_coach_request()
returns trigger language plpgsql security definer set search_path = public, private, pg_temp as $$
declare v_active_coach uuid; v_offer_coach uuid; v_offer_active boolean; v_accepting boolean;
begin
  if tg_op = 'INSERT' then
    if new.athlete_id = new.coach_id then raise exception 'Athlete and coach must be different users'; end if;
    select is_accepting_athletes into v_accepting from public.physique_coaches where coach_id = new.coach_id;
    if coalesce(v_accepting,false) is not true then raise exception 'Coach is not accepting athletes'; end if;
    select coach_id into v_active_coach from public.physique_coach_athletes where athlete_id=new.athlete_id and status='active' limit 1;
    if v_active_coach is not null then raise exception 'Athlete already has an active coach'; end if;
    if new.offer_id is not null then
      select coach_id,is_active into v_offer_coach,v_offer_active from public.physique_coach_offers where id=new.offer_id;
      if v_offer_coach is distinct from new.coach_id or coalesce(v_offer_active,false) is not true then raise exception 'Selected offer is not available for this coach'; end if;
    end if;
  elsif tg_op = 'UPDATE' then
    if new.athlete_id is distinct from old.athlete_id or new.coach_id is distinct from old.coach_id or new.offer_id is distinct from old.offer_id or new.created_at is distinct from old.created_at then raise exception 'Request identity fields cannot be changed'; end if;
    if old.status <> 'pending' then raise exception 'Only pending requests can be changed'; end if;
    if new.status not in ('accepted','rejected','cancelled') then raise exception 'Invalid request transition'; end if;
    if new.responded_at is null then new.responded_at := now(); end if;
    if new.status = 'accepted' then
      select coach_id into v_active_coach from public.physique_coach_athletes where athlete_id=new.athlete_id and status='active' limit 1;
      if v_active_coach is not null and v_active_coach is distinct from new.coach_id then raise exception 'Athlete already has an active coach'; end if;
    end if;
  end if;
  return new;
end; $$;

create or replace function private.apply_physique_coach_request_event()
returns trigger language plpgsql security definer set search_path = public, private, pg_temp as $$
declare v_athlete_name text; v_coach_name text;
begin
  select coalesce(nullif(ap.full_name,''),nullif(pa.display_name,''),'المتدرب') into v_athlete_name from public.profiles ap left join public.physique_athletes pa on pa.athlete_id=ap.id where ap.id=new.athlete_id;
  select coalesce(nullif(cp.full_name,''),nullif(pc.display_name,''),'المدرب') into v_coach_name from public.profiles cp left join public.physique_coaches pc on pc.coach_id=cp.id where cp.id=new.coach_id;
  if tg_op='INSERT' then
    insert into public.physique_notifications(recipient_id,actor_id,type,title,body,entity_type,entity_id) values(new.coach_id,new.athlete_id,'coach_request','New athlete request',v_athlete_name || ' wants to train with you.','coach_request',new.id);
  elsif old.status='pending' and new.status='accepted' then
    insert into public.physique_coach_athletes(coach_id,athlete_id,status,started_at,ended_at) values(new.coach_id,new.athlete_id,'active',now(),null) on conflict (coach_id,athlete_id) do update set status='active',ended_at=null,updated_at=now();
    insert into public.physique_notifications(recipient_id,actor_id,type,title,body,entity_type,entity_id) values(new.athlete_id,new.coach_id,'coach_request_accepted','Coach accepted your request',v_coach_name || ' accepted your coaching request. You can start from your dashboard.','coach_request',new.id);
  elsif old.status='pending' and new.status='rejected' then
    insert into public.physique_notifications(recipient_id,actor_id,type,title,body,entity_type,entity_id) values(new.athlete_id,new.coach_id,'coach_request_rejected','Coach request declined',coalesce(nullif(new.rejection_reason,''),v_coach_name || ' declined your coaching request.'),'coach_request',new.id);
  elsif old.status='pending' and new.status='cancelled' then
    insert into public.physique_notifications(recipient_id,actor_id,type,title,body,entity_type,entity_id) values(new.coach_id,new.athlete_id,'coach_request_cancelled','Athlete cancelled request',v_athlete_name || ' cancelled the coaching request.','coach_request',new.id);
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_physique_coach_request on public.physique_coach_requests;
create trigger trg_guard_physique_coach_request before insert or update on public.physique_coach_requests for each row execute function private.guard_physique_coach_request();
drop trigger if exists trg_apply_physique_coach_request_event on public.physique_coach_requests;
create trigger trg_apply_physique_coach_request_event after insert or update on public.physique_coach_requests for each row execute function private.apply_physique_coach_request_event();
