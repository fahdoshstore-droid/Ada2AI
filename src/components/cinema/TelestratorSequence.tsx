/**
 * TelestratorSequence — "match scene → freeze → tracking → tactical annotation →
 * insight → tactical board", in the grammar of a TV football analysis segment.
 *
 * HONESTY (read before editing)
 * ─────────────────────────────
 * ADA2AI has no real match footage and no tracker output to show here. The frame
 * is an AI-generated broadcast-style still (src/assets/cinema/match-frame.jpg).
 * Every ring, ID, path, patch, label, observation and the board is a HAND-DRAWN
 * ILLUSTRATION placed over that still. They carry no data: no speeds, distances,
 * times, counts or player identities. A persistent «توضيحي» badge and an
 * explicit note say so. Do NOT replace these with numbers unless they come from
 * a real analysis record.
 *
 * Motion rules: only transform / opacity / clip-path / stroke reveals; nothing
 * moves layout. prefers-reduced-motion → no autoplay, starts on the annotated
 * freeze, and the step buttons switch instantly. The sequence starts only when
 * scrolled into view and never blocks loading (image is lazy).
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import matchFrame from '../../assets/cinema/match-frame.jpg'
import { EASE } from './Cinema'

// Palette (ADA2AI only). The reference's yellow / cyan / red roles map to:
//   followed team + ball + main lines → teal · opponents → scout-blue · space → ice (hatched)
const TEAL = '#00DCC8'
const BLUE = '#007ABA'
const NAVY = '#000A0F'
const ICE = '#EEEFEE'

type P = readonly [number, number] // % of the 1536×864 frame
type Team = 'us' | 'opp'

const FW = 1536
const FH = 864
const fx = (x: number) => (x / 100) * FW
const fy = (y: number) => (y / 100) * FH

/** Illustrative IDs, placed over players visible in the still. feet/head are % of the frame. */
const PLAYERS: { id: string; team: Team; feet: P; headY: number }[] = [
  { id: 'A1', team: 'us', feet: [29.3, 66.8], headY: 58.5 },
  { id: 'A2', team: 'us', feet: [45.4, 49.6], headY: 43.2 },
  { id: 'A3', team: 'us', feet: [71.3, 65.8], headY: 57.6 },
  { id: 'B1', team: 'opp', feet: [35.0, 61.2], headY: 54.2 },
  { id: 'B2', team: 'opp', feet: [35.1, 44.4], headY: 38.6 },
  { id: 'B3', team: 'opp', feet: [49.3, 78.5], headY: 68.2 },
]

// Hand-drawn annotation geometry (% of frame). 3 points = quadratic, 4 = cubic.
const PASS: P[] = [[31.4, 64.8], [50, 57], [69.6, 64.4]]
const RUN: P[] = [[45.4, 49.6], [49, 50.4], [53, 53], [57, 56]]
const PRESS: P[] = [[49.3, 76.8], [38, 71], [33.5, 68.2]]
const SPACE: P[] = [[50, 49], [63, 48], [66, 58], [59, 67], [51, 66]]

type Mapper = (p: P) => readonly [number, number]
const toFrame: Mapper = ([x, y]) => [fx(x), fy(y)]

// Illustrative flatten to a top-down board (1050×680, goal on the left). A sketch, not a measurement.
// viewBox is 16:9 (same as the frame) so board coordinates map 1:1 to % of the container for the HTML labels.
const BW = 1200
const BH = 675
const toBoard: Mapper = ([x, y]) => [600 + (x - 58) * 8, 28 + (y - 21) * (602 / 74)]

function pathD(pts: P[], map: Mapper): string {
  const m = pts.map(map)
  const f = (n: readonly [number, number]) => `${n[0].toFixed(1)} ${n[1].toFixed(1)}`
  return m.length === 3 ? `M ${f(m[0])} Q ${f(m[1])} ${f(m[2])}` : `M ${f(m[0])} C ${f(m[1])} ${f(m[2])} ${f(m[3])}`
}
function endAngle(pts: P[], map: Mapper): { x: number; y: number; a: number } {
  const m = pts.map(map)
  const e = m[m.length - 1]
  const p = m[m.length - 2]
  return { x: e[0], y: e[1], a: (Math.atan2(e[1] - p[1], e[0] - p[0]) * 180) / Math.PI }
}

