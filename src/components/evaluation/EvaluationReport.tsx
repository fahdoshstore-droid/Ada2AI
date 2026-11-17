/**
 * EvaluationReport — the one evaluation form in Ada2AI.
 *
 * Ported from scout-report-preview.html and now shared by both the scout
 * dashboard and the coach's evaluation page, so a coach report and a scout
 * report describe the same player on the same scale.
 *
 * Writes to `scout_reports`, the table the backend already built for this
 * form: `ratings` jsonb holds the 32 item scores, `notes` jsonb the per-axis
 * notes, and `total_score` is computed by the table's own write trigger —
 * this component never sends a score it calculated itself. The percentages
 * shown while filling in are a live preview of that same formula.
 */
import { useMemo, useState } from 'react'
import { X, Printer, Save, Loader2 } from 'lucide-react'
import type { Player } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useCreateScoutReport } from '../../hooks/useCreateScoutReport'
import { AXES, POSITIONS, axisPercent, emptyScores, overallFromScores } from './axes'

interface Props {
  player: Player
  /** 'scout' adds the discovery date and the match; the scoring is identical. */
  variant?: 'scout' | 'coach'
  onClose?: () => void
  onSaved?: () => void
}

const field = 'w-full rounded-lg border border-white/10 bg-[#05080f] px-3 py-2.5 text-sm text-ice-white outline-none transition-colors focus:border-teal-prime/50 arabic-text'

