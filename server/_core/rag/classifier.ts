/**
 * Intent Classifier — Ada2AI RAG System
 *
 * Keyword-scoring classifier that maps a user question to the best-matching
 * intent and extracts structured params (sport, region, playerName, table).
 */

import { intents, getIntentById, type Intent } from "./intents";

// ─── Arabic → English lookup maps ──────────────────────────────────────

const SPORT_MAP: Record<string, string> = {
  "كرة القدم": "Football",
  "كرة قدم": "Football",
  "كرة السلة": "Basketball",
  "كرة سلة": "Basketball",
  "السباحة": "Swimming",
  "سباحة": "Swimming",
  "ألعاب القوى": "Athletics",
  "التنس": "Tennis",
};

const REGION_MAP: Record<string, string> = {
  "الرياض": "Riyadh",
  "جدة": "Jeddah",
  "مكة": "Makkah",
  "المدينة": "Madinah",
  "الدمام": "Dammam",
};

/** Tables used by count_query when a specific entity is mentioned. */
const TABLE_MAP: Record<string, string> = {
  لاعب: "players",
  لاعبين: "players",
  اللاعبين: "players",
  أكاديمية: "academies",
  أكاديميات: "academies",
  كشاف: "scouts",
  كشافين: "scouts",
  كشافة: "scouts",
  player: "players",
  players: "players",
  academy: "academies",
  academies: "academies",
  scout: "scouts",
  scouts: "scouts",
};

// ─── Param extraction helpers ──────────────────────────────────────────

function extractSport(question: string): string | undefined {
  for (const [ar, en] of Object.entries(SPORT_MAP)) {
    if (question.includes(ar)) return en;
  }
  // Also check English sport names directly
  const enSports = ["Football", "Basketball", "Swimming", "Athletics", "Tennis"];
  const lower = question.toLowerCase();
  for (const s of enSports) {
    if (lower.includes(s.toLowerCase())) return s;
  }
  return undefined;
}

function extractRegion(question: string): string | undefined {
  for (const [ar, en] of Object.entries(REGION_MAP)) {
    if (question.includes(ar)) return en;
  }
  // Also check English region names directly
  const enRegions = ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam"];
  for (const r of enRegions) {
    if (question.toLowerCase().includes(r.toLowerCase())) return r;
  }
  return undefined;
}

function extractPlayerName(question: string): string | undefined {
  // Arabic: look for "اللاعب NAME" or "اللاعبين NAME" or after "لاعب"
  const arMatch = question.match(/(?:اللاعب|اللاعبين|لاعب)\s+([\u0600-\u06FF\s]+?)(?:\s+(?:في|من|عند|ب|$))/);
  if (arMatch) return arMatch[1].trim();

  // English: look for "player NAME" or "for NAME" with common patterns
  const enMatch = question.match(/(?:player\s+(?:named\s+)?|for\s+|named\s+)([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (enMatch) return enMatch[1].trim();

  return undefined;
}

function extractTable(question: string): string | undefined {
  for (const [keyword, table] of Object.entries(TABLE_MAP)) {
    if (question.includes(keyword)) return table;
  }
  return undefined;
}

// ─── Main classifier ───────────────────────────────────────────────────

export interface ClassifyResult {
  intent: Intent;
  params: Record<string, string>;
}

/**
 * Classify a user question into an intent using keyword scoring.
 *
 * For each intent, count how many of its keywords appear in the question.
 * Pick the intent with the highest score. If no intent scores >= 1,
 * fall back to `general_sport`.
 *
 * Params are extracted from the question text (sport, region, playerName, table).
 */
export function classifyIntent(question: string): ClassifyResult {
  const normalised = question.trim();

  // ── Keyword scoring ─────────────────────────────────────────────────
  let bestIntent: Intent = getIntentById("general_sport")!;
  let bestScore = 0;

  for (const intent of intents) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (normalised.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // If nothing matched at all, default to general_sport
  if (bestScore < 1) {
    bestIntent = getIntentById("general_sport")!;
  }

  // ── Param extraction ────────────────────────────────────────────────
  const params: Record<string, string> = {};

  const sport = extractSport(normalised);
  if (sport) params.sport = sport;

  const region = extractRegion(normalised);
  if (region) params.region = region;

  const playerName = extractPlayerName(normalised);
  if (playerName) params.playerName = playerName;

  // For count_query, extract which table to count
  if (bestIntent.id === "count_query") {
    const table = extractTable(normalised);
    if (table) params.table = table;
  }

  return { intent: bestIntent, params };
}