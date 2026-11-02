import { supabase } from './supabase';

export interface SportIdentity { id: string; profile_id: string; sport_id: string }

/** Physique-only resolution. No football queries or automatic domain enrollment. */
export async function getPhysiqueSportIdentity(profileId: string) {
  const { data: identity, error } = await supabase.from('sport_identities')
    .select('id,profile_id,sport_id').eq('profile_id', profileId).maybeSingle();
  if (error) throw error;
  if (!identity) return null; // Unavailable to this session; not proof of missing identity.
  if (identity.profile_id !== profileId) throw new Error('Sport identity/profile mismatch');
  const { data: athlete, error: athleteError } = await supabase.from('physique_athletes')
    .select('athlete_id,display_name').eq('athlete_id', profileId).maybeSingle();
  if (athleteError) throw athleteError;
  if (!athlete) return null;
  if (athlete.athlete_id !== identity.profile_id) throw new Error('Physique athlete/profile mismatch');
  return { identity: identity as SportIdentity, athlete };
}

/** Resolve an existing public/business ID within the current user's RLS access. */
export async function resolvePhysiqueSportIdentity(sportId: string) {
  const { data, error } = await supabase.from('sport_identities')
    .select('id,profile_id,sport_id').eq('sport_id', sportId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.sport_id !== sportId) throw new Error('Sport ID mismatch');
  const resolved = await getPhysiqueSportIdentity(data.profile_id);
  if (resolved && resolved.identity.id !== data.id) throw new Error('Sport identity changed during resolution');
  return resolved;
}
