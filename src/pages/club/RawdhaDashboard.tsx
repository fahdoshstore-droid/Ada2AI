/**
 * Al Rawdha Club Dashboard — Ada2AI
 *
 * Club-specific dashboard showing players, analyses, and stats
 * for نادي الروضة. All data from existing hooks (useAdmin, useAnalysis).
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useClubPlayers, useClubAnalyses, useClubStats } from '../../hooks/useAdmin'
import { toUiStatus } from '../../services/analysis'
import { StatusBadge } from '../../components/StatusBadge'
import {
  Users, BarChart3, Video, Activity,
  ChevronLeft, Upload, UserCheck, Search,
  AlertCircle, CheckCircle, Star
} from 'lucide-react'
import type { StatusKey } from '../../lib/tokens'

export default function RawdhaDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { players, loading: loadingPlayers, error: playersError } = useClubPlayers()
  const { analyses: clubAnalyses, loading: loadingAnalyses } = useClubAnalyses()
  const { stats, loading: loadingStats } = useClubStats()

  const isLoading = loadingPlayers || loadingAnalyses || loadingStats
  const isCoach = profile?.user_type === 'coach'
  const isPlayer = profile?.user_type === 'player'

  // Get recent 5 analyses for the club
  const recentAnalyses = clubAnalyses.slice(0, 5)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-navy">
      {/* Header */}
      <div className="relative bg-navy-light/50 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-prime/5 rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-black text-xl flex-shrink-0">
              رو
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ice-white arabic-text">نادي الروضة</h1>
              <p className="text-ice-muted text-sm arabic-text">لوحة التحكم الرسمية</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'اللاعبون', value: stats.playersCount, icon: <Users className="w-4 h-4" />, color: 'text-teal-prime' },
              { label: 'التحليلات', value: stats.videosCount, icon: <Video className="w-4 h-4" />, color: 'text-scout-blue' },
              { label: 'المكتملة', value: stats.completedCount, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-400' },
              { label: 'التقييمات', value: stats.ratingsCount, icon: <Star className="w-4 h-4" />, color: 'text-amber-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
                <div className={`mx-auto mb-2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
                  {icon}
                </div>
                <div className="text-2xl font-black font-display text-ice-white">{value}</div>
                <div className="text-xs text-ice-muted arabic-text mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* ── SECTION B: Active Players ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ice-white flex items-center gap-2 arabic-text">
              <Users className="w-4 h-4 text-teal-prime" />
              اللاعبون النشطون
            </h2>
            <span className="text-xs text-ice-muted arabic-text">
              {players.length} لاعب
            </span>
          </div>

          {playersError ? (
            <div className="flex items-center gap-2 py-4 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm arabic-text">{playersError}</span>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-ice-muted text-sm arabic-text">لا يوجد لاعبون مسجلون للنادي حالياً</p>
            </div>
          ) : (
            <div className="space-y-2">
              {players.slice(0, 10).map((player) => {
                const playerAnalyses = clubAnalyses.filter(a => a.uploaded_by === player.user_id)
                const latestAnalysis = playerAnalyses[0]
                const analysisStatus: StatusKey = latestAnalysis
                  ? toUiStatus(latestAnalysis.status)
                  : 'pending'

                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-3 hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-prime/20 to-scout-blue/20 flex items-center justify-center text-teal-prime font-bold text-sm flex-shrink-0">
                        {(player.name ?? '?').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ice-white arabic-text truncate">
                          {player.name}
                        </p>
                        <p className="text-xs text-ice-muted arabic-text truncate">
                          {player.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={analysisStatus} />
                      <button
                        onClick={() => navigate(`/player/${player.id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-teal-prime hover:bg-teal-prime/10 transition-colors arabic-text"
                      >
                        عرض الملف
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* ── SECTION C: Recent Analyses ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ice-white flex items-center gap-2 arabic-text">
              <Activity className="w-4 h-4 text-teal-prime" />
              التحليلات الأخيرة
            </h2>
            <button
              onClick={() => navigate('/coach/workspace')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-teal-prime hover:bg-teal-prime/10 transition-colors arabic-text"
            >
              مساحة عمل المدرب
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>

          {recentAnalyses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-ice-muted text-sm arabic-text">لا توجد تحليلات بعد</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAnalyses.map((analysis) => {
                const uiStatus = toUiStatus(analysis.status) as StatusKey
                const matchingPlayer = players.find(p => p.user_id === analysis.uploaded_by)
                return (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ice-white arabic-text truncate">
                        {matchingPlayer?.name ?? analysis.title ?? 'تحليل'}
                      </p>
                      <p className="text-xs text-ice-muted arabic-text">
                        {analysis.date ?? analysis.created_at?.slice(0, 10)}
                      </p>
                    </div>
                    <StatusBadge status={uiStatus} />
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* ── SECTION D: Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <h2 className="font-bold text-ice-white flex items-center gap-2 mb-4 arabic-text">
            <BarChart3 className="w-4 h-4 text-teal-prime" />
            إجراءات سريعة
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isPlayer && (
              <button
                onClick={() => navigate('/player/upload')}
                className="flex items-center gap-3 p-4 rounded-xl bg-teal-prime/5 hover:bg-teal-prime/10 border border-teal-prime/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-prime/10 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 text-teal-prime" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ice-white arabic-text">رفع فيديو جديد</p>
                  <p className="text-xs text-ice-muted arabic-text">ارفع مقطع أدائك</p>
                </div>
              </button>
            )}

            {isCoach && (
              <button
                onClick={() => navigate('/coach/workspace')}
                className="flex items-center gap-3 p-4 rounded-xl bg-scout-blue/5 hover:bg-scout-blue/10 border border-scout-blue/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-scout-blue/10 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-scout-blue" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ice-white arabic-text">تقييم لاعب</p>
                  <p className="text-xs text-ice-muted arabic-text">سجّل نتائج التحليل</p>
                </div>
              </button>
            )}

            <button
              onClick={() => navigate('/scout')}
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-ice-white arabic-text">بحث في الكشافين</p>
                <p className="text-xs text-ice-muted arabic-text">اكتشف الكشافين المسجلين</p>
              </div>
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

