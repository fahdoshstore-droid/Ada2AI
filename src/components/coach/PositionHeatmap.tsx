/**
 * PositionHeatmap — «خريطة التمركز» tied to a real Sport ID.
 *
 * The report mockup (تقرير مباراة أدائي) showed this under a player's card
 * with an honest disclaimer: "الخريطة هنا مولّدة حسب مركز اللاعب للعرض فقط.
 * في المنصة تأتي من حقل heatmap في نتائج التحليل." That field has never
 * existed — nothing in the backend has ever written analysis_data.heatmap,
 * src/components/coach/AnalysisResultsView.tsx's HeatmapGrid has stood dead
 * since it shipped. The data that actually exists is positional_history.
 *
 * positional_history is frame-normalized — x_norm = cx / frame_width
 * (vision_core/graph.py:138) — i.e. where the player sat IN THE CAMERA
 * FRAME, not on the pitch. Showing that directly as a "positioning map"
 * would repeat the exact mistake this whole effort started by fixing
 * (pixels passed off as metres): every point here is required to go through
 * the stored homography first. Without a calibration, this component says so
 * and shows nothing, rather than a plausible-looking camera-framing map.
 */
import { useMemo } from 'react'
import { AlertTriangle, MapPin } from 'lucide-react'
import {
  projectHistory, buildDensityGrid, SPARSE_POINTS_THRESHOLD,
  PITCH_LENGTH, PITCH_WIDTH,
  type PositionSample, type Homography,
} from '../../services/calibration'

interface Props {
  history: PositionSample[]
  homography: Homography | null
  calibrationValidated: boolean
  label: string
}

/** Portrait pitch outline, same viewBox convention as the Floodlight
 *  cinema components: width = pitch width, height = pitch length. */
function PitchOutline() {
  return (
    <svg viewBox="0 0 68 105" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="rgba(238,239,238,.28)" strokeWidth="0.4">
        <rect x="1" y="1" width="66" height="103" />
        <line x1="1" y1="52.5" x2="67" y2="52.5" />
        <circle cx="34" cy="52.5" r="9.15" />
        <rect x="13.85" y="1" width="40.3" height="16.5" />
        <rect x="24.85" y="1" width="18.3" height="5.5" />
        <rect x="13.85" y="87.5" width="40.3" height="16.5" />
        <rect x="24.85" y="98.5" width="18.3" height="5.5" />
      </g>
    </svg>
  )
}

/** Metres-from-centre -> percentage position inside the portrait box. */
function toPercent(x: number, y: number): { left: number; top: number } {
  return {
    left: ((y + PITCH_WIDTH / 2) / PITCH_WIDTH) * 100,
    top: ((x + PITCH_LENGTH / 2) / PITCH_LENGTH) * 100,
  }
}

export default function PositionHeatmap({ history, homography, calibrationValidated, label }: Props) {
  const projection = useMemo(
    () => (homography ? projectHistory(history, homography) : null),
    [history, homography],
  )

  if (!homography) {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 text-xs text-gold arabic-text">
        <AlertTriangle className="me-1 inline h-3.5 w-3.5" />
        لا توجد معايرة محفوظة لهذه المباراة. المواضع المخزَّنة إحداثيات داخل إطار الكاميرا، لا موضعاً على الملعب —
        عرضها بلا معايرة يُظهر تأطير الكاميرا لا تمركز اللاعب. عايِر الملعب في القسم 03 أولاً.
      </div>
    )
  }

  const { points, dropped } = projection!
  const sparse = points.length < SPARSE_POINTS_THRESHOLD
  const grid = sparse ? null : buildDensityGrid(points)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-ice-white">
          <MapPin className="h-4 w-4 text-teal-prime" />
          <span className="arabic-text">خريطة التمركز — {label}</span>
        </h4>
        {!calibrationValidated && (
          <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[10px] text-gold arabic-text">معايرة غير متحقَّقة</span>
        )}
      </div>

      <div className="relative mx-auto aspect-[68/105] w-full max-w-[220px] overflow-hidden rounded-xl border border-white/10 bg-[#06231c]">
        <PitchOutline />
        {sparse
          ? points.map((p, index) => {
              const { left, top } = toPercent(p.x, p.y)
              return (
                <span
                  key={index}
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-prime shadow-[0_0_6px_rgba(0,220,200,0.8)]"
                  style={{ left: `${left}%`, top: `${top}%` }}
                  title={p.timestamp != null ? `t=${p.timestamp.toFixed(1)}s` : undefined}
                />
              )
            })
          : grid!.counts.map((rowArr, row) =>
              rowArr.map((count, col) => {
                if (count === 0) return null
                const intensity = count / grid!.maxCount
                return (
                  <span
                    key={`${row}-${col}`}
                    className="absolute"
                    style={{
                      left: `${(col / grid!.cols) * 100}%`,
                      top: `${(row / grid!.rows) * 100}%`,
                      width: `${100 / grid!.cols}%`,
                      height: `${100 / grid!.rows}%`,
                      background: `rgba(0, 220, 200, ${Math.max(0.08, intensity * 0.85)})`,
                    }}
                  />
                )
              }),
            )}
      </div>

      <p className="text-[11px] leading-relaxed text-ice-muted arabic-text">
        {sparse
          ? `${points.length} عيّنة فقط — أقل من النقاط اللازمة لخريطة كثافة (${SPARSE_POINTS_THRESHOLD})، فتُعرض كنقاط فعلية لا كتقدير. هذا بسبب frame_stride=30 في التحليل الحالي: عيّنة واحدة كل 30 إطاراً.`
          : `${points.length} عيّنة موزّعة على شبكة ${grid!.cols}×${grid!.rows}.`}
        {dropped > 0 && ` استُبعدت ${dropped} عيّنة سقطت خارج حدود الملعب بعد المعايرة.`}
      </p>
    </div>
  )
}
