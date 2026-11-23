/**
 * RealMatchAnalysis — real YOLO11n + ByteTrack match analysis, in the
 * Floodlight D2 cinematic grammar.
 *
 * Plays the actual match clip, overlays REAL detection positions and track
 * IDs synced to playback time, offers evidence-timestamp navigation, and
 * separates the tactical proposal into an explicitly-labelled «سيناريو
 * افتراضي» (hypothetical) panel.
 *
 * HONESTY: this is a real computer-vision run over real broadcast footage.
 * It is NOT calibrated to a pitch — positions are image-space only, teams are
 * an unconfirmed jersey-colour grouping (13 vs 1), the ball is a detector
 * observation (not a confirmed trajectory), and no speed/distance is claimed.
 * The tactical proposal is an analyst suggestion, not a measured event.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

const TEAL = '#00DCC8'
const ICE = '#EEEFEE'
const RED = '#E5484D'
const WHITE = '#F5F7FA'

interface Observation { t: number; id: number; x: number; y: number; c: number }
interface BallObs { t: number; x: number; y: number; c: number }
interface RealData {
  meta: { fps: number; width: number; height: number; duration: number; device: string; model: string; tracking: string; processing_time: number; frames_processed: number }
  match: { home: string; away: string; competition: string }
  players: { track_id: number; team: number | null }[]
  observations: Observation[]
  ball: BallObs[]
  team_assignment: { method: string; note: string }
  calibration: { status: string; note: string }
  scenario: { title: string; problem: string; proposal: string; source: string }
  tactical: { questions: { q: string; verdict: string; reason: string }[] }
}

function formatTime(t: number): string {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Fixed tactical interpretation (analyst claim vs proposal) — presented with an
// explicit INCONCLUSIVE verdict because the CV data cannot prove or disprove it.
const TACTICAL = {
  claim: 'ادعاء المحلل: الفريق منفصل إلى مجموعة دفاعية ومجموعة هجومية متقدمة — «خمسة في الدفاع وخمسة في الهجوم».',
  proposal: 'السيناريو المقترح: إنزال أحد المهاجمين المتقدمين إلى المساحة المركزية ليكون خيار تمرير أثناء بناء الهجمة، ويساعد في تأخير المرتدة عند فقدان الكرة.',
  advantages: [
    { label: 'ميزة بناء الهجمة', text: 'خيار تمرير إضافي في الوسط يخفف الضغط على حامل الكرة.' },
    { label: 'ميزة الدفاع الانتقالي', text: 'لاعب أقرب للكرة عند فقدانها لتعطيل المرتدة بسرعة.' },
  ],
  risks: [
    { label: 'فقدان العمق', text: 'نزول المهاجم مبكراً يقلل خيارات التمرير الأمامي والاختراق.' },
    { label: 'ازدحام الوسط', text: 'تمركز خاطئ قد يزاحم خط الوسط ويقلل المساحة المتاحة.' },
  ],
  evidence: 'اللقطات تُظهر توزيع اللاعبين على أرض الملعب، لكن لا توجد معايرة ملعب ولا هوية لاعب مؤكدة ولا تعيين فريق موثوق.',
  aiCan: 'كشف مواقع اللاعبين ورموزهم، وكشف الكرة (كشف فقط وليس مساراً مؤكداً).',
  aiCannot: 'إثبات هوية اللاعبين، إحداثيات الملعب، السرعة/المسافة، أو أحداث الاستحواذ/التمرير/التسديد.',
  verdict: 'لا تكفي المعلومات للحكم',
  verdictNote: 'التحليل الحالي يكشف مواقع اللاعبين وتحركاتهم، لكنه لا يملك معايرة ملعب أو هوية لاعب أو أحداث استحواذ تُثبت أو تنفي الادعاء التكتيكي.',
}

export default function RealMatchAnalysis() {
  const [data, setData] = useState<RealData | null>(null)
  const [error, setError] = useState(false)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showIds, setShowIds] = useState(true)
  const [showBall, setShowBall] = useState(true)
  const [frozen, setFrozen] = useState(false)
  const [showTrails, setShowTrails] = useState(false)
  const [showSpace, setShowSpace] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { once: true, margin: '0px 0px -15% 0px' })

  useEffect(() => {
    let active = true
    fetch('/real-match-data.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: RealData) => { if (active) setData(d) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  // track_id -> team (1 = red, 2 = white, null = غير محدد) من تمييز ألوان القمصان.
  const teamMap = useMemo(() => {
    if (!data) return new Map<number, number | null>()
    const m = new Map<number, number | null>()
    for (const p of data.players) m.set(p.track_id, p.team)
    return m
  }, [data])

  // Detections near the current playback time — per track, highest confidence.
  const obsAtTime = useMemo(() => {
    if (!data) return [] as Observation[]
    const grouped = new Map<number, Observation>()
    for (const o of data.observations) {
      if (Math.abs(o.t - time) > 0.16) continue
      const cur = grouped.get(o.id)
      if (!cur || o.c > cur.c) grouped.set(o.id, o)
    }
    return Array.from(grouped.values())
  }, [data, time])

  const ballAtTime = useMemo(() => {
    if (!data) return null as BallObs | null
    let best: BallObs | null = null
    for (const b of data.ball) {
      if (Math.abs(b.t - time) <= 0.16 && (!best || b.c > best.c)) best = b
    }
    return best
  }, [data, time])

  const evidenceTimes = useMemo(() => (data ? data.ball.map((b) => b.t) : []), [data])

  // Recent movement trails per track (image-space), for the telestrator "paths".
  const trails = useMemo(() => {
    if (!data) return [] as { id: number; points: [number, number][] }[]
    const window = 3 // seconds of history
    const byTrack = new Map<number, Observation[]>()
    for (const o of data.observations) {
      if (o.t < time - window || o.t > time) continue
      const arr = byTrack.get(o.id) || []
      arr.push(o)
      byTrack.set(o.id, arr)
    }
    return Array.from(byTrack.entries())
      .filter(([, arr]) => arr.length >= 3)
      .map(([id, arr]) => {
        arr.sort((a, b) => a.t - b.t)
        return { id, points: arr.map((o) => [o.x * 100, o.y * 100] as [number, number]) }
      })
  }, [data, time])

  const seek = (t: number) => {
    if (videoRef.current) videoRef.current.currentTime = t
    setTime(t)
  }

  const duration = data?.meta.duration ?? 0
  const progress = duration > 0 ? Math.min(1, Math.max(0, time / duration)) : 0

  return (
    <div ref={rootRef} className="border border-white/10 bg-white/[0.02]">
      {/* ── Broadcast frame ── */}
      <div className="relative aspect-video overflow-hidden bg-[#000A0F]">
        {!data && !error && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-ice-muted arabic-text">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-prime border-t-transparent" />
            جارٍ تحميل بيانات التحليل…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ice-muted arabic-text">
            مقطع هذه المباراة وبياناته محفوظة على جهاز التحليل، ولا تُعرض من هذا الرابط.
          </div>
        )}

        {data && (
          <>
            <video
              ref={videoRef}
              src="/ettifaq-muharraq-clip.mp4"
              controls
              playsInline
              preload={inView ? 'metadata' : 'none'}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="block h-full w-full"
            />

            {/* detection overlay (image-space, synced) */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {showIds &&
                obsAtTime.map((o) => {
                  const team = teamMap.get(o.id)
                  const bg = team === 1 ? RED : team === 2 ? WHITE : TEAL
                  return (
                    <div
                      key={o.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${(o.x * 100).toFixed(3)}%`, top: `${(o.y * 100).toFixed(3)}%` }}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: 20, height: 20, background: bg,
                          border: '2px solid rgba(0,0,0,0.7)',
                          boxShadow: `0 0 8px ${bg}88`,
                        }}
                      />
                    </div>
                  )
                })}
              {showBall && ballAtTime && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(ballAtTime.x * 100).toFixed(3)}%`, top: `${(ballAtTime.y * 100).toFixed(3)}%` }}
                >
                  <div
                    className="rounded-full"
                    style={{ width: 15, height: 15, background: ICE, border: '1.5px solid #FF6B6B', boxShadow: '0 0 9px rgba(255,107,107,0.85)' }}
                  />
                </div>
              )}

              {/* movement trails (telestrator "paths") — recent tracked positions */}
              {showTrails && (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                  {trails.map((tr) => (
                    <polyline
                      key={tr.id}
                      points={tr.points.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')}
                      fill="none" stroke={TEAL} strokeWidth="0.45" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                  ))}
                </svg>
              )}

              {/* proposed central space (hypothetical — approximate, image-space) */}
              {showSpace && (
                <div
                  className="absolute"
                  title="المساحة المركزية المقترحة — افتراضي وتقريبي (إحداثيات الصورة)"
                  style={{
                    left: '50%', top: '50%', width: '36%', height: '32%', transform: 'translate(-50%,-50%)',
                    border: '2px dashed rgba(255,184,0,0.6)', background: 'rgba(255,184,0,0.06)',
                  }}
                >
                  <span className="absolute -top-4 start-0 whitespace-nowrap bg-[#000A0F]/80 px-1.5 py-0.5 text-[8px] font-bold text-[#FFB800] md:text-[10px] arabic-text">
                    المساحة المركزية المقترحة (افتراضي)
                  </span>
                </div>
              )}
            </div>

            {/* frozen badge */}
            {frozen && (
              <div className="absolute bottom-2 end-2 z-10 border border-[#00DCC8]/60 bg-[#000A0F]/85 px-2 py-1 text-[10px] font-bold text-[#00DCC8] md:text-xs arabic-text">
                ⏸ إطار مجمّد — اقرأ المواقع والمسارات
              </div>
            )}

            {/* corner bug */}
            <div className="absolute start-2 top-2 z-10 flex flex-col" dir="ltr">
              <span className="bg-[#00DCC8] px-2 py-0.5 font-display text-[9px] font-black tracking-wider text-[#000A0F] md:px-3 md:text-xs">ADA2AI</span>
              <span className="flex items-center gap-1.5 bg-[#000A0F]/90 px-2 py-0.5 font-sans text-[8px] font-bold tracking-[0.16em] text-[#EEEFEE] md:px-3 md:text-[11px]">
                <span className={`h-1.5 w-1.5 rounded-full ${playing ? 'bg-[#00DCC8]' : 'bg-[#EEEFEE]'}`} />
                {playing ? 'LIVE · تحليل' : 'ANALYSIS · تحليل'}
              </span>
            </div>

            {/* provenance badge */}
            <div className="absolute end-2 top-2 z-10 border border-[#FFB800]/50 bg-[#000A0F]/85 px-2 py-1 text-[9px] font-bold text-[#FFB800] backdrop-blur-sm md:end-3 md:top-3 md:px-3 md:py-1.5 md:text-[11px] arabic-text">
              تحليل المباراة — نتائج حقيقية
            </div>
          </>
        )}
      </div>

      {data && (
        <>
          {/* ── controls ── */}
          <div className="border-t border-white/10 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ice-muted arabic-text">
                <input type="checkbox" checked={showIds} onChange={(e) => setShowIds(e.target.checked)} className="accent-[#00DCC8]" />
                رموز اللاعبين
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ice-muted arabic-text">
                <input type="checkbox" checked={showBall} onChange={(e) => setShowBall(e.target.checked)} className="accent-[#00DCC8]" />
                الكرة
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ice-muted arabic-text">
                <input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} className="accent-[#00DCC8]" />
                مسارات الحركة
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ice-muted arabic-text">
                <input type="checkbox" checked={showSpace} onChange={(e) => setShowSpace(e.target.checked)} className="accent-[#FFB800]" />
                المساحة المقترحة
              </label>
              <div className="flex items-center gap-3 border-s border-white/10 ps-3 text-[10px] text-ice-muted arabic-text">
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: RED }} /> أحمر (الاتفاق)</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full border border-black/40" style={{ background: WHITE }} /> أبيض (المحرق)</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: TEAL }} /> غير محدد</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const v = videoRef.current
                  if (frozen) { setFrozen(false) }
                  else { if (v) v.pause(); setFrozen(true) }
                }}
                className="border border-[#00DCC8]/50 px-3 py-1 text-xs font-bold text-[#00DCC8] transition-colors hover:bg-[#00DCC8]/10 arabic-text"
              >
                {frozen ? 'إلغاء التجميد' : '⏸ تجميد الإطار'}
              </button>
              <span className="font-display text-xs tracking-wider text-teal-prime">{formatTime(time)} / {formatTime(duration)}</span>
            </div>

            {/* scrubber + evidence markers */}
            <div className="mt-3">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.05}
                value={time}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full accent-[#00DCC8]"
                aria-label="شريط التوقيت"
              />
              <div className="relative mt-1 h-3">
                <div className="absolute inset-x-0 top-0 h-1 rounded-full bg-white/10" style={{ backgroundImage: `linear-gradient(90deg,#00DCC8,#00DCC8 ${progress * 100}%,transparent ${progress * 100}%)` }} />
                {evidenceTimes.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => seek(t)}
                    title={`كشف كرة عند ${formatTime(t)}`}
                    className="absolute top-0 h-3 w-1 -translate-x-1/2 rounded-sm bg-[#FF6B6B] hover:scale-150"
                    style={{ left: `${(t / duration) * 100}%` }}
                    aria-label={`الانتقال إلى ${formatTime(t)}`}
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px] text-ice-muted/70 arabic-text">النقاط الحمراء = كشف الكرة (يمكن الانتقال إليها بالنقر).</p>
            </div>
          </div>

          {/* ── provenance strip ── */}
          <div className="flex flex-wrap gap-2 border-t border-white/10 p-4 text-[11px]">
            <span className="px-2 py-1 text-[#00DCC8]" style={{ background: 'rgba(0,220,200,0.10)' }}>
              تحليل المباراة · تحركات اللاعبين
            </span>
            <span className="px-2 py-1 text-[#FFB800]" style={{ background: 'rgba(255,184,0,0.10)' }}>
              {data.team_assignment.note}
            </span>
            <span className="px-2 py-1 text-ice-muted" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {data.calibration.note}
            </span>
          </div>

          {/* ── tactical interpretation (claim vs proposal + INCONCLUSIVE verdict) ── */}
          <div className="border-t border-dashed border-[#FFB800]/40 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="border border-[#FFB800]/50 bg-[#FFB800]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFB800] md:text-[11px] arabic-text">
                التفسير التكتيكي — ادعاء مقابل سيناريو
              </span>
              <span className="border border-[#FFB800] bg-[#FFB800]/15 px-2 py-0.5 font-display text-[10px] font-black tracking-wider text-[#FFB800] md:text-xs">
                النتيجة: {TACTICAL.verdict}
              </span>
            </div>

            <p className="mt-3 text-sm font-bold text-ice-white arabic-text">الادعاء الأصلي</p>
            <p className="mt-1 text-sm leading-relaxed text-ice-white/85 arabic-text">{TACTICAL.claim}</p>

            <p className="mt-3 text-sm font-bold text-ice-white arabic-text">السيناريو المقترح</p>
            <p className="mt-1 text-sm leading-relaxed text-ice-muted arabic-text">{TACTICAL.proposal}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs font-bold text-[#00DCC8] arabic-text">مزايا محتملة</p>
                <ul className="mt-2 space-y-2">
                  {TACTICAL.advantages.map((a) => (
                    <li key={a.label} className="text-xs leading-relaxed text-ice-muted arabic-text">
                      <span className="font-bold text-ice-white">{a.label}: </span>{a.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs font-bold text-[#FF6B6B] arabic-text">مخاطر وعيوب</p>
                <ul className="mt-2 space-y-2">
                  {TACTICAL.risks.map((r) => (
                    <li key={r.label} className="text-xs leading-relaxed text-ice-muted arabic-text">
                      <span className="font-bold text-ice-white">{r.label}: </span>{r.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs font-bold text-ice-white arabic-text">ما يُثبته الذكاء الاصطناعي</p>
              <p className="mt-1 text-xs leading-relaxed text-ice-muted arabic-text">{TACTICAL.aiCan}</p>
              <p className="mt-2 text-xs font-bold text-ice-white arabic-text">ما لا يستطيع إثباته</p>
              <p className="mt-1 text-xs leading-relaxed text-ice-muted arabic-text">{TACTICAL.aiCannot}</p>
            </div>

            <div className="mt-3 border border-[#FFB800]/40 bg-[#FFB800]/5 p-3">
              <p className="text-xs leading-relaxed text-[#FFB800] arabic-text">
                <span className="font-bold">الخلاصة ({TACTICAL.verdict}): </span>{TACTICAL.verdictNote}
              </p>
            </div>

            <p className="mt-2 text-[11px] text-ice-muted/60 arabic-text">{data.scenario.source}</p>
          </div>

          {/* ── الأسئلة التكتيكية الثلاثة ── */}
          <div className="border-t border-white/10 p-4 md:p-5">
            <p className="text-xs font-bold text-ice-white arabic-text">الأسئلة التكتيكية — الدليل من المباراة</p>
            <div className="mt-3 space-y-2">
              {data.tactical.questions.map((q, i) => (
                <div key={i} className="border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-sm font-bold text-ice-white arabic-text">{i + 1}. {q.q}</p>
                  <p className="mt-1 text-xs font-bold text-[#FFB800] arabic-text">النتيجة: {q.verdict}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ice-muted/80 arabic-text">{q.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── meta ── */}
          <div className="border-t border-white/10 px-4 py-3 text-[11px] text-ice-muted/70 arabic-text">
            {data.match.home} × {data.match.away} · {data.match.competition}
          </div>
        </>
      )}
    </div>
  )
}
