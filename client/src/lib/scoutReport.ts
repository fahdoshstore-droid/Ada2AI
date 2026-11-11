/**
 * Scout evaluation report model — نموذج تقييم الكشاف
 *
 * Four pillars (الفني / التكتيكي / البدني / الذهني), eight criteria each,
 * every criterion rated 1–5. The overall score is the percentage of the
 * maximum (32 criteria × 5 = 160), exactly as on the paper form.
 */

export type PillarKey = 'technical' | 'tactical' | 'physical' | 'mental'

export interface Criterion {
  key: string
  ar: string
  en: string
}

export interface Pillar {
  key: PillarKey
  ar: string
  en: string
  color: string
  criteria: Criterion[]
}

export const RATING_MIN = 1
export const RATING_MAX = 5

export const RATING_SCALE: Array<{ value: number; ar: string; en: string }> = [
  { value: 1, ar: 'ضعيف', en: 'Weak' },
  { value: 2, ar: 'مقبول', en: 'Fair' },
  { value: 3, ar: 'جيد', en: 'Good' },
  { value: 4, ar: 'جيد جداً', en: 'Very good' },
  { value: 5, ar: 'ممتاز', en: 'Excellent' },
]

export const PILLARS: Pillar[] = [
  {
    key: 'technical',
    ar: 'الفني',
    en: 'Technical',
    color: '#F4A582',
    criteria: [
      { key: 'short_pass', ar: 'التمرير القصير', en: 'Short passing' },
      { key: 'long_pass', ar: 'التمرير الطويل', en: 'Long passing' },
      { key: 'pass_accuracy', ar: 'دقة التمرير', en: 'Passing accuracy' },
      { key: 'directed_first_touch', ar: 'الاستلام الموجه', en: 'Directed first touch' },
      { key: 'body_shape', ar: 'وضعية الجسم', en: 'Body shape' },
      { key: 'scanning', ar: 'المسح', en: 'Scanning' },
      { key: 'shooting', ar: 'التصويب', en: 'Shooting' },
      { key: 'heading', ar: 'إتقان الكرات الرأسية', en: 'Heading' },
    ],
  },
  {
    key: 'tactical',
    ar: 'التكتيكي',
    en: 'Tactical',
    color: '#5BC0EB',
    criteria: [
      { key: 'positional_play', ar: 'الألعاب المركزية', en: 'Positional play' },
      { key: 'creating_space', ar: 'خلق المساحة', en: 'Creating space' },
      { key: 'role_execution', ar: 'إجادة الأدوار التكتيكية', en: 'Tactical role execution' },
      { key: 'tactical_awareness', ar: 'الوعي التكتيكي', en: 'Tactical awareness' },
      { key: 'tactical_discipline', ar: 'الانضباط التكتيكي', en: 'Tactical discipline' },
      { key: 'defensive_phase', ar: 'الحالة الدفاعية', en: 'Defensive phase' },
      { key: 'attacking_phase', ar: 'الحالة الهجومية', en: 'Attacking phase' },
      { key: 'set_pieces', ar: 'الكرات الثابتة', en: 'Set pieces' },
    ],
  },
  {
    key: 'physical',
    ar: 'البدني',
    en: 'Physical',
    color: '#A8B0BD',
    criteria: [
      { key: 'physique', ar: 'البنية الجسمانية', en: 'Physique' },
      { key: 'aerobic_endurance', ar: 'التحمل الهوائي', en: 'Aerobic endurance' },
      { key: 'flexibility', ar: 'المرونة', en: 'Flexibility' },
      { key: 'speed', ar: 'السرعة', en: 'Speed' },
      { key: 'strength', ar: 'القوة', en: 'Strength' },
      { key: 'agility', ar: 'الرشاقة', en: 'Agility' },
      { key: 'coordination', ar: 'التوافق', en: 'Coordination' },
      { key: 'balance', ar: 'التوازن', en: 'Balance' },
    ],
  },
  {
    key: 'mental',
    ar: 'الذهني',
    en: 'Mental',
    color: '#7BD389',
    criteria: [
      { key: 'personality', ar: 'الشخصية', en: 'Personality' },
      { key: 'decision_speed', ar: 'سرعة اتخاذ القرار', en: 'Decision speed' },
      { key: 'reaction_speed', ar: 'سرعة ردة الفعل', en: 'Reaction speed' },
      { key: 'comprehension', ar: 'القدرة على الاستيعاب', en: 'Comprehension' },
      { key: 'development', ar: 'التطور', en: 'Development' },
      { key: 'emotional_control', ar: 'الانضباط الانفعالي', en: 'Emotional control' },
      { key: 'communication', ar: 'التواصل', en: 'Communication' },
      { key: 'leadership', ar: 'القيادة', en: 'Leadership' },
    ],
  },
]

export const PILLAR_KEYS: PillarKey[] = PILLARS.map(p => p.key)
export const TOTAL_CRITERIA = PILLARS.reduce((n, p) => n + p.criteria.length, 0)

