/**
 * PitchView — Ada2AI Coach Workspace «تشكيل الفريق»
 *
 * - Players are placed by their real position (حارس/مدافع/وسط/مهاجم), not by
 *   list order. Players without a recorded position fill the slots left over.
 * - Tap a position to choose who plays there (or leave it vacant); choosing a
 *   player who is already on the pitch swaps the two.
 * - Drag a player to fine-tune the shape.
 * - Vacant positions look vacant — never a fake "لاعب 9".
 * - «حركة اللاعب»: for a player the coach has linked to a track in an analysed,
 *   calibrated match (error ≤ 3 m), his real positions are drawn on this pitch.
 *   Without that chain the panel says what is missing; nothing is invented.
 */
import { useState, useRef, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, X, MapPin, Footprints } from 'lucide-react'
import type { Player } from '../../lib/supabase'
import { getPlayerMovement, type PlayerMovement } from '../../services/playerMovement'
import { PITCH_LENGTH, PITCH_WIDTH, SPARSE_POINTS_THRESHOLD, buildDensityGrid, MAX_HEATMAP_ERROR_METERS } from '../../services/calibration'

// ── Formations ──────────────────────────────────────────────

interface PlayerPos { x: number; y: number }
type Role = 'gk' | 'def' | 'mid' | 'fwd'
interface Slot extends PlayerPos { role: Role }

const gk: Slot = { x: 50, y: 88, role: 'gk' }
const d = (x: number, y = 66): Slot => ({ x, y, role: 'def' })
const m = (x: number, y = 43): Slot => ({ x, y, role: 'mid' })
const f = (x: number, y = 18): Slot => ({ x, y, role: 'fwd' })

const FORMATIONS = {
  '4-3-3': [gk, d(20, 68), d(40, 65), d(60, 65), d(80, 68), m(30, 44), m(50, 42), m(70, 44), f(20, 20), f(50, 16), f(80, 20)],
  '4-4-2': [gk, d(20, 68), d(40, 65), d(60, 65), d(80, 68), m(20, 44), m(40, 44), m(60, 44), m(80, 44), f(35, 18), f(65, 18)],
  '4-2-3-1': [gk, d(20, 68), d(40, 65), d(60, 65), d(80, 68), m(38, 50), m(62, 50), m(20, 32), m(50, 30), m(80, 32), f(50, 14)],
  '3-5-2': [gk, d(25, 65), d(50, 62), d(75, 65), m(12, 44), m(30, 42), m(50, 40), m(70, 42), m(88, 44), f(35, 18), f(65, 18)],
  '3-4-3': [gk, d(25, 65), d(50, 62), d(75, 65), m(15, 44), m(38, 44), m(62, 44), m(85, 44), f(20, 20), f(50, 16), f(80, 20)],
  '5-3-2': [gk, d(10, 62), d(30, 67), d(50, 68), d(70, 67), d(90, 62), m(30, 44), m(50, 42), m(70, 44), f(35, 18), f(65, 18)],
} satisfies Record<string, Slot[]>

export type FormationKey = keyof typeof FORMATIONS
export const FORMATION_KEYS = Object.keys(FORMATIONS) as FormationKey[]

// ── Role from the player's recorded position ────────────────

function classifyRole(position?: string | null): Role | null {
  if (!position) return null
  const p = position.toLowerCase().trim()
  if (/حارس|goalkeeper|keeper|\bgk\b/.test(p)) return 'gk'
  if (/مدافع|دفاع|ظهير|defender|\bback\b|\bcb\b|\blb\b|\brb\b/.test(p)) return 'def'
  if (/مهاجم|هجوم|رأس حربة|جناح|forward|striker|winger|\bst\b|\bfw\b|\bcf\b/.test(p)) return 'fwd'
  if (/وسط|محور|صانع|midfield|\bcm\b|\bdm\b|\bam\b/.test(p)) return 'mid'
  return null
}

