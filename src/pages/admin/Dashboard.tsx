import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Video, BarChart3, Briefcase, Search,
  RefreshCw, Eye, Edit3, X, AlertCircle, CheckCircle2, Loader2,
} from 'lucide-react'
import { useClubPlayers, useSearchClubPlayers, useUpdateClubPlayer, useClubAnalyses, useRetryAnalysis, useClubStats } from '../../hooks/useAdmin'
import type { Player } from '../../lib/supabase'
import type { AnalysisResults } from '../../services/analysis'
import { StatusBadge } from '../../components/StatusBadge'
import type { StatusKey } from '../../lib/tokens'

type Tab = 'players' | 'analyses' | 'stats' | 'workspace'

function EditPlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const updatePlayerMutation = useUpdateClubPlayer()
  const [form, setForm] = useState({
    name: player.name ?? '',
    position: player.position ?? '',
    sport: player.sport ?? '',
    age: player.age?.toString() ?? '',
    height_cm: player.height_cm?.toString() ?? '',
    weight_kg: player.weight_kg?.toString() ?? '',
    dominant_foot: player.dominant_foot ?? '',
    jersey_number: player.jersey_number?.toString() ?? '',
    achievements: player.achievements ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setError(null)
    try {
      const updates: Record<string, unknown> = {}
      if (form.name) updates.name = form.name
      if (form.position) updates.position = form.position
      if (form.sport) updates.sport = form.sport
      if (form.age) updates.age = parseInt(form.age)
      if (form.height_cm) updates.height_cm = parseInt(form.height_cm)
      if (form.weight_kg) updates.weight_kg = parseInt(form.weight_kg)
      if (form.dominant_foot) updates.dominant_foot = form.dominant_foot
      if (form.jersey_number) updates.jersey_number = parseInt(form.jersey_number)
      if (form.achievements) updates.achievements = form.achievements

      await updatePlayerMutation.mutateAsync({ id: player.id, updates })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-ice-white arabic-text">تعديل بيانات اللاعب</h3>
          <button onClick={onClose} className="text-ice-muted hover:text-ice-white"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="bg-red-400/10 text-red-400 text-sm rounded-lg p-3 mb-4 arabic-text">{error}</div>
        )}

        <div className="space-y-4">
          {[
            { key: 'name', label: 'الاسم' },
            { key: 'position', label: 'المركز' },
            { key: 'sport', label: 'الرياضة' },
            { key: 'age', label: 'العمر' },
            { key: 'height_cm', label: 'الطول (سم)' },
            { key: 'weight_kg', label: 'الوزن (كغ)' },
            { key: 'dominant_foot', label: 'القدم المفضلة' },
            { key: 'jersey_number', label: 'رقم القميص' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs text-ice-muted arabic-text block mb-1">{field.label}</label>
              <input
                type="text"
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ice-white text-sm arabic-text focus:outline-none focus:border-teal-prime"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-ice-muted arabic-text block mb-1">الإنجازات</label>
            <textarea
              value={form.achievements}
              onChange={e => setForm(prev => ({ ...prev, achievements: e.target.value }))}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ice-white text-sm arabic-text focus:outline-none focus:border-teal-prime resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={updatePlayerMutation.isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm arabic-text disabled:opacity-50 transition-all"
          >
            {updatePlayerMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 text-ice-muted text-sm arabic-text hover:bg-white/10">إلغاء</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { players, loading: playersLoading, error: playersError } = useClubPlayers()
  const { analyses, loading: analysesLoading } = useClubAnalyses()
  const { stats, loading: statsLoading } = useClubStats()
  const retryAnalysis = useRetryAnalysis()
  const [activeTab, setActiveTab] = useState<Tab>('players')
  const [searchQuery, setSearchQuery] = useState('')
  const { results: searchResults, loading: searchLoading } = useSearchClubPlayers(searchQuery)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'players', label: 'اللاعبون', icon: <Users className="w-4 h-4" /> },
    { id: 'analyses', label: 'التحليلات', icon: <Video className="w-4 h-4" /> },
    { id: 'stats', label: 'الإحصائيات', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'workspace', label: 'مساحة العمل', icon: <Briefcase className="w-4 h-4" /> },
  ]

  const displayedPlayers = searchQuery.length > 1 ? searchResults : players

  return (
    <div className="min-h-screen bg-navy" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-teal arabic-text">لوحة إدارة نادي الروضة</h1>
            <p className="text-ice-muted text-sm arabic-text mt-1">إدارة اللاعبين والتحليلات والإحصائيات</p>
          </div>
          <button onClick={() => navigate('/coach')} className="px-4 py-2 rounded-xl bg-white/5 text-ice-muted text-sm arabic-text hover:bg-white/10 transition-colors">
            العودة للوحة المدرب
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'workspace') {
                  navigate('/coach/workspace')
                } else {
                  setActiveTab(tab.id)
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all arabic-text ${
                activeTab === tab.id
                  ? 'bg-teal-prime/20 text-teal-prime border border-teal-prime/30'
                  : 'bg-white/5 text-ice-muted hover:bg-white/10 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* TAB A — Players */}
        {activeTab === 'players' && (
          <div>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن لاعب..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pr-11 pl-4 py-3 text-ice-white text-sm arabic-text focus:outline-none focus:border-teal-prime"
              />
            </div>

            {playersLoading || searchLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-teal-prime animate-spin" />
              </div>
            ) : playersError ? (
              <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-ice-muted arabic-text">{playersError}</p>
              </div>
            ) : displayedPlayers.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-ice-muted mx-auto mb-4" />
                <p className="text-ice-muted arabic-text">{searchQuery ? 'لا توجد نتائج بحث' : 'لا يوجد لاعبون مسجلون'}</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-right px-4 py-3 text-ice-muted arabic-text font-medium">الاسم</th>
                        <th className="text-right px-4 py-3 text-ice-muted arabic-text font-medium">المركز</th>
                        <th className="text-right px-4 py-3 text-ice-muted arabic-text font-medium">الرياضة</th>
                        <th className="text-right px-4 py-3 text-ice-muted arabic-text font-medium">العمر</th>
                        <th className="text-right px-4 py-3 text-ice-muted arabic-text font-medium">حالة</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedPlayers.map(player => (
                        <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-xs">
                                {(player.name || '؟').charAt(0)}
                              </div>
                              <span className="text-ice-white arabic-text">{player.name || 'غير معروف'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-ice-muted arabic-text">{player.position || '-'}</td>
                          <td className="px-4 py-3 text-ice-muted arabic-text">{player.sport || '-'}</td>
                          <td className="px-4 py-3 text-ice-white">{player.age ?? '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-lg arabic-text ${player.is_verified ? 'bg-teal-400/10 text-teal-400' : 'bg-amber-400/10 text-amber-400'}`}>
                              {player.is_verified ? 'مؤكد' : 'معلّق'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setEditingPlayer(player)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-prime/10 text-teal-prime text-xs arabic-text hover:bg-teal-prime/20 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              تعديل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB B — Analyses */}
        {activeTab === 'analyses' && (
          <div>
            {analysesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-teal-prime animate-spin" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-20">
                <Video className="w-16 h-16 text-ice-muted mx-auto mb-4" />
                <p className="text-ice-muted arabic-text">لا توجد تحليلات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyses.map(analysis => {
                  const results = (analysis.analysis_data ?? {}) as AnalysisResults

                  return (
                    <div key={analysis.id} className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={(analysis.status ?? 'queued') as StatusKey} />
                          <div>
                            <p className="text-ice-white text-sm arabic-text">{analysis.title || 'تحليل فيديو'}</p>
                            <p className="text-ice-muted text-xs arabic-text">{analysis.created_at ? new Date(analysis.created_at).toLocaleDateString('ar-SA') : '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {analysis.status === 'failed' && (
                            <button
                              onClick={() => retryAnalysis.mutate(analysis.id)}
                              disabled={retryAnalysis.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 text-xs arabic-text hover:bg-amber-400/20 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className="w-3 h-3" />
                              إعادة المحاولة
                            </button>
                          )}
                          {analysis.status === 'completed' && (
                            <button
                              onClick={() => navigate('/coach/workspace')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-prime/10 text-teal-prime text-xs arabic-text hover:bg-teal-prime/20 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              عرض النتائج
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline results summary for completed */}
                      {analysis.status === 'completed' && results.activity_score != null && (
                        <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-ice-white">{results.activity_score}</div>
                            <div className="text-xs text-ice-muted arabic-text">نشاط</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-ice-white">{results.touches_estimate ?? '-'}</div>
                            <div className="text-xs text-ice-muted arabic-text">لمسات</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-ice-white">{results.speed_estimate_kmh ?? '-'}</div>
                            <div className="text-xs text-ice-muted arabic-text">كم/س</div>
                          </div>
                        </div>
                      )}

                      {/* Error message for failed */}
                      {analysis.status === 'failed' && results.error && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-red-400 text-xs arabic-text">⚠️ {results.error}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB C — Stats */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'اللاعبون المسجلون', value: stats.playersCount, icon: <Users className="w-5 h-5" />, color: 'text-teal-prime' },
              { label: 'فيديوهات مرفوعة', value: stats.videosCount, icon: <Video className="w-5 h-5" />, color: 'text-blue-400' },
              { label: 'تحليلات مكتملة', value: stats.completedCount, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-400' },
              { label: 'تحليلات فاشلة', value: stats.failedCount, icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-400' },
              { label: 'التقييمات', value: stats.ratingsCount, icon: <BarChart3 className="w-5 h-5" />, color: 'text-gold' },
            ].map(stat => (
              <div key={stat.label} className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-ice-white">{statsLoading ? '...' : stat.value}</div>
                <div className="text-xs text-ice-muted arabic-text mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB D — Workspace link */}
        {activeTab === 'workspace' && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-teal-prime mx-auto mb-4" />
            <h3 className="text-xl font-bold text-ice-white arabic-text mb-2">مساحة عمل المدرب</h3>
            <p className="text-ice-muted arabic-text mb-6">تحليلات الفيديو والتشكيلات التكتيكية</p>
            <button
              onClick={() => navigate('/coach/workspace')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm arabic-text hover:shadow-xl hover:shadow-teal-prime/25 transition-all"
            >
              فتح مساحة العمل
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingPlayer && (
        <EditPlayerModal player={editingPlayer} onClose={() => setEditingPlayer(null)} />
      )}
    </div>
  )
}