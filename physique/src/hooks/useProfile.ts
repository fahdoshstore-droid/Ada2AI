import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { Athlete, Coach } from "../lib/types";

/** Current athlete's physique profile (1:1 with profiles.id). */
export function useAthleteProfile() {
  const { userId } = useAuth();
  return useQuery<Athlete | null>({
    queryKey: ["physique-athlete", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_athletes")
        .select("*")
        .eq("athlete_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Athlete | null;
    },
  });
}

/** Current coach's physique profile (1:1 with profiles.id). */
export function useCoachProfile() {
  const { userId } = useAuth();
  return useQuery<Coach | null>({
    queryKey: ["physique-coach", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_coaches")
        .select("*")
        .eq("coach_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as Coach | null;
    },
  });
}

/** The current user's unified Sport ID (read-only; created server-side). */
export function useMySportIdentity() {
  const { userId } = useAuth();
  return useQuery<{ id: string; profile_id: string; sport_id: string } | null>({
    queryKey: ["my-sport-identity", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sport_identities")
        .select("id, profile_id, sport_id")
        .eq("profile_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as { id: string; profile_id: string; sport_id: string } | null;
    },
  });
}
