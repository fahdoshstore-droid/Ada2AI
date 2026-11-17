/**
 * EvaluationBreakdown — read-only view of a saved report's 32 item scores.
 *
 * Collapsed by default: the four axis bars already answer "how good", this
 * answers "where exactly". Renders nothing when a report has no detail, which
 * is the case for every evaluation saved before migration 20261117 — those
 * keep showing their four axis percentages and nothing is invented for them.
 */
import { AXES, MAX_SCORE, scoresFromDetails, type EvaluationDetails } from './axes'

export default function EvaluationBreakdown({ details }: { details?: EvaluationDetails | null }) {
  const scores = scoresFromDetails(details)
  if (!scores) return null

  return (
    <details className="mt-5 border-t border-white/5 pt-4">
      <summary className="cursor-pointer list-none text-xs font-bold text-teal-prime transition-colors hover:text-teal-glow arabic-text">
        تفصيل البنود ({AXES.reduce((n, a) => n + a.items.length, 0)} بنداً)
        {details?.source && (
          <span className="ms-2 font-normal text-ice-muted">
            — {details.source === 'scout' ? 'تقرير كشاف' : 'تقييم مدرب'}
          </span>
        )}
      </summary>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {AXES.map((axis, ai) => (
          <div key={axis.key}>
            <h3 className="mb-2 text-xs font-bold arabic-text" style={{ color: axis.color }}>{axis.label}</h3>
            <ul>
              {axis.items.map((item, ii) => {
                const score = scores[ai][ii]
                return (
                  <li key={item} className="flex items-center justify-between gap-3 border-b border-white/[0.04] py-1 text-xs last:border-0">
                    <span className="text-ice-muted arabic-text">{item}</span>
                    <span className="flex flex-shrink-0 items-center gap-1" aria-label={`${score} من ${MAX_SCORE}`}>
                      {Array.from({ length: MAX_SCORE }, (_, i) => (
                        <span key={i} aria-hidden="true" className="h-1.5 w-1.5 rounded-full"
                          style={{ background: i < score ? axis.color : 'rgba(255,255,255,0.12)' }} />
                      ))}
                      <b className="ms-1 font-display text-[11px] text-ice-white/70">{score}</b>
                    </span>
                  </li>
                )
              })}
            </ul>
            {details?.axes?.[axis.key]?.note && (
              <p className="mt-2 text-[11px] leading-relaxed text-ice-muted arabic-text">
                {details.axes[axis.key]!.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {(details?.positions?.length || details?.match) && (
        <p className="mt-4 border-t border-white/5 pt-3 text-[11px] text-ice-muted arabic-text">
          {details.positions?.length ? `المراكز: ${details.positions.join(' · ')}` : ''}
          {details.positions?.length && details.match ? ' — ' : ''}
          {details.match ? `المباراة: ${details.match}` : ''}
        </p>
      )}
    </details>
  )
}
