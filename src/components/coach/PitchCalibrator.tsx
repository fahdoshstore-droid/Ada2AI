/**
 * PitchCalibrator — the coach turns pixels into metres by clicking landmarks.
 *
 * Why this screen exists: every distance and speed in the product descends
 * from one line in backend/vision_core/graph.py, `dist_px / 100.0`, with the
 * comment "Using ppm=100 as default". A 30-metre run measures 0.68 m under
 * that constant. The backend has had a correct homography solver for a while;
 * what was missing was somewhere to put the answer and someone to click the
 * points. This is both.
 *
 * The frame comes from the match video: the coach uploads it once, scrubs to
 * a moment where the lines are visible, pauses, and clicks the landmarks on
 * the paused frame. video_url and thumbnail_url were null on all four
 * analyses and both storage buckets were empty — no video had ever been
 * uploaded through this product — so the upload here is what makes a frame
 * exist at all. It attaches to the analysis that already holds the tracks
 * rather than creating a second record.
 *
 * Clicks land on the <video> element directly. It is rendered at its natural
 * aspect ratio filling the width, so the element box is the frame box and
 * normalization is exact; an object-contain fit would letterbox and skew
 * every coordinate silently.
 *
 * This replaces training-hub/components/CalibrationPanel.tsx, which was
 * mounted nowhere and could not submit: its holdoutPairs state had no setter,
 * so canSubmitHoldout was permanently false and validateHoldout always threw.
 * It also sent pitch coordinates read off a diagram by eye in corner-origin
 * 0..105 / 0..68, while the backend's PitchLandmarks are metres from the
 * centre spot — a different coordinate frame than the server assumes.
 */
import { useMemo, useRef, useState } from 'react'
import { Crosshair, Check, AlertTriangle, Upload, Trash2, Ruler, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  LANDMARKS, calibrate, recomputeTrack, landmarkByKey,
  HOLDOUT_TOLERANCE_METERS, MIN_POINTS_FOR_HOLDOUT, RECOMMENDED_POINTS,
  POSITIONAL_HISTORY_CAP,
  type Correspondence,
} from '../../services/calibration'
import { useCalibration, useTrackHistories, useSaveCalibration, useAnalysisVideo } from '../../hooks/useCalibration'

interface Props {
  analysisId: string
  matchId: string | null
}

