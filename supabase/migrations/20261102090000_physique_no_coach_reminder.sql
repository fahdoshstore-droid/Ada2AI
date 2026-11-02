-- Event-based NO_COACH reminder. No cron, queue, or new notification table.

begin;

create or replace function private.create_physique_coach_selection_reminder()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if not exists (
    select 1 from public.physique_coach_athletes
    where athlete_id = new.athlete_id and status = 'active'
  )
  and not exists (
    select 1 from public.physique_coach_requests
    where athlete_id = new.athlete_id and status = 'pending'
  )
  and not exists (
    select 1 from public.physique_notifications
    where recipient_id = new.athlete_id
      and type = 'coach_selection_reminder'
      and created_at >= now() - interval '7 days'
  ) then
    insert into public.physique_notifications (
      recipient_id, type, title, body, entity_type, entity_id
    ) values (
      new.athlete_id,
      'coach_selection_reminder',
      'ملفك جاهز — اختر مدربك',
      'استكمل بياناتك واختر المدرب المناسب لك لبدء برنامجك التدريبي في Ada2Physique.',
      'coach_marketplace',
      null
    );
  end if;
  return new;
end;
$$;

revoke all on function private.create_physique_coach_selection_reminder() from public;

drop trigger if exists trg_physique_coach_selection_reminder on public.physique_athletes;
create trigger trg_physique_coach_selection_reminder
after insert on public.physique_athletes
for each row execute function private.create_physique_coach_selection_reminder();

-- One-time idempotent backfill for existing NO_COACH athletes.
insert into public.physique_notifications (
  recipient_id, type, title, body, entity_type, entity_id
)
select a.athlete_id,
  'coach_selection_reminder',
  'ملفك جاهز — اختر مدربك',
  'استكمل بياناتك واختر المدرب المناسب لك لبدء برنامجك التدريبي في Ada2Physique.',
  'coach_marketplace',
  null
from public.physique_athletes a
where not exists (
  select 1 from public.physique_coach_athletes ca
  where ca.athlete_id = a.athlete_id and ca.status = 'active'
)
and not exists (
  select 1 from public.physique_coach_requests cr
  where cr.athlete_id = a.athlete_id and cr.status = 'pending'
)
and not exists (
  select 1 from public.physique_notifications n
  where n.recipient_id = a.athlete_id
    and n.type = 'coach_selection_reminder'
    and n.created_at >= now() - interval '7 days'
);

commit;
