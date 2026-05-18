/**
 * ScoutDashboard — Ada2AI (CTAs fixed + Pagination added)
 * 
 * Changes:
 * 1. Eye button → navigate to /player/:id
 * 2. Share button → copy link to clipboard with toast
 * 3. Compare button → local comparison list (max 2 players)
 * 4. Download button → labeled "قريباً" until PDF feature is built
 * 5. Pagination → no more select('*') without limit
 * 6. React Query via useScoutPlayers (migrated hook)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  UserSearch, Filter, Eye, Download,
  Share2, GitCompareArrows, ChevronLeft, ChevronRight,
  AlertCircle
} from 'lucide-react'
import { useScoutPlayers } from '../hooks/useScoutPlayers'
import { trackEvent } from '../lib/analytics'

const filters = ['الكل', 'مهاجم', 'وسط', 'مدافع', 'حارس', 'جناح']

export default function ScoutDashboard() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('الكل')
  const [page, setPage] = useState(0)
  const [compareList, setCompareList] = useState<string[]>([])

  const { players, loading, error, pageSize } = useScoutPlayers(
    activeFilter !== 'الكل' ? activeFilter : undefined,
    page
  )

  // ── Actions ────────────────────────────────────────────────

  function handleView(playerId: string) {
    trackEvent('scoutViewedPlayer', { playerId })
    navigate(`/player/${playerId}`)
  }

  function handleShare(playerId: string) {
    const url = `${window.location.origin}/#/player/${playerId}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('تم نسخ رابط اللاعب')
      trackEvent('scoutSharedPlayer', { playerId })
    })
  }

  function handleCompare(playerId: string) {
    setCompareList(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId)
      }
      if (prev.length >= 2) {
        toast.info('يمكنك مقارنة لاعبين فقط في نفس الوقت')
        return prev
      }
      return [...prev, playerId]
    })
  }

  function handleFilterChange(f: string) {
    setActiveFilter(f)
    setPage(0) // reset to first page when filter changes
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-scout-blue/10 rounded-full blur-[128px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-scout-blue/10 border border-scout-blue/20 text-teal-prime text-sm font-medium mb-6">
              <UserSearch className="w-4 h-4" />
              <span className="arabic-text">لوحة الكشافين</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-teal arabic-text">اكتشف المواهب</span>
              <br />
              <span className="text-ice-white arabic-text">بذكاء اصطناعي متقدم</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div className="sticky top-0 z-10 bg-navy-dark/90 backdrop-blur-sm border-b border-teal-prime/20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-ice-muted arabic-text">
              {compareList.length} / 2 لاعبين محددين للمقارنة
            </span>
            {compareList.length === 2 && (
              <button
                onClick={() => navigate(`/compare?ids=${compareList.join(',')}`)}
                className="px-4 py-1.5 rounded-lg bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
              >
                مقارنة الآن
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters & Players Grid */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all arabic-text ${
                  activeFilter === f
                    ? 'bg-teal-prime text-navy-dark'
                    : 'glass-card text-ice-muted hover:text-ice-white hover:border-teal-prime/30'
                }`}
              >
                {f}
              </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-ice-muted hover:text-ice-white transition-all mr-auto">
              <Filter className="w-4 h-4" />
              <span className="arabic-text">تصفية متقدمة</span>
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-ice-muted text-lg arabic-text mb-4">تعذّر تحميل بيانات اللاعبين</p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && players.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <UserSearch className="w-16 h-16 text-ice-muted mb-4" />
              <p className="text-ice-muted text-lg arabic-text">لا يوجد لاعبون في هذه الفئة</p>
            </div>
          )}

          {/* Grid */}
          {!loading && players.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player, i) => {
                const isInCompare = compareList.includes(player.id)
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                  >
                    <div className={`glass-card glass-card-hover rounded-2xl p-6 group transition-all ${
                      isInCompare ? 'border border-teal-prime/40' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-lg">
                            {(player.name || '؟').charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-ice-white arabic-text">
                              {(player.name || 'غير معروف').split(' ')[0]}
                            </h3>
                            <p className="text-sm text-teal-prime">{player.position || ''}</p>
                          </div>
                        </div>
                        {player.is_verified && (
                          <span className="text-xs text-teal-prime bg-teal-prime/10 px-2 py-0.5 rounded-full arabic-text">
                            موثق
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-ice-white">{player.age || '-'}</div>
                          <div className="text-xs text-ice-muted arabic-text">العمر</div>
                        </div>
                        <div className="text-center bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-ice-white">{player.jersey_number || '-'}</div>
                          <div className="text-xs text-ice-muted arabic-text">القميص</div>
                        </div>
                        <div className="text-center bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-teal-prime">{player.rating || '-'}</div>
                          <div className="text-xs text-ice-muted arabic-text">التقييم</div>
                        </div>
                      </div>

                      {/* CTAs — all functional */}
                      <div className="flex gap-2 pt-4 border-t border-white/5">
                        {/* View — navigates to player profile */}
                        <button
                          onClick={() => handleView(player.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-prime/10 text-teal-prime text-xs font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض
                        </button>

                        {/* Compare — toggles local selection */}
                        <button
                          onClick={() => handleCompare(player.id)}
                          title="مقارنة"
                          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                            isInCompare
                              ? 'bg-teal-prime/20 text-teal-prime'
                              : 'bg-white/5 text-ice-muted hover:text-ice-white hover:bg-white/10'
                          }`}
                        >
                          <GitCompareArrows className="w-4 h-4" />
                        </button>

                        {/* Download — coming soon */}
                        <button
                          onClick={() => toast.info('تقارير PDF قريباً')}
                          title="تنزيل التقرير"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-ice-muted hover:text-ice-white hover:bg-white/10 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Share — copies link to clipboard */}
                        <button
                          onClick={() => handleShare(player.id)}
                          title="مشاركة"
                          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-ice-muted hover:text-ice-white hover:bg-white/10 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && (players.length === pageSize || page > 0) && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card text-ice-muted hover:text-ice-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors arabic-text text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>
              <span className="text-ice-muted text-sm arabic-text">صفحة {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={players.length < pageSize}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card text-ice-muted hover:text-ice-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors arabic-text text-sm"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 bg-navy-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: `${players.length}+`, label: 'لاعب في هذه الصفحة' },
              { value: `${new Set(players.map(p => p.club).filter(Boolean)).size}`, label: 'نادٍ مُمثَّل' },
              { value: `${new Set(players.map(p => p.position).filter(Boolean)).size}`, label: 'مركز مُغطَّى' },
              { value: `${players.filter(p => p.is_verified).length}`, label: 'لاعب موثق' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-gradient-teal mb-1">{stat.value}</div>
                <div className="text-sm text-ice-muted arabic-text">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
