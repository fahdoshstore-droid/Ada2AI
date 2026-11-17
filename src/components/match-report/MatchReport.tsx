/**
 * MatchReport — one post-match report for coach, player and scout, in the
 * form first drawn for Al Rawdha: every number sits under the source it came from, a track
 * is anonymous until the coach links it to a Sport ID, and what the
 * platform cannot measure yet is listed without a number.
 *
 * Same component and tabs for all three roles; ROLE_VIEW narrows the view:
 *   coach  — team, every track, Sport ID, and the link action
 *   player — his own line and card
 *   scout  — linked players only
 *
 * Two layers, kept visibly apart:
 *   1. The viewer's own team strip — live from Supabase, derived from who
 *      is signed in (services/clubReport); no club is hardcoded.
 *   2. The match body — the illustrative example, until the club has an
 *      analysed match. Real club players are listed with their real Sport
 *      IDs but never given example figures.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EXAMPLE_MATCH, EVENTS, CV_STATS, COACH_STATS, NOT_AVAILABLE, ROLE_VIEW, EXAMPLE_OWN_INDEX,
  buildExampleTracks, type ReportRole, type ReportTab, type ExampleTrack,
} from './simData'
import { useTeamReport } from '../../hooks/useClubReport'
import { useAuth } from '../../contexts/AuthContext'

type ChipKind = 'cv' | 'coach' | 'none'
const CHIP: Record<ChipKind, string> = {
  cv: 'text-teal-prime border-teal-prime/50',
  coach: 'text-scout-blue border-scout-blue/60',
  none: 'text-ice-muted border-ice-muted/50',
}
function Chip({ kind, children }: { kind: ChipKind; children: React.ReactNode }) {
  return <span className={`whitespace-nowrap rounded-full border px-1.5 text-[10px] font-bold arabic-text ${CHIP[kind]}`}>{children}</span>
}

const ratingClass = (r: number | null) =>
  r == null ? 'border border-dashed border-ice-muted text-ice-muted'
    : r >= 8 ? 'bg-teal-prime text-navy' : r >= 7 ? 'bg-scout-blue text-white' : 'bg-gold text-navy'
const ratingText = (r: number | null) => (r == null ? '—' : r.toFixed(1))

function PitchLines() {
  return (
    <svg viewBox="0 0 68 105" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="rgba(238,239,238,.32)" strokeWidth="0.4">
        <rect x="1" y="1" width="66" height="103" /><line x1="1" y1="52.5" x2="67" y2="52.5" />
        <circle cx="34" cy="52.5" r="9.15" />
        <rect x="13.85" y="1" width="40.3" height="16.5" /><rect x="24.85" y="1" width="18.3" height="5.5" />
        <rect x="13.85" y="87.5" width="40.3" height="16.5" /><rect x="24.85" y="98.5" width="18.3" height="5.5" />
      </g>
    </svg>
  )
}

function seeded(seed: number) {
  let s = seed * 9301 + 49297
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
}

/** Drawn from the formation slot — an example shape, not tracking data. The
 *  real map is coach/PositionHeatmap and requires a calibration. */
