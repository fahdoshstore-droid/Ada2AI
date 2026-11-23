/**
 * MatchReportsPanel — «تقارير تحليل المباريات» inside the Coach Dashboard.
 *
 * Lists matches whose saved report loads successfully from the vision API
 * and shows the selected report inline. Only sections the report actually
 * contains are rendered; nothing is estimated, and nothing is re-analysed.
 */
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Loader2, AlertCircle, Users, Target, ShieldCheck, ChevronLeft } from 'lucide-react'
import {
  listEligibleReports, getMatchReport, ApiAuthError,
  type EligibleReport, type MatchReport, type MatchSummary, type ExternalGoal,
} from '../../services/matchIntelligence'


function title(m: MatchSummary) {
  return `${m.home_team || '؟'} × ${m.away_team || '؟'}`
}

function Section({ heading, icon: Icon, children }: { heading: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-5">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ice-white arabic-text">
        {Icon && <Icon className="h-4 w-4 text-teal-prime" />}
        {heading}
      </h4>
      {children}
    </div>
  )
}

function GoalsList({ goals, half }: { goals?: ExternalGoal[]; half: string }) {
  if (!goals?.length) return null
  return (
    <div>
      <p className="mb-2 text-[11px] text-ice-muted arabic-text">{half}</p>
      <ul className="space-y-1.5">
        {goals.map((g, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
            <span className="text-ice-white" dir="ltr">{g.player ?? '—'}</span>
            <span className="text-xs text-ice-muted" dir="ltr">{g.team ?? ''} · {g.minute ?? '—'}'</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReportView({ match, report }: { match: MatchSummary; report: MatchReport }) {
  const ext = report.external_match_data
  const players = Object.values(report.players ?? {})
  const teams = Object.values(report.teams ?? {})
  const dq = report.data_quality
  const tracked = dq?.tracking_quality?.person_tracks ?? players.length
  const isExternalOnly = !!ext && tracked === 0

  return (
    <div className="space-y-5" data-testid="match-report-view" data-match-id={report.match_id}>
      {/* Overview */}
      <div>
        <p className="text-xs font-semibold text-teal-prime arabic-text">
          تقرير محفوظ{match.competition ? ` · ${match.competition}` : ''}{match.season ? ` · ${match.season}` : ''}
        </p>
        <h3 className="mt-1 text-2xl font-black text-ice-white arabic-text">{title(match)}</h3>
        <p className="mt-1 text-xs text-ice-muted arabic-text">
          {[match.match_date ? new Date(match.match_date).toLocaleDateString('ar-SA') : null, match.venue].filter(Boolean).join(' · ')}
        </p>
      </div>

      <Section heading="ملخص التقرير" icon={ShieldCheck}>
        <p className="text-sm text-ice-white arabic-text">
          {isExternalOnly
            ? 'أهداف المباراة وتشكيلة الفريقين.'
            : `رصدت المنصة ${tracked} لاعبين من فيديو المباراة.`}
        </p>
      </Section>

      {ext?.goals && (ext.goals.first_half?.length || ext.goals.second_half?.length) ? (
        <Section heading="الأهداف" icon={Target}>
          <div className="grid gap-4 sm:grid-cols-2">
            <GoalsList goals={ext.goals.first_half} half="الشوط الأول" />
            <GoalsList goals={ext.goals.second_half} half="الشوط الثاني" />
          </div>
        </Section>
      ) : null}

      {ext?.formations && Object.keys(ext.formations).length > 0 && (
        <Section heading="التشكيلات">
          <div className="flex flex-wrap gap-3">
            {Object.entries(ext.formations).map(([team, f]) => (
              <div key={team} className="rounded-lg bg-white/5 px-4 py-2">
                <p className="text-[11px] text-ice-muted" dir="ltr">{team}</p>
                <p className="font-display text-lg font-bold text-ice-white" dir="ltr">{f}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {players.length > 0 && (
        <Section heading="اللاعبون المرصودون" icon={Users}>
          {teams.length > 0 && (
            <p className="mb-3 text-xs text-ice-muted arabic-text">
              {teams.map(t => `${t.team_label ?? 'مجموعة'}: ${t.player_count ?? 0}`).join(' · ')}
            </p>
          )}
          <ul className="grid gap-2 sm:grid-cols-2">
            {players.map(p => {
              const frames = p.physical?.frames_visible?.value
              return (
                <li key={p.track_id} className="rounded-lg bg-white/5 px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ice-white arabic-text">رقم {p.track_id}</span>
                    <span className="text-ice-muted arabic-text">{p.team ? `مجموعة ${p.team === 1 ? 'أ' : 'ب'}` : ''}{frames != null ? ` · ظهر في ${frames} لقطات` : ''}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        </Section>
      )}

      {report.coach?.tactical_shape && players.length > 0 && (
        <Section heading="الشكل التكتيكي">
          <p className="text-sm text-ice-white arabic-text">{report.coach.tactical_shape.replace(/\bvs\b/gi, 'مقابل')}</p>
        </Section>
      )}

      {players.length > 0 && !dq?.player_identity_confirmed && (
        <p className="border-t border-white/10 pt-4 text-xs text-ice-muted arabic-text">
          الأرقام مؤقتة لكل لاعب ظهر في الفيديو؛ يحدد المدرب أسماءهم من صفحة «تحليل المباراة».
        </p>
      )}


    </div>
  )
}

type SelectedState =
  | { phase: 'idle' }
  | { phase: 'loading'; id: string }
  | { phase: 'ready'; id: string; report: MatchReport }
  | { phase: 'unavailable' | 'incomplete' | 'auth' | 'error'; id: string }

export default function MatchReportsPanel() {
  const list = useQuery({
    queryKey: ['eligible-match-reports'],
    queryFn: ({ signal }) => listEligibleReports(signal),
    retry: (count, err) => !(err instanceof ApiAuthError) && count < 1,
    staleTime: 60_000,
  })
  const [selected, setSelected] = useState<SelectedState>({ phase: 'idle' })
  const requestRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const open = async (item: EligibleReport) => {
    const id = item.match.id
    const request = ++requestRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setSelected({ phase: 'loading', id })
    try {
      const result = await getMatchReport(id, controller.signal)
      if (request !== requestRef.current) return // a newer selection won
      if (result.kind === 'ok') setSelected({ phase: 'ready', id, report: result.report })
      else if (result.kind === 'incomplete') setSelected({ phase: 'incomplete', id })
      else setSelected({ phase: 'unavailable', id })
    } catch (err) {
      if (request !== requestRef.current || (err as Error)?.name === 'AbortError') return
      setSelected({ phase: err instanceof ApiAuthError ? 'auth' : 'error', id })
    }
  }

  const items = list.data ?? []
  const current = selected.phase !== 'idle' ? items.find(i => i.match.id === selected.id) : undefined

  return (
    <div className="glass-card rounded-2xl p-6" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-3 text-lg font-bold text-ice-white">
          <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">03</span>
          <FileText className="h-5 w-5 text-teal-prime" />
          <span className="arabic-text">تقارير تحليل المباريات</span>
        </h3>
        {items.length > 0 && <span className="text-xs text-ice-muted arabic-text">{items.length} تقارير محفوظة</span>}
      </div>

      {list.isPending && (
        <p className="flex items-center gap-2 text-sm text-ice-muted arabic-text" role="status">
          <Loader2 className="h-4 w-4 animate-spin" /> جارٍ تحميل التقارير المحفوظة…
        </p>
      )}
      {list.isError && (
        <p className="flex items-center gap-2 text-sm text-red-400 arabic-text" role="alert">
          <AlertCircle className="h-4 w-4" />
          {list.error instanceof ApiAuthError
            ? 'تعذّر التحقق من الصلاحية لدى خدمة التحليل. سجّل الدخول من جديد ثم حاول مرة أخرى.'
            : 'خدمة تحليل المباريات لا تستجيب الآن. لم تُعرض أي بيانات بديلة.'}
        </p>
      )}
      {list.isSuccess && items.length === 0 && (
        <p className="text-sm text-ice-muted arabic-text">لا توجد مباريات لها تقرير تحليل محفوظ بعد.</p>
      )}

      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <ul className="space-y-2 lg:col-span-1" aria-label="المباريات المحللة">
            {items.map(item => {
              const active = selected.phase !== 'idle' && selected.id === item.match.id
              return (
                <li key={item.match.id}>
                  <button
                    type="button"
                    onClick={() => open(item)}
                    aria-pressed={active}
                    className={`flex w-full items-center justify-between rounded-xl p-4 text-start transition-colors ${active ? 'border border-teal-prime/40 bg-teal-prime/10' : 'bg-white/5 hover:bg-white/[0.08]'}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-ice-white arabic-text">{title(item.match)}</p>
                      <p className="mt-0.5 text-[11px] text-ice-muted arabic-text">
                        {[item.match.competition, item.match.match_date ? new Date(item.match.match_date).toLocaleDateString('ar-SA') : null].filter(Boolean).join(' · ')}
                      </p>
                      <p className="mt-1 text-[11px] text-teal-prime arabic-text">تقرير متاح</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-teal-prime" />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="min-w-0 lg:col-span-2">
            {selected.phase === 'idle' && (
              <p className="rounded-xl bg-white/5 p-6 text-sm text-ice-muted arabic-text">اختر مباراة لعرض تقرير تحليلها هنا.</p>
            )}
            {selected.phase === 'loading' && (
              <p className="flex items-center gap-2 rounded-xl bg-white/5 p-6 text-sm text-ice-muted arabic-text" role="status">
                <Loader2 className="h-4 w-4 animate-spin" /> جارٍ تحميل التقرير…
              </p>
            )}
            {selected.phase === 'unavailable' && <p className="rounded-xl bg-white/5 p-6 text-sm text-gold arabic-text">التقرير غير متاح لهذه المباراة الآن.</p>}
            {selected.phase === 'incomplete' && <p className="rounded-xl bg-white/5 p-6 text-sm text-gold arabic-text">تحليل هذه المباراة لم يكتمل بعد.</p>}
            {selected.phase === 'auth' && <p className="rounded-xl bg-white/5 p-6 text-sm text-red-400 arabic-text">تعذّر التحقق من الصلاحية لعرض هذا التقرير.</p>}
            {selected.phase === 'error' && <p className="rounded-xl bg-white/5 p-6 text-sm text-red-400 arabic-text">خدمة التحليل لم تستجب. حاول مرة أخرى.</p>}
            {selected.phase === 'ready' && current && <ReportView match={current.match} report={selected.report} />}
          </div>
        </div>
      )}
    </div>
  )
}
