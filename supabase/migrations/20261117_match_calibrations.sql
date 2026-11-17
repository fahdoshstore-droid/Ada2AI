-- Ada2AI — pitch calibration storage.
--
-- Why this table exists:
--   vision_core/graph.py:175 computes every distance as `dist_px / 100.0`
--   with the comment "Using ppm=100 as default". That hardcoded 100 is why
--   a track that crossed the frame reads 0.29 metres. The backend already
--   has a full homography solver (backend/calibration/calibrator.py, 368
--   lines) and an endpoint (/calibration/manual), but the endpoint RETURNS
--   the result and stores nothing — its to_dict() does not even include the
--   matrix. So the homography is recomputed and thrown away every time.
--
--   This table is the missing durable half: one calibration per analysis,
--   written by the coach, readable by the frontend, so distances can be
--   recomputed in real metres from the positional_history we already store.
--
-- Coordinate conventions — both deliberate, do not change one without the other:
--   image_x/image_y are NORMALIZED to [0,1] against the frame, because
--   analysis_data.graph.players[].positional_history is normalized too
--   (vision_core/graph.py writes x_norm/y_norm). Storing pixels would break
--   silently the first time a frame was captured at another resolution.
--   pitch_x/pitch_y are METRES FROM THE CENTRE SPOT, matching
--   PitchLandmarks in backend/calibration/calibrator.py: x along the length
--   (±52.5), y along the width (±34). A frontend that used corner-origin
--   coordinates would produce a plausible-looking, wrong homography.

create table if not exists public.match_calibrations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.video_analyses(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,

  -- [{landmark, image_x, image_y, pitch_x, pitch_y}, ...]
  correspondences jsonb not null,

  -- 3x3 row-major, 9 numbers: maps normalized image -> pitch metres.
  homography double precision[] not null,

  -- Mean reprojection error over the correspondences, in metres. This is the
  -- number that decides whether the coach's clicks were good enough to trust;
  -- it is shown to him rather than hidden.
  reprojection_error_meters double precision,

  pitch_length_meters double precision not null default 105,
  pitch_width_meters double precision not null default 68,

  -- validated = checked against landmarks held out of the solve, not merely
  -- solved. Only a validated calibration should recolour a metric to teal.
  validated boolean not null default false,

  source text not null default 'coach_manual',

  -- Which frame the coach clicked on. Stored so the calibration can be
  -- reviewed and re-clicked later against the same moment of the same video,
  -- instead of being an unreproducible one-off.
  frame_timestamp_seconds double precision,
  frame_video_url text,
  frame_label text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint match_calibrations_homography_len check (array_length(homography, 1) = 9),
  constraint match_calibrations_min_points check (jsonb_array_length(correspondences) >= 4),
  constraint match_calibrations_one_per_analysis unique (analysis_id)
);

create index if not exists match_calibrations_match_idx on public.match_calibrations(match_id);

alter table public.match_calibrations enable row level security;

-- Same shape as video_analysis_player_links: calibration is coach work.
drop policy if exists match_calibrations_select_coach on public.match_calibrations;
create policy match_calibrations_select_coach on public.match_calibrations
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.user_type = any (array['coach','admin'])
    )
  );

drop policy if exists match_calibrations_write_coach on public.match_calibrations;
create policy match_calibrations_write_coach on public.match_calibrations
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.user_type = any (array['coach','admin'])
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.user_type = any (array['coach','admin'])
    )
  );

create or replace function public.touch_match_calibrations()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists match_calibrations_touch on public.match_calibrations;
create trigger match_calibrations_touch before update on public.match_calibrations
  for each row execute function public.touch_match_calibrations();

-- ── Storage: let a coach actually upload the match video ─────────────
--
-- The videos bucket was created in June 2026 and has held nothing since.
-- The reason is here: storage.objects has RLS on and no policy ever
-- mentioned this bucket, so every upload was rejected. That is the root
-- cause of video_url and thumbnail_url being null on all four analyses,
-- and therefore of there being no frame to calibrate against.
-- The bucket is public, so reads need no policy; writes do.

drop policy if exists videos_insert_coach on storage.objects;
create policy videos_insert_coach on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'videos'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.user_type = any (array['coach','admin'])
    )
  );

drop policy if exists videos_update_coach on storage.objects;
create policy videos_update_coach on storage.objects
  for update to authenticated
  using (
    bucket_id = 'videos'
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.user_type = any (array['coach','admin'])
    )
  );