function ExampleHeatmap({ track }: { track: ExampleTrack }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { width: W, height: H } = canvas
    const r = seeded(track.index + 3)
    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'lighter'
    const cx = (track.x / 100) * W
    const cy = (track.y / 100) * H
    const spread = track.pos === 'حارس' ? 26 : track.pos === 'قلب دفاع' ? 55 : 80
    for (let k = 0; k < 46; k++) {
      const px = cx + (r() - 0.5) * spread * 1.6
      const py = cy + (r() - 0.4) * spread * 2.2
      const rad = 22 + r() * 20
      const g = ctx.createRadialGradient(px, py, 0, px, py, rad)
      g.addColorStop(0, 'rgba(0,220,200,.20)'); g.addColorStop(1, 'rgba(0,220,200,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, rad, 0, 6.3); ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  }, [track])
  return (
    <div className="relative mx-auto aspect-[68/105] w-full max-w-[300px] overflow-hidden rounded-xl border border-white/10 bg-[#06231c]">
      <canvas ref={ref} width={272} height={420} className="absolute inset-0 h-full w-full" />
      <PitchLines />
    </div>
  )
}

function DuoRows({ rows }: { rows: [string, number, number][] }) {
  return (
    <div>
      {rows.map(([label, home, away]) => {
        const max = Math.max(home, away) || 1
        return (
          <div key={label} className="grid grid-cols-[52px_1fr_52px] items-center gap-2 border-t border-white/10 py-2 first:border-t-0">
            <div className={`text-center font-display text-[15px] font-extrabold ${home >= away ? 'text-ice-white' : 'text-ice-muted'}`}>{home}</div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="text-center text-[13px] text-ice-white arabic-text">{label}</div>
              <div className="grid grid-cols-2 gap-[3px]" dir="ltr">
                <span className="flex h-1.5 justify-end overflow-hidden rounded bg-[#0D1E35]"><i className="block h-full rounded bg-scout-blue" style={{ width: `${(away / max) * 100}%` }} /></span>
                <span className="flex h-1.5 overflow-hidden rounded bg-[#0D1E35]"><i className="block h-full rounded bg-teal-prime" style={{ width: `${(home / max) * 100}%` }} /></span>
              </div>
            </div>
            <div className={`text-center font-display text-[15px] font-extrabold ${away > home ? 'text-ice-white' : 'text-ice-muted'}`}>{away}</div>
          </div>
        )
      })}
    </div>
  )
}

function Bar({ label, value, max, text }: { label: string; value: number; max: number; text: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr_40px] items-center gap-2 text-[13px]">
      <span className="text-ice-white arabic-text">{label}</span>
      <span className="overflow-hidden rounded bg-[#0D1E35]"><i className="block h-1.5 rounded bg-teal-prime" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></span>
      <b className="font-display text-ice-white">{text}</b>
    </div>
  )
}

const card = 'glass-card flex flex-col gap-3 rounded-2xl p-4'
const firstName = (name?: string) => (name ?? '').trim().split(/\s+/)[0] || 'لاعب'

export default function MatchReport({ role }: { role: ReportRole }) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { state, loading, error } = useTeamReport()
  // Never a hardcoded club: the name comes from the viewer's own players.
  const teamName = state?.clubName ?? null
  const view = ROLE_VIEW[role]

  const [tab, setTab] = useState<ReportTab>(view.tabs[0][0])
  const [tracks, setTracks] = useState<ExampleTrack[]>(buildExampleTracks)
  const [selected, setSelected] = useState(EXAMPLE_OWN_INDEX)

  const visible = useMemo(
    () => role === 'player' ? tracks.filter(t => t.index === EXAMPLE_OWN_INDEX)
      : role === 'scout' ? tracks.filter(t => t.linked) : tracks,
    [role, tracks],
  )
  const track = visible.find(t => t.index === selected) ?? visible[0]
  const label = (t: ExampleTrack) => (t.linked ? t.name! : `مسار ${t.track}`)
  const linkedCount = tracks.filter(t => t.linked).length
  const ratedCount = tracks.filter(t => t.rating != null).length

  // In-memory only: this is the example match, nothing is written.
  const linkExample = (index: number) => {
    setTracks(prev => {
      const n = prev.filter(t => t.linked).length + 1
      return prev.map(t => t.index === index
        ? { ...t, linked: true, name: `لاعب ${n}`, sportId: `SID-2026-9${String(index + 1).padStart(4, '0')}` } : t)
    })
    setSelected(index)
  }

  const hasRealMatch = (state?.analysedMatchIds.length ?? 0) > 0
  const ownClubPlayer = role === 'player' ? state?.players.find(p => p.player.user_id === profile?.id) ?? null : null
  // Scouts get first names only, as the report promises for youth players.
  const shownName = (name?: string) => (role === 'scout' ? firstName(name) : name || 'بدون اسم')

  return (
    <div dir="rtl" className="mx-auto flex w-full max-w-3xl flex-col gap-4">

      {/* Layer 1 — the live club account */}
      {role !== 'scout' && <section className={card} aria-label="فريقي">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[17px] font-bold text-ice-white arabic-text">{teamName ? `فريقي · ${teamName}` : 'فريقي'}</h2>
          <Chip kind="cv">بيانات حيّة</Chip>
        </div>
        {loading ? <p className="text-sm text-ice-muted arabic-text">جارٍ التحميل…</p>
          : error ? <p className="text-sm text-gold arabic-text">تعذّر قراءة بيانات فريقك: {error}</p>
          : state && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {([
                  [state.players.length, 'لاعب مسجَّل'],
                  [state.players.filter(p => p.sportId).length, 'له Sport ID'],
                  [`${state.analysedMatchIds.length} / ${state.matches.length}`, 'مباريات محلَّلة'],
                  [state.evaluations, 'تقييم محفوظ'],
                ] as const).map(([value, text]) => (
                  <div key={text} className="rounded-xl bg-white/5 p-2 text-center">
                    <b className="block font-display text-lg text-ice-white">{value}</b>
                    <span className="text-[11px] text-ice-muted arabic-text">{text}</span>
                  </div>
                ))}
              </div>
              {!hasRealMatch && (
                <p className="rounded-xl border border-gold/30 bg-gold/5 p-3 text-[13px] leading-relaxed text-gold arabic-text">
                  {state.players.length === 0 ? 'حسابك غير مربوط بفريق بعد. ' : ''}لا توجد مباراة محلَّلة لفريقك بعد، فالتقرير أدناه مثال توضيحي وليس مباراة حقيقية.
                  يتحول إلى تقرير حقيقي عند إضافة مباراة لفريقك وتحليل فيديوها وربط مساراتها.
                  {role === 'coach' && (
                    <button onClick={() => navigate('/coach/match-analysis')} className="ms-2 font-bold underline">افتح تحليل المباراة</button>
                  )}
                </p>
              )}
              {hasRealMatch && (
                <p className="rounded-xl border border-teal-prime/30 bg-teal-prime/5 p-3 text-[13px] text-teal-prime arabic-text">
                  لفريقك مباراة محلَّلة. مساراتها ومعايرتها في «تحليل المباراة»؛ نقل أرقامها إلى هذا التقرير هو الخطوة التالية، والمعروض أدناه ما زال المثال.
                </p>
              )}
            </>
          )}
      </section>}

      {/* Layer 2 — the match body (example) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ice-muted arabic-text">{view.hint}</p>
        <span className="rounded-full border border-gold px-2.5 py-0.5 text-xs font-bold text-gold arabic-text">مثال توضيحي، ليست مباراة حقيقية</span>
      </div>

      <section className="glass-card grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl p-4 text-center" aria-label="النتيجة">
        <div className="flex flex-col items-center gap-1.5 font-bold text-teal-prime">
          <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-current text-lg font-black">{EXAMPLE_MATCH.homeMono}</span>
          <small className="text-sm text-ice-white arabic-text">{EXAMPLE_MATCH.home}</small>
        </div>
        <div>
          <div className="font-display text-4xl font-extrabold tracking-wider text-ice-white" dir="ltr">{EXAMPLE_MATCH.homeScore} : {EXAMPLE_MATCH.awayScore}</div>
          <div className="text-xs text-ice-muted arabic-text">النتيجة من إدخال المدرب</div>
        </div>
        <div className="flex flex-col items-center gap-1.5 font-bold text-scout-blue">
          <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-current text-lg font-black">{EXAMPLE_MATCH.awayMono}</span>
          <small className="text-sm text-ice-white arabic-text">{EXAMPLE_MATCH.away}</small>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2">
        {([[`${linkedCount} / ${tracks.length}`, 'مسارات مربوطة بهوية'], [`${ratedCount} / ${tracks.length}`, 'لاعبون قيّمهم المدرب'], [NOT_AVAILABLE.length, 'مؤشرات غير متاحة']] as const).map(([value, text]) => (
          <div key={text} className="rounded-xl bg-white/5 p-2 text-center">
            <b className="block font-display text-lg text-ice-white">{value}</b>
            <span className="text-[11px] text-ice-muted arabic-text">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-xl border border-white/10 bg-[#07161F] p-1" role="tablist" aria-label="أقسام التقرير">
        {view.tabs.map(([key, text]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold transition-colors arabic-text ${tab === key ? 'bg-[#0D1E35] text-ice-white shadow-[inset_0_-2px_0_#00DCC8]' : 'text-ice-muted hover:text-ice-white'}`}>
            {text}
          </button>
        ))}
      </div>

      {/* TEAM */}
      {tab === 'team' && (
        <div className="flex flex-col gap-4">
          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-ice-white arabic-text">أحداث المباراة</h2><Chip kind="coach">إدخال المدرب</Chip></div>
            <p className="text-[13px] text-ice-muted arabic-text">لا يوجد مصدر خارجي لمباريات الدرجة الثالثة، فالمدرب يسجّل الأحداث بعد المباراة.</p>
            <ul>
              {EVENTS.map(([minute, event, who, opponent]) => (
                <li key={minute + event} className="grid grid-cols-[48px_1fr_auto] items-center gap-2.5 border-t border-white/10 py-2 text-sm first:border-t-0">
                  <span className="font-display font-extrabold text-ice-white" dir="ltr">{minute}′</span>
                  <span className="text-ice-white arabic-text"><b>{event}</b> · {who}</span>
                  <span className={`text-xs arabic-text ${opponent ? 'text-scout-blue' : 'text-teal-prime'}`}>{opponent ? 'المنافس' : 'فريقك'}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-ice-white arabic-text">من الفيديو</h2><Chip kind="cv">آلي</Chip></div>
            <p className="text-[13px] text-ice-muted arabic-text">أرقام تقديرية من كاميرا واحدة. الفريقان يُفرَّقان بلون القميص.</p>
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-ice-muted arabic-text">الاستحواذ التقديري</span>
              <div className="flex h-3 overflow-hidden rounded-full bg-[#0D1E35]" dir="ltr">
                <i className="block h-full bg-scout-blue" style={{ width: `${EXAMPLE_MATCH.possession.away}%` }} />
                <i className="block h-full bg-teal-prime" style={{ width: `${EXAMPLE_MATCH.possession.home}%` }} />
              </div>
              <div className="flex justify-between text-[13px]">
                <b className="font-display text-teal-prime">{EXAMPLE_MATCH.possession.home}%</b>
                <b className="font-display text-scout-blue">{EXAMPLE_MATCH.possession.away}%</b>
              </div>
            </div>
            <DuoRows rows={CV_STATS} />
          </section>

          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-ice-white arabic-text">أرقام المدرب</h2><Chip kind="coach">إدخال المدرب</Chip></div>
            <DuoRows rows={COACH_STATS} />
          </section>

          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-ice-white arabic-text">غير متاح بعد</h2><Chip kind="none">لا يُعرض رقم</Chip></div>
            <ul className="flex flex-col gap-2">
              {NOT_AVAILABLE.map(([what, why]) => (
                <li key={what} className="flex justify-between gap-2.5 border-t border-white/10 pt-2 text-[13.5px] first:border-t-0 first:pt-0">
                  <span className="text-ice-white arabic-text">{what}</span><span className="text-end text-xs text-ice-muted arabic-text">{why}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* PLAYERS */}
      {tab === 'players' && track && (
        <div className="flex flex-col gap-4">
          {/* Real club players — identity only, never example figures. */}
          {role !== 'player' && state && state.players.length > 0 && (
            <section className={card}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-ice-white arabic-text">لاعبو فريقي المسجَّلون</h2><Chip kind="cv">بيانات حيّة</Chip></div>
              <ul>
                {state.players.map(({ player, sportId }) => (
                  <li key={player.id} className="flex items-center justify-between gap-2 border-t border-white/10 py-2 text-sm first:border-t-0">
                    <span className="text-ice-white arabic-text">{shownName(player.name)} <span className="text-xs text-ice-muted">· {player.position || '—'}</span></span>
                    <span className="font-display text-xs text-teal-prime" dir="ltr">{sportId ?? '—'}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[13px] text-ice-muted arabic-text">هؤلاء هم من يُربط بهم مسار عند تحليل مباراة حقيقية. لا تُنسب لهم أرقام المثال.</p>
            </section>
          )}

          {role === 'player' && (
            <section className={card}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-ice-white arabic-text">حسابي</h2><Chip kind="cv">بيانات حيّة</Chip></div>
              {ownClubPlayer
                ? <p className="text-sm text-ice-white arabic-text">{ownClubPlayer.player.name} · {ownClubPlayer.player.position || '—'} · <span className="font-display text-teal-prime" dir="ltr">{ownClubPlayer.sportId ?? '—'}</span><br /><span className="text-[13px] text-ice-muted">أرقامك تظهر هنا بعد أول مباراة محلَّلة يربطك فيها المدرب بمسار. ما تحته مثال.</span></p>
                : <p className="text-[13px] text-ice-muted arabic-text">حسابك غير مربوط بسجل لاعب بعد. ما تحته مثال توضيحي.</p>}
            </section>
          )}

          {role !== 'player' && (
            <section className={card}>
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-[17px] font-bold text-ice-white arabic-text">اللاعبون والمسارات</h2><span className="text-[11px] text-ice-muted arabic-text">{linkedCount} من {tracks.length} مربوطة</span></div>
              <p className="text-[13px] text-ice-muted arabic-text">كل مسار مجهول إلى أن يربطه المدرب بلاعب له Sport ID. الدائرة المتقطعة تعني هوية غير مؤكدة.</p>
              <div className="relative mx-auto aspect-[68/105] w-full max-w-[340px] overflow-hidden rounded-xl border border-white/10 bg-[#06231c]">
                <PitchLines />
                {visible.map(t => (
                  <button key={t.index} onClick={() => setSelected(t.index)} aria-pressed={t.index === track.index} aria-label={label(t)}
                    className={`absolute grid h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-[11px] font-extrabold ${
                      t.linked ? `border-2 border-navy ${t.rating == null ? 'bg-scout-blue text-white' : ratingClass(t.rating)}` : 'border-2 border-dashed border-ice-muted text-ice-muted'
                    } ${t.index === track.index ? 'ring-2 ring-ice-white' : ''}`}
                    style={{ left: `${t.x}%`, top: `${t.y}%` }}>
                    {t.linked ? (t.rating == null ? '·' : t.rating.toFixed(1)) : '?'}
                  </button>
                ))}
              </div>
              <div className="flex flex-col">
                {visible.map(t => (
                  <div key={t.index} role="button" tabIndex={0} aria-pressed={t.index === track.index}
                    onClick={() => setSelected(t.index)} onKeyDown={e => { if (e.key === 'Enter') setSelected(t.index) }}
                    className={`grid w-full cursor-pointer grid-cols-[64px_1fr_auto_auto] items-center gap-2.5 border-t border-white/10 px-1.5 py-2.5 first:border-t-0 ${t.index === track.index ? 'rounded-lg bg-[#0D1E35]' : ''}`}>
                    <span className="text-[11px] font-bold text-ice-muted arabic-text">{t.pos}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-ice-white arabic-text">{label(t)}</span>
                      {t.linked
                        ? <><span className="font-display text-[11px] text-ice-muted" dir="ltr">{t.sportId}</span> <span className="text-xs font-bold text-teal-prime arabic-text">مربوط</span></>
                        : <span className="text-xs font-bold text-gold arabic-text">هوية غير مؤكدة</span>}
                      {t.goals > 0 && <span className="text-[11px] text-ice-muted arabic-text"> · {t.goals} هدف</span>}
                    </span>
                    {!t.linked && role === 'coach'
                      ? <button onClick={e => { e.stopPropagation(); linkExample(t.index) }} className="whitespace-nowrap rounded-lg border border-gold px-2 py-1 text-xs font-bold text-gold arabic-text">اربط بلاعب</button>
                      : <span />}
                    <span className={`min-w-[46px] rounded-lg px-1.5 py-0.5 text-center font-display text-sm font-extrabold ${ratingClass(t.rating)}`}>{ratingText(t.rating)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div>
                <h2 className="text-[17px] font-bold text-ice-white arabic-text">{label(track)}</h2>
                <div className="text-[11px] text-ice-muted arabic-text">{track.pos} · <span className="font-display" dir="ltr">{track.track}</span>{track.linked ? <> · <span className="font-display" dir="ltr">{track.sportId}</span></> : ' · هوية غير مؤكدة'}</div>
              </div>
              <span className={`min-w-[46px] rounded-lg px-1.5 py-0.5 text-center font-display text-sm font-extrabold ${ratingClass(track.rating)}`}>{ratingText(track.rating)}</span>
            </div>

            <h3 className="flex items-center gap-2 text-sm font-bold text-ice-muted arabic-text">خريطة التمركز <Chip kind="cv">آلي</Chip></h3>
            <ExampleHeatmap track={track} />
            <p className="text-[13px] text-ice-muted arabic-text">شكل توضيحي حسب مركز اللاعب. الخريطة الحقيقية تُبنى من مواضع التتبّع بعد معايرة الملعب، في «تحليل المباراة».</p>

            <h3 className="flex items-center gap-2 text-sm font-bold text-ice-muted arabic-text">من الفيديو <Chip kind="cv">آلي، تقديري</Chip></h3>
            <div className="flex flex-col gap-2">
              <Bar label="نشاط اللاعب" value={track.activity} max={100} text={String(track.activity)} />
              <Bar label="ثلث دفاعي %" value={track.zones[0]} max={100} text={String(track.zones[0])} />
              <Bar label="ثلث أوسط %" value={track.zones[1]} max={100} text={String(track.zones[1])} />
              <Bar label="ثلث هجومي %" value={track.zones[2]} max={100} text={String(track.zones[2])} />
              <Bar label="لمسات تقديرية" value={track.touches} max={60} text={String(track.touches)} />
              <Bar label="سرعة غير معايرة" value={track.speed} max={30} text={String(track.speed)} />
            </div>

            <h3 className="flex items-center gap-2 text-sm font-bold text-ice-muted arabic-text">تقييم المدرب <Chip kind="coach">إدخال المدرب</Chip></h3>
            {track.evaluation
              ? <div className="flex flex-col gap-2">{['فني', 'تكتيكي', 'بدني', 'ذهني'].map((axis, i) => <Bar key={axis} label={axis} value={track.evaluation![i]} max={10} text={track.evaluation![i].toFixed(1)} />)}</div>
              : <p className="text-[13px] text-ice-muted arabic-text">{track.linked ? 'لم يقيّم المدرب هذا اللاعب في هذه المباراة بعد.' : 'لا يمكن التقييم قبل ربط المسار بلاعب.'}</p>}

            {track.linked && (
              <button onClick={() => { setTab('sport-id'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="rounded-xl border border-teal-prime px-3 py-2.5 text-sm font-bold text-teal-prime transition-colors hover:bg-teal-prime/10 arabic-text">
                عرض بطاقة Sport ID
              </button>
            )}
          </section>
        </div>
      )}

      {/* SPORT ID */}
      {tab === 'sport-id' && (() => {
        // The player's own card is his real identity when his account is in the club.
        const real = ownClubPlayer
        const shown = track?.linked ? track : visible.find(t => t.linked) ?? tracks.find(t => t.linked)!
        return (
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3.5 rounded-[18px] border border-teal-prime bg-gradient-to-br from-[#0D1E35] to-[#07161F] p-[18px]">
              <div>
                <div className="text-[11px] text-ice-muted arabic-text">الهوية الرياضية · Sport ID {real ? '' : '· مثال'}</div>
                <div className="text-xl font-black text-ice-white arabic-text">{real ? real.player.name : shown.name}</div>
                <div className="font-display text-[15px] font-extrabold text-teal-prime" dir="ltr" style={{ textAlign: 'right' }}>{real ? real.sportId ?? '—' : shown.sportId}</div>
                <div className="text-[11px] text-ice-muted arabic-text">كرة قدم · {real ? real.player.position || '—' : shown.pos} {real?.player.club ? ` · ${real.player.club}` : ''}</div>
              </div>
              {real
                ? <p className="text-[13px] text-ice-muted arabic-text">هذه هويتك الحقيقية. أرقام المباريات تُضاف إليها بعد أول مباراة محلَّلة.</p>
                : <>
                    <div className="grid grid-cols-3 gap-2">
                      {([['تقييم المدرب', ratingText(shown.rating)], ['نشاط من 100', shown.activity], ['أهداف', shown.goals]] as const).map(([text, value]) => (
                        <div key={text} className="rounded-xl bg-white/5 p-2 text-center">
                          <b className="block font-display text-lg text-ice-white">{value}</b>
                          <span className="text-[11px] text-ice-muted arabic-text">{text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[13px] text-ice-muted arabic-text">الاسم يظهر بالاسم الأول فقط حمايةً للناشئين. الرقم هنا تجريبي.</p>
                  </>}
            </section>
            <section className={card}>
              <h2 className="text-[17px] font-bold text-ice-white arabic-text">ماذا يضيف هذا التقرير للبطاقة</h2>
              <ol className="flex list-decimal flex-col gap-1.5 ps-5 text-sm text-ice-white arabic-text">
                <li>المباراة تُضاف لسجل اللاعب برقم هويته، فيتراكم عدد المباريات المحللة.</li>
                <li>خريطة التمركز ونشاطه يُحفظان مع كل مباراة، فيظهر تطوره عبر الموسم.</li>
                <li>تقييم المدرب يدخل في الترتيب، والكشاف يرى اللاعبين المرتبطين فقط.</li>
              </ol>
            </section>
          </div>
        )
      })()}
    </div>
  )
}
