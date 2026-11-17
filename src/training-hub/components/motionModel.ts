export interface SavedEvent {
  minute: number | string; team?: string; player?: string; provenance?: string;
  players?: { name: string; direction: string }[];
}
export interface MotionReport {
  status: string; match_id: string | null; run_id?: string | null;
  external_match_data?: {
    provenance?: string;
    formations?: Record<string, string>;
    goals?: Record<string, SavedEvent[]>;
    cards?: SavedEvent[];
    substitutions?: Record<string, SavedEvent[]>;
    period_stats?: Record<string, Record<string, { possession_pct?: number }>>;
    sources?: { name: string; url?: string }[];
  };
}
export interface MotionEvent extends SavedEvent { kind: string; period: number; order: number; minuteLabel: string }
// Keep added time in its own half: 45+2 must precede second-half minute 46.
export function eventTime(value: unknown, period?: number) {
  const match = /^(\d{1,3})(?:\+(\d{1,2}))?$/.exec(String(value));
  if (!match) return null;
  const base = Number(match[1]);
  const half = period ?? (base <= 45 ? 1 : 2);
  if (base > 120) return null;
  return { period: half, order: base + Number(match[2] || 0), minuteLabel: String(value) };
}
export function motionModel(report: MotionReport, matchId: string) {
  if (report.status !== 'success' || report.match_id !== matchId) throw new Error('هوية التقرير لا تطابق المباراة');
  const data = report.external_match_data;
  const verified = (value?: string) => value === 'EXTERNAL VERIFIED' || value === 'verified';
  const teams = verified(data?.provenance) ? Object.entries(data?.formations || {}).filter(([, shape]) => {
    const lines = shape.split('-').map(Number);
    return /^\d(?:-\d){2,4}$/.test(shape) && lines.every(n => n > 0 && n <= 5) && lines.reduce((a, b) => a + b, 0) === 10;
  }) : [];
  const events: MotionEvent[] = [];
  const add = (items: SavedEvent[], kind: string, period?: number, team?: string) => items.forEach(item => {
    const time = eventTime(item.minute, period);
    if (time && verified(item.provenance)) events.push({ ...item, team: item.team || team, kind, ...time });
  });
  Object.entries(data?.goals || {}).forEach(([period, items]) => {
    if (period === 'first_half' || period === 'second_half') add(items, 'هدف', period === 'first_half' ? 1 : 2);
  });
  add(data?.cards || [], 'بطاقة');
  Object.entries(data?.substitutions || {}).forEach(([team, items]) => add(items, 'تبديل', undefined, team));
  events.sort((a, b) => a.period - b.period || a.order - b.order);
  const halfEnds = [Math.max(45, ...events.filter(e => e.period === 1).map(e => e.order)), Math.max(90, ...events.filter(e => e.period === 2).map(e => e.order))];
  const offset = (event: MotionEvent) => event.period === 1 ? event.order : halfEnds[0] + event.order - 45;
  return { teams: teams.slice(0, 2), events: events.map(e => ({ ...e, at: offset(e) })), halfEnds, duration: halfEnds[0] + halfEnds[1] - 45, data };
}
// Schematic positions are deliberately anonymous. No starter-to-slot assignment is inferred.
export function formationPoints(shape: string, side: number, minute: number, possession?: number) {
  const lines = [1, ...shape.split('-').map(Number)];
  const pressure = typeof possession === 'number' && possession >= 0 && possession <= 100 ? (possession - 50) / 50 : 0;
  return lines.flatMap((count, line) => Array.from({ length: count }, (_, slot) => {
    const x = 6 + line * 38 / (lines.length - 1);
    const y = (slot + 1) * 68 / (count + 1);
    // Illustrative collective movement only, not inferred event trajectories or ball paths.
    const shift = line === 0 ? 0 : Math.sin(minute * Math.PI / 3) * 1.5 + pressure * 4;
    return { x: side === 0 ? x + shift : 105 - x - shift, y: y + (line === 0 ? 0 : Math.sin(minute * Math.PI / 4 + line) * 1.2) };
  }));
}
