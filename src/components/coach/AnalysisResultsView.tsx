/**
 * AnalysisResultsView — Ada2AI Coach Components
 *
 * Displays analysis results from video_analyses.analysis_data (jsonb).
 * No fake data — all values come from Supabase.
 */
import { type AnalysisResults } from '../../services/analysis'
import { StatBar } from './StatBar'

interface Props {
  results: AnalysisResults | null | undefined
  playerName?: string
}

export function AnalysisResultsView({ results, playerName }: Props) {
  if (!results) {
    return (
      <div className="text-center py-6">
        <p className="text-ice-muted text-sm arabic-text">لا توجد نتائج تحليل بعد</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" dir="rtl">
      {playerName && (
        <p className="text-xs text-ice-muted arabic-text mb-2">
          نتائج تحليل: <span className="text-ice-white font-medium">{playerName}</span>
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