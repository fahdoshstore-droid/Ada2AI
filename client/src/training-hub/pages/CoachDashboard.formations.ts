// Formation templates for CoachDashboard

import { PitchPlayer, Formation, CustomOpponent } from "./CoachDashboard.types";

export const formationTemplates: Record<Formation, Omit<PitchPlayer, "id" | "nameAr" | "nameEn" | "rating" | "hasWarning">[]> = {
  "4-3-3": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 3,  role: "DEF", x: 15, y: 68 },
    { number: 5,  role: "DEF", x: 35, y: 68 },
    { number: 4,  role: "DEF", x: 65, y: 68 },
    { number: 2,  role: "DEF", x: 85, y: 68 },
    { number: 6,  role: "MID", x: 25, y: 45 },
    { number: 8,  role: "MID", x: 50, y: 42 },
    { number: 10, role: "MID", x: 75, y: 45 },
    { number: 11, role: "FWD", x: 18, y: 18 },
    { number: 9,  role: "FWD", x: 50, y: 12 },
    { number: 7,  role: "FWD", x: 82, y: 18 },
  ],
  "4-4-2": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 3,  role: "DEF", x: 15, y: 68 },
    { number: 5,  role: "DEF", x: 35, y: 68 },
    { number: 4,  role: "DEF", x: 65, y: 68 },
    { number: 2,  role: "DEF", x: 85, y: 68 },
    { number: 7,  role: "MID", x: 15, y: 45 },
    { number: 11, role: "MID", x: 35, y: 45 },
    { number: 8,  role: "MID", x: 65, y: 45 },
    { number: 6,  role: "MID", x: 85, y: 45 },
    { number: 9,  role: "FWD", x: 35, y: 18 },
    { number: 10, role: "FWD", x: 65, y: 18 },
  ],
  "3-5-2": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 5,  role: "DEF", x: 25, y: 68 },
    { number: 4,  role: "DEF", x: 50, y: 68 },
    { number: 2,  role: "DEF", x: 75, y: 68 },
    { number: 7,  role: "MID", x: 10, y: 45 },
    { number: 6,  role: "MID", x: 35, y: 42 },
    { number: 8,  role: "MID", x: 50, y: 40 },
    { number: 11, role: "MID", x: 65, y: 42 },
    { number: 3,  role: "MID", x: 90, y: 45 },
    { number: 9,  role: "FWD", x: 35, y: 18 },
    { number: 10, role: "FWD", x: 65, y: 18 },
  ],
  "4-2-3-1": [
    { number: 1,  role: "GK",  x: 50, y: 88 },
    { number: 3,  role: "DEF", x: 15, y: 68 },
    { number: 5,  role: "DEF", x: 35, y: 68 },
    { number: 4,  role: "DEF", x: 65, y: 68 },
    { number: 2,  role: "DEF", x: 85, y: 68 },
    { number: 6,  role: "MID", x: 35, y: 50 },
    { number: 8,  role: "MID", x: 65, y: 50 },
    { number: 10, role: "MID", x: 25, y: 28 },
    { number: 11, role: "MID", x: 75, y: 28 },
    { number: 7,  role: "MID", x: 50, y: 28 },
    { number: 9,  role: "FWD", x: 50, y: 12 },
  ],
};

// Position to PitchRole mapping
const positionToRole: Record<string, PitchPlayer["role"]> = {
  "GK": "GK", "حارس مرمى": "GK", "Goalkeeper": "GK",
  "CB": "DEF", "مدافع": "DEF", "مدافع وسط": "DEF", "Defender": "DEF", "Center Back": "DEF",
  "RB": "DEF", "ظهير أيمن": "DEF", "Right Back": "DEF",
  "LB": "DEF", "ظهير أيسر": "DEF", "Left Back": "DEF",
  "CM": "MID", "لاعب وسط": "MID", "Midfielder": "MID",
  "CAM": "MID", "صانع ألعاب": "MID", "Playmaker": "MID",
  "CDM": "MID", "محور": "MID",
  "RW": "MID", "جناح أيمن": "MID", "Right Wing": "MID",
  "LW": "MID", "جناح أيسر": "MID", "Left Wing": "MID",
  "ST": "FWD", "مهاجم": "FWD", "Striker": "FWD", "Forward": "FWD",
  "مهاجم أيسر": "FWD", "مهاجم أيمن": "FWD",
};

/**
 * Build PitchPlayer[] from real player data + optional evaluation ratings.
 * Falls back to positional defaults when players list is empty or incomplete.
 * 
 * Accepts any objects with: id, position?, jersey_number?, profile?.full_name
 */
export interface PlayerInput {
  id: string;
  position?: string;
  jersey_number?: number;
  profile?: { full_name?: string };
}

export function buildPitchPlayers(players: PlayerInput[], ratings?: Record<string, number>): PitchPlayer[] {
  if (players.length === 0) return getDefaultPitchPlayers();

  return players.slice(0, 11).map((p, i) => {
    const pos = p.position || "";
    const role = positionToRole[pos] || "MID";
    // Get formation template position for this slot
    const tmpl = formationTemplates["4-3-3"][i] || { number: i + 1, role, x: 50, y: 50 };
    const rating = (p.id && ratings?.[p.id]) || 70;
    return {
      id: i + 1,
      number: p.jersey_number || tmpl.number,
      nameAr: p.profile?.full_name || pos,
      nameEn: p.profile?.full_name || pos,
      role: tmpl.role as PitchPlayer["role"],
      x: tmpl.x,
      y: tmpl.y,
      rating,
    };
  });
}

/**
 * Default placeholder players (used when no real data is available yet).
 * Generic positional names, no specific player identities.
 */
export function getDefaultPitchPlayers(): PitchPlayer[] {
  return [
    { id: 1, number: 1,  nameAr: "حارس المرمى", nameEn: "Goalkeeper", role: "GK", x: 50, y: 88, rating: 70 },
    { id: 2, number: 2,  nameAr: "مدافع يمين", nameEn: "Right Back", role: "DEF", x: 85, y: 68, rating: 70 },
    { id: 3, number: 3,  nameAr: "مدافع يسار", nameEn: "Left Back", role: "DEF", x: 15, y: 68, rating: 70 },
    { id: 4, number: 4,  nameAr: "قلب دفاع 1", nameEn: "Center Back 1", role: "DEF", x: 65, y: 68, rating: 70 },
    { id: 5, number: 5,  nameAr: "قلب دفاع 2", nameEn: "Center Back 2", role: "DEF", x: 35, y: 68, rating: 70 },
    { id: 6, number: 6,  nameAr: "جناح يمين", nameEn: "Right Wing", role: "MID", x: 15, y: 45, rating: 70 },
    { id: 7, number: 8,  nameAr: "جناح يسار", nameEn: "Left Wing", role: "MID", x: 85, y: 45, rating: 70 },
    { id: 8, number: 10, nameAr: "صانع ألعاب", nameEn: "Playmaker", role: "MID", x: 50, y: 42, rating: 70 },
    { id: 9, number: 7,  nameAr: "لاعب وسط", nameEn: "Midfielder", role: "MID", x: 35, y: 45, rating: 70 },
    { id: 10, number: 9, nameAr: "مهاجم", nameEn: "Striker", role: "FWD", x: 50, y: 18, rating: 70 },
    { id: 11, number: 11, nameAr: "مهاجم أيسر", nameEn: "Left Forward", role: "FWD", x: 82, y: 18, rating: 70 },
  ];
}

// Keep for backward compatibility — re-exports the generic defaults
export const defaultPlayers = getDefaultPitchPlayers();

// Opponent presets are static scouting reference data (not mock player data)
export const opponentPresets: CustomOpponent[] = [
  {
    nameAr: "نادي النصر",
    nameEn: "Al-Nassr",
    formation: "4-2-3-1",
    styleAr: "هجومي سريع",
    styleEn: "Fast Attack",
    strengthsAr: "السرعة على الأطراف",
    strengthsEn: "Speed on wings",
    weaknessesAr: "ضعف في الارتكاز",
    weaknessesEn: "Weak at center",
  },
  {
    nameAr: "الهلال",
    nameEn: "Al-Hilal",
    formation: "4-3-3",
    styleAr: "سيطرة على الوسط",
    styleEn: "Midfield Control",
    strengthsAr: "السيطرة والتمرير",
    strengthsEn: "Ball control",
    weaknessesAr: "بطء في الارتداد",
    weaknessesEn: "Slow transition",
  },
];