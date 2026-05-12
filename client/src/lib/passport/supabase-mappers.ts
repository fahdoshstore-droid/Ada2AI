/**
 * Supabase → Passport type mappers
 * Maps Supabase Player/Profile/Evaluation data to passport Athlete shape
 */
import type { Player, Profile, Evaluation } from '@/lib/supabase';
import type { Athlete } from '@/lib/passport/types';
import { getLevelInfo } from '@/lib/passport/levels';

/**
 * Derive sport points from an array of evaluations.
 * Each evaluation has technical + tactical + physical + mental (each out of 100).
 * We average these and multiply by 5 to get a cumulative point value,
 * then sum across all evaluations.
 */
export function computeSportPoints(evaluations: Evaluation[]): number {
  if (!evaluations.length) return 0;
  return evaluations.reduce((sum, ev) => {
    const avg = (ev.technical + ev.tactical + ev.physical + ev.mental) / 4;
    // Scale average (0-100) to points (0-25) per evaluation
    return sum + Math.round(avg / 4);
  }, 0);
}

/**
 * Derive a career score (0-100) from the most recent evaluation
 */
export function computeCareerScore(evaluations: Evaluation[]): number {
  if (!evaluations.length) return 0;
  const latest = evaluations[0]; // assumed sorted desc by date
  return latest.overall;
}

/**
 * Derive radar data from evaluations
 */
export function computeRadarData(evaluations: Evaluation[]) {
  if (!evaluations.length) {
    return [
      { subject: 'Technical', A: 0 },
      { subject: 'Tactical', A: 0 },
      { subject: 'Physical', A: 0 },
      { subject: 'Mental', A: 0 },
    ];
  }
  const latest = evaluations[0];
  return [
    { subject: 'Technical', A: latest.technical },
    { subject: 'Tactical', A: latest.tactical },
    { subject: 'Physical', A: latest.physical },
    { subject: 'Mental', A: latest.mental },
  ];
}

/**
 * Map a Supabase Player (with joined Profile) + Evaluations → passport Athlete type
 */
export function mapPlayerToAthlete(
  player: Player & { profile?: Profile },
  evaluations: Evaluation[] = [],
): Athlete {
  const profile = player.profile;
  const sportPoints = computeSportPoints(evaluations);
  const levelInfo = getLevelInfo(sportPoints);
  const sport = profile?.sport || 'Football';

  return {
    id: player.id,
    sportId: player.id, // Use player ID as sport ID
    name: profile?.full_name || '—',
    nameAr: '', // Not available in Supabase
    age: player.age || 0,
    city: profile?.city || '—',
    region: profile?.region || '—',
    sports: sport ? [sport] : ['Football'],
    sportPoints,
    level: levelInfo.level,
    joinedAt: player.created_at || new Date().toISOString(),
    certifications: [],
    achievements: [],
    sessions: evaluations.map((ev, idx) => ({
      id: ev.id,
      facilityId: '',
      facilityName: ev.notes || 'Training Session',
      sport,
      date: ev.evaluation_date || ev.created_at || new Date().toISOString(),
      duration: 60, // default
      points: Math.round((ev.technical + ev.tactical + ev.physical + ev.mental) / 16),
      verifiedAt: ev.created_at || new Date().toISOString(),
    })),
    careerScore: computeCareerScore(evaluations),
    guardianConsent: false,
  };
}