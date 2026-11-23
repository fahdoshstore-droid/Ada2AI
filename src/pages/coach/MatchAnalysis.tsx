/**
 * CoachMatchAnalysis — «تحليل المباراة» (coach-only)
 *
 * Two existing, already-tested experiences on one coach page:
 *  1. <MatchReports /> — saved match-intelligence reports from the CV backend
 *     (formations, verified goal timeline, schematic motion, track → Sport ID
 *     links). Tested against the City–Liverpool and Muharraq–Riffa reports.
 *  2. <RealMatchAnalysis /> — the real clip with synced tracking markers.
 *
 * No second copy of either analysis: both components are reused as-is.
 * The match list comes from the same backend endpoint MatchReplay uses.
 *
 * Visual direction: Floodlight (D2) — the same cinematic language as the
 * landing page and the coach dashboard, in its working-tool register:
 * compact header, no hero photograph, numbered sections, staggered panels.
 * Colour carries provenance and nothing else (see the legend below).
 */
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Film, FileText, Radar, Users, Ruler, MapPin } from 'lucide-react'
import RealMatchAnalysis from '../../components/cinema/RealMatchAnalysis'
import { EASE, GhostNumber, Letterbox, SideReveal, SplitReveal, Stagger, StaggerItem } from '../../components/cinema/Cinema'
import MatchReports from '../../training-hub/components/MatchReports'
import { yoloEndpoint, yoloFetch } from '../../lib/yoloApi'
import TrackIdentityLinker from '../../components/coach/TrackIdentityLinker'
import PitchCalibrator from '../../components/coach/PitchCalibrator'
import PositionHeatmap from '../../components/coach/PositionHeatmap'
import SavedMatchAnalysis from '../../components/coach/SavedMatchAnalysis'
import { usePrimaryAnalysisId, useCalibration, useTrackHistories } from '../../hooks/useCalibration'
import { useMatchTracks } from '../../hooks/useTrackLinks'
import { useAnalysedMatchIds } from '../../hooks/useTrackLinks'
import { useMatches } from '../../hooks/useMatches'
import { useCoachPlayers } from '../../hooks/useCoachPlayers'

interface AnalysedMatch {
  id: string
  home_team?: string | null
  away_team?: string | null
  match_date?: string | null
  competition?: string | null
}