const STEPS = [
  { key: 'scene', ar: 'المشهد', title: 'المشهد أولاً', body: 'تُعرض اللقطة قبل أي تفسير، فنراها كما هي.' },
  { key: 'freeze', ar: 'تجميد', title: 'تجميد الإطار', body: 'تتوقف الصورة عند لحظة واحدة لنقرأها بتمهّل.' },
  { key: 'track', ar: 'تتبّع', title: 'رموز التتبّع', body: 'حلقة ورمز تحت كل لاعب: الفريق بالـ teal والخصم بالأزرق.' },
  { key: 'draw', ar: 'مسارات', title: 'الرسم التكتيكي', body: 'مسار الكرة وحركة اللاعب والمساحة، مرسومة فوق الصورة نفسها.' },
  { key: 'insight', ar: 'ملاحظات', title: 'الملاحظات', body: 'ملاحظة واحدة لكل لون، بجملة واضحة.' },
  { key: 'board', ar: 'اللوحة', title: 'اللوحة التكتيكية', body: 'تُسطَّح الصورة إلى لوحة علوية نظيفة تلخّص ما رأيناه.' },
] as const
const DURATIONS = [2600, 1900, 2600, 3600, 3800] // ms for steps 0‥4; step 5 is the resting state
const MODE = ['REPLAY · إعادة', 'ANALYSIS · تحليل', 'ANALYSIS · تحليل', 'ANALYSIS · تحليل', 'ANALYSIS · تحليل', 'BOARD · لوحة']

const OBSERVATIONS: { color: string; ar: string; en: string }[] = [
  { color: TEAL, ar: 'حامل الكرة تحت ضغط لاعبَين', en: 'BALL CARRIER · PRESSURE' },
  { color: BLUE, ar: 'الخصم يتجمّع حول الكرة', en: 'OPPONENTS · COMPACT' },
  { color: ICE, ar: 'مساحة مفتوحة في وسط الملعب', en: 'SPACE · CENTRE' },
]

/* ───────────── marker line: dark outline + glowing core + thin highlight, drawn along its length ───────────── */
function Marker({
  d, color, w = 9, dashed, delay = 0, dur = 1.1, head, reduced,
}: {
  d: string; color: string; w?: number; dashed?: boolean; delay?: number; dur?: number
  head?: { x: number; y: number; a: number }; reduced: boolean
}) {
  const id = useId().replace(/:/g, '')
  const dash = dashed ? '22 16' : undefined
  return (
    <g>
      <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="-200" y="-200" width={FW + 400} height={FH + 400}>
        <motion.path
          d={d} fill="none" stroke="#fff" strokeWidth={w + 40} strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : dur, delay: reduced ? 0 : delay, ease: 'easeInOut' }}
        />
      </mask>
      <g mask={`url(#m${id})`} style={{ filter: `drop-shadow(0 0 7px ${color})` }}>
        <path d={d} fill="none" stroke={NAVY} strokeOpacity=".55" strokeWidth={w + 6} strokeLinecap="round" strokeDasharray={dash} />
        <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
        <path d={d} fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth={w * 0.28} strokeLinecap="round" strokeDasharray={dash} />
      </g>
      {head && (
        <motion.g
          initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.2 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.28, delay: reduced ? 0 : delay + dur * 0.9, ease: EASE }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <g transform={`translate(${head.x} ${head.y}) rotate(${head.a})`} style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
            <polygon points="12,0 -30,-17 -30,17" fill={NAVY} fillOpacity=".55" transform="scale(1.18)" />
            <polygon points="12,0 -30,-17 -30,17" fill={color} />
          </g>
        </motion.g>
      )}
    </g>
  )
}