const ROLE_COLORS: Record<Role, { bg: string; border: string; glow: string; label: string }> = {
  gk:  { bg: 'linear-gradient(135deg, #FF8C00, #FF6B35)', border: '#FF6B35', glow: '#FF6B3560', label: 'حارس' },
  def: { bg: 'linear-gradient(135deg, #00D4FF, #0080FF)', border: '#00D4FF', glow: '#00D4FF60', label: 'مدافع' },
  mid: { bg: 'linear-gradient(135deg, #00FF88, #00CC66)', border: '#00FF88', glow: '#00FF8860', label: 'وسط' },
  fwd: { bg: 'linear-gradient(135deg, #FF4444, #CC2222)', border: '#FF4444', glow: '#FF444460', label: 'مهاجم' },
}

/** Fill slots of the matching role first, then put players with no (or a
 *  surplus) position in the remaining slots, midfield first. */
function autoAssign(players: Player[], slots: Slot[]): (string | null)[] {
  const out: (string | null)[] = slots.map(() => null)
  const pool = [...players]
  const take = (pred: (p: Player) => boolean) => {
    const i = pool.findIndex(pred)
    return i === -1 ? null : pool.splice(i, 1)[0]
  }
  slots.forEach((slot, i) => {
    const p = take(pl => classifyRole(pl.position) === slot.role)
    if (p) out[i] = p.id
  })
  const order = (['mid', 'def', 'fwd', 'gk'] as Role[])
  for (const role of order) {
    slots.forEach((slot, i) => {
      if (out[i] || slot.role !== role) return
      const p = take(pl => classifyRole(pl.position) === null) ?? (role !== 'gk' ? take(() => true) : null)
      if (p) out[i] = p.id
    })
  }
  return out
}

// ── Movement overlay: pitch metres → % inside the drawn field ──
// Field rect in the SVG: x 5..95 (width), y 3..97 (length). The pitch is
// portrait; a player's x (length, ±52.5) runs top→bottom. Attack direction in
// the video is unknown, so the overlay is drawn as the camera saw it.
function toField(px: number, py: number) {
  return {
    left: 5 + ((py + PITCH_WIDTH / 2) / PITCH_WIDTH) * 90,
    top: 3 + ((px + PITCH_LENGTH / 2) / PITCH_LENGTH) * 94,
  }
}

function movementMessage(mv: PlayerMovement): string {
  switch (mv.status) {
    case 'not_linked': return 'لم يُربط هذا اللاعب بعد بلاعب ظهر في فيديو مباراة. حدّده في «تحليل المباراة» ← «هوية اللاعبين».'
    case 'no_calibration': return 'اللاعب ظهر في مباراة محلَّلة، لكن ملعب تلك المباراة لم يُضبط بعد، فلا يمكن رسم حركته.'
    case 'error_too_high': return `ضبط ملعب تلك المباراة غير دقيق${mv.errorMeters != null ? ` (هامش خطأ ${mv.errorMeters.toFixed(1)} م)` : ''}، والحد ${MAX_HEATMAP_ERROR_METERS} م. أعد ضبط الملعب لتظهر الحركة.`
    case 'no_positions': return 'لا توجد مواقع محفوظة لهذا اللاعب في المباراة المحلَّلة.'
    default: return ''
  }
}

// ── Component ───────────────────────────────────────────────

interface PitchViewProps {
  players: Player[]
  formation: FormationKey
  onFormationChange: (f: FormationKey) => void
}