/** Pitch positions selectable on the form's mini pitch. x/y are % on a vertical pitch (attack = top). */
export const PITCH_POSITIONS: Array<{ code: string; ar: string; x: number; y: number }> = [
  { code: 'ST', ar: 'مهاجم', x: 50, y: 10 },
  { code: 'LW', ar: 'جناح أيسر', x: 16, y: 22 },
  { code: 'RW', ar: 'جناح أيمن', x: 84, y: 22 },
  { code: 'AM', ar: 'صانع ألعاب', x: 50, y: 30 },
  { code: 'ML', ar: 'وسط أيسر', x: 16, y: 46 },
  { code: 'MC', ar: 'محور', x: 50, y: 48 },
  { code: 'MR', ar: 'وسط أيمن', x: 84, y: 46 },
  { code: 'DM', ar: 'محور دفاعي', x: 50, y: 64 },
  { code: 'LB', ar: 'ظهير أيسر', x: 16, y: 76 },
  { code: 'CB', ar: 'قلب دفاع', x: 50, y: 80 },
  { code: 'RB', ar: 'ظهير أيمن', x: 84, y: 76 },
  { code: 'GK', ar: 'حارس', x: 50, y: 93 },
]

export type PillarRatings = Record<string, number>
export type ReportRatings = Record<PillarKey, PillarRatings>
export type ReportNotes = Record<PillarKey, string>

export interface ScoutReport {
  id: string
  scout_id: string
  /** Set when the report is about a player already on the platform. */
  player_id: string | null
  player_name: string
  birth_year: number | null
  club: string
  position: string
  pitch_positions: string[]
  target_category: string
  discovery_date: string
  match: string
  ratings: ReportRatings
  notes: ReportNotes
  scout_opinion: string
  scout_name: string
  total_score: number
  created_at: string
  updated_at: string
}

/** Fields the scout fills in; everything else is derived or set by the database. */
export type ScoutReportDraft = Omit<ScoutReport, 'id' | 'scout_id' | 'total_score' | 'created_at' | 'updated_at'>

export function emptyRatings(): ReportRatings {
  return { technical: {}, tactical: {}, physical: {}, mental: {} }
}

export function emptyDraft(today: string, scoutName = ''): ScoutReportDraft {
  return {
    player_id: null,
    player_name: '',
    birth_year: null,
    club: '',
    position: '',
    pitch_positions: [],
    target_category: '',
    discovery_date: today,
    match: '',
    ratings: emptyRatings(),
    notes: { technical: '', tactical: '', physical: '', mental: '' },
    scout_opinion: '',
    scout_name: scoutName,
  }
}

export function isValidRating(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= RATING_MIN && v <= RATING_MAX
}

/** Sum of a pillar's valid ratings and how many criteria were rated. */
export function pillarSum(pillar: Pillar, ratings: PillarRatings | undefined): { sum: number; rated: number } {
  let sum = 0
  let rated = 0
  for (const c of pillar.criteria) {
    const v = ratings?.[c.key]
    if (isValidRating(v)) {
      sum += v
      rated += 1
    }
  }
  return { sum, rated }
}

/** Pillar score as a percentage of its maximum (8 × 5 = 40). Unrated criteria count as 0. */
export function pillarPercent(pillar: Pillar, ratings: PillarRatings | undefined): number {
  const { sum } = pillarSum(pillar, ratings)
  return Math.round((sum / (pillar.criteria.length * RATING_MAX)) * 100)
}

/** إجمالي التقييم من 100% — sum of all ratings over the 160 maximum. */
export function totalScore(ratings: ReportRatings): number {
  let sum = 0
  for (const p of PILLARS) sum += pillarSum(p, ratings[p.key]).sum
  return Math.round((sum / (TOTAL_CRITERIA * RATING_MAX)) * 100)
}

export function ratedCount(ratings: ReportRatings): number {
  return PILLARS.reduce((n, p) => n + pillarSum(p, ratings[p.key]).rated, 0)
}

export function missingCriteria(ratings: ReportRatings): Array<{ pillar: PillarKey; key: string; ar: string }> {
  const out: Array<{ pillar: PillarKey; key: string; ar: string }> = []
  for (const p of PILLARS) {
    for (const c of p.criteria) {
      if (!isValidRating(ratings[p.key]?.[c.key])) out.push({ pillar: p.key, key: c.key, ar: c.ar })
    }
  }
  return out
}

export type DraftField = 'player_name' | 'birth_year' | 'position' | 'discovery_date' | 'scout_name' | 'ratings'

/** Returns the fields that block saving; empty when the report is complete. */
export function validateDraft(d: ScoutReportDraft, currentYear: number): DraftField[] {
  const errors: DraftField[] = []
  if (!d.player_name.trim()) errors.push('player_name')
  if (d.birth_year !== null && (!Number.isInteger(d.birth_year) || d.birth_year < 1950 || d.birth_year > currentYear)) {
    errors.push('birth_year')
  }
  if (!d.position.trim()) errors.push('position')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.discovery_date)) errors.push('discovery_date')
  if (!d.scout_name.trim()) errors.push('scout_name')
  if (missingCriteria(d.ratings).length > 0) errors.push('ratings')
  return errors
}

/** Strips unknown keys/invalid values so only the form's 32 criteria are persisted. */
export function sanitizeRatings(ratings: Partial<Record<PillarKey, PillarRatings>> | null | undefined): ReportRatings {
  const out = emptyRatings()
  for (const p of PILLARS) {
    for (const c of p.criteria) {
      const v = ratings?.[p.key]?.[c.key]
      if (isValidRating(v)) out[p.key][c.key] = v
    }
  }
  return out
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#00DCC8'
  if (score >= 60) return '#F59E0B'
  return '#9CA3AF'
}

export function ratingLabel(value: number, isRTL: boolean): string {
  const r = RATING_SCALE.find(s => s.value === value)
  return r ? (isRTL ? r.ar : r.en) : ''
}