/* ───────────── perspective ring under the feet, drawn clockwise ───────────── */
function Ring({ feet, team, delay, reduced }: { feet: P; team: Team; delay: number; reduced: boolean }) {
  const color = team === 'us' ? TEAL : BLUE
  const [cx, cy] = toFrame(feet)
  const r = 15 + (feet[1] - 40) * 0.42
  return (
    <g style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
      <motion.ellipse
        cx={cx} cy={cy} rx={r * 1.55} ry={r * 0.56} fill="none" stroke={ICE} strokeOpacity=".5" strokeWidth="2" strokeDasharray="9 9"
        initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : delay + 0.3 }}
      />
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.36} fill="none" stroke={NAVY} strokeOpacity=".55" strokeWidth="11" />
      <motion.ellipse
        cx={cx} cy={cy} rx={r} ry={r * 0.36} fill="none" stroke={color} strokeWidth="6.5" strokeLinecap="round"
        initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay, ease: 'easeOut' }}
      />
    </g>
  )
}

/* ───────────── the open-space patch: hatched fill + dashed edge ───────────── */
function SpacePatch({ map, delay, reduced, hatchId }: { map: Mapper; delay: number; reduced: boolean; hatchId: string }) {
  const pts = SPACE.map(map).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <motion.g initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay }}>
      <polygon points={pts} fill={ICE} fillOpacity=".13" />
      <polygon points={pts} fill={`url(#${hatchId})`} />
      <polygon points={pts} fill="none" stroke={ICE} strokeWidth="4" strokeDasharray="16 12" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${ICE})` }} />
    </motion.g>
  )
}

/* ───────────── top-down tactical board (illustrative) ───────────── */
function Board({ reduced }: { reduced: boolean }) {
  const hatch = useId().replace(/:/g, '') + 'bh'
  const lineProps = { fill: 'none', stroke: ICE, strokeOpacity: 0.5, strokeWidth: 3 } as const
  return (
    <div className="absolute inset-0" role="img" aria-label="لوحة تكتيكية علوية توضيحية">
      <svg viewBox={`0 0 ${BW} ${BH}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <pattern id={hatch} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={ICE} strokeOpacity=".35" strokeWidth="3" />
          </pattern>
          <pattern id={`${hatch}g`} width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0H0V60" fill="none" stroke={ICE} strokeOpacity=".05" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={BW} height={BH} fill={NAVY} />
        <rect width={BW} height={BH} fill={`url(#${hatch}g)`} />
        <g {...lineProps}>
          <rect x="135" y="28" width="930" height="602" />
          <line x1="600" y1="28" x2="600" y2="630" />
          <circle cx="600" cy="329" r="81" />
          <rect x="135" y="150" width="146" height="357" />
          <rect x="135" y="248" width="49" height="162" />
          <rect x="919" y="150" width="146" height="357" />
          <rect x="1016" y="248" width="49" height="162" />
        </g>
        <SpacePatch map={toBoard} delay={0.5} reduced={reduced} hatchId={hatch} />
        <Marker d={pathD(PASS, toBoard)} color={TEAL} dashed delay={0.7} head={endAngle(PASS, toBoard)} reduced={reduced} w={9} />
        <Marker d={pathD(RUN, toBoard)} color={TEAL} dashed delay={0.9} head={endAngle(RUN, toBoard)} reduced={reduced} w={8} />
        <Marker d={pathD(PRESS, toBoard)} color={BLUE} delay={1.0} head={endAngle(PRESS, toBoard)} reduced={reduced} w={8} />
        {PLAYERS.map((p, i) => {
          const [x, y] = toBoard(p.feet)
          const c = p.team === 'us' ? TEAL : BLUE
          return (
            <motion.g
              key={p.id}
              initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.2 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.1 + i * 0.09, ease: EASE }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <circle cx={x} cy={y} r="25" fill={NAVY} fillOpacity=".7" />
              <circle cx={x} cy={y} r="19" fill={c} stroke={ICE} strokeWidth="4" style={{ filter: `drop-shadow(0 0 8px ${c})` }} />
            </motion.g>
          )
        })}
      </svg>
      {/* IDs and caption are HTML so they stay readable at every width */}
      {PLAYERS.map((p, i) => {
        const [x, y] = toBoard(p.feet)
        return (
          <motion.span
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap px-1 py-px font-display text-[8px] font-bold leading-tight text-[#EEEFEE] sm:text-[10px] md:px-1.5 md:text-[12px]"
            style={{ left: `${(x / BW) * 100}%`, top: `${((y - 28) / BH) * 100}%`, background: 'rgba(0,10,15,.88)', borderInlineStart: `3px solid ${p.team === 'us' ? TEAL : BLUE}` }}
            initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.3 + i * 0.09 }}
          >
            {p.id}
          </motion.span>
        )
      })}
      <p className="absolute inset-x-0 bottom-1 text-center text-[8px] text-[#EEEFEE]/75 sm:text-[10px] md:bottom-2 md:text-xs arabic-text">
        رسم توضيحي — ليس قياساً حقيقياً لمواقع اللاعبين
      </p>
    </div>
  )
}

