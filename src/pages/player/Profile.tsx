/**
 * PlayerProfile — Ada2AI
 *
 * Public player profile page.
 * Shown when scouts click "عرض" in ScoutDashboard.
 * Reads player id from useParams(), fetches player + latest evaluation.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { supabase, type Player, type Evaluation } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import {
  ArrowRight, Share2, CheckCircle, Star, Ruler,
  Weight, Footprints, Shield, Video, User, Trophy,
  Loader2, AlertCircle, ChevronLeft, BarChart3
} from 'lucide-react'
import { GhostNumber, SideReveal, SplitReveal, Stagger, StaggerItem } from '../../components/cinema/Cinema'
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

// ── Stat Cell ──────────────────────────────────────
function StatCell({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null) return null
  return (
    <StaggerItem y={18} className="bg-[#000A0F] px-4 py-5">
      <div className="font-display text-2xl font-black leading-tight text-ice-white md:text-3xl">{value}</div>
      <div className="mt-1 text-[11px] text-ice-muted arabic-text">{label}</div>
    </StaggerItem>
  )
}

// ── Foot Label ──────────────────────────────────────
function footLabel(foot: string | undefined): string {
  switch (foot) {
    case 'left': return 'يسرى'
    case 'right': return 'أيمن'
    case 'both': return 'ثنائي'
    default: return '—'
  }
}

// ── Profile layout: pinned image → scrolling profile ─────────────
interface ProfileLayoutProps {
  player: Player
  evaluation: Evaluation | null
  copied: boolean
  onShare: () => void
  onBack: () => void
}

function ProfileLayout({ player, evaluation, copied, onShare, onBack }: ProfileLayoutProps) {
  const reduced = useReducedMotion()
  const infoRef = useRef<HTMLDivElement>(null)
  // progress of the info column through the viewport drives the image → profile transition
  const { scrollYProgress } = useScroll({ target: infoRef, offset: ['start start', 'end end'] })
  const shade = useTransform(scrollYProgress, [0, 0.7], [0, 0.62])
  const zoom = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const photo = player.avatar_url || player.photo_url
  const firstName = (player.name || 'بدون اسم').split(' ')[0]

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

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              {player.sport && <span className="border border-teal-prime/40 px-2.5 py-1 text-teal-prime arabic-text">{player.sport}</span>}
              {player.position && <span className="border border-white/15 px-2.5 py-1 text-ice-muted arabic-text">{player.position}</span>}
              {player.nationality && <span className="border border-white/15 px-2.5 py-1 text-ice-muted arabic-text">{player.nationality}</span>}
            </div>

            <div className="flex items-center gap-4">
              <h1 className="text-6xl font-black leading-[1.2] tracking-tightest text-ice-white md:text-8xl">
                <SplitReveal text={firstName} immediate delay={0.2} className="arabic-text" />
              </h1>
              {player.is_verified && <CheckCircle className="h-8 w-8 flex-shrink-0 text-teal-prime" aria-label="موثّق" />}
            </div>
            {player.name_en && <p className="mt-1 text-sm tracking-widest text-ice-muted">{player.name_en.split(' ')[0]}</p>}

            <button
              onClick={onShare}
              className="mt-6 flex items-center gap-2 border border-teal-prime/40 px-5 py-2.5 text-sm font-medium text-teal-prime transition-colors hover:bg-teal-prime/10 arabic-text"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  تم النسخ!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  مشاركة الملف
                </>
              )}
            </button>

            {/* Facts grid */}
            <Stagger gap={0.07} className="mt-12 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
              <StatCell label="العمر" value={player.age} />
              <StatCell label="النادي" value={player.club} />
              <StatCell label="الطول" value={player.height_cm ? `${player.height_cm} cm` : undefined} />
              <StatCell label="الوزن" value={player.weight_kg ? `${player.weight_kg} kg` : undefined} />
              <StatCell label="القدم" value={player.dominant_foot ? footLabel(player.dominant_foot) : undefined} />
              <StatCell label="أهداف" value={player.goals} />
              <StatCell label="تمريرات" value={player.assists} />
              <StatCell label="مباريات" value={player.appearances} />
            </Stagger>

            {/* Overall rating — from evaluation */}
            {evaluation && (
              <SideReveal from="start" className="relative mt-16 overflow-hidden border-t border-white/10 pt-8">
                <GhostNumber n={String(evaluation.overall)} className="-top-6 end-0 opacity-60" />
                <div className="relative z-10 flex items-end gap-5">
                  <Trophy className="mb-3 h-8 w-8 text-teal-prime" />
                  <div>
                    <p className="mb-1 text-xs text-ice-muted arabic-text">التقييم العام</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-8xl font-black leading-none text-teal-prime md:text-9xl">{evaluation.overall}</span>
                      <span className="text-sm text-ice-muted">/100</span>
                    </div>
                  </div>
                  {evaluation.evaluation_date && (
                    <p className="mb-3 ms-auto text-[11px] text-ice-muted arabic-text">
                      {new Date(evaluation.evaluation_date).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                </div>
              </SideReveal>
            )}

            {/* Skills — from evaluation */}
            {evaluation && (
              <SideReveal from="start" className="mt-12 border-t border-white/10 pt-8">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-ice-white arabic-text">
                  <Star className="h-4 w-4 text-teal-prime" />
                  المهارات
                </h2>
                <div className="space-y-4">
                  <SkillBar label="فني" value={evaluation.technical} icon={Footprints} />
                  <SkillBar label="تكتيكي" value={evaluation.tactical} icon={Shield} />
                  <SkillBar label="بدني" value={evaluation.physical} icon={Ruler} />
                  <SkillBar label="ذهني" value={evaluation.mental} icon={Weight} />
                </div>
                {evaluation.notes && (
                  <p className="mt-5 border-t border-white/5 pt-4 text-xs leading-relaxed text-ice-muted arabic-text">
                    {evaluation.notes}
                  </p>
                )}
              </SideReveal>
            )}

            {/* Player Stats — from players table */}
            {(player.speed || player.passing || player.shooting || player.fitness || player.dribbling || player.defense) && (
              <SideReveal from="start" className="mt-12 border-t border-white/10 pt-8">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-ice-white arabic-text">
                  <BarChart3 className="h-4 w-4 text-teal-prime" />
                  إحصائيات اللعب
                </h2>
                <div className="space-y-4">
                  {player.speed !== undefined && player.speed > 0 && <SkillBar label="السرعة" value={player.speed} icon={Footprints} />}
                  {player.passing !== undefined && player.passing > 0 && <SkillBar label="التمرير" value={player.passing} icon={Share2} />}
                  {player.shooting !== undefined && player.shooting > 0 && <SkillBar label="التسديد" value={player.shooting} icon={Star} />}
                  {player.fitness !== undefined && player.fitness > 0 && <SkillBar label="اللياقة" value={player.fitness} icon={Ruler} />}
                  {player.dribbling !== undefined && player.dribbling > 0 && <SkillBar label="المراوغة" value={player.dribbling} icon={Footprints} />}
                  {player.defense !== undefined && player.defense > 0 && <SkillBar label="الدفاع" value={player.defense} icon={Shield} />}
                </div>
              </SideReveal>
            )}

            {/* Video */}
            {player.video_url && (
              <SideReveal from="start" className="mt-12 border-t border-white/10 pt-8">
                <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-ice-white arabic-text">
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
                    className="font-black leading-none text-transparent text-[min(46vw,22rem)] lg:text-[22rem]"
                    style={{ WebkitTextStroke: '2px rgba(0,220,200,0.7)' }}
                  >
                    {(player.name || '؟').charAt(0)}
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
  const navigate = useNavigate()

  const [player, setPlayer] = useState<Player | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
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
          .limit(1)
          .maybeSingle()

        if (!cancelled) {
          setEvaluation(evalData as Evaluation | null)
          trackEvent('playerProfileView', { playerId: id as string, hasEval: !!evalData })
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
          <h1 className="text-xl font-bold text-ice-white mb-2 arabic-text">اللاعب غير موجود</h1>
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
      copied={copied}
      onShare={handleShare}
      onBack={() => navigate(-1)}
    />
  )
}
