/**
 * The one evaluation catalogue used across Ada2AI.
 *
 * Four axes x eight items, each scored 1-5. A coach report and a scout report
 * fill in the same items, so the two are directly comparable for one player,
 * and a player's progress can be read item by item across the season.
 *
 * CATALOGUE_VERSION is stored with every saved report. Bump it whenever an
 * item is added, removed or reworded, so rows written under an older list stay
 * readable instead of silently changing meaning.
 */
export const CATALOGUE_VERSION = 1

export type AxisKey = 'technical' | 'tactical' | 'physical' | 'mental'

export interface Axis {
  key: AxisKey
  label: string
  /** Axis identity colour, used for its bar and selected score buttons. */
  color: string
  items: string[]
}

export const AXES: readonly Axis[] = [
  {
    key: 'technical', label: 'الفني', color: '#F4A582',
    items: ['التمرير القصير', 'التمرير الطويل', 'دقة التمرير', 'الاستلام الموجه', 'وضعية الجسم', 'المسح', 'التصويب', 'إتقان الكرات الرأسية'],
  },
  {
    key: 'tactical', label: 'التكتيكي', color: '#5BC0EB',
    items: ['الألعاب المركزية', 'خلق المساحة', 'إجادة الأدوار التكتيكية', 'الوعي التكتيكي', 'الانضباط التكتيكي', 'الحالة الدفاعية', 'الحالة الهجومية', 'الكرات الثابتة'],
  },
  {
    key: 'physical', label: 'البدني', color: '#A8B0BD',
    items: ['البنية الجسمانية', 'التحمل الهوائي', 'المرونة', 'السرعة', 'القوة', 'الرشاقة', 'التوافق', 'التوازن'],
  },
  {
    key: 'mental', label: 'الذهني', color: '#7BD389',
    items: ['الشخصية', 'سرعة اتخاذ القرار', 'سرعة ردة الفعل', 'القدرة على الاستيعاب', 'التطور', 'الانضباط الانفعالي', 'التواصل', 'القيادة'],
  },
] as const

/** Pitch slots, x/y as percentages of the pitch box, attacking end at the top. */
export const POSITIONS: readonly [string, string, number, number][] = [
  ['ST', 'مهاجم', 50, 10], ['LW', 'جناح أيسر', 16, 22], ['RW', 'جناح أيمن', 84, 22],
  ['CAM', 'صانع', 50, 32], ['LM', 'وسط أيسر', 14, 42], ['RM', 'وسط أيمن', 86, 42],
  ['CM', 'محور', 50, 50], ['CDM', 'ارتكاز', 50, 62], ['LB', 'ظهير أيسر', 14, 74],
  ['CB', 'قلب دفاع', 50, 78], ['RB', 'ظهير أيمن', 86, 74], ['GK', 'حارس', 50, 92],
]

/** Mid-point of the 1-5 scale: the starting value, and what "not judged" means. */
export const NEUTRAL = 3
export const MIN_SCORE = 1
export const MAX_SCORE = 5

/** Shape of `evaluations.details` (jsonb). See migration 20261117. */
export interface EvaluationDetails {
  version: number
  source: 'scout' | 'coach'
  axes: Partial<Record<AxisKey, { scores: number[]; note?: string }>>
  positions?: string[]
  match?: string
}

export const emptyScores = (): number[][] => AXES.map(axis => axis.items.map(() => NEUTRAL))

/** One axis as a 0-100 percentage, the scale the four numeric columns store. */
export const axisPercent = (scores: number[]): number =>
  scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / (scores.length * MAX_SCORE)) * 100) : 0

/**
 * Overall, computed the way `trg_scout_reports_before_write` computes
 * total_score: round(sum of every item / (items x 5) x 100). Averaging the
 * four rounded axis percentages instead can land 1% away from the stored
 * value, so the preview on screen would disagree with the saved report.
 */
export const overallFromScores = (scores: number[][]): number => {
  const flat = scores.flat()
  return flat.length ? Math.round((flat.reduce((a, b) => a + b, 0) / (flat.length * MAX_SCORE)) * 100) : 0
}

/** Read a saved report back into the editable grid, tolerating older rows. */
export function scoresFromDetails(details: EvaluationDetails | null | undefined): number[][] | null {
  if (!details || details.version !== CATALOGUE_VERSION) return null
  const grid = AXES.map(axis => {
    const saved = details.axes?.[axis.key]?.scores
    if (!Array.isArray(saved) || saved.length !== axis.items.length) return null
    return saved.map(n => (Number.isFinite(n) && n >= MIN_SCORE && n <= MAX_SCORE ? Math.round(n) : NEUTRAL))
  })
  return grid.every(Boolean) ? (grid as number[][]) : null
}
