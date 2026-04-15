/**
 * DHEEB Eye — Core Types
 * Web-native AI companion with voice, vision, and cursor-pointing
 */

// ── Action Types ──────────────────────────────────────────────────────────

export type EyeActionType =
  | 'point'       // Cursor points at a DOM element or coordinates
  | 'highlight'   // Highlight an area (green/red/yellow)
  | 'speak'       // TTS output in Arabic
  | 'listen'      // Activate voice capture
  | 'capture'     // Screenshot the current view
  | 'analyze'     // Send captured frame to Claude Vision
  | 'factcheck';  // (RealityScanner) Verify a claim visually

export type EyeState =
  | 'idle'
  | 'listening'   // Voice capture active
  | 'thinking'    // Processing with Claude Vision
  | 'speaking'    // TTS output active
  | 'pointing'    // Cursor animation active
  | 'error';

export type EyeContext = 'coach' | 'factcheck';

// ── Cursor ────────────────────────────────────────────────────────────────

export interface CursorPoint {
  /** X position as percentage (0-100) or pixel offset */
  x: number;
  /** Y position as percentage (0-100) or pixel offset */
  y: number;
  /** CSS selector to point at (preferred over x/y) */
  targetSelector?: string;
  /** Arabic label shown beside cursor */
  label?: string;
  /** Cursor color, defaults to Eye teal #00DCC8 */
  color?: string;
  /** Unit type for x/y values */
  unit?: 'percent' | 'pixel';
}

// ── Highlight ─────────────────────────────────────────────────────────────

export type HighlightZone =
  | 'penalty-area'
  | 'goal-area'
  | 'center-circle'
  | 'left-wing'
  | 'right-wing'
  | 'midfield'
  | 'defensive-third'
  | 'attacking-third';

export type HighlightColor = 'teal' | 'green' | 'red' | 'yellow' | 'blue';

export interface EyeHighlight {
  zone: HighlightZone | string;
  color: HighlightColor;
  label?: string;
  opacity?: number;
}

export interface EyeArrow {
  from: CursorPoint;
  to: CursorPoint;
  color?: string;
  label?: string;
  animated?: boolean;
}

// ── Actions ────────────────────────────────────────────────────────────────

export interface EyeAction {
  id: string;
  type: EyeActionType;
  payload: Record<string, unknown>;
  messageAr: string;
  messageEn: string;
}

// ── Fact-Check (RealityScanner) ────────────────────────────────────────────

export type FactCheckVerdict = 'verified' | 'false' | 'misleading' | 'unverified';

export interface FactCheckHighlight {
  claim: string;
  verdict: FactCheckVerdict;
  confidence: number;
  bbox?: { x: number; y: number; w: number; h: number };
  messageAr: string;
  messageEn: string;
}

// ── Vision ─────────────────────────────────────────────────────────────────

export interface VisionAnalysisResult {
  description: string;
  descriptionAr: string;
  objects: VisionObject[];
  suggestions: string[];
  suggestionsAr: string[];
}

export interface VisionObject {
  label: string;
  labelAr: string;
  confidence: number;
  bbox?: { x: number; y: number; w: number; h: number };
}

// ── Session ────────────────────────────────────────────────────────────────

export interface EyeSession {
  id: string;
  actions: EyeAction[];
  currentIndex: number;
  state: EyeState;
  transcript?: string;
  visionResult?: VisionAnalysisResult;
  factCheckResults?: FactCheckHighlight[];
  startedAt: number;
  completedAt?: number;
}

// ── Config ─────────────────────────────────────────────────────────────────

export interface EyeConfig {
  language: 'ar' | 'en';
  voiceEnabled: boolean;
  ttsEnabled: boolean;
  visionEnabled: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number;   // ms between actions
  cursorDuration: number;     // ms cursor stays visible
  claudeModel: string;        // default: 'claude-sonnet-4-20250514'
  visionEndpoint?: string;    // e.g. '/api/eye/vision'
  whisperEndpoint?: string;   // e.g. '/api/trpc/voice.transcribe'
  context: EyeContext;
}

export const DEFAULT_EYE_CONFIG: EyeConfig = {
  language: 'ar',
  voiceEnabled: true,
  ttsEnabled: true,
  visionEnabled: true,
  autoAdvance: true,
  autoAdvanceDelay: 2000,
  cursorDuration: 3000,
  claudeModel: 'claude-sonnet-4-20250514',
  context: 'coach',
};

// ── Callbacks ──────────────────────────────────────────────────────────────

export interface EyeCallbacks {
  onStateChange?: (state: EyeState) => void;
  onActionComplete?: (action: EyeAction) => void;
  onSessionEnd?: (session: EyeSession) => void;
  onError?: (error: Error) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onVisionResult?: (result: VisionAnalysisResult) => void;
}