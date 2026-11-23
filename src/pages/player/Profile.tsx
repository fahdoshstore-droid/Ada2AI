/**
 * PlayerProfile — Ada2AI
 *
 * Public player profile page.
 * Shown when scouts click "عرض" in ScoutDashboard.
 * Reads player id from useParams(), fetches player + latest evaluation.
 */
import { useEffect, useRef, useState } from 'react'
import EvaluationBreakdown from '../../components/evaluation/EvaluationBreakdown'
import SportIdentityBadge from '../../components/coach/SportIdentityBadge'
import RadarCard from '../../components/player/RadarCard'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { supabase, type Player, type Evaluation } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import {
  ArrowRight, Share2, CheckCircle, Star, Ruler,
  Footprints, Shield, Video, User,
  Loader2, AlertCircle, ChevronLeft
} from 'lucide-react'
import { SideReveal, SplitReveal, Stagger, StaggerItem } from '../../components/cinema/Cinema'
import { sportLabel } from '../../lib/sportLabel'
import aerialPitch from '../../assets/cinema/aerial-pitch.jpg'

// ── Skill Bar ──────────────────────────────────────
function SkillBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const pct = Math.min(Math.max(value, 0), 100)
  const reduced = useReducedMotion()
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-ice-muted arabic-text">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <span className="text-teal-prime font-bold">{pct}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={reduced ? false : { width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-l from-teal-prime to-teal-prime/60"
        />
      </div>
    </div>
  )
}

// ── Foot Label ──────────────────────────────────────
function footLabel(foot: string | undefined): string {
  switch (foot) {
    case 'left': return 'يسرى'
    case 'right': return 'يمنى'
    case 'both': return 'ثنائي'
    default: return '—'
  }
}

// ── Profile layout: pinned image → scrolling profile ─────────────
interface ProfileLayoutProps {
  player: Player
  evaluation: Evaluation | null
  /** The evaluation before the latest one, drawn dashed on the radar for progress. */
  previousEvaluation: Evaluation | null
  /** Arrived here straight from finishing Sport ID onboarding. */
  justCreated: boolean
  copied: boolean
  onShare: () => void
  onBack: () => void
}