export default function PitchView({ players, formation, onFormationChange }: PitchViewProps) {
  const slots: Slot[] = FORMATIONS[formation]
  const playerById = useMemo(() => new Map(players.map(p => [p.id, p])), [players])

  // Manual choices override the automatic placement; reset with the formation.
  const [manual, setManual] = useState<{ key: string; ids: (string | null)[] } | null>(null)
  const autoIds = useMemo(() => autoAssign(players, slots), [players, slots])
  const assignment = manual && manual.key === formation ? manual.ids : autoIds

  const [offsets, setOffsets] = useState<Record<string, PlayerPos>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [showMovement, setShowMovement] = useState(true)
  const [dragInfo, setDragInfo] = useState<{ slot: number; startX: number; startY: number; moved: boolean } | null>(null)
  const pitchRef = useRef<HTMLDivElement>(null)

  const selectedPlayerId = selected != null ? assignment[selected] : null
  const movement = useQuery({
    queryKey: ['player-movement', selectedPlayerId],
    queryFn: () => getPlayerMovement(selectedPlayerId as string),
    enabled: !!selectedPlayerId,
    staleTime: 60_000,
  })

  const changeFormation = (key: FormationKey) => {
    onFormationChange(key)
    setOffsets({})
    setSelected(null)
  }

  const assign = (slot: number, playerId: string | null) => {
    const next = [...assignment]
    const other = playerId ? next.indexOf(playerId) : -1
    if (other !== -1 && other !== slot) next[other] = next[slot] // swap
    next[slot] = playerId
    setManual({ key: formation, ids: next })
  }

  const posOf = (i: number): PlayerPos => offsets[`${formation}:${i}`] ?? slots[i]

  // ── Drag (a press without movement is a tap → select) ──
  const point = (e: React.MouseEvent | React.TouchEvent) =>
    'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY }

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent, slot: number) => {
    e.stopPropagation()
    const p = point(e)
    setDragInfo({ slot, startX: p.x, startY: p.y, moved: false })
  }, [])

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragInfo || !pitchRef.current) return
    const p = point(e)
    if (!dragInfo.moved && Math.hypot(p.x - dragInfo.startX, p.y - dragInfo.startY) < 5) return
    e.preventDefault()
    const rect = pitchRef.current.getBoundingClientRect()
    const x = Math.min(95, Math.max(5, ((p.x - rect.left) / rect.width) * 100))
    const y = Math.min(95, Math.max(5, ((p.y - rect.top) / rect.height) * 100))
    setOffsets(prev => ({ ...prev, [`${formation}:${dragInfo.slot}`]: { x, y } }))
    if (!dragInfo.moved) setDragInfo({ ...dragInfo, moved: true })
  }, [dragInfo, formation])

  const onUp = useCallback(() => {
    if (dragInfo && !dragInfo.moved) setSelected(s => (s === dragInfo.slot ? null : dragInfo.slot))
    setDragInfo(null)
  }, [dragInfo])

  const placedIds = new Set(assignment.filter(Boolean) as string[])
  const bench = players.filter(p => !placedIds.has(p.id))
  const placedCount = placedIds.size
  const mv = movement.data
  const drawMovement = showMovement && mv?.status === 'ok' && mv.points.length > 0
  const sparse = drawMovement && mv!.points.length < SPARSE_POINTS_THRESHOLD
  const grid = drawMovement && !sparse ? buildDensityGrid(mv!.points, 12, 18) : null

  return (
    <div dir="rtl" className="space-y-3">
      {/* Formation selector */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="relative">
          <label htmlFor="formation-select" className="sr-only">خطة اللعب</label>
          <select
            id="formation-select"
            value={formation}
            onChange={e => changeFormation(e.target.value as FormationKey)}
            className="cursor-pointer appearance-none rounded-xl py-2 pl-8 pr-4 text-sm font-bold outline-none arabic-text"
            style={{ background: 'rgba(0,194,168,0.1)', border: '1px solid rgba(0,194,168,0.3)', color: '#00DCC8' }}
          >
            {FORMATION_KEYS.map(key => (
              <option key={key} value={key} style={{ background: '#0D1526' }}>{key}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: '#00DCC8' }} />
        </div>
      </div>

      {/* Pitch */}
      <div
        ref={pitchRef}
        className="relative select-none overflow-hidden rounded-2xl"
        style={{ height: '420px', cursor: dragInfo?.moved ? 'grabbing' : 'default', userSelect: 'none', touchAction: dragInfo ? 'none' : 'auto' }}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={() => setDragInfo(null)}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a2e1a 0%, #0d3d22 30%, #0f4a28 50%, #0d3d22 70%, #0a2e1a 100%)' }} />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <rect x="5" y="3" width="90" height="94" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.4)" />
          <rect x="25" y="3" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <rect x="35" y="3" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <rect x="25" y="79" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <rect x="35" y="89" width="30" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />

          {/* Real movement of the selected player (calibrated data only) */}
          {grid && grid.counts.map((row, r) => row.map((count, c) => count === 0 ? null : (
            <rect key={`${r}-${c}`} x={5 + (c / grid.cols) * 90} y={3 + (r / grid.rows) * 94} width={90 / grid.cols} height={94 / grid.rows}
              fill={`rgba(0,220,200,${Math.max(0.1, (count / grid.maxCount) * 0.7)})`} />
          )))}
          {drawMovement && (
            <polyline
              points={mv!.points.map(p => { const q = toField(p.x, p.y); return `${q.left},${q.top}` }).join(' ')}
              fill="none" stroke="rgba(0,220,200,0.85)" strokeWidth="1.5" strokeDasharray="4 3" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {/* Dots as HTML so they stay round on the stretched pitch */}
        {drawMovement && mv!.points.map((p, i) => {
          const q = toField(p.x, p.y)
          const last = i === mv!.points.length - 1
          return (
            <span
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${q.left}%`, top: `${q.top}%`, width: last ? 10 : 6, height: last ? 10 : 6, background: last ? '#00DCC8' : 'rgba(0,220,200,0.75)', boxShadow: last ? '0 0 8px rgba(0,220,200,0.9)' : undefined, zIndex: 5 }}
              title={p.timestamp != null ? `${p.timestamp.toFixed(1)} ث` : undefined}
            />
          )
        })}

        {/* Positions */}
        {slots.map((slot, i) => {
          const pos = posOf(i)
          const id = assignment[i]
          const player = id ? playerById.get(id) : undefined
          const rc = ROLE_COLORS[slot.role]
          const isSel = selected === i
          const isDragging = dragInfo?.slot === i && dragInfo.moved
          const name = player?.name?.split(' ')[0]
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={player ? `${player.name} — ${rc.label}` : `مركز ${rc.label} شاغر`}
              aria-pressed={isSel}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(s => (s === i ? null : i)) } }}
              className="group absolute flex flex-col items-center outline-none"
              style={{
                left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)',
                zIndex: isDragging ? 50 : isSel ? 30 : 10,
                cursor: player ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
                transition: isDragging ? 'none' : 'left 0.15s, top 0.15s',
              }}
              onMouseDown={e => onDown(e, i)}
              onTouchStart={e => onDown(e, i)}
            >
              {player ? (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: rc.bg,
                    boxShadow: isSel ? `0 0 0 3px #EEEFEE, 0 0 18px ${rc.glow}` : `0 0 12px ${rc.glow}`,
                    transform: isDragging ? 'scale(1.15)' : undefined,
                  }}
                >
                  <span className="text-xs font-black leading-none text-white">{player.jersey_number ?? i + 1}</span>
                </div>
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed text-lg leading-none"
                  style={{ borderColor: isSel ? '#EEEFEE' : 'rgba(238,239,238,0.35)', color: 'rgba(238,239,238,0.5)', background: 'rgba(0,0,0,0.2)' }}
                >
                  +
                </div>
              )}
              <div
                className="pointer-events-none mt-0.5 whitespace-nowrap rounded px-1.5 py-0.5 text-center arabic-text"
                style={{ fontSize: '9px', color: player ? '#fff' : 'rgba(238,239,238,0.55)', background: 'rgba(0,0,0,0.6)' }}
              >
                {player ? name : `${rc.label} — شاغر`}
              </div>
            </div>
          )
        })}

        <div className="absolute bottom-3 left-3 rounded-lg px-3 py-1 text-xs font-black" style={{ background: 'rgba(0,0,0,0.5)', color: '#00DCC8', border: '1px solid rgba(0,194,168,0.2)' }}>
          {formation}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg px-2 py-1 text-xs arabic-text" style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.55)' }}>
          اضغط على مركز لاختيار لاعب · اسحب للتحريك
        </div>
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {Object.entries(ROLE_COLORS).map(([role, rc]) => (
            <div key={role} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ background: rc.bg }} />
              <span className="arabic-text" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>{rc.label}</span>
            </div>
          ))}
        </div>

        {players.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm arabic-text" style={{ color: 'rgba(255,255,255,0.5)' }}>لا يوجد لاعبون في قائمتك بعد — أضف لاعبين لبناء التشكيل</p>
          </div>
        )}
      </div>

      {/* Selected position panel */}
      {selected != null && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-ice-white arabic-text">مركز {ROLE_COLORS[slots[selected].role].label}</p>
            <button type="button" onClick={() => setSelected(null)} aria-label="إغلاق" className="rounded-lg p-1 text-ice-muted hover:text-ice-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div>
            <label htmlFor="slot-player" className="mb-1 block text-xs text-ice-muted arabic-text">اللاعب في هذا المركز</label>
            <select
              id="slot-player"
              value={assignment[selected] ?? ''}
              onChange={e => assign(selected, e.target.value || null)}
              className="w-full rounded-lg border border-white/10 bg-[#05080f] px-3 py-2 text-sm text-ice-white outline-none focus:border-teal-prime/50 arabic-text"
            >
              <option value="">— مركز شاغر —</option>
              {players.map(p => {
                const role = classifyRole(p.position)
                const where = assignment.indexOf(p.id)
                return (
                  <option key={p.id} value={p.id}>
                    {p.name || 'بدون اسم'} · {role ? ROLE_COLORS[role].label : 'مركزه غير محدد'}{where !== -1 && where !== selected ? ' · في التشكيل (سيُبدَّل)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Movement */}
          {selectedPlayerId && (
            <div className="space-y-2 border-t border-white/10 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-bold text-ice-white arabic-text">
                  <Footprints className="h-4 w-4 text-teal-prime" />
                  حركة اللاعب في آخر مباراة محلَّلة
                </p>
                {mv?.status === 'ok' && (
                  <label className="flex items-center gap-2 text-xs text-ice-muted arabic-text">
                    <input type="checkbox" checked={showMovement} onChange={e => setShowMovement(e.target.checked)} className="accent-teal-prime" />
                    إظهارها على الملعب
                  </label>
                )}
              </div>
              {movement.isLoading && <p className="text-xs text-ice-muted arabic-text">جارٍ التحميل…</p>}
              {movement.isError && <p className="text-xs text-red-400 arabic-text">تعذّر تحميل حركة اللاعب. حاول مرة أخرى.</p>}
              {mv && mv.status !== 'ok' && (
                <p className="flex items-start gap-2 text-xs leading-relaxed text-gold arabic-text">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none" />
                  {movementMessage(mv)}
                </p>
              )}
              {mv?.status === 'ok' && (
                <p className="text-xs leading-relaxed text-ice-muted arabic-text">
                  {mv.points.length} موقعاً من فيديو المباراة، مرسومة على الملعب بعد ضبطه (هامش خطأ {mv.errorMeters?.toFixed(1)} م{mv.validated ? '' : '، دقة غير كافية'}).
                  {sparse ? ' المواقع قليلة، فتظهر كنقاط وخط حركة بدل خريطة كثافة.' : ' الأماكن الأغمق هي التي قضى فيها وقتاً أطول.'}
                  {' '}اتجاه اللعب كما ظهر في الفيديو.
                  {mv.dropped > 0 && ` استُبعدت ${mv.dropped} مواقع وقعت خارج الملعب.`}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bench + count */}
      {bench.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-ice-muted arabic-text">الاحتياط:</span>
          {bench.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { if (selected != null) assign(selected, p.id) }}
              disabled={selected == null}
              title={selected == null ? 'اختر مركزاً أولاً' : 'ضعه في المركز المحدد'}
              className="rounded-full border border-white/10 px-2.5 py-1 text-ice-white transition-colors enabled:hover:border-teal-prime/50 disabled:opacity-60 arabic-text"
            >
              {p.name || 'بدون اسم'}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
        <span className="arabic-text">
          {players.length === 0 ? 'لم تُضف لاعبين بعد' : placedCount < slots.length ? `${placedCount} من ${slots.length} في التشكيل — ${slots.length - placedCount} مراكز شاغرة` : 'التشكيل مكتمل'}
        </span>
        {players.some(p => !classifyRole(p.position)) && (
          <span className="arabic-text" style={{ color: '#FFD700' }}>بعض اللاعبين بلا مركز مسجّل، فوُضعوا في المراكز المتبقية</span>
        )}
      </div>
    </div>
  )
}