/* ───────────── main component ───────────── */
export default function TelestratorSequence() {
  const reduced = Boolean(useReducedMotion())
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: true, margin: '0px 0px -25% 0px' })
  const hatchId = useId().replace(/:/g, '') + 'h'
  const [step, setStep] = useState<number>(reduced ? 4 : 0)
  const [playing, setPlaying] = useState(false)
  const started = useRef(false)

  // Start once, only when the section is on screen (never at load time, never under reduced motion).
  useEffect(() => {
    if (inView && !reduced && !started.current) {
      started.current = true
      setPlaying(true)
    }
  }, [inView, reduced])

  // "playing" is derived: the board (step 5) is the resting state, so the sequence is never playing there.
  const isPlaying = playing && step < 5

  useEffect(() => {
    if (!isPlaying) return
    const t = window.setTimeout(() => setStep((s) => s + 1), DURATIONS[step])
    return () => window.clearTimeout(t)
  }, [isPlaying, step])

  const go = useCallback((i: number) => {
    setPlaying(false)
    setStep(i)
  }, [])
  const replay = useCallback(() => {
    setStep(0)
    setPlaying(!reduced)
  }, [reduced])

  const frozen = step >= 1
  const board = step === 5

  // Stage motion: slow push-in while "playing" → punch on freeze → slow creep. Reduced motion: static.
  const stageAnim = reduced
    ? { scale: 1 }
    : step === 0
      ? { scale: 1.045, transition: { duration: 2.6, ease: 'linear' as const } }
      : step === 1
        ? { scale: [1.08, 1.045], transition: { duration: 0.45, ease: 'easeOut' as const } }
        : step < 5
          ? { scale: 1.058, transition: { duration: 9, ease: 'linear' as const } }
          : { scale: 1.058, rotateX: 62, y: '-8%', opacity: 0, transition: { duration: 0.9, ease: EASE } }

  return (
    <div ref={rootRef} className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* ── Broadcast frame ── */}
      <div className="lg:col-span-8">
        <div
          className="relative aspect-video overflow-hidden border border-white/10 bg-[#000A0F]"
          role="img"
          aria-label="عرض توضيحي لتحليل لقطة مباراة: تجميد الإطار ثم رموز تتبّع ومسارات ومساحة مفتوحة ثم لوحة تكتيكية"
          style={{ perspective: 1400 }}
        >
          <motion.div className="absolute inset-0" style={{ transformOrigin: '50% 100%' }} initial={false} animate={stageAnim}>
            {/* picture: local grade only (no global filter) */}
            <img
              src={matchFrame}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{
                filter: frozen ? 'saturate(0.62) brightness(1.14) contrast(1.06)' : 'saturate(0.95) brightness(1.18) contrast(1.04)',
                transition: reduced ? undefined : 'filter .35s ease-out',
              }}
            />
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: frozen ? 0.9 : 0.35, background: `radial-gradient(120% 100% at 50% 50%, transparent 55%, ${NAVY}cc 100%)` }}
            />

            {/* freeze flash */}
            {step === 1 && !reduced && (
              <motion.div key="flash" className="pointer-events-none absolute inset-0 bg-white" initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} transition={{ duration: 0.28 }} />
            )}

            {/* annotation layer shares the picture's transform, so it never slides off the players */}
            <svg viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <pattern id={hatchId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="14" stroke={ICE} strokeOpacity=".4" strokeWidth="3" />
                </pattern>
              </defs>
              {step >= 3 && <SpacePatch map={toFrame} delay={0.1} reduced={reduced} hatchId={hatchId} />}
              {step >= 2 && PLAYERS.map((p, i) => <Ring key={p.id} feet={p.feet} team={p.team} delay={i * 0.14} reduced={reduced} />)}
              {step >= 3 && (
                <>
                  <Marker d={pathD(PASS, toFrame)} color={TEAL} dashed delay={0.35} dur={1.3} head={endAngle(PASS, toFrame)} reduced={reduced} />
                  <Marker d={pathD(RUN, toFrame)} color={TEAL} dashed delay={0.9} dur={0.9} head={endAngle(RUN, toFrame)} reduced={reduced} w={8} />
                  <Marker d={pathD(PRESS, toFrame)} color={BLUE} delay={1.5} dur={0.9} head={endAngle(PRESS, toFrame)} reduced={reduced} w={8} />
                </>
              )}
            </svg>

            {/* tracking IDs */}
            {step >= 2 &&
              PLAYERS.map((p, i) => (
                <motion.span
                  key={p.id}
                  className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap px-1 py-px font-display text-[8px] font-bold leading-tight text-[#EEEFEE] sm:text-[10px] md:px-1.5 md:text-[12px]"
                  style={{
                    left: `${p.feet[0]}%`, top: `${p.headY}%`, background: 'rgba(0,10,15,.88)',
                    borderInlineStart: `3px solid ${p.team === 'us' ? TEAL : BLUE}`,
                  }}
                  initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.3 + i * 0.14, ease: EASE }}
                >
                  {p.id}
                </motion.span>
              ))}

            {/* finding labels: black card, coloured bar, Arabic line + spaced English line (md+; mobile reads them in the panel) */}
            {step >= 4 && !board &&
              ([
                { o: OBSERVATIONS[0], left: '2.5%', top: '71%' },
                { o: OBSERVATIONS[1], left: '55.5%', top: '83.5%' },
                { o: OBSERVATIONS[2], left: '50%', top: '34%' },
              ] as const).map(({ o, left, top }, i) => (
                <motion.div
                  key={o.en}
                  className="absolute hidden md:block"
                  style={{ left, top, background: 'rgba(0,10,15,.92)', borderInlineStart: `4px solid ${o.color}`, padding: '5px 12px 6px' }}
                  initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.2 + i * 0.45, ease: EASE }}
                >
                  <div className="text-[clamp(11px,1.3vw,17px)] font-black leading-tight text-[#EEEFEE] arabic-text">{o.ar}</div>
                  <div className="font-sans text-[clamp(8px,0.78vw,11px)] font-semibold tracking-[0.18em]" style={{ color: o.color }}>{o.en}</div>
                </motion.div>
              ))}
          </motion.div>

          {/* tactical board takes over */}
          <AnimatePresence>
            {board && (
              <motion.div key="board" className="absolute inset-0" initial={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.35, ease: EASE }}>
                <Board reduced={reduced} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* corner bug (top, in every frame) */}
          <div className="absolute start-2 top-2 z-10 md:start-3 md:top-3">
           <div className="flex flex-col" dir="ltr">
            <span className="bg-[#00DCC8] px-2 py-0.5 font-display text-[9px] font-black tracking-wider text-[#000A0F] md:px-3 md:text-xs">ADA2AI</span>
            <span key={MODE[step]} className="flex items-center gap-1.5 bg-[#000A0F]/90 px-2 py-0.5 font-sans text-[8px] font-bold tracking-[0.16em] text-[#EEEFEE] md:px-3 md:text-[11px]">
              <span className={`h-1.5 w-1.5 rounded-full ${step === 0 ? 'bg-[#EEEFEE]' : 'bg-[#00DCC8]'}`} />
              {MODE[step]}
            </span>
           </div>
          </div>

          {/* illustrative badge — always visible */}
          <div className="absolute end-2 top-2 z-10 border border-[#00DCC8]/60 bg-[#000A0F]/85 px-2 py-1 text-[9px] font-bold text-[#00DCC8] backdrop-blur-sm md:end-3 md:top-3 md:px-3 md:py-1.5 md:text-[11px] arabic-text">
            توضيحي — ليس تحليلاً آلياً
          </div>
        </div>

        {/* step controls */}
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="خطوات العرض التوضيحي">
          <ol className="flex flex-1 flex-wrap gap-1.5">
            {STEPS.map((s, i) => {
              const active = i === step
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-pressed={active}
                    aria-label={`${i + 1}. ${s.title}`}
                    className={`relative overflow-hidden border px-3 py-1.5 text-xs font-bold transition-colors arabic-text md:text-sm ${
                      active ? 'border-teal-prime bg-teal-prime/15 text-teal-prime' : i < step ? 'border-white/20 text-ice-white/80 hover:border-white/40' : 'border-white/10 text-ice-muted hover:border-white/30'
                    }`}
                  >
                    <span className="font-display text-[10px] opacity-70">{String(i + 1).padStart(2, '0')}</span> {s.ar}
                    {active && isPlaying && !reduced && (
                      <motion.span
                        key={`p${step}`}
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-right bg-teal-prime"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: DURATIONS[step] / 1000, ease: 'linear' }}
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ol>
          <button
            type="button"
            onClick={() => (isPlaying ? setPlaying(false) : step >= 5 ? replay() : setPlaying(!reduced))}
            className="border border-white/20 px-3 py-1.5 text-xs font-bold text-ice-white transition-colors hover:border-teal-prime hover:text-teal-prime arabic-text md:text-sm"
          >
            {isPlaying ? '❚❚ إيقاف' : step >= 5 ? '↻ إعادة' : '▶ تشغيل'}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-ice-muted/70 arabic-text">لقطة مولّدة بالذكاء الاصطناعي لأغراض العرض.</p>
      </div>

      {/* ── Reading panel ── */}
      <div className="lg:col-span-4">
        <div className="border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-ice-white arabic-text">كيف تُقرأ اللقطة</h3>
            <span className="border border-teal-prime/50 px-2 py-0.5 text-[10px] font-bold text-teal-prime arabic-text">توضيحي</span>
          </div>

          <div className="min-h-[5.5rem]" aria-live="polite">
            <p className="font-display text-xs tracking-widest text-teal-prime">{String(step + 1).padStart(2, '0')} / 06</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reduced ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
              >
                <p className="mt-1 text-lg font-extrabold text-ice-white arabic-text">{STEPS[step].title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ice-muted arabic-text">{STEPS[step].body}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <ul className="mt-5 border-t border-white/10">
            {OBSERVATIONS.map((o, i) => {
              const shown = step >= 4
              return (
                <motion.li
                  key={o.en}
                  className="flex items-start gap-3 border-b border-white/10 py-3"
                  initial={false}
                  animate={{ opacity: shown ? 1 : 0.28, x: shown ? 0 : 10 }}
                  transition={{ duration: reduced ? 0 : 0.5, delay: reduced || !shown ? 0 : i * 0.25, ease: EASE }}
                >
                  <span className="mt-1.5 h-3 w-3 flex-shrink-0" style={{ background: o.color, boxShadow: `0 0 10px ${o.color}` }} aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-bold text-ice-white arabic-text">{o.ar}</span>
                    <span className="block font-sans text-[10px] font-semibold tracking-[0.16em]" style={{ color: o.color }}>{o.en}</span>
                  </span>
                </motion.li>
              )
            })}
          </ul>

          <ul className="mt-4 space-y-1.5 text-[11px] text-ice-muted arabic-text" aria-label="دليل الألوان">
            <li className="flex items-center gap-2"><i className="h-2 w-2 flex-shrink-0 bg-teal-prime" />الفريق والكرة والمسارات الرئيسية</li>
            <li className="flex items-center gap-2"><i className="h-2 w-2 flex-shrink-0 bg-scout-blue" />الخصم</li>
            <li className="flex items-center gap-2"><i className="h-2 w-2 flex-shrink-0 border border-dashed border-ice-white" />المساحة المفتوحة</li>
          </ul>

          <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-ice-muted/80 arabic-text">
            الحلقات والرموز والمسارات والملاحظات واللوحة كلها رسم توضيحي فوق لقطة مولّدة، وليست مخرجات رصد آلي ولا بيانات لاعب أو مباراة حقيقية.
          </p>
        </div>
      </div>
    </div>
  )
}
