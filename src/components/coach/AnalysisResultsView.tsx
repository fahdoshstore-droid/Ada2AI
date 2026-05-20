/**
 * AnalysisResultsView — Ada2AI Coach Components
 *
 * Displays analysis results from video_analyses.analysis_data (jsonb).
 * Supports both coach-entered results and YOLO backend results (v1).
 * No fake data — all values come from Supabase.
 */
import { type AnalysisResults } from '../../services/analysis'
import { StatBar } from './StatBar'

interface Props {
  results: AnalysisResults | null | undefined
  playerName?: string
}

function HeatmapGrid({ heatmap }: { heatmap: number[][] }) {
  const flat = heatmap.flat()
  const maxVal = Math.max(...flat, 1)

  return (
    <div className="space-y-2">
      <p className="text-xs text-ice-muted arabic-text">خريطة حرارية</p>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${heatmap[0]?.length ?? 5}, 1fr)` }}
      >
        {flat.map((val, i) => {
          const intensity = val / maxVal
          return (
            <div
              key={i}
              className="rounded h-6 flex items-center justify-center"
              style={{
                background: `rgba(0, 194, 168, ${Math.max(0.05, intensity)})`,
                minHeight: '24px',
              }}
              title={`${val} detections`}
            >
              <span className="text-[9px] font-bold" style={{ color: intensity > 0.5 ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                {val > 0 ? val : ''}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between text-[9px] arabic-text" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span>دفاعي</span>
        <span>وسط</span>
        <span>هجومي</span>
      </div>
    </div>
  )
}

export function AnalysisResultsView({ results, playerName }: Props) {
  if (!results) {
    return (
      <div className="text-center py-6">
        <p className="text-ice-muted text-sm arabic-text">لا توجد نتائج تحليل بعد</p>
      </div>
    )
  }

  // Show error if YOLO processing failed
  if (results.error) {
    return (
      <div className="bg-red-400/10 rounded-lg p-3 border border-red-400/20" dir="rtl">
        <p className="text-sm text-red-400 arabic-text">⚠️ فشل التحليل: {results.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" dir="rtl">
      {playerName && (
        <p className="text-xs text-ice-muted arabic-text mb-2">
          نتائج تحليل: <span className="text-ice-white font-medium">{playerName}</span>
          {results.version && (
            <span className="text-ice-muted/50 mr-2">({results.version})</span>
          )}
        </p>
      )}

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {results.touches_estimate != null && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-ice-white">{results.touches_estimate}</div>
            <div className="text-xs text-ice-muted arabic-text">لمسات</div>
          </div>
        )}
        {results.speed_estimate_kmh != null && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-ice-white">{results.speed_estimate_kmh}</div>
            <div className="text-xs text-ice-muted arabic-text">كم/س</div>
          </div>
        )}
        {results.total_detections != null && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-ice-white">{results.total_detections}</div>
            <div className="text-xs text-ice-muted arabic-text">اكتشافات</div>
          </div>
        )}
        {results.duration_seconds != null && (
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-ice-white">{results.duration_seconds}s</div>
            <div className="text-xs text-ice-muted arabic-text">مدة الفيديو</div>
          </div>
        )}
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        {results.activity_score != null && (
          <StatBar label="نشاط اللاعب" value={results.activity_score} color="#00C2A8" />
        )}
        {results.possession_involvement != null && (
          <StatBar label="مشاركة في الاستحواذ" value={results.possession_involvement} color="#00D4FF" />
        )}
      </div>

      {/* Movement zones */}
      {results.movement_zones && results.movement_zones.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-ice-muted arabic-text">مناطق التحرك</p>
          {results.movement_zones.map(zone => (
            <StatBar
              key={zone.zone}
              label={zone.zone}
              value={zone.percentage}
              color={zone.zone === 'دفاعي' ? '#00D4FF' : zone.zone === 'وسط' ? '#00FF88' : '#FF4444'}
            />
          ))}
        </div>
      )}

      {/* Heatmap (YOLO v1 backend) */}
      {results.heatmap && results.heatmap.length > 0 && (
        <HeatmapGrid heatmap={results.heatmap} />
      )}

      {/* Notes */}
      {results.notes && (
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-ice-muted arabic-text mb-1">ملاحظات المدرب</p>
          <p className="text-sm text-ice-white arabic-text">{results.notes}</p>
        </div>
      )}
    </div>
  )
}