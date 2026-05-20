/**
 * Player Dashboard V1 — Ada2AI
 * 
 * The real player home. Built on actual data.
 * All CTAs functional or clearly labeled as "قريباً".
 * 
 * Data sources:
 *   - Profile: from AuthContext
 *   - Player record: players table (user_id = auth.uid())
 *   - Evaluations: evaluations table (player_id = player.id)
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase, type Player, type Evaluation } from '../../lib/supabase'
import { trackEvent } from '../../lib/analytics'
import { usePlayerAnalyses } from '../../hooks/useAnalysis'
import {
  User, Video, BarChart3, MessageSquare,
  Upload, Share2, Star, CheckCircle,
  AlertCircle, ChevronRight,
  Trophy, Activity
} from 'lucide-react'
import { StatusBadge } from '../../components/StatusBadge'
import { SectionHeader } from '../../components/SectionHeader'
import type { StatusKey } from '../../lib/tokens'

// ── Skill Bar ──────────────────────────────────────────────────

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-ice-muted arabic-text">{label}</span>
        <span className="text-teal-prime font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className="h-full bg-gradient-to-r from-teal-prime to-scout-blue rounded-full"
        />
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────

export default function PlayerDashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [playerRecord, setPlayerRecord] = useState<Player | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loadingPlayer, setLoadingPlayer] = useState(true)
  const [copied, setCopied] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Video analyses (real data from video_analyses table)
  const { analyses: videoAnalyses } = usePlayerAnalyses(user?.id ?? '')

  // Fetch player record
  useEffect(() => {
    if (!user) return

    supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('[PlayerDashboard] player fetch error:', error)
          setFetchError('تعذّر تحميل بيانات اللاعب. حاول مرة أخرى.')
        }
        setPlayerRecord(data as Player | null)
        setLoadingPlayer(false)
      })
  }, [user])

  // Fetch evaluations once we have player id
  useEffect(() => {
    if (!playerRecord?.id) return

    supabase
      .from('evaluations')
      .select('*')
      .eq('player_id', playerRecord.id)
      .order('evaluation_date', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setEvaluations((data as Evaluation[]) ?? [])
      })
  }, [playerRecord?.id])

  // Redirect to onboarding if no player record
  useEffect(() => {
    if (!loadingPlayer && !playerRecord) {
      navigate('/player/onboarding', { replace: true })
    }
  }, [loadingPlayer, playerRecord, navigate])

  // Refetch data when window regains focus (session continuity)
  useEffect(() => {
    function handleFocus() {
      if (!user) return
      supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setPlayerRecord(data as Player)
        })
      // Also refetch evaluations when returning to the app
      const currentPlayerId = playerRecord?.id
      if (currentPlayerId) {
        supabase
          .from('evaluations')
          .select('*')
          .eq('player_id', currentPlayerId)
          .order('evaluation_date', { ascending: false })
          .limit(10)
          .then(({ data }) => {
            if (data) setEvaluations(data as Evaluation[])
          })
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, playerRecord?.id])

  // ── Derived state ────────────────────────────────────────

  const latestEval = evaluations[0] ?? null

  const analysisStatus: 'none' | 'pending' | 'processing' | 'completed' =
    evaluations.length === 0
      ? playerRecord?.video_url ? 'pending' : 'none'
      : 'completed'

  // ── Actions ──────────────────────────────────────────────

  function handleShareProfile() {
    const url = `${window.location.origin}/#/player/${playerRecord?.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackEvent('playerProfileShared')
    }).catch(() => {
      setCopied(false)
    })
  }

  // ── Loading ──────────────────────────────────────────────

  if (loadingPlayer) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-ice-white font-bold text-lg mb-2 arabic-text">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (!playerRecord) return null // will redirect

  // ── Render ───────────────────────────────────────────────

  return (
    <div dir="rtl" className="min-h-screen bg-navy">
      {/* Header */}
      <div className="relative bg-navy-light/50 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-prime/5 rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                {(profile?.full_name ?? '?').charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-ice-white arabic-text">
                    {profile?.full_name ?? playerRecord.name ?? 'اللاعب'}
                  </h1>
                  {playerRecord.is_verified && (
                    <CheckCircle className="w-5 h-5 text-teal-prime flex-shrink-0" />
                  )}
                </div>
                <p className="text-teal-prime text-sm arabic-text">
                  {playerRecord.position} · {playerRecord.sport}
                </p>
                {playerRecord.club && (
                  <p className="text-ice-muted text-xs mt-0.5 arabic-text">{playerRecord.club}</p>
                )}
              </div>
            </div>

            {/* Top actions */}
            <div className="flex gap-2">
              <button
                onClick={handleShareProfile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-ice-muted hover:text-ice-white transition-colors text-sm arabic-text"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'تم النسخ ✓' : 'مشاركة الملف'}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {[
              { label: 'التقييم العام', value: latestEval?.overall ?? '-', highlight: true },
              { label: 'المباريات', value: playerRecord.appearances ?? '-', highlight: false },
              { label: 'الكشافون', value: playerRecord.scouts_count ?? 0, highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className={`text-xl font-black ${highlight ? 'text-gradient-teal' : 'text-ice-white'}`}>
                  {value}
                </div>
                <div className="text-xs text-ice-muted arabic-text mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* ── MEDIA SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <SectionHeader title="الفيديوهات" icon={<Video className="w-4 h-4" />} action={
              <button
                onClick={() => navigate('/player/upload')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-prime/10 text-teal-prime text-xs font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
              >
                <Upload className="w-3.5 h-3.5" />
                رفع فيديو
              </button>
            } />
          </div>

          {playerRecord.video_url ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-white/5">
              <video
                src={playerRecord.video_url}
                controls
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              onClick={() => navigate('/player/upload')}
              className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-teal-prime/40 cursor-pointer transition-colors group"
            >
              <Upload className="w-8 h-8 text-ice-muted group-hover:text-teal-prime transition-colors mb-2" />
              <p className="text-ice-muted text-sm arabic-text group-hover:text-ice-white transition-colors">
                ارفع فيديو أداء لزيادة فرص الاكتشاف
              </p>
            </div>
          )}
        </motion.div>

        {/* ── ANALYSIS STATUS ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ice-white flex items-center gap-2 arabic-text">
              <BarChart3 className="w-4 h-4 text-teal-prime" />
              التحليل والتقييم
            </h2>
            <StatusBadge status={analysisStatus === 'none' ? 'pending' : analysisStatus === 'pending' ? 'queued' : analysisStatus as StatusKey} />
          </div>

          {latestEval ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'تقني', value: latestEval.technical },
                  { label: 'تكتيكي', value: latestEval.tactical },
                  { label: 'بدني', value: latestEval.physical },
                  { label: 'ذهني', value: latestEval.mental },
                ].map(({ label, value }) => (
                  <SkillBar key={label} label={label} value={value} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
                <Trophy className="w-5 h-5 text-teal-prime" />
                <span className="text-2xl font-black text-gradient-teal">{latestEval.overall}</span>
                <span className="text-sm text-ice-muted arabic-text">/ 100 تقييم عام</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Star className="w-10 h-10 text-ice-muted mx-auto mb-2" />
              <p className="text-ice-muted text-sm arabic-text">لم يصلك تقييم بعد — ارفع فيديو لتسريع العملية</p>
            </div>
          )}
        </motion.div>

        {/* ── ANALYSIS RESULTS (real data from video_analyses) ── */}
        {videoAnalyses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ice-white flex items-center gap-2 arabic-text">
                <Activity className="w-4 h-4 text-teal-prime" />
                نتائج التحليل
              </h2>
              <StatusBadge
                status={
                  videoAnalyses.find(a => a.status === 'completed')
                    ? 'completed' as StatusKey
                    : videoAnalyses.find(a => a.status === 'processing')
                      ? 'processing' as StatusKey
                      : videoAnalyses.find(a => a.status === 'queued')
                        ? 'queued' as StatusKey
                        : 'pending' as StatusKey
                }
              />
            </div>

            {(() => {
              const completed = videoAnalyses.find(a => a.status === 'completed' && a.analysis_data)
              if (!completed?.analysis_data) {
                return (
                  <div className="text-center py-6">
                    <p className="text-ice-muted text-sm arabic-text mb-3">لم يتم تحليل أي فيديو بعد</p>
                    <button
                      onClick={() => navigate('/player/upload')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text mx-auto"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      ارفع فيديو
                    </button>
                  </div>
                )
              }

              const results = completed.analysis_data
              return (
                <div className="space-y-4">
                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {results.activity_score != null && (
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-gradient-teal">{results.activity_score}%</div>
                        <div className="text-xs text-ice-muted arabic-text">نشاط اللاعب</div>
                      </div>
                    )}
                    {results.touches_estimate != null && (
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-ice-white">{results.touches_estimate}</div>
                        <div className="text-xs text-ice-muted arabic-text">لمسات</div>
                      </div>
                    )}
                    {results.speed_estimate_kmh != null && (
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-ice-white">{results.speed_estimate_kmh}</div>
                        <div className="text-xs text-ice-muted arabic-text">كم/س سرعة</div>
                      </div>
                    )}
                    {results.possession_involvement != null && (
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-2xl font-bold text-ice-white">{results.possession_involvement}%</div>
                        <div className="text-xs text-ice-muted arabic-text">استحواذ</div>
                      </div>
                    )}
                  </div>

                  {/* Activity Score Progress Bar */}
                  {results.activity_score != null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-ice-muted arabic-text">نشاط اللاعب</span>
                        <span className="text-teal-prime font-medium">{results.activity_score}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${results.activity_score}%` }}
                          transition={{ duration: 1.2 }}
                          className="h-full bg-gradient-to-r from-teal-prime to-scout-blue rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Movement Zones */}
                  {results.movement_zones && results.movement_zones.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-ice-muted arabic-text">مناطق التحرك</p>
                      {results.movement_zones.map((zone) => (
                        <div key={zone.zone} className="flex items-center gap-2">
                          <span className="text-xs text-ice-muted arabic-text w-12">{zone.zone}</span>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${zone.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-teal-prime to-scout-blue rounded-full"
                            />
                          </div>
                          <span className="text-xs text-ice-white font-medium w-8">{zone.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Coach Notes */}
                  {results.notes && (
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-ice-muted arabic-text mb-1">ملاحظات المدرب</p>
                      <p className="text-sm text-ice-white arabic-text">{results.notes}</p>
                    </div>
                  )}
                </div>
              )
            })()}
          </motion.div>
        )}

        {videoAnalyses.length === 0 && playerRecord.video_url && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ice-white flex items-center gap-2 arabic-text">
                <Activity className="w-4 h-4 text-teal-prime" />
                نتائج التحليل
              </h2>
            </div>
            <div className="text-center py-6">
              <p className="text-ice-muted text-sm arabic-text mb-3">لم يتم تحليل أي فيديو بعد</p>
              <button
                onClick={() => navigate('/player/upload')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text mx-auto"
              >
                <Upload className="w-3.5 h-3.5" />
                ارفع فيديو
              </button>
            </div>
          </motion.div>
        )}

        {/* ── COACH NOTES ── */}
        {latestEval?.notes && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
          >
            <h2 className="font-bold text-ice-white flex items-center gap-2 mb-3 arabic-text">
              <MessageSquare className="w-4 h-4 text-teal-prime" />
              ملاحظات المدرب
            </h2>
            <p className="text-ice-muted text-sm leading-relaxed arabic-text">
              {latestEval.notes}
            </p>
          </motion.div>
        )}

        {/* ── IDENTITY CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-5"
        >
          <h2 className="font-bold text-ice-white flex items-center gap-2 mb-4 arabic-text">
            <User className="w-4 h-4 text-teal-prime" />
            البيانات الشخصية
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'الرياضة', value: playerRecord.sport },
              { label: 'المركز', value: playerRecord.position },
              { label: 'العمر', value: playerRecord.age ? `${playerRecord.age} سنة` : null },
              { label: 'الطول', value: playerRecord.height_cm ? `${playerRecord.height_cm} سم` : null },
              { label: 'الوزن', value: playerRecord.weight_kg ? `${playerRecord.weight_kg} كغ` : null },
              { label: 'القدم', value: playerRecord.dominant_foot === 'right' ? 'يمنى' : playerRecord.dominant_foot === 'left' ? 'يسرى' : playerRecord.dominant_foot === 'both' ? 'كلتاهما' : null },
            ].filter(item => item.value).map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3">
                <div className="text-xs text-ice-muted arabic-text mb-0.5">{label}</div>
                <div className="text-sm font-medium text-ice-white arabic-text">{value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── REQUEST SCOUT REVIEW ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-ice-white arabic-text">طلب مراجعة كاشف</h3>
              <p className="text-xs text-ice-muted mt-0.5 arabic-text">
                أرسل ملفك للكشافين المسجلين في المنصة
              </p>
            </div>
            <button
              onClick={() => trackEvent('scoutReviewRequested')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
            >
              إرسال
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