export default function PitchCalibrator({ analysisId, matchId }: Props) {
  const { calibration } = useCalibration(analysisId)
  const { tracks } = useTrackHistories(analysisId)
  const { save, saving, error: saveError } = useSaveCalibration()

  const { videoUrl, upload, uploading, uploadError } = useAnalysisVideo(analysisId)

  const [points, setPoints] = useState<Correspondence[]>([])
  const [pendingLandmark, setPendingLandmark] = useState<string>('')
  const [selected, setSelected] = useState<number | null>(null)
  const [frameTime, setFrameTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [paused, setPaused] = useState(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  /** One frame at 25 fps. Scrubbing by whole seconds is too coarse to land on
   *  a moment where the goal line is unobstructed. */
  const FRAME_STEP = 1 / 25

  function seekBy(delta: number) {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(duration || video.duration || 0, Math.max(0, video.currentTime + delta))
  }

  const solved = useMemo(() => (points.length >= 4 ? calibrate(points) : null), [points])
  const usedKeys = new Set(points.map(p => p.landmark))
  const available = LANDMARKS.filter(l => !usedKeys.has(l.key))

  async function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setPoints([])
    setSelected(null)
    await upload(file)
  }

  function onFrameClick(event: React.MouseEvent<HTMLVideoElement>) {
    if (!pendingLandmark) return
    const landmark = landmarkByKey.get(pendingLandmark)
    if (!landmark) return
    const rect = event.currentTarget.getBoundingClientRect()
    const image_x = (event.clientX - rect.left) / rect.width
    const image_y = (event.clientY - rect.top) / rect.height
    setPoints(prev => [...prev, {
      landmark: landmark.key, image_x, image_y,
      pitch_x: landmark.pitch[0], pitch_y: landmark.pitch[1],
    }])
    setSelected(points.length)
    setPendingLandmark('')
  }

  /** Click precision dominates the final error: ±2 px of click noise puts
   *  seven points at 59 % validated, ±1 px puts them at 99 %. One arrow key
   *  press moves one displayed pixel. */
  function nudge(event: React.KeyboardEvent) {
    if (selected === null || !videoRef.current) return
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
    }
    const delta = map[event.key]
    if (!delta) return
    event.preventDefault()
    const { clientWidth, clientHeight } = videoRef.current
    setPoints(prev => prev.map((p, i) => i === selected ? {
      ...p,
      image_x: Math.min(1, Math.max(0, p.image_x + delta[0] / clientWidth)),
      image_y: Math.min(1, Math.max(0, p.image_y + delta[1] / clientHeight)),
    } : p))
  }

  // What calibrating actually changes, on this match's own tracks.
  const comparison = useMemo(() => {
    if (!solved) return []
    return tracks.slice(0, 5).map(track => ({
      trackId: track.trackId,
      stored: track.storedDistanceMeters,
      recomputed: recomputeTrack(track.history, solved.homography),
      samples: track.history.length,
    }))
  }, [solved, tracks])

  async function onSave() {
    if (!solved) return
    await save({
      analysisId, matchId, correspondences: points, solved,
      frameTimestampSeconds: frameTime,
      frameVideoUrl: videoUrl,
      frameLabel: `t=${frameTime.toFixed(2)}s`,
    })
  }

  return (
    <div className="space-y-6">
      {calibration && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {calibration.validated
              ? <Check className="h-4 w-4 shrink-0 text-teal-prime" />
              : <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />}
            <span className={`arabic-text ${calibration.validated ? 'text-teal-prime' : 'text-gold'}`}>
              {calibration.validated ? 'الملعب مضبوط لهذه المباراة بدقة جيدة' : 'الملعب مضبوط لكن الدقة غير كافية'}
            </span>
            {calibration.reprojection_error_meters !== null && (
              <span className="font-display text-xs text-ice-muted">
                هامش الخطأ {calibration.reprojection_error_meters.toFixed(1)} م · {calibration.correspondences.length} نقاط
              </span>
            )}
          </div>
        </div>
      )}

      {!videoUrl ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[#05080f] p-10 text-center transition-colors hover:border-teal-prime/40">
          <Upload className={`h-6 w-6 text-teal-prime ${uploading ? 'animate-pulse' : ''}`} />
          <span className="text-sm text-ice-white arabic-text">
            {uploading ? 'جارٍ رفع الفيديو…' : 'ارفع فيديو المباراة'}
          </span>
          <span className="max-w-md text-xs leading-relaxed text-ice-muted arabic-text">
            لا يوجد فيديو لهذه المباراة بعد. ارفعه لتحدد عليه معالم الملعب، ويبقى محفوظاً للرجوع إليه.
          </span>
          <input type="file" accept="video/*" className="hidden" onChange={onPickFile} disabled={uploading} />
          {uploadError && <span className="text-xs text-gold arabic-text">{uploadError}</span>}
        </label>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div
            className="relative select-none overflow-hidden rounded-2xl border border-white/10 outline-none"
            tabIndex={0}
            onKeyDown={nudge}
            role="application"
            aria-label="لقطة من المباراة — انقر لتحديد معالم الملعب"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className={`block h-auto w-full ${pendingLandmark ? 'cursor-crosshair' : 'cursor-default'}`}
              onClick={onFrameClick}
              onLoadedMetadata={event => setDuration(event.currentTarget.duration || 0)}
              onTimeUpdate={event => setFrameTime(event.currentTarget.currentTime)}
              onSeeked={event => setFrameTime(event.currentTarget.currentTime)}
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
              playsInline
            />
            {points.map((p, index) => (
              <button
                key={`${p.landmark}-${index}`}
                type="button"
                onClick={() => setSelected(index)}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.image_x * 100}%`, top: `${p.image_y * 100}%` }}
                aria-label={landmarkByKey.get(p.landmark)?.label ?? p.landmark}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 font-display text-[10px] font-black ${
                  selected === index
                    ? 'border-teal-prime bg-teal-prime text-navy'
                    : 'border-teal-prime/70 bg-navy/80 text-teal-prime'
                }`}>
                  {index + 1}
                </span>
              </button>
            ))}
            {pendingLandmark && (
              <div className="pointer-events-none absolute inset-x-0 top-0 bg-navy/85 p-2 text-center text-xs text-teal-prime arabic-text">
                انقر على: {landmarkByKey.get(pendingLandmark)?.label}
              </div>
            )}

            {!paused && (
              <div className="pointer-events-none absolute inset-x-0 bottom-14 bg-gold/15 p-2 text-center text-xs text-gold arabic-text">
                أوقف الفيديو أولاً، ثم انقر على المعلم في الصورة
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#05080f] p-2">
              <button
                type="button"
                onClick={() => { const v = videoRef.current; if (!v) return; if (v.paused) void v.play(); else v.pause() }}
                className="rounded-lg border border-white/10 p-1.5 text-ice-white transition-colors hover:border-teal-prime/50"
                aria-label={paused ? 'تشغيل' : 'إيقاف'}
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => seekBy(-FRAME_STEP)} className="rounded-lg border border-white/10 p-1.5 text-ice-white transition-colors hover:border-teal-prime/50" aria-label="لقطة للخلف">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => seekBy(FRAME_STEP)} className="rounded-lg border border-white/10 p-1.5 text-ice-white transition-colors hover:border-teal-prime/50" aria-label="لقطة للأمام">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={FRAME_STEP}
                value={frameTime}
                onChange={event => { const v = videoRef.current; if (v) v.currentTime = Number(event.target.value) }}
                className="h-1 min-w-[8rem] flex-1 accent-teal-prime"
                aria-label="موضع الفيديو"
              />
              <span className="font-display text-[11px] tabular-nums text-ice-muted">
                {frameTime.toFixed(2)}s
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="landmark" className="mb-1 block text-xs text-ice-muted arabic-text">
                المعلم التالي ({points.length} من {RECOMMENDED_POINTS} الموصى بها)
              </label>
              <select
                id="landmark"
                value={pendingLandmark}
                onChange={event => setPendingLandmark(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#05080f] px-3 py-2.5 text-sm text-ice-white outline-none focus:border-teal-prime/50 arabic-text"
              >
                <option value="">— اختر معلماً ثم انقر عليه في الصورة —</option>
                {available.map(l => (
                  <option key={l.key} value={l.key}>
                    {l.label}{l.inBackend ? '' : ' *'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] leading-relaxed text-ice-muted arabic-text">
                المعالم المعلَّمة بنجمة إضافية، لأن الكاميرا نادراً ما تُظهر كل زوايا الملعب معاً.
                بعد وضع النقطة، حرّكها بأسهم لوحة المفاتيح لتطابق المعلم بدقة.
              </p>
            </div>

            {points.length > 0 && (
              <ul className="space-y-1.5">
                {points.map((p, index) => (
                  <li key={`${p.landmark}-${index}`} className="flex items-center gap-2 text-xs">
                    <span className="font-display text-teal-prime">{index + 1}</span>
                    <span className="flex-1 truncate text-ice-white arabic-text">{landmarkByKey.get(p.landmark)?.label}</span>
                    <button
                      type="button"
                      onClick={() => { setPoints(prev => prev.filter((_, i) => i !== index)); setSelected(null) }}
                      className="text-ice-muted transition-colors hover:text-gold"
                      aria-label="حذف النقطة"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {points.length >= 4 && !solved && (
              <p className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs text-gold arabic-text">
                لا يمكن ضبط الملعب بهذه النقاط لأنها على خط واحد تقريباً. وزّعها على عرض الملعب وطوله.
              </p>
            )}

            {solved && (
              <div className={`rounded-xl border p-3 ${solved.validated ? 'border-teal-prime/30 bg-teal-prime/5' : 'border-gold/30 bg-gold/5'}`}>
                <div className={`mb-1 flex items-center gap-2 text-xs font-bold ${solved.validated ? 'text-teal-prime' : 'text-gold'}`}>
                  {solved.validated ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  <span className="arabic-text">{solved.validated ? 'دقة جيدة' : 'دقة غير كافية'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-ice-muted arabic-text">{solved.note}</p>
                <p className="mt-1 text-[11px] text-ice-muted arabic-text">
                  الدقة الجيدة: هامش خطأ أقل من {HOLDOUT_TOLERANCE_METERS} م، وتحتاج {MIN_POINTS_FOR_HOLDOUT} نقاط على الأقل.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={!solved || saving}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? 'جارٍ الحفظ…' : 'احفظ ضبط الملعب'}
            </button>
            {saveError && <p className="text-xs text-gold arabic-text">{saveError}</p>}
          </div>
        </div>
      )}

      {comparison.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ice-white">
            <Ruler className="h-4 w-4 text-teal-prime" />
            <span className="arabic-text">المسافات قبل ضبط الملعب وبعده</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-ice-muted">
                  <th className="p-2 text-start arabic-text">اللاعب</th>
                  <th className="p-2 text-start arabic-text">قبل الضبط</th>
                  <th className="p-2 text-start arabic-text">بعد الضبط</th>
                  <th className="p-2 text-start arabic-text">أعلى سرعة</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(row => (
                  <tr key={row.trackId} className="border-t border-white/5">
                    <td className="p-2 font-display text-ice-white">#{row.trackId}</td>
                    <td className="p-2 font-display text-gold">{row.stored.toFixed(2)} م</td>
                    <td className="p-2 font-display text-teal-prime">
                      {row.recomputed ? `${row.recomputed.distanceMeters.toFixed(1)} م` : '—'}
                    </td>
                    <td className="p-2 font-display text-ice-muted">
                      {row.recomputed?.topSpeedMps != null ? `${row.recomputed.topSpeedMps.toFixed(1)} م/ث` : '—'}
                      {row.recomputed && row.recomputed.implausibleSteps > 0 && (
                        <span className="ms-1 text-gold">({row.recomputed.implausibleSteps} قفزة غير منطقية استُبعدت)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-ice-muted arabic-text">
            «قبل الضبط» هو الرقم المحفوظ حالياً، وهو غير صحيح لأنه محسوب من الصورة لا من الملعب.
            «بعد الضبط» محسوب على الملعب الحقيقي، ويغطي آخر {POSITIONAL_HISTORY_CAP} موضعاً لكل لاعب فقط، فليس مسافة المباراة كاملة.
          </p>
        </div>
      )}

      {!videoUrl && tracks.length === 0 && (
        <p className="text-xs text-ice-muted arabic-text">
          <Crosshair className="me-1 inline h-3 w-3" />
          لا توجد مواقع لاعبين محفوظة لهذا التحليل.
        </p>
      )}
    </div>
  )
}
