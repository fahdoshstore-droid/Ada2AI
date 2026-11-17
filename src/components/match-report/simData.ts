/**
 * Illustrative match for the shared report — an example, not a real game,
 * and not any particular club's: every coach and player sees the same one
 * until his own team has an analysed match.
 *
 * It replaced the first version built from video-game screens (Al Hilal 6-0)
 * because that one promised numbers the platform cannot produce: shots, xG,
 * an automatic rating out of 10. This one only shows what Ada2AI can
 * actually source, grouped by where each number comes from:
 *   coach — entered by the coach after the match (scout-blue)
 *   cv    — estimated from single-camera video (teal)
 *   none  — not available yet; no number is shown at all
 * Tracks are anonymous until the coach links them to a Sport ID, exactly as
 * in /coach/match-analysis. The example players are deliberately unnamed
 * ("لاعب 1"); no example figure is ever attached to a real club player.
 */
export type ReportRole = 'coach' | 'player' | 'scout'
export type ReportTab = 'team' | 'players' | 'sport-id'

export const EXAMPLE_MATCH = { home: 'فريقك', away: 'المنافس', homeMono: 'ف', awayMono: 'م', homeScore: 2, awayScore: 1, possession: { home: 57, away: 43 } }

/** [minute, event, who, isOpponent] */
export const EVENTS: [string, string, string, boolean][] = [
  ['23', 'هدف', 'مهاجم فريقك', false], ['41', 'بطاقة صفراء', 'لاعب من المنافس', true],
  ['58', 'هدف', 'وسط فريقك', false], ['64', 'تبديل', 'فريقك', false],
  ['71', 'هدف', 'المنافس', true], ['83', 'بطاقة صفراء', 'ظهير فريقك', false],
]
export const CV_STATS: [string, number, number][] = [
  ['الوجود في الثلث الهجومي %', 38, 29], ['نشاط الفريق من 100', 72, 64], ['مسارات متتبَّعة', 14, 13],
]
export const COACH_STATS: [string, number, number][] = [
  ['الأهداف', 2, 1], ['الركنيات', 5, 3], ['بطاقات صفراء', 1, 2], ['التبديلات', 3, 2],
]
export const NOT_AVAILABLE: [string, string][] = [
  ['التسديدات والأهداف المتوقعة', 'يحتاج كشف أحداث'],
  ['التمريرات ودقتها', 'يحتاج كشف أحداث'],
  ['التدخلات والاعتراضات', 'يحتاج كشف أحداث'],
  ['المسافة والسرعة بالمتر', 'يحتاج معايرة الملعب'],
  ['تقييم آلي للاعب من 10', 'غير مبني، التقييم من المدرب'],
]

export interface ExampleTrack {
  index: number; pos: string; track: string; x: number; y: number
  linked: boolean; name: string | null; sportId: string | null
  /** Coach's overall out of 10, or null when he has not rated the player. */
  rating: number | null
  goals: number; activity: number; touches: number; speed: number
  zones: [number, number, number]
  /** Coach axes: فني، تكتيكي، بدني، ذهني */
  evaluation: number[] | null
}

function seeded(seed: number) {
  let s = seed * 9301 + 49297
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

const RAW: [string, string, number, number, boolean, number | null, number][] = [
  ['حارس', 'T-01', 50, 93, true, 7.0, 0], ['ظهير أيسر', 'T-07', 14, 74, true, 6.5, 0], ['قلب دفاع', 'T-11', 38, 78, false, null, 0],
  ['قلب دفاع', 'T-12', 62, 78, true, 7.5, 0], ['ظهير أيمن', 'T-15', 86, 74, true, null, 0], ['وسط', 'T-18', 30, 54, false, null, 1],
  ['محور', 'T-21', 50, 58, true, 8.0, 0], ['وسط', 'T-22', 70, 54, true, 7.0, 0], ['جناح أيسر', 'T-26', 16, 26, false, null, 0],
  ['مهاجم', 'T-29', 50, 16, true, 8.5, 1], ['جناح أيمن', 'T-31', 84, 26, false, null, 0],
]

export function buildExampleTracks(): ExampleTrack[] {
  let n = 0
  return RAW.map((a, index) => {
    const r = seeded(index + 11)
    const linked = a[4]
    if (linked) n++
    const att = a[3] < 40 ? 55 : a[3] < 65 ? 30 : 12
    const mid = a[3] < 40 ? 33 : a[3] < 65 ? 45 : 28
    const activity = Math.round(55 + r() * 35)
    const touches = Math.round(18 + r() * 40)
    const speed = Math.round(19 + r() * 9)
    const rating = a[5]
    return {
      index, pos: a[0], track: a[1], x: a[2], y: a[3], linked,
      name: linked ? `لاعب ${n}` : null,
      sportId: linked ? `SID-2026-9${String(index + 1).padStart(4, '0')}` : null,
      rating, goals: a[6], activity, touches, speed,
      zones: a[0] === 'حارس' ? [94, 6, 0] : [100 - att - mid, mid, att],
      evaluation: rating ? [rating + 0.5, rating - 0.5, rating, rating + (r() > 0.5 ? 0.5 : -0.5)].map(v => Math.max(1, Math.min(10, v))) : null,
    }
  })
}

/** The example player the "player" role sees when his own account has no match yet. */
export const EXAMPLE_OWN_INDEX = 9

/** The one place that decides what each role sees. */
export const ROLE_VIEW: Record<ReportRole, { tabs: [ReportTab, string][]; hint: string }> = {
  coach: { tabs: [['team', 'الفريق'], ['players', 'اللاعبون'], ['sport-id', 'Sport ID']], hint: 'المدرب يرى التقرير كاملاً، ويربط المسارات المجهولة بلاعبيه.' },
  player: { tabs: [['players', 'أدائي'], ['sport-id', 'بطاقتي']], hint: 'اللاعب يرى أداءه هو فقط، وبعد أن يربطه المدرب بهويته.' },
  scout: { tabs: [['players', 'اللاعبون'], ['sport-id', 'Sport ID']], hint: 'الكشاف يرى اللاعبين المرتبطين بهوية فقط. المسارات المجهولة لا تظهر له.' },
}
