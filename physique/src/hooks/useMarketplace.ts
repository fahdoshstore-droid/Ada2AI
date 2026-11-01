import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { CoachCard, CoachOffer } from "../lib/types";

/**
 * Marketplace data layer — coach discovery, offers, and subscription.
 *
 * RLS contract (migration 009):
 *   * physique_coaches  — public SELECT (marketing profile only)
 *   * physique_coach_offers — public SELECT
 *   * physique_subscriptions — athlete sees own; coach sees roster's; an
 *     athlete may only INSERT a 'pending' subscription for themselves.
 */

/** Marketplace-safe coach columns (never emails / stripe internals). */
const COACH_SELECT =
  "coach_id, display_name, bio, specialties, years_experience, competition_background, avatar_url, is_verified, is_accepting_athletes";

const OFFER_SELECT =
  "id, coach_id, name, description, price_amount, currency, billing_interval, is_active, sort_order";

/** All coaches accepting athletes, with their active offers. */
export function useCoaches() {
  return useQuery<CoachCard[]>({
    queryKey: ["marketplace-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_coaches")
        .select(`${COACH_SELECT}, offers:physique_coach_offers(${OFFER_SELECT})`)
        .eq("is_accepting_athletes", true)
        .order("is_verified", { ascending: false });
      if (error) throw error;
      const coaches = (data ?? []) as unknown as (Omit<CoachCard, "offers"> & {
        offers: CoachOffer[] | null;
      })[];
      return coaches.map((c) => ({
        ...c,
        offers: (c.offers ?? []).filter((o) => o.is_active),
      }));
    },
  });
}

/** A single coach's public profile + active offers. */
export function useCoachPublic(coachId: string | undefined) {
  return useQuery<CoachCard | null>({
    queryKey: ["marketplace-coach", coachId],
    enabled: !!coachId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_coaches")
        .select(`${COACH_SELECT}, offers:physique_coach_offers(${OFFER_SELECT})`)
        .eq("coach_id", coachId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const c = data as unknown as Omit<CoachCard, "offers"> & {
        offers: CoachOffer[] | null;
      };
      return {
        ...c,
        offers: (c.offers ?? []).filter((o) => o.is_active),
      };
    },
  });
}

/** Coach's own offers (for the coach onboarding / offer management). */
export function useMyOffers() {
  const { userId } = useAuth();
  return useQuery<CoachOffer[]>({
    queryKey: ["my-offers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physique_coach_offers")
        .select(OFFER_SELECT)
        .eq("coach_id", userId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CoachOffer[];
    },
  });
}

/** Coach creates an offer. */
export function useCreateOffer() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description: string;
      priceAmount: number;
      currency: string;
      billingInterval: "month" | "quarter" | "year";
    }) => {
      const { error } = await supabase.from("physique_coach_offers").insert({
        coach_id: userId!,
        name: input.name,
        description: input.description || null,
        price_amount: input.priceAmount,
        currency: input.currency,
        billing_interval: input.billingInterval,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-offers", userId] });
    },
  });
}