async function fetchAnalysedMatches(): Promise<AnalysedMatch[]> {
  const response = await yoloFetch(yoloEndpoint('/matches'))
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`)
  const matches: unknown = payload?.matches
  return Array.isArray(matches) ? (matches as AnalysedMatch[]).filter(match => !!match?.id) : []
}

/** Colour is provenance. Teal = measured by the vision pipeline, blue = entered
 *  by the coach, gold = present but unconfirmed, grey = not available at all. */
const PROVENANCE = [
  { dot: 'bg-teal-prime', label: 'رصد تلقائي', note: 'من الفيديو' },
  { dot: 'bg-scout-blue', label: 'إدخال المدرب', note: 'أحداث وتقييم' },
  { dot: 'bg-gold', label: 'غير مؤكد', note: 'لاعب لم يُحدَّد اسمه' },
  { dot: 'bg-ice-muted', label: 'غير متاح', note: 'لا يُعرض رقم' },
] as const

export default function CoachMatchAnalysis() {
  const reduced = useReducedMotion()
  // The linker reads Supabase straight, so it keeps working when the vision
  // service is down — unlike the saved reports in section 01.
  const { matches: dbMatches } = useMatches()
  const { players: roster } = useCoachPlayers()
  const { analysedMatchIds } = useAnalysedMatchIds()
  const linkable = dbMatches.filter(match => analysedMatchIds.includes(match.id))
  const [linkMatchId, setLinkMatchId] = useState('')
  const { analysisId } = usePrimaryAnalysisId(linkMatchId || null)
  const { calibration } = useCalibration(analysisId)
  const { tracks: histories } = useTrackHistories(analysisId)
  const { links } = useMatchTracks(linkMatchId || null)
  const [heatmapTrackId, setHeatmapTrackId] = useState('')

  // Only a track a coach has actually linked carries a Sport ID — an
  // unlinked track is still "track_id is NOT player_id" (trackLinks.ts), so
  // only linked tracks are offered here.
  const linkedTracks = links
    .filter(l => l.player_id)
    .map(l => ({ link: l, player: roster.find(p => p.id === l.player_id) }))
    .filter((row): row is { link: typeof links[number]; player: NonNullable<typeof row.player> } => !!row.player)
  const matches = useQuery({
    queryKey: ['coach-analysed-matches'],
    queryFn: fetchAnalysedMatches,
    retry: 1,
  })

  return (
    <div className="bg-[#000A0F]">
      {/* Header — working register: no hero photograph, type does the work. */}
      <section className="relative overflow-hidden pb-10 pt-32 md:pb-14 md:pt-40" aria-label="تحليل المباراة">
        <div className="absolute inset-0 bg-[radial-gradient(55%_55%_at_80%_0%,rgba(0,220,200,0.12),transparent_70%)]" aria-hidden="true" />
        <div className="grain-overlay" />
        <Letterbox height="3svh" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-teal-prime">
            <span className="h-px w-10 bg-teal-prime" />
            <Radar className="h-4 w-4" />
            <span className="arabic-text">من اللقطة إلى المعلومة</span>
          </div>

          <h1 className="text-4xl font-black leading-[1.22] tracking-tightest md:text-6xl lg:text-7xl">
            <SplitReveal text="تحليل" immediate delay={0.25} className="block text-teal-prime arabic-text" />
            <SplitReveal text="المباراة" immediate delay={0.45} className="block text-ice-white arabic-text" />
          </h1>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
          >
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ice-white/75 arabic-text">
              تقارير المباريات المحفوظة، وتحديد من هو كل لاعب ظهر في الفيديو،
              ثم فيديو المباراة مع مواقع اللاعبين.
            </p>

            {/* Provenance legend — the page's one colour rule, stated once. */}
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3" aria-label="دلالة الألوان">
              {PROVENANCE.map(item => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} aria-hidden="true" />
                  <span className="font-semibold text-ice-white arabic-text">{item.label}</span>
                  <span className="text-ice-muted arabic-text">{item.note}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 01 — saved reports */}
      <section className="relative overflow-hidden py-12 md:py-16" aria-label="تقارير المباريات المحللة" data-testid="coach-match-reports">
        <GhostNumber n="01" className="-top-6 start-[-2%]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger gap={0.1} className="mb-8 flex items-center gap-3">
            <StaggerItem y={16}>
              <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">01</span>
            </StaggerItem>
            <StaggerItem y={16}>
              <h2 className="flex items-center gap-3 text-xl font-bold text-ice-white md:text-2xl">
                <FileText className="h-5 w-5 text-teal-prime" />
                <span className="arabic-text">التقارير المحفوظة</span>
              </h2>
            </StaggerItem>
          </Stagger>

          {/* Analyses saved in the database — visible on any link */}
          <div className="mb-8">
            <SavedMatchAnalysis />
          </div>

          <SideReveal from="start">
            {matches.isPending && (
              <p className="glass-card rounded-2xl p-6 text-sm text-ice-muted arabic-text" role="status">
                جارٍ تحميل قائمة المباريات المحللة…
              </p>
            )}
            {matches.isError && (
              <p className="text-xs text-ice-muted/70 arabic-text" role="status">
                تقارير الإعادة الكاملة تظهر هنا أيضاً عند تشغيل خدمة تحليل الفيديو على جهاز التحليل.
              </p>
            )}
            {matches.isSuccess && matches.data.length === 0 && (
              <p className="glass-card rounded-2xl p-6 text-sm text-ice-muted arabic-text">
                لا توجد مباريات محللة محفوظة بعد.
              </p>
            )}
            {matches.isSuccess && matches.data.length > 0 && <MatchReports matches={matches.data} lang="ar" />}
          </SideReveal>
        </div>
      </section>

      {/* 02 — the hinge: which track is which player */}
      <section className="relative overflow-hidden py-12 md:py-16" aria-label="هوية اللاعبين">
        <GhostNumber n="02" className="-top-6 end-[-2%]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger gap={0.1} className="mb-8 flex items-center gap-3">
            <StaggerItem y={16}>
              <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">02</span>
            </StaggerItem>
            <StaggerItem y={16}>
              <h2 className="flex items-center gap-3 text-xl font-bold text-ice-white md:text-2xl">
                <Users className="h-5 w-5 text-teal-prime" />
                <span className="arabic-text">هوية اللاعبين</span>
              </h2>
            </StaggerItem>
          </Stagger>

          <SideReveal from="end">
            <div className="mb-4">
              <label htmlFor="link-match" className="mb-1 block text-xs text-ice-muted arabic-text">المباراة</label>
              <select
                id="link-match"
                value={linkMatchId}
                onChange={event => setLinkMatchId(event.target.value)}
                className="w-full max-w-md rounded-xl border border-white/10 bg-[#05080f] px-4 py-3 text-sm text-ice-white outline-none focus:border-teal-prime/50 arabic-text"
              >
                <option value="">— اختر مباراة —</option>
                {linkable.map(match => (
                  <option key={match.id} value={match.id}>
                    {match.home_team || '؟'} × {match.away_team || '؟'}
                    {match.match_date ? ` · ${match.match_date}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {linkable.length === 0 && (
              <p className="glass-card rounded-2xl p-6 text-sm text-gold arabic-text">
                لا توجد مباراة محلَّلة بعد. يظهر اللاعبون هنا بعد تحليل فيديو مباراة.
              </p>
            )}

            {linkMatchId
              ? <TrackIdentityLinker matchId={linkMatchId} players={roster} />
              : linkable.length > 0 && (
                <p className="glass-card rounded-2xl p-6 text-sm text-ice-muted arabic-text">
                  اختر مباراة لترى اللاعبين الذين ظهروا فيها، وحدّد من هو كل واحد منهم من قائمة لاعبيك. بدون ذلك تبقى أرقامهم بلا اسم.
                </p>
              )}
          </SideReveal>
        </div>
      </section>

      {/* 03 — the units: pixels into metres */}
      <section className="relative overflow-hidden py-12 md:py-16" aria-label="ضبط الملعب">
        <GhostNumber n="03" className="-top-6 start-[-2%]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger gap={0.1} className="mb-8 flex items-center gap-3">
            <StaggerItem y={16}>
              <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">03</span>
            </StaggerItem>
            <StaggerItem y={16}>
              <h2 className="flex items-center gap-3 text-xl font-bold text-ice-white md:text-2xl">
                <Ruler className="h-5 w-5 text-teal-prime" />
                <span className="arabic-text">ضبط الملعب</span>
              </h2>
            </StaggerItem>
          </Stagger>

          <SideReveal from="start">
            {!linkMatchId
              ? (
                <p className="glass-card rounded-2xl p-6 text-sm text-ice-muted arabic-text">
                  اختر المباراة في القسم 02 أولاً. ضبط الملعب يُحفظ لكل مباراة على حدة.
                </p>
              )
              : analysisId
                ? <PitchCalibrator analysisId={analysisId} matchId={linkMatchId} />
                : (
                  <p className="glass-card rounded-2xl p-6 text-sm text-gold arabic-text">
                    لا يوجد تحليل محفوظ لهذه المباراة.
                  </p>
                )}
          </SideReveal>
        </div>
      </section>

      {/* 04 — خريطة التمركز، tied to Sport ID */}
      <section className="relative overflow-hidden py-12 md:py-16" aria-label="خريطة التمركز">
        <GhostNumber n="04" className="-top-6 end-[-2%]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger gap={0.1} className="mb-8 flex items-center gap-3">
            <StaggerItem y={16}>
              <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">04</span>
            </StaggerItem>
            <StaggerItem y={16}>
              <h2 className="flex items-center gap-3 text-xl font-bold text-ice-white md:text-2xl">
                <MapPin className="h-5 w-5 text-teal-prime" />
                <span className="arabic-text">خريطة التمركز</span>
              </h2>
            </StaggerItem>
          </Stagger>

          <SideReveal from="end">
            {!linkMatchId ? (
              <p className="glass-card rounded-2xl p-6 text-sm text-ice-muted arabic-text">
                اختر المباراة في القسم 02 أولاً.
              </p>
            ) : linkedTracks.length === 0 ? (
              <p className="glass-card rounded-2xl p-6 text-sm text-ice-muted arabic-text">
                لم تحدّد أي لاعب بعد. حدّد اللاعبين في القسم 02، ثم تظهر خريطة كل لاعب هنا.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="heatmap-player" className="mb-1 block text-xs text-ice-muted arabic-text">اللاعب</label>
                  <select
                    id="heatmap-player"
                    value={heatmapTrackId}
                    onChange={event => setHeatmapTrackId(event.target.value)}
                    className="w-full max-w-md rounded-xl border border-white/10 bg-[#05080f] px-4 py-3 text-sm text-ice-white outline-none focus:border-teal-prime/50 arabic-text"
                  >
                    <option value="">— اختر لاعباً —</option>
                    {linkedTracks.map(({ link, player }) => (
                      <option key={link.id} value={link.track_id}>
                        {player.name || 'بدون اسم'} · رقم {link.track_id}
                      </option>
                    ))}
                  </select>
                </div>

                {heatmapTrackId && (() => {
                  const chosen = linkedTracks.find(row => row.link.track_id === heatmapTrackId)
                  const trackHistory = histories.find(t => String(t.trackId) === heatmapTrackId)
                  if (!chosen || !trackHistory) return null
                  return (
                    <PositionHeatmap
                      history={trackHistory.history}
                      homography={calibration?.homography ?? null}
                      calibrationValidated={!!calibration?.validated}
                      reprojectionErrorMeters={calibration?.reprojection_error_meters ?? null}
                      label={chosen.player.name || `T-${heatmapTrackId}`}
                    />
                  )
                })()}
              </div>
            )}
          </SideReveal>
        </div>
      </section>

      {/* 05 — the clip itself */}
      <section className="relative overflow-hidden pb-20 pt-6 md:pb-28" aria-label="الفيديو ومواقع اللاعبين">
        <GhostNumber n="05" className="-top-6 start-[-2%]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Stagger gap={0.1} className="mb-8 flex items-center gap-3">
            <StaggerItem y={16}>
              <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">05</span>
            </StaggerItem>
            <StaggerItem y={16}>
              <h2 className="flex items-center gap-3 text-xl font-bold text-ice-white md:text-2xl">
                <Film className="h-5 w-5 text-teal-prime" />
                <span className="arabic-text">الفيديو ومواقع اللاعبين</span>
              </h2>
            </StaggerItem>
          </Stagger>

          <SideReveal from="end">
            <RealMatchAnalysis />
          </SideReveal>
        </div>
      </section>
    </div>
  )
}
