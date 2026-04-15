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

// ─── Tactical Animation Types ────────────────────────────────────────────────

export type TacticalPhase =
  | "build-up"
  | "high-press"
  | "mid-block"
  | "low-block"
  | "counter-attack"
  | "set-piece"
  | "transition-att"
  | "transition-def";

export type PressureSide = "left" | "center" | "right";
export type BallDirection = "forward" | "backward" | "left" | "right" | "neutral";

export interface TacticalScenario {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  phase: TacticalPhase;
  pressureSide: PressureSide;
  ballDirection: BallDirection;
  intensity: number;
  duration: number;
  keyframes: TacticalKeyframe[];
  passes: TacticalPass[];
  presses: TacticalPress[];
  runs: TacticalRun[];
}

export interface TacticalKeyframe {
  t: number;
  offsets: Record<number, { dx: number; dy: number }>;
}

export interface TacticalPass {
  fromPlayer: number;
  toPlayer: number;
  at: number;
  type: "short" | "long" | "through" | "cross" | "back";
}

export interface TacticalPress {
  fromPlayer: number;
  targetLabelAr: string;
  targetLabelEn: string;
  targetX: number;
  targetY: number;
  from: number;
  to: number;
}

export type TacticalRunType = "overlap" | "underlap" | "cut-inside" | "run-behind" | "drift-wide" | "cover";

export interface TacticalRun {
  playerNumber: number;
  from: { dx: number; dy: number };
  to: { dx: number; dy: number };
  atFrom: number;
  atTo: number;
  type: TacticalRunType;
}

export interface TacticalAnimationState {
  isPlaying: boolean;
  currentScenario: TacticalScenario | null;
  progress: number;
  phaseLabel: string;
  animatedPositions: Record<number, { x: number; y: number }>;
  activePasses: TacticalPass[];
  activePresses: TacticalPress[];
  activeRuns: TacticalRun[];
  pressureZones: PressureZone[];
  speed: number;
  scenarioIndex: number;
  totalScenarios: number;
}

export interface PressureZone {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  color: string;
}

export interface UseTacticalAnimationReturn extends TacticalAnimationState {
  play: () => void;
  pause: () => void;
  stop: () => void;
  nextScenario: () => void;
  prevScenario: () => void;
  setSpeed: (speed: number) => void;
  setScenarioIndex: (index: number) => void;
  togglePlay: () => void;
}
