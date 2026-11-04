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
}

function formatTime(t: number): string {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function RealMatchAnalysis() {
  const [data, setData] = useState<RealData | null>(null)
  const [error, setError] = useState(false)
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showIds, setShowIds] = useState(true)
  const [showBall, setShowBall] = useState(true)
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
          <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400 arabic-text">
            تعذّر تحميل بيانات التحليل.
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
                obsAtTime.map((o) => (
                  <div
                    key={o.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${(o.x * 100).toFixed(3)}%`, top: `${(o.y * 100).toFixed(3)}%` }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full font-display font-bold text-[#EEEFEE]"
                      style={{
                        width: 26, height: 26, background: TEAL,
                        border: '1.5px solid rgba(0,0,0,0.7)', fontSize: 10,
                        boxShadow: `0 0 8px ${TEAL}66`,
                      }}
                    >
                      {o.id}
                    </div>
                  </div>
                ))}
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
            </div>

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
              نتائج حقيقية — YOLO11n + ByteTrack
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
              {data.meta.model} · {data.meta.tracking} · device={data.meta.device}
            </span>
            <span className="px-2 py-1 text-[#FFB800]" style={{ background: 'rgba(255,184,0,0.10)' }}>
              {data.team_assignment.note}
            </span>
            <span className="px-2 py-1 text-ice-muted" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {data.calibration.note}
            </span>
          </div>

          {/* ── hypothetical scenario (clearly separated) ── */}
          <div className="border-t border-dashed border-[#FFB800]/40 p-4 md:p-5">
            <span className="inline-block border border-[#FFB800]/50 bg-[#FFB800]/10 px-2 py-0.5 text-[10px] font-bold text-[#FFB800] md:text-[11px] arabic-text">
              {data.scenario.title}
            </span>
            <p className="mt-3 text-sm leading-relaxed text-ice-white/85 arabic-text">{data.scenario.problem}</p>
            <p className="mt-2 text-sm leading-relaxed text-ice-muted arabic-text">{data.scenario.proposal}</p>
            <p className="mt-2 text-[11px] text-ice-muted/60 arabic-text">{data.scenario.source}</p>
          </div>

          {/* ── meta ── */}
          <div className="border-t border-white/10 px-4 py-3 text-[11px] text-ice-muted/70 arabic-text">
            {data.match.home} × {data.match.away} · {data.match.competition} · {data.meta.duration}s · {data.meta.frames_processed} إطار معالَج · {data.meta.processing_time}s معالجة
          </div>
        </>
      )}
    </div>
  )
}