function ProfileLayout({ player, evaluation, previousEvaluation, justCreated, copied, onShare, onBack }: ProfileLayoutProps) {
  const reduced = useReducedMotion()
  const infoRef = useRef<HTMLDivElement>(null)
  // progress of the info column through the viewport drives the image → profile transition
  const { scrollYProgress } = useScroll({ target: infoRef, offset: ['start start', 'end end'] })
  const shade = useTransform(scrollYProgress, [0, 0.7], [0, 0.62])
  const zoom = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const photo = player.avatar_url || player.photo_url
  const nameParts = (player.name || 'بدون اسم').trim().split(/\s+/)
  const firstName = nameParts[0]
  const restName = nameParts.slice(1).join(' ')

  const num = (v: number | null | undefined) => (typeof v === 'number' ? v : null)
  const rawHeadline = [
    { label: 'أهداف', value: num(player.goals) },
    { label: 'صناعة أهداف', value: num(player.assists) },
    { label: 'مباريات', value: num(player.appearances) },
  ].filter((h): h is { label: string; value: number } => h.value !== null)
  const facts = [
    { label: 'العمر', value: player.age ? String(player.age) : null },
    { label: 'النادي', value: player.club || null },
    { label: 'الطول', value: player.height_cm ? `${player.height_cm} سم` : null },
    { label: 'الوزن', value: player.weight_kg ? `${player.weight_kg} كغ` : null },
    { label: 'القدم', value: player.dominant_foot ? footLabel(player.dominant_foot) : null },
  ].filter((f): f is { label: string; value: string } => !!f.value && f.value !== '—')
  const playStats = [
    { label: 'السرعة', value: player.speed, icon: Footprints },
    { label: 'التمرير', value: player.passing, icon: Share2 },
    { label: 'التسديد', value: player.shooting, icon: Star },
    { label: 'اللياقة', value: player.fitness, icon: Ruler },
    { label: 'المراوغة', value: player.dribbling, icon: Footprints },
    { label: 'الدفاع', value: player.defense, icon: Shield },
  ].filter((st): st is { label: string; value: number; icon: typeof Footprints } => typeof st.value === 'number' && st.value > 0)

  // New records get column defaults (rating 60, zeros everywhere) that were
  // never measured. Show a rating only from a coach evaluation, or from a
  // record that carries real recorded stats; hide all-zero season totals.
  const hasRecordedData = playStats.length > 0 || rawHeadline.some(h => h.value > 0)
  const overall = evaluation?.overall ?? (hasRecordedData && player.rating ? player.rating : null)
  const overallLabel = evaluation ? 'تقييم المدرب' : 'التقييم العام'
  const headline = rawHeadline.some(h => h.value > 0) ? rawHeadline : []

  return (
    <div dir="rtl" className="min-h-screen bg-[#000A0F]">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-12">
        {/* ── Info column (scrolls) ── */}
        <div ref={infoRef} className="relative order-2 -mt-14 px-4 pb-24 sm:px-8 lg:order-1 lg:col-span-7 lg:mt-0 lg:px-14 lg:pb-32 lg:pt-36">
          <div className="relative z-10 mx-auto max-w-2xl">
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-1.5 text-sm text-ice-muted transition-colors hover:text-ice-white arabic-text"
            >
              <ArrowRight className="h-4 w-4" />
              رجوع
            </button>

            {justCreated && (
              <div role="status" className="mb-8 border border-teal-prime/40 bg-teal-prime/[0.07] p-5">
                <p className="flex items-center gap-2 text-base font-black text-teal-prime arabic-text">
                  <CheckCircle className="h-5 w-5" /> تم إنشاء هويتك الرياضية
                </p>
                <p className="mt-1 text-sm text-ice-muted arabic-text">
                  هذه بطاقتك كما يراها المدربون والكشافون. أضف فيديو لك لتكتمل، وسيظهر تقييم مدربك هنا حين يقيّمك.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to="/player/upload" className="btn-primary rounded-full px-5 py-2.5 text-sm arabic-text">أضف فيديو</Link>
                  <Link to="/player/dashboard" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-ice-white transition-colors hover:border-teal-prime/50 arabic-text">لوحتي</Link>
                </div>
              </div>
            )}

            {/* Eyebrow — as in the D2 mockup */}
            <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-teal-prime">
              <span className="h-px w-10 bg-teal-prime" />
              <span className="arabic-text">
                الهوية الرياضية{player.position ? ` · ${player.position}` : ''}{player.sport ? ` · ${sportLabel(player.sport)}` : ''}
              </span>
            </div>

            <div className="flex items-start gap-4">
              <h1 className="text-6xl font-black leading-[1.15] tracking-tightest md:text-8xl">
                <SplitReveal text={firstName} immediate delay={0.2} className="block text-ice-white arabic-text" />
                {restName && <SplitReveal text={restName} immediate delay={0.4} className="block text-teal-prime arabic-text" />}
              </h1>
              {player.is_verified && <CheckCircle className="mt-4 h-8 w-8 flex-shrink-0 text-teal-prime" aria-label="موثّق" />}
            </div>
            {player.name_en && <p className="mt-2 text-sm tracking-widest text-ice-muted" dir="ltr">{player.name_en}</p>}
            <div className="mt-6 h-px w-full bg-teal-prime/40" />

            {/* Headline numbers: overall + season totals (only what exists) */}
            {overall == null && headline.length === 0 && (
              <p className="mt-8 text-sm text-ice-muted arabic-text">لم يُقيَّم بعد، ولا توجد مباريات مسجّلة لهذا اللاعب.</p>
            )}
            {(overall != null || headline.length > 0) && (
              <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-6">
                {overall != null && (
                  <div>
                    <p className="mb-1 text-xs text-ice-muted arabic-text">{overallLabel}</p>
                    <span className="font-display text-8xl font-black leading-none text-teal-prime md:text-9xl">{overall}</span>
                  </div>
                )}
                {headline.map(h => (
                  <div key={h.label}>
                    <p className="mb-1 text-xs text-ice-muted arabic-text">{h.label}</p>
                    <span className="font-display text-4xl font-bold leading-none text-ice-white md:text-5xl">{h.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Facts row */}
            {facts.length > 0 && (
              <Stagger gap={0.07} className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/10 py-6 sm:grid-cols-5">
                {facts.map(f => (
                  <StaggerItem key={f.label} y={14}>
                    <p className="text-[11px] text-ice-muted arabic-text">{f.label}</p>
                    <p className="mt-1 text-lg font-bold text-ice-white arabic-text">{f.value}</p>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onShare}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-prime to-scout-blue px-6 py-3 text-sm font-bold text-navy-dark transition-all hover:shadow-lg hover:shadow-teal-prime/25 arabic-text"
              >
                {copied ? <><CheckCircle className="h-4 w-4" /> تم نسخ الرابط</> : <><Share2 className="h-4 w-4" /> مشاركة الملف</>}
              </button>
              <SportIdentityBadge profileId={player.user_id ?? undefined} />
            </div>

            {/* Skills — coach evaluation (4 axes) and play stats, side by side */}
            {(evaluation || playStats.length > 0) && (
              <SideReveal from="start" className="mt-14">
                <h2 className="mb-6 text-xl font-black text-ice-white arabic-text">
                  المهارات <span className="text-ice-muted">·</span> إحصائيات اللعب
                </h2>
                <div className={`grid gap-5 ${evaluation && playStats.length >= 3 ? 'md:grid-cols-2' : 'md:max-w-sm'}`}>
                  {evaluation && (() => {
                    const evalAxes = [
                      { label: 'فني', value: evaluation.technical },
                      { label: 'تكتيكي', value: evaluation.tactical },
                      { label: 'بدني', value: evaluation.physical },
                      { label: 'ذهني', value: evaluation.mental },
                    ]
                    const delta = previousEvaluation ? evaluation.overall - previousEvaluation.overall : null
                    return (
                      <RadarCard
                        eyebrow="تقييم المدرب"
                        headline={String(evaluation.overall)}
                        headlineCaption={delta == null ? 'من 100' : delta === 0 ? 'دون تغيير عن التقييم السابق' : <><bdi dir="ltr">{`${delta > 0 ? '+' : ''}${delta}`}</bdi> عن التقييم السابق</>}
                        color="#00DCC8"
                        axes={evalAxes}
                        compare={previousEvaluation ? {
                          label: 'التقييم السابق',
                          values: [previousEvaluation.technical, previousEvaluation.tactical, previousEvaluation.physical, previousEvaluation.mental],
                        } : undefined}
                        footnote={evaluation.evaluation_date ? `آخر تقييم ${new Date(evaluation.evaluation_date).toLocaleDateString('ar-SA')}` : undefined}
                      />
                    )
                  })()}
                  {playStats.length >= 3 && (
                    <RadarCard
                      eyebrow="إحصائيات اللعب"
                      headline={String(Math.round(playStats.reduce((t, st) => t + st.value, 0) / playStats.length))}
                      headlineCaption="المتوسط"
                      color="#F59E0B"
                      axes={playStats.map(st => ({ label: st.label, value: st.value }))}
                    />
                  )}
                  {playStats.length > 0 && playStats.length < 3 && (
                    <div className="space-y-4">
                      <p className="text-[11px] text-ice-muted arabic-text">إحصائيات اللاعب المسجّلة</p>
                      {playStats.map(st => <SkillBar key={st.label} label={st.label} value={st.value} icon={st.icon} />)}
                    </div>
                  )}
                </div>
                {evaluation?.notes && (
                  <p className="mt-6 border-t border-white/5 pt-4 text-sm leading-relaxed text-ice-muted arabic-text">{evaluation.notes}</p>
                )}
                {evaluation && <EvaluationBreakdown details={evaluation.details} />}
              </SideReveal>
            )}

            {/* Video */}
            {player.video_url && (
              <SideReveal from="start" className="mt-12 border-t border-white/10 pt-8">
                <h2 className="mb-5 flex items-center gap-2 text-base font-black text-ice-white arabic-text">
                  <Video className="h-4 w-4 text-teal-prime" />
                  فيديو اللاعب
                </h2>
                <video controls className="w-full bg-black/40" src={player.video_url}>
                  متصفحك لا يدعم تشغيل الفيديو
                </video>
              </SideReveal>
            )}
          </div>
        </div>

        {/* ── Pinned image column ── */}
        <div className="relative order-1 h-[58svh] overflow-hidden lg:order-2 lg:sticky lg:top-0 lg:col-span-5 lg:h-[100svh]">
          <motion.div style={reduced ? undefined : { scale: zoom }} className="absolute inset-0">
            {photo ? (
              <img src={photo} alt={player.name || ''} decoding="async" className="h-full w-full object-cover object-top" />
            ) : (
              /* No player photo on record: ambient pitch + monogram. Never a stand-in photo of a "player". */
              <>
                <img src={aerialPitch} alt="" decoding="async" className="h-full w-full object-cover grayscale opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(0,220,200,0.22),transparent_70%)]" />
                <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <span
                    className="font-display font-black leading-none text-transparent text-[min(40vw,18rem)] lg:text-[18rem]"
                    style={{ WebkitTextStroke: '2px rgba(0,220,200,0.7)', direction: 'ltr' }}
                  >
                    {overall ?? player.jersey_number ?? ''}
                  </span>
                </div>
              </>
            )}
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F] via-transparent to-[#000A0F]/40" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#000A0F] via-[#000A0F]/10 to-transparent" />
          <motion.div style={reduced ? undefined : { opacity: shade }} className="absolute inset-0 bg-[#000A0F]" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-teal-prime/80" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const justCreated = searchParams.get('created') === '1'
  const navigate = useNavigate()

  const [player, setPlayer] = useState<Player | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [previousEvaluation, setPreviousEvaluation] = useState<Evaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) {
      setError('معرّف اللاعب غير موجود')
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchPlayer() {
      try {
        // Fetch player
        const { data: playerData, error: playerErr } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (cancelled) return

        if (playerErr) {
          setError('تعذّر تحميل الملف')
          trackEvent('playerProfileError', { step: 'player', reason: playerErr.message })
          return
        }

        if (!playerData) {
          setPlayer(null)
          setLoading(false)
          return
        }

        setPlayer(playerData as Player)
        trackEvent('player_profile_viewed', { playerId: id as string })

        // Fetch latest evaluation
        const { data: evalData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('player_id', playerData.id)
          .order('evaluation_date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(2)

        if (!cancelled) {
          const evals = (evalData ?? []) as Evaluation[]
          setEvaluation(evals[0] ?? null)
          setPreviousEvaluation(evals[1] ?? null)
          trackEvent('playerProfileView', { playerId: id as string, hasEval: !!evalData?.length })
        }
      } catch {
        if (!cancelled) setError('تعذّر تحميل الملف')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPlayer()
    return () => { cancelled = true }
  }, [id])

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-prime animate-spin" />
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-card rounded-2xl p-8 max-w-sm w-full text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-ice-white font-bold text-lg mb-2 arabic-text">تعذّر تحميل الملف</p>
          <p className="text-ice-muted text-sm mb-6 arabic-text">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
          >
            <ArrowRight className="w-4 h-4" />
            رجوع
          </button>
        </motion.div>
      </div>
    )
  }

  // Empty — player not found
  if (!player) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-card rounded-2xl p-8 max-w-sm w-full text-center"
        >
          <User className="w-16 h-16 text-ice-muted mx-auto mb-4" />
          <h1 className="text-xl font-black text-ice-white mb-2 arabic-text">اللاعب غير موجود</h1>
          <p className="text-ice-muted text-sm mb-6 arabic-text">
            لم نتمكن من العثور على اللاعب المطلوب.
          </p>
          <button
            onClick={() => navigate('/scout')}
            className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة للوحة الكشافة
          </button>
        </motion.div>
      </div>
    )
  }

  // Share handler
  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      trackEvent('playerProfileShare', { playerId: id as string })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <ProfileLayout
      player={player}
      evaluation={evaluation}
      previousEvaluation={previousEvaluation}
      justCreated={justCreated}
      copied={copied}
      onShare={handleShare}
      onBack={() => navigate(-1)}
    />
  )
}
