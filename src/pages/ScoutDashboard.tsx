import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserSearch, Filter, Eye, Download, Share2, GitCompareArrows } from 'lucide-react';
import { useScoutPlayers } from '../hooks/useScoutPlayers';

const filters = ['الكل', 'مهاجم', 'وسط', 'مدافع', 'حارس', 'جناح'];

export default function ScoutDashboard() {
  const [activeFilter, setActiveFilter] = useState('الكل');
  const { players, loading } = useScoutPlayers(
    activeFilter !== 'الكل' ? activeFilter : undefined
  );

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
            <p className="text-ice-muted text-lg leading-relaxed max-w-2xl arabic-text">
              منصة متكاملة للكشافين تتيح البحث المتقدم، المقارنة، وتتبع اللاعبين 
              مع تقارير تفصيلية مدعومة بالذكاء الاصطناعي.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Players Grid */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {filters.map((f, _i) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all arabic-text ${
                  activeFilter === f
                    ? 'bg-teal-prime text-navy-dark'
                    : 'glass-card text-ice-muted hover:text-ice-white hover:border-teal-prime/30'
                }`}
              >
                {f}
              </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-ice-muted hover:text-ice-white transition-all ml-auto">
              <Filter className="w-4 h-4" />
              <span className="arabic-text">تصفية متقدمة</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && players.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <UserSearch className="w-16 h-16 text-ice-muted mb-4" />
              <p className="text-ice-muted text-lg arabic-text">لا يوجد لاعبين متاحين</p>
            </div>
          )}

          {/* Players Grid */}
          {!loading && players.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player, i) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="glass-card glass-card-hover rounded-2xl p-6 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-lg">
                          {(player.profile?.full_name || '؟').charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-white arabic-text">{player.profile?.full_name || 'غير معروف'}</h3>
                          <p className="text-sm text-teal-prime">{player.position || ''} - {player.profile?.region || ''}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center bg-white/5 rounded-lg p-2">
                        <div className="text-lg font-bold text-ice-white">{player.age || '-'}</div>
                        <div className="text-xs text-ice-muted arabic-text">العمر</div>
                      </div>
                      <div className="text-center bg-white/5 rounded-lg p-2">
                        <div className="text-lg font-bold text-ice-white">{player.jersey_number || '-'}</div>
                        <div className="text-xs text-ice-muted arabic-text">رقم القميص</div>
                      </div>
                      <div className="text-center bg-white/5 rounded-lg p-2">
                        <div className="text-lg font-bold text-teal-prime">{player.position || '-'}</div>
                        <div className="text-xs text-ice-muted arabic-text">المركز</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-white/5">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-prime/10 text-teal-prime text-xs font-medium hover:bg-teal-prime/20 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="arabic-text">عرض</span>
                      </button>
                      <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-ice-muted hover:text-ice-white hover:bg-white/10 transition-colors">
                        <GitCompareArrows className="w-4 h-4" />
                      </button>
                      <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-ice-muted hover:text-ice-white hover:bg-white/10 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 text-ice-muted hover:text-ice-white hover:bg-white/10 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-navy-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: `${players.length}+`, label: 'لاعب في قاعدة البيانات' },
              { value: '350+', label: 'كشاف مسجل' },
              { value: '2,100+', label: 'تقرير تحليلي' },
              { value: '98%', label: 'نسبة الرضا' },
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
  );
}