-- Harden access to public.players.
--
-- Before this migration:
--   * INSERT / UPDATE / DELETE policies only checked auth.uid() IS NOT NULL,
--     so any signed-in user could change or delete any player.
--   * "Public read players" (USING true, role public) let anonymous visitors
--     read every player.
--   * anon held every table privilege; TRUNCATE bypasses RLS altogether.
--   * api.players (a view the API serves by default) is not security_invoker,
--     so it ran as its owner and ignored all of the above.
--
-- Kept as is: the RESTRICTIVE players_coach_scope policy (a coach reads only
-- the players linked to him), and service-role writes from the create-player
-- edge function (service role bypasses RLS).
--
-- Admin = profiles.user_type = 'admin', or the app's existing convention
-- user_type = 'coach' AND sport = 'admin' (src/contexts/AuthContext isAdmin).
--
-- Rollback (restores the previous behaviour exactly):
--   drop policy "Authenticated read players" on public.players;
--   drop policy "Players insert own record" on public.players;
--   drop policy "Players update own record" on public.players;
--   drop policy "Admins delete players" on public.players;
--   create policy "Public read players" on public.players for select using (true);
--   create policy "Authenticated insert players" on public.players for insert with check (auth.uid() is not null);
--   create policy "Authenticated update players" on public.players for update using (auth.uid() is not null);
--   create policy "Authenticated delete players" on public.players for delete using (auth.uid() is not null);
--   grant all on public.players to anon, authenticated;
--   alter view api.players reset (security_invoker);

create or replace function public.is_app_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.user_type = 'admin' or (p.user_type = 'coach' and p.sport = 'admin'))
  )
$$;
revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;

drop policy if exists "Public read players" on public.players;
drop policy if exists "Authenticated insert players" on public.players;
drop policy if exists "Authenticated update players" on public.players;
drop policy if exists "Authenticated delete players" on public.players;

create policy "Authenticated read players"
  on public.players for select to authenticated
  using (true);

create policy "Players insert own record"
  on public.players for insert to authenticated
  with check (user_id = auth.uid() or public.is_app_admin());

create policy "Players update own record"
  on public.players for update to authenticated
  using (user_id = auth.uid() or public.is_app_admin())
  with check (user_id = auth.uid() or public.is_app_admin());

create policy "Admins delete players"
  on public.players for delete to authenticated
  using (public.is_app_admin());

revoke all on public.players from anon;
revoke truncate, references, trigger on public.players from authenticated;

-- Make the API view obey the table's RLS instead of its owner's rights.
alter view api.players set (security_invoker = true);
revoke all on api.players from anon;