export default function EvaluationReport({ player, variant = 'scout', onClose, onSaved }: Props) {
  const { user, profile } = useAuth()
  const { mutate, isPending, isSuccess, error } = useCreateScoutReport()
  const isScout = variant === 'scout'

  const [scores, setScores] = useState<number[][]>(emptyScores)
  const [picked, setPicked] = useState<string[]>(() => {
    const match = POSITIONS.find(p => p[1] === (player.position ?? ''))
    return match ? [match[0]] : []
  })
  const [opinion, setOpinion] = useState('')
  const [axisNotes, setAxisNotes] = useState<string[]>(() => AXES.map(() => ''))
  const [matchName, setMatchName] = useState('')
  const [ageGroup, setAgeGroup] = useState(player.age ? `تحت ${player.age + 1}` : '')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const axisPcts = useMemo(() => scores.map(axisPercent), [scores])
  const overall = useMemo(() => overallFromScores(scores), [scores])

  // RLS on scout_reports: only a profile whose user_type is 'scout' may insert.
  // Say so up front instead of letting the save fail with a database error.
  const canSave = profile?.user_type === 'scout'

  const setScore = (ai: number, ii: number, value: number) =>
    setScores(prev => prev.map((row, r) => (r === ai ? row.map((v, c) => (c === ii ? value : v)) : row)))

  const save = () => {
    if (!user || !canSave) return
    const birthYear = player.age ? new Date().getFullYear() - player.age : null

    mutate({
      scoutId: user.id,
      playerId: player.id,
      playerName: player.name?.trim() || 'لاعب غير مسمّى',
      birthYear,
      club: player.club,
      position: player.position,
      pitchPositions: picked,
      targetCategory: ageGroup,
      discoveryDate: date,
      match: matchName,
      scores,
      axisNotes,
      opinion,
      scoutName: profile?.full_name ?? null,
    }, { onSuccess: () => onSaved?.() })
  }

  return (
    <div dir="rtl" className="glass-premium rounded-2xl border border-teal-prime/20 p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tightest text-ice-white arabic-text">
            {isScout ? 'نموذج تقييم الكشاف' : 'تقييم المدرب'}
          </h2>
          <p className="mt-1 text-sm text-ice-muted arabic-text">
            اضغط الأرقام لتغيير التقييم (1 ضعيف … 5 ممتاز)، والمجموع يتحدث مباشرة.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="إغلاق النموذج"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-ice-muted transition-colors hover:bg-white/10 hover:text-ice-white">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Identity — read from the player record, never retyped */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-ice-muted arabic-text">اسم اللاعب</label>
          <p className={`${field} !bg-white/5 truncate`}>{player.name || 'غير معروف'}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs text-ice-muted arabic-text">النادي</label>
          <p className={`${field} !bg-white/5 truncate`}>{player.club || '—'}</p>
        </div>
        <div>
          <label htmlFor="ev-age" className="mb-1 block text-xs text-ice-muted arabic-text">الفئة المستهدفة</label>
          <input id="ev-age" className={field} value={ageGroup} onChange={e => setAgeGroup(e.target.value)} placeholder="تحت 16" />
        </div>
        <div>
          <label htmlFor="ev-date" className="mb-1 block text-xs text-ice-muted arabic-text">
            {isScout ? 'تاريخ الاكتشاف' : 'تاريخ التقييم'}
          </label>
          <input id="ev-date" type="date" dir="ltr" className={field} value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[230px_1fr]">
        {/* Pitch */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <label className="mb-2 block text-xs text-ice-muted arabic-text">مركز اللاعب في الملعب</label>
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[200px] overflow-hidden rounded-lg border-2 border-white/20 bg-gradient-to-b from-[#14532d] to-[#166534]">
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-white/25" />
            <div className="absolute left-1/2 top-1/2 h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25" />
            {POSITIONS.map(([code, title, x, y]) => {
              const on = picked.includes(code)
              return (
                <button key={code} type="button" title={title} aria-pressed={on}
                  onClick={() => setPicked(p => (on ? p.filter(c => c !== code) : [...p, code]))}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute z-[2] flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors ${
                    on ? 'border-white bg-teal-prime text-navy-dark' : 'border-white/40 bg-black/50 text-white'}`}>
                  {code}
                </button>
              )
            })}
          </div>
        </div>

        {/* Opinion */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <label htmlFor="ev-op" className="mb-1 block text-xs text-ice-muted arabic-text">
            {isScout ? 'رأي الكشاف' : 'رأي المدرب'}
          </label>
          <textarea id="ev-op" value={opinion} onChange={e => setOpinion(e.target.value)}
            className={`${field} min-h-[140px] resize-y`} placeholder="ملخص ما شاهدته: نقاط القوة، ما يحتاج تطويراً، والسياق." />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-ice-muted arabic-text">
                {isScout ? 'اسم الكشاف' : 'اسم المدرب'}
              </label>
              <p className={`${field} !bg-white/5 truncate`}>{profile?.full_name || 'الحساب الحالي'}</p>
            </div>
            <div>
              <label htmlFor="ev-match" className="mb-1 block text-xs text-ice-muted arabic-text">المباراة</label>
              <input id="ev-match" className={field} value={matchName} onChange={e => setMatchName(e.target.value)} placeholder="الفريق × الفريق" />
            </div>
          </div>
        </div>
      </div>

      {/* Four axes */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {AXES.map((axis, ai) => (
          <div key={axis.key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="mb-2 flex items-center justify-between text-base font-bold arabic-text" style={{ color: axis.color }}>
              <span>{axis.label}</span>
              <b className="font-display text-lg">{axisPcts[ai]}%</b>
            </h3>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${axisPcts[ai]}%`, background: axis.color }} />
            </div>
            <ul className="space-y-0">
              {axis.items.map((item, ii) => (
                <li key={item} className="flex items-center justify-between gap-2 border-b border-white/[0.05] py-1.5 text-[13px] last:border-0">
                  <span className="text-ice-white/80 arabic-text">{item}</span>
                  <span className="flex flex-shrink-0 gap-1" role="group" aria-label={`${axis.label} — ${item}`}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const on = scores[ai][ii] === n
                      return (
                        <button key={n} type="button" aria-pressed={on} aria-label={`${n} من 5`}
                          onClick={() => setScore(ai, ii, n)}
                          style={on ? { background: axis.color, borderColor: axis.color, color: '#000' } : undefined}
                          className={`h-6 w-6 rounded-md border text-xs font-bold transition-colors ${
                            on ? '' : 'border-white/15 text-ice-muted hover:border-white/30 hover:text-ice-white'}`}>
                          {n}
                        </button>
                      )
                    })}
                  </span>
                </li>
              ))}
            </ul>
            <label htmlFor={`ev-n-${axis.key}`} className="mb-1 mt-3 block text-xs text-ice-muted arabic-text">ملاحظات {axis.label}</label>
            <textarea id={`ev-n-${axis.key}`} value={axisNotes[ai]}
              onChange={e => setAxisNotes(p => p.map((v, i) => (i === ai ? e.target.value : v)))}
              className={`${field} min-h-[56px] resize-y`} />
          </div>
        ))}
      </div>

      {/* Total + actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div>
          <span className="block text-xs text-ice-muted arabic-text">النتيجة الإجمالية</span>
          <span className="font-display text-4xl font-black text-gradient-teal">{overall}%</span>
          <span className="ms-2 text-xs text-ice-muted arabic-text">
            متوسط المحاور الأربعة{isSuccess ? ' — النتيجة المحفوظة تُحتسب في قاعدة البيانات' : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!canSave && (
            <span className="max-w-sm text-sm text-gold arabic-text">
              الحفظ متاح لحساب كشاف فقط. يمكنك تعبئة التقرير وطباعته، ولن يُحفظ في قاعدة البيانات.
            </span>
          )}
          {error && <span className="text-sm text-gold arabic-text">تعذّر الحفظ: {error.message}</span>}
          {isSuccess && <span className="text-sm text-teal-prime arabic-text">حُفظ التقرير</span>}
          <button type="button" onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-teal-prime/30 px-5 py-3 text-sm font-bold text-teal-prime transition-colors hover:bg-teal-prime/10 arabic-text">
            <Printer className="h-4 w-4" /> طباعة
          </button>
          <button type="button" onClick={save} disabled={isPending || !canSave}
            className="flex items-center gap-2 rounded-lg bg-teal-prime px-5 py-3 text-sm font-bold text-navy-dark transition-opacity disabled:opacity-50 arabic-text">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ التقرير
          </button>
        </div>
      </div>
    </div>
  )
}
