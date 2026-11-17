-- ============================================================
-- Sport ID — one ordered format from here on, nothing renumbered
-- ============================================================
-- An issued identity is permanent. SID-FHD-001, SID-SAD-002 and SID-OMA-003
-- belong to real Ada2Physique users with check-in history, so they are left
-- exactly as they are. The 30 machine-generated SID-xxxxxxxx rows are left
-- alone too: ten of them are linked to physique_athletes, and a dormant real
-- user cannot be told apart from seed data by looking at the database.
-- Renumbering those would risk breaking a live identity to tidy a demo one.
--
-- What changes is issuance. Before:
--   'SID-' || 8 random hex chars      SID-B5D8582B
--   unordered, unreadable, and looped on collision.
-- After:
--   'SID-' || issue year || 5-digit serial     SID-2026-00034
--   • from a sequence: collisions impossible, the retry loop is gone
--   • ordered: a lower serial is an older identity
--   • readable on the phone and on a printed card
--   • person-level, carrying no sport, so one identity spans football
--     and physique as intended
--
-- A CHECK constraint then allows only these three shapes, so no fourth
-- format can be introduced by hand later.

begin;

-- Continue past every serial already in use.
create sequence if not exists public.sport_id_serial start with 1;
select setval(
  'public.sport_id_serial',
  greatest((select count(*) from public.sport_identities), 1),
  true
);

create or replace function public.ensure_sport_identity_for_profile(p_profile_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_existing text;
  v_inserted text;
begin
  select si.sport_id into v_existing
  from public.sport_identities si
  where si.profile_id = p_profile_id;

  if found then
    return v_existing;
  end if;

  insert into public.sport_identities (profile_id, sport_id)
  values (
    p_profile_id,
    'SID-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.sport_id_serial')::text, 5, '0')
  )
  on conflict (profile_id) do nothing
  returning sport_id into v_inserted;

  if v_inserted is not null then
    return v_inserted;
  end if;

  -- Another transaction issued it first; return that one.
  select si.sport_id into v_existing
  from public.sport_identities si
  where si.profile_id = p_profile_id;

  return v_existing;
end;
$function$;

alter table public.sport_identities
  drop constraint if exists sport_identities_format_check;

alter table public.sport_identities
  add constraint sport_identities_format_check
  check (
    sport_id ~ '^SID-[0-9]{4}-[0-9]{5}$'   -- issued from here on
    or sport_id ~ '^SID-[A-Z]{3}-[0-9]{3}$' -- early real users, preserved
    or sport_id ~ '^SID-[0-9A-F]{8}$'       -- random era, preserved
  );

commit;
