/**
 * PlayerProfile — Ada2AI
 *
 * Public player profile page.
 * Shown when scouts click "عرض" in ScoutDashboard.
 * Reads player id from useParams(), fetches player + latest evaluation.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, type Player, type Evaluation } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import {
  ArrowRight, Share2, CheckCircle, Star, Ruler,
  Weight, Footprints, Shield, Video, User, Trophy,
  Loader2, AlertCircle, ChevronLeft, BarChart3
} from 'lucide-react'

// ── Skill Bar ──────────────────────────────────────
function SkillBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const pct = Math.min(Math.max(value, 0), 100)
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
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-l from-teal-prime to-teal-prime/60"
        />
      </div>
    </div>
  )
}

// ── Stat Pill ──────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null) return null
  return (
    <div className="glass-card rounded-xl px-4 py-3 text-center min-w-[80px]">
      <div className="text-lg font-bold text-gradient-teal">{value}</div>
      <div className="text-[11px] text-ice-muted arabic-text mt-0.5">{label}</div>
    </div>
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
    <div dir="rtl" className="min-h-screen bg-navy pb-12">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-2xl mx-auto px-4 pt-6">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-ice-muted text-sm mb-4 hover:text-ice-white transition-colors arabic-text"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {player.avatar_url || player.photo_url ? (
                <img
                  src={player.avatar_url || player.photo_url}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-ice-muted" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-ice-white arabic-text truncate">
                  {player.name || 'بدون اسم'}
                </h1>
                {player.is_verified && (
                  <CheckCircle className="w-5 h-5 text-teal-prime flex-shrink-0" />
                )}
              </div>
              {player.name_en && (
                <p className="text-ice-muted text-xs mb-2">{player.name_en}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                {player.sport && (
                  <span className="px-2 py-1 rounded-lg bg-teal-prime/10 text-teal-prime arabic-text">
                    {player.sport}
                  </span>
                )}
                {player.position && (
                  <span className="px-2 py-1 rounded-lg bg-white/5 text-ice-muted arabic-text">
                    {player.position}
                  </span>
                )}
                {player.nationality && (
                  <span className="px-2 py-1 rounded-lg bg-white/5 text-ice-muted arabic-text">
                    {player.nationality}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Share button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  تم النسخ!
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  مشاركة الملف
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-3 overflow-x-auto pb-2 mb-6 scrollbar-hide"
        >
          <StatPill label="العمر" value={player.age} />
          <StatPill label="النادي" value={player.club} />
          <StatPill label="الطول" value={player.height_cm ? `${player.height_cm} cm` : undefined} />
          <StatPill label="الوزن" value={player.weight_kg ? `${player.weight_kg} kg` : undefined} />
          <StatPill label="القدم" value={player.dominant_foot ? footLabel(player.dominant_foot) : undefined} />
          <StatPill label="أهداف" value={player.goals} />
          <StatPill label="تمريرات" value={player.assists} />
          <StatPill label="مباريات" value={player.appearances} />
        </motion.div>

        {/* Overall Rating — from evaluation */}
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass-card rounded-2xl p-6 mb-6 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-prime/10 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-teal-prime" />
            </div>
            <div className="flex-1">
              <p className="text-ice-muted text-xs arabic-text mb-1">التقييم العام</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gradient-teal">
                  {evaluation.overall}
                </span>
                <span className="text-ice-muted text-sm">/100</span>
              </div>
            </div>
            {evaluation.evaluation_date && (
              <p className="text-ice-muted text-[11px] arabic-text">
                {new Date(evaluation.evaluation_date).toLocaleDateString('ar-SA')}
              </p>
            )}
          </motion.div>
        )}

        {/* Skills — from evaluation */}
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h2 className="text-base font-bold text-ice-white mb-4 arabic-text flex items-center gap-2">
              <Star className="w-4 h-4 text-teal-prime" />
              المهارات
            </h2>
            <div className="space-y-4">
              <SkillBar label="فني" value={evaluation.technical} icon={Footprints} />
              <SkillBar label="تكتيكي" value={evaluation.tactical} icon={Shield} />
              <SkillBar label="بدني" value={evaluation.physical} icon={Ruler} />
              <SkillBar label="ذهني" value={evaluation.mental} icon={Weight} />
            </div>
            {evaluation.notes && (
              <p className="text-ice-muted text-xs mt-4 leading-relaxed arabic-text border-t border-white/5 pt-4">
                {evaluation.notes}
              </p>
            )}
          </motion.div>
        )}

        {/* Player Stats — from players table */}
        {(player.speed || player.passing || player.shooting || player.fitness || player.dribbling || player.defense) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h2 className="text-base font-bold text-ice-white mb-4 arabic-text flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-prime" />
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
          </motion.div>
        )}

        {/* Video */}
        {player.video_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-2xl p-6 mb-6"
          >
            <h2 className="text-base font-bold text-ice-white mb-4 arabic-text flex items-center gap-2">
              <Video className="w-4 h-4 text-teal-prime" />
              فيديو اللاعب
            </h2>
            <video
              controls
              className="w-full rounded-xl bg-black/40"
              src={player.video_url}
            >
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          </motion.div>
        )}
      </div>
    </div>
  )
}