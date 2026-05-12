/**
 * Training Hub — usePlayers hook
 * Bilingual player data (Arabic + English) — powered by Supabase
 */
import { useState, useMemo } from "react";
import { usePlayers as useSupabasePlayers } from "@/hooks/usePlayers";
import { useEvaluations } from "@/hooks/useEvaluations";
import type { Player as SupabasePlayer, Evaluation } from "@/lib/supabase";

export interface Player {
  id: string;
  nameAr: string;
  nameEn: string;
  positionAr: string;
  positionEn: string;
  team: string;
  age: number;
  avatar: string;
  progress: number;
  lastSession: string;
  stats: {
    speed: number;
    strength: number;
    technique: number;
    stamina: number;
    teamwork: number;
  };
  rating: number;
  potential: number;
  speed: number;
  strength: number;
  stamina: number;
  injured?: boolean;
}

export interface TrainingSession {
  id: string;
  date: string;
  typeAr: string;
  typeEn: string;
  duration: number;
  intensityAr: string;
  intensityEn: string;
  notes: string;
  playerId: string;
}

/** Map a Supabase Player (with joined profile) to the local Player shape */
function mapPlayer(sp: SupabasePlayer): Player {
  const profile = sp.profile as Record<string, unknown> | undefined;
  const fullName = (profile?.full_name as string) || "";
  const firstName = fullName.split(" ")[0] || "";
  const lastName = fullName.split(" ").slice(1).join(" ") || "";

  // Build bilingual names — if the DB only has one name, Arabic displays the same
  const nameAr = fullName || "لاعب";
  const nameEn = fullName || "Player";

  // Map position — DB stores English; provide Arabic equivalent
  const positionMap: Record<string, { ar: string; en: string }> = {
    forward: { ar: "مهاجم", en: "Forward" },
    midfielder: { ar: "وسط", en: "Midfielder" },
    goalkeeper: { ar: "حارس مرمى", en: "Goalkeeper" },
    defender: { ar: "مدافع", en: "Defender" },
  };
  const pos = (sp.position || "").toLowerCase();
  const posInfo = positionMap[pos] || { ar: pos, en: pos };

  // Avatar: first letter of first name (Arabic or English)
  const avatar = firstName.charAt(0) || nameAr.charAt(0) || "?";

  return {
    id: sp.id,
    nameAr,
    nameEn,
    positionAr: posInfo.ar,
    positionEn: posInfo.en,
    team: "", // team assignment not in current schema
    age: sp.age || 0,
    avatar,
    progress: 0,
    lastSession: "",
    stats: { speed: 0, strength: 0, technique: 0, stamina: 0, teamwork: 0 },
    rating: 0,
    potential: 0,
    speed: 0,
    strength: 0,
    stamina: 0,
  };
}

/** Map an Evaluation to a TrainingSession shape */
function evaluationToSession(ev: Evaluation, playerId: string): TrainingSession {
  const typeMap: Record<string, { ar: string; en: string }> = {
    technical: { ar: "تدريب تقني", en: "Technical Training" },
    tactical: { ar: "تدريب تكتيكي", en: "Tactical Training" },
    physical: { ar: "تدريب قوة", en: "Strength Training" },
    mental: { ar: "تدريب ذهني", en: "Mental Training" },
  };

  // Derive a type label from the evaluation's strongest category
  const categories = [
    { key: "technical", value: ev.technical },
    { key: "tactical", value: ev.tactical },
    { key: "physical", value: ev.physical },
    { key: "mental", value: ev.mental },
  ];
  const dominant = categories.reduce((a, b) => (b.value > a.value ? b : a), categories[0]);
  const typeInfo = typeMap[dominant.key] || { ar: "تدريب عام", en: "General Training" };

  // Intensity derived from overall score
  const overall = ev.overall ?? 0;
  const intensityInfo =
    overall >= 80
      ? { ar: "عالية", en: "High" }
      : overall >= 60
        ? { ar: "متوسطة", en: "Medium" }
        : { ar: "منخفضة", en: "Low" };

  return {
    id: ev.id,
    date: ev.evaluation_date ?? ev.created_at ?? "",
    typeAr: typeInfo.ar,
    typeEn: typeInfo.en,
    duration: 0, // not tracked in evaluations table
    intensityAr: intensityInfo.ar,
    intensityEn: intensityInfo.en,
    notes: ev.notes ?? "",
    playerId,
  };
}

export function usePlayers() {
  const {
    players: supabasePlayers,
    isLoading: playersLoading,
    isError: playersError,
  } = useSupabasePlayers();

  // We'll fetch evaluations per player to build sessions & enrich stats.
  // For simplicity, use the first player's evaluations as a start, then aggregate.
  // NOTE: For a full implementation, consider useAllEvaluations() for team-wide data.
  const firstPlayerId = supabasePlayers.length > 0 ? supabasePlayers[0].id : null;
  const { evaluations, isLoading: evalsLoading } = useEvaluations(firstPlayerId);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Map Supabase players → local Player shape, enriching with evaluation stats
  const players: Player[] = useMemo(() => {
    if (!supabasePlayers) return [];

    return supabasePlayers.map((sp) => {
      const mapped = mapPlayer(sp);

      // Find the latest evaluation for this player (if loaded)
      // Since we only fetched evals for firstPlayerId, other players won't have evals yet.
      // This is a limitation — useAllEvaluations would solve it.
      const playerEvals = evaluations?.filter((e) => e.player_id === sp.id) ?? [];
      const latestEval = playerEvals[0]; // sorted desc by date

      if (latestEval) {
        mapped.stats = {
          speed: latestEval.physical ?? 0,
          strength: latestEval.physical ?? 0,
          technique: latestEval.technical ?? 0,
          stamina: latestEval.physical ?? 0,
          teamwork: latestEval.tactical ?? 0,
        };
        mapped.rating = latestEval.overall ?? 0;
        mapped.potential = Math.round((latestEval.overall ?? 0) * 1.1); // rough estimate
        mapped.speed = latestEval.physical ?? 0;
        mapped.strength = latestEval.physical ?? 0;
        mapped.stamina = latestEval.physical ?? 0;
        mapped.progress = latestEval.overall ?? 0;
        mapped.lastSession = latestEval.evaluation_date ?? "";
      }

      return mapped;
    });
  }, [supabasePlayers, evaluations]);

  // Build sessions from evaluations
  const sessions: TrainingSession[] = useMemo(() => {
    if (!evaluations) return [];
    return evaluations.map((ev) => evaluationToSession(ev, ev.player_id));
  }, [evaluations]);

  const getPlayerById = (id: string) => players.find((p) => p.id === id);
  const getPlayerSessions = (playerId: string) => sessions.filter((s) => s.playerId === playerId);

  return {
    players,
    sessions,
    selectedPlayer,
    setSelectedPlayer,
    getPlayerById,
    getPlayerSessions,
    isLoading: playersLoading || evalsLoading,
    isError: playersError,
  };
}