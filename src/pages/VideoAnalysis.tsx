/**
 * VideoAnalysis — Ada2AI
 *
 * Real player-facing analysis page.
 * Reads analyses from usePlayerAnalyses(user.id).
 * No fake data — all values come from Supabase.
 */
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Film, Clock, Loader2, CheckCircle2, XCircle,
  Upload, ArrowLeft, AlertCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePlayerAnalyses } from '../hooks/useAnalysis'
import { AnalysisResultsView } from '../components/coach/AnalysisResultsView'

const STATUS_CONFIG: Record<string, { icon: typeof Clock; label: string; color: string; spin?: boolean }> = {
  queued: { icon: Clock, label: 'في الانتظار', color: 'text-amber-400 bg-amber-400/10' },
  processing: { icon: Loader2, label: 'جارٍ التحليل', color: 'text-blue-400 bg-blue-400/10', spin: true },
  completed: { icon: CheckCircle2, label: 'مكتمل', color: 'text-teal-prime bg-teal-prime/10' },
  failed: { icon: XCircle, label: 'فشل', color: 'text-red-400 bg-red-400/10' },
}

function StatusBadge({ status }: { status: string | null }) {
  const cfg = STATUS_CONFIG[status ?? 'queued'] ?? STATUS_CONFIG.queued
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg arabic-text ${cfg.color}`}>
      <Icon className={`w-3.5 h-3.5${cfg.spin ? ' animate-spin' : ''}`} />
      {cfg.label}
    </span>
  )
}

export default function VideoAnalysis() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { analyses, loading, error } = usePlayerAnalyses(user?.id ?? '')

  if (!user) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-ice-muted arabic-text">يرجى تسجيل الدخول أولاً</p>
      </div>
    )
  }

  if (error) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 arabic-text mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl bg-teal-prime/10 text-teal-prime text-sm arabic-text hover:bg-teal-prime/20"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-navy">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-ice-muted hover:text-ice-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-ice-white arabic-text">تحليلات الفيديو</h1>
              <p className="text-ice-muted text-sm arabic-text">جميع تحليلات الفيديو الخاصة بك</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/player/upload')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm arabic-text hover:shadow-lg hover:shadow-teal-prime/25 transition-all"
          >
            <Upload className="w-4 h-4" />
            رفع فيديو
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-teal-prime animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && analyses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-10 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-prime/10 flex items-center justify-center mx-auto mb-6">
              <Film className="w-8 h-8 text-teal-prime" />
            </div>
            <h2 className="text-xl font-bold text-ice-white arabic-text mb-2">لا توجد تحليلات بعد</h2>
            <p className="text-ice-muted arabic-text mb-6">
              ارفع فيديو أولاً ليتم تحليله بواسطة الذكاء الاصطناعي
            </p>
            <button
              onClick={() => navigate('/player/upload')}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm arabic-text hover:shadow-lg hover:shadow-teal-prime/25 transition-all"
            >
              <Upload className="w-4 h-4" />
              ارفع فيديو
            </button>
          </motion.div>
        )}

        {/* Analyses list */}
        {!loading && analyses.length > 0 && (
          <div className="space-y-4">
            {analyses.map(analysis => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-5"
              >
                {/* Header: title + status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Film className="w-5 h-5 text-teal-prime" />
                    </div>
                    <div>
                      <h3 className="text-ice-white font-medium arabic-text">
                        {analysis.title || 'تحليل فيديو'}
                      </h3>
                      <p className="text-ice-muted text-xs arabic-text">
                        {analysis.created_at
                          ? new Date(analysis.created_at).toLocaleDateString('ar-SA', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })
                          : 'تاريخ غير معروف'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={analysis.status} />
                </div>

                {/* Results for completed analyses */}
                {analysis.status === 'completed' && analysis.analysis_data && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <AnalysisResultsView results={analysis.analysis_data} />
                  </div>
                )}

                {/* Error for failed */}
                {analysis.status === 'failed' && analysis.analysis_data?.error && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="bg-red-400/10 rounded-lg p-3 border border-red-400/20">
                      <p className="text-sm text-red-400 arabic-text">⚠️ {analysis.analysis_data.error}</p>
                    </div>
                  </div>
                )}

                {/* Video link */}
                {analysis.video_url && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <a
                      href={analysis.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-teal-prime hover:text-teal-prime/80 transition-colors arabic-text"
                    >
                      <Film className="w-4 h-4" />
                      مشاهدة الفيديو
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}