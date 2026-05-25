/**
 * ScoutDashboard — Ada2AI (Elite Cinematic Redesign)
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
    }).catch(() => {
      toast.error('فشل نسخ الرابط')
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
      trackEvent('scout_compare_added', { playerId })
      return [...prev, playerId]
    })
  }

  function handleFilterChange(f: string) {
    trackEvent('scout_filter_used', { filter: f })
    setActiveFilter(f)
    setPage(0) // reset to first page when filter changes
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#060d18]">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero-orb-1" />
        <div className="absolute inset-0 bg-gradient-hero-orb-2" />
        <div className="absolute inset-0 grain-overlay" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-prime/10 border border-teal-prime/20 text-teal-prime text-[11px] font-semibold uppercase tracking-widest mb-6">
              <UserSearch className="w-4 h-4" />
              <span className="arabic-text">لوحة الكشافين</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tightest mb-6">
              <span className="text-gradient-shimmer arabic-text">اكتشف المواهب</span>
              <br />
              <span className="text-ice-white arabic-text">بذكاء اصطناعي متقدم</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Compare bar */}
      {compareList.length > 0 && (
        <div className="sticky top-0 z-10 glass-premium depth-lg border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-ice-muted arabic-text">
              {compareList.length} / 2 لاعبين محددين للمقارنة
            </span>
            {compareList.length === 2 && (
              <button
                onClick={() => navigate(`/compare?ids=${compareList.join(',')}`)}
                className="btn-primary text-sm arabic-text"
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
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 arabic-text ${
                  activeFilter === f
                    ? 'bg-gradient-to-r from-teal-prime to-scout-blue text-[#060d18] shadow-lg shadow-teal-prime/20'
                    : 'glass-card text-ice-muted hover:text-ice-white hover:border-teal-prime/30'
                }`}
              >
                {f}
              </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-ice-muted hover:text-ice-white transition-all mr-auto">
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
              <div className="glass-premium rounded-2xl p-8 text-center depth-md">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-ice-muted text-lg arabic-text mb-4">تعذّر تحميل بيانات اللاعبين</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-ghost text-sm arabic-text"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && players.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="glass-premium rounded-2xl p-8 text-center depth-md">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                  <UserSearch className="w-8 h-8 text-ice-muted" />
                </div>
                <p className="text-ice-muted text-lg arabic-text">لا يوجد لاعبون في هذه الفئة</p>
              </div>
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
                    <div className={`glass-premium rounded-2xl card-depth-hover border border-white/[0.06] p-6 group transition-all duration-300 ${
                      isInCompare ? '!border-teal-prime/40 !shadow-[0_0_24px_rgba(20,184,166,0.12)]' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-prime/20">
                            {(player.name || '؟').charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-ice-white arabic-text font-display tracking-tight">
                              {(player.name || 'غير معروف').split(' ')[0]}
                            </h3>
                            {player.position && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-prime/10 text-teal-prime border border-teal-prime/20 arabic-text">
                                {player.position}
                              </span>
                            )}
                          </div>
                        </div>
                        {player.is_verified && (
                          <span className="status-badge status-badge--teal arabic-text">
                            موثق
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                          <div className="text-lg font-bold text-ice-white">{player.age || '-'}</div>
                          <div className="text-[11px] text-ice-muted/60 arabic-text uppercase tracking-wider">العمر</div>
                        </div>
                        <div className="text-center bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                          <div className="text-lg font-bold text-ice-white">{player.jersey_number || '-'}</div>
                          <div className="text-[11px] text-ice-muted/60 arabic-text uppercase tracking-wider">القميص</div>
                        </div>
                        <div className="text-center bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                          <div className="text-lg font-bold font-display text-gradient-hero">{player.rating || '-'}</div>
                          <div className="text-[11px] text-ice-muted/60 arabic-text uppercase tracking-wider">التقييم</div>
                        </div>
                      </div>

                      {/* CTAs — all functional */}
                      <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
                        {/* View — navigates to player profile */}
                        <button
                          onClick={() => handleView(player.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-prime/10 to-scout-blue/10 text-teal-prime text-xs font-semibold hover:from-teal-prime/20 hover:to-scout-blue/20 transition-all duration-200 arabic-text"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          عرض
                        </button>

                        {/* Compare — toggles local selection */}
                        <button
                          onClick={() => handleCompare(player.id)}
                          title="مقارنة"
                          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                            isInCompare
                              ? 'bg-teal-prime/20 text-teal-prime shadow-md shadow-teal-prime/10'
                              : 'bg-white/[0.03] text-ice-muted hover:text-ice-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <GitCompareArrows className="w-4 h-4" />
                        </button>

                        {/* Download — coming soon */}
                        <button
                          onClick={() => toast.info('تقارير PDF قريباً')}
                          title="تنزيل التقرير"
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] text-ice-muted hover:text-ice-white hover:bg-white/[0.06] transition-all duration-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Share — copies link to clipboard */}
                        <button
                          onClick={() => handleShare(player.id)}
                          title="مشاركة"
                          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] text-ice-muted hover:text-ice-white hover:bg-white/[0.06] transition-all duration-200"
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
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-premium text-ice-muted hover:text-ice-white disabled:opacity-30 disabled:cursor-not-allowed transition-all arabic-text text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>
              <span className="text-ice-muted text-sm font-medium arabic-text">صفحة {page + 1}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={players.length < pageSize}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-premium text-ice-muted hover:text-ice-white disabled:opacity-30 disabled:cursor-not-allowed transition-all arabic-text text-sm"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16">
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
                className="glass-premium rounded-2xl p-6 text-center card-depth-hover"
              >
                <div className="text-2xl md:text-3xl font-bold font-display text-gradient-teal mb-1 tracking-tight">{stat.value}</div>
                <div className="text-sm text-ice-muted arabic-text">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}