// CoachDashboard - Types and Interfaces

export type Formation = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1";
export type PlayerRole = "GK" | "DEF" | "MID" | "FWD";

export interface PitchPlayer {
  id: number;
  number: number;
  nameAr: string;
  nameEn: string;
  role: PlayerRole;
  rating: number;
  x: number;
  y: number;
  hasWarning?: boolean;
  linkedPlayerId?: number;
}

export interface SavedFormation {
  id: string;
  name: string;
  formation: Formation;
  players: PitchPlayer[];
  savedAt: string;
}

export interface CustomOpponent {
  nameAr: string;
  nameEn: string;
  formation: string;
  styleAr: string;
  styleEn: string;
  strengthsAr: string;
  strengthsEn: string;
  weaknessesAr: string;
  weaknessesEn: string;
}

export interface VideoAnalysisResult {
  team_0_name: string;
  team_1_name: string;
  team_0_possession: number;
  team_1_possession: number;
  team_0_area: number;
  team_1_area: number;
  team_0_goals?: number;
  team_1_goals?: number;
  team_0_shots?: number;
  team_1_shots?: number;
}

export interface CoachDashboardProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}
