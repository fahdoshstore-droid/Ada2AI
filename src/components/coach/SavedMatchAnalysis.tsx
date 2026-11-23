/**
 * SavedMatchAnalysis — real, completed analyses read from the database.
 *
 * Shows what the pipeline recorded for each analysed match: the source clip,
 * the method, how many players were tracked and a snapshot of where they
 * stood IN THE CAMERA FRAME. It never shows distances, speeds or events the
 * analysis marks as unavailable or uncalibrated.
 */
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Users } from 'lucide-react'
import { getSavedAnalyses, type SavedAnalysis } from '../../services/savedAnalyses'

function AnalysisCard({ a }: { a: SavedAnalysis }) {
  const home = a.match?.home_team ?? 'الفريق الأول'
  const away = a.match?.away_team ?? 'الفريق الثاني'
  const yt = a.source?.youtube_video_id
  const start = a.source?.segment_start_seconds ?? 0
  const t1 = a.formation?.team1 ?? []
  const t2 = a.formation?.team2 ?? []
  const aspect = a.video?.width && a.video?.height ? `${a.video.width} / ${a.video.height}` : '16 / 9'

  return (
    <article className="border border-white/10 bg-white/[0.03]">
      <div className="grid gap-0 lg:grid-cols-5">
        {/* Facts */}
        <div className="space-y-5 p-6 lg:col-span-3">
          <div>
            <p className="text-xs font-semibold text-teal-prime arabic-text">
              تحليل محفوظ{a.match?.competition ? ` · ${a.match.competition}` : ''}
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-tightest text-ice-white arabic-text">
              {home} <span className="text-ice-muted">×</span> {away}
            </h3>
            <p className="mt-1 text-sm text-ice-muted arabic-text">
              {a.match?.match_date ? new Date(a.match.match_date).toLocaleDateString('ar-SA') : ''}
              {a.match?.home_score != null && a.match?.away_score != null ? ` · النتيجة ${a.match.home_score}-${a.match.away_score}` : ''}
            </p>
          </div>

          {yt && (
            <a
              href={`https://www.youtube.com/watch?v=${encodeURIComponent(yt)}&t=${Math.round(start)}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-teal-prime/40 px-4 py-2 text-sm font-bold text-teal-prime transition-colors hover:bg-teal-prime/10 arabic-text"
            >
              <ExternalLink className="h-4 w-4" />
              شاهد المقطع
            </a>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] text-ice-muted arabic-text"><Users className="h-3.5 w-3.5" /> لاعبون رُصدوا</p>
              <p className="mt-1 font-display text-3xl font-bold text-teal-prime">{a.playersTracked}</p>
            </div>
            <div>
              <p className="text-[11px] text-ice-muted arabic-text">لقطات حُلّلت</p>
              <p className="mt-1 font-display text-3xl font-bold text-ice-white">{a.method?.frames_processed ?? '—'}</p>
            </div>
          </div>

          {!a.identityConfirmed && (
            <p className="border-t border-white/10 pt-4 text-xs text-ice-muted arabic-text">
              حدّد أسماء اللاعبين في «هوية اللاعبين» بالأسفل.
            </p>
          )}
        </div>

        {/* Snapshot of positions in the camera frame */}
        <div className="border-t border-white/10 p-6 lg:col-span-2 lg:border-s lg:border-t-0">
          <p className="mb-3 text-sm font-bold text-ice-white arabic-text">مواقع اللاعبين في لقطة واحدة</p>
          <div className="relative w-full overflow-hidden border border-white/10 bg-[#06231c]" style={{ aspectRatio: aspect }}>
            <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,rgba(0,220,200,0.08),transparent_70%)]" aria-hidden="true" />
            {[...t1.map(p => ({ ...p, team: 1 })), ...t2.map(p => ({ ...p, team: 2 }))].map(p => (
              <span
                key={`${p.team}-${p.track_id}`}
                className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[9px] font-bold ${p.team === 1 ? 'bg-teal-prime text-navy-dark' : 'bg-scout-blue text-white'}`}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                title={`رقم ${p.track_id}`}
              >
                {p.track_id}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-ice-muted arabic-text">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-teal-prime" /> مجموعة أ ({t1.length})</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-scout-blue" /> مجموعة ب ({t2.length})</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function SavedMatchAnalysis() {
  const q = useQuery({ queryKey: ['saved-analyses'], queryFn: getSavedAnalyses, staleTime: 60_000 })
  if (q.isPending) return <p className="text-sm text-ice-muted arabic-text" role="status">جارٍ تحميل التحليلات المحفوظة…</p>
  if (q.isError) return <p className="text-sm text-ice-muted arabic-text">تعذّر تحميل التحليلات المحفوظة. حاول مرة أخرى.</p>
  if (!q.data.length) return null
  return (
    <div className="space-y-6">
      {q.data.map(a => <AnalysisCard key={a.id} a={a} />)}
    </div>
  )
}
