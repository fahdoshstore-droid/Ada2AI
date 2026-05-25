import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart3, Activity, Zap, Target, TrendingUp, User } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useEvaluations } from '../hooks/useEvaluations';

export default function PlayerAnalysis() {
  const [searchQuery, setSearchQuery] = useState('');
  const { players, loading: playersLoading } = usePlayers();
  const { evaluations, loading: evaluationsLoading } = useEvaluations();

  const loading = playersLoading || evaluationsLoading;

  // Filter players by search
  const filteredPlayers = players.filter(p =>
    !searchQuery ||
    (p.name || '').includes(searchQuery) ||
    (p.position || '').includes(searchQuery)
  );

  // Get latest evaluation for a player
  const getLatestEvaluation = (playerId: string) => {
    return evaluations.find(e => e.player_id === playerId);
  };

  // Map evaluation to skill bars
  const getSkills = (playerId: string) => {
    const eval_ = getLatestEvaluation(playerId);
    if (!eval_) return null;
    return [
      { name: 'تقني', value: eval_.technical },
      { name: 'تكتيكي', value: eval_.tactical },
      { name: 'بدني', value: eval_.physical },
      { name: 'ذهني', value: eval_.mental },
    ];
  };

  // Find selected player (first filtered, or by search)
  const selectedPlayer = filteredPlayers.length > 0 ? filteredPlayers[0] : null;
  const selectedSkills = selectedPlayer ? getSkills(selectedPlayer.id) : null;
  const selectedEval = selectedPlayer ? getLatestEvaluation(selectedPlayer.id) : null;

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
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-prime/10 border border-teal-prime/20 text-teal-prime text-[11px] font-semibold uppercase tracking-widest mb-6">
              <Activity className="w-4 h-4" />
              <span className="arabic-text">تحليل اللاعب</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tightest mb-6">
              <span className="text-gradient-shimmer arabic-text">تحليل شامل للاعب</span>
            </h1>
            <p className="text-ice-muted text-lg max-w-2xl mx-auto mb-10 arabic-text">
              أدخل اسم اللاعب أو رقم الهوية للحصول على تحليل مفصل وشامل لأدائه
            </p>
            
            {/* Search Bar — HUGE and prominent */}
            <div className="max-w-xl mx-auto relative">
              <div className="glass-premium rounded-2xl p-3 flex items-center gap-3 depth-lg">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن لاعب..."
                  className="flex-1 bg-transparent text-ice-white text-lg placeholder:text-ice-muted/60 outline-none py-2 arabic-text font-display tracking-tight"
                />
                <button className="btn-primary px-6 py-3 text-sm font-bold arabic-text">
                  تحليل
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && players.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="glass-premium rounded-2xl p-10 text-center depth-md">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-ice-muted" />
            </div>
            <p className="text-ice-muted text-lg arabic-text">لا يوجد لاعبين في قاعدة البيانات</p>
          </div>
        </div>
      )}

      {!loading && !selectedPlayer && players.length > 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="glass-premium rounded-2xl p-10 text-center depth-md">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-ice-muted" />
            </div>
            <p className="text-ice-muted text-lg arabic-text">لا توجد نتائج مطابقة للبحث</p>
          </div>
        </div>
      )}

      {/* Player Profile */}
      {!loading && selectedPlayer && (
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Player Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-premium rounded-2xl p-6 text-center glow-teal border border-white/[0.06]">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-teal-prime/20">
                    <User className="w-14 h-14" />
                  </div>
                  <h2 className="text-2xl font-bold text-ice-white mb-1 arabic-text font-display tracking-tight">{selectedPlayer.name || 'غير معروف'}</h2>
                  <p className="text-teal-prime mb-4 font-medium">{selectedPlayer.position || '-'}</p>
                  
                  {selectedEval && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-4xl font-bold font-display text-gradient-hero tracking-tight">{selectedEval.overall}</span>
                      <span className="text-sm text-ice-muted arabic-text">تقييم عام</span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'العمر', value: selectedPlayer.age || '-' },
                      { label: 'الطول', value: selectedPlayer.height_cm ? `${selectedPlayer.height_cm}cm` : '-' },
                      { label: 'الوزن', value: selectedPlayer.weight_kg ? `${selectedPlayer.weight_kg}kg` : '-' },
                      { label: 'القدم', value: selectedPlayer.dominant_foot === 'right' ? 'يمنى' : selectedPlayer.dominant_foot === 'left' ? 'يسرى' : '-' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.04]">
                        <div className="text-lg font-bold text-ice-white">{stat.value}</div>
                        <div className="text-[11px] text-ice-muted/60 arabic-text uppercase tracking-wider">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Skills Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-2"
              >
                <div className="glass-premium rounded-2xl p-6 border border-white/[0.06]">
                  <h3 className="text-lg font-bold text-ice-white mb-6 flex items-center gap-2 arabic-text font-display tracking-tight">
                    <BarChart3 className="w-5 h-5 text-teal-prime" />
                    تحليل المهارات
                  </h3>
                  
                  {selectedSkills ? (
                    <div className="space-y-4">
                      {selectedSkills.map((skill) => (
                        <div key={skill.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-ice-muted arabic-text">{skill.name}</span>
                            <span className="text-sm font-bold text-gradient-teal">{skill.value}</span>
                          </div>
                          <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.04]">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.value}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-teal-prime to-teal-glow rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-ice-muted arabic-text">لا يوجد تقييم متاح لهذا اللاعب</p>
                    </div>
                  )}
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[
                    { icon: Target, label: 'تقني', value: selectedEval?.technical ?? '-' },
                    { icon: Zap, label: 'تكتيكي', value: selectedEval?.tactical ?? '-' },
                    { icon: TrendingUp, label: 'بدني', value: selectedEval?.physical ?? '-' },
                    { icon: Activity, label: 'ذهني', value: selectedEval?.mental ?? '-' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-premium rounded-xl p-4 text-center card-depth-hover border border-white/[0.06]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-prime/10 to-scout-blue/10 flex items-center justify-center mx-auto mb-2 border border-teal-prime/10">
                          <Icon className="w-5 h-5 text-teal-prime" />
                        </div>
                        <div className="text-xl font-bold font-display text-gradient-teal tracking-tight">{stat.value}</div>
                        <div className="text-[11px] text-ice-muted/60 arabic-text uppercase tracking-wider">{stat.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Performance Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-8 glass-premium rounded-2xl p-6 border border-white/[0.06]"
            >
              <h3 className="text-lg font-bold text-ice-white mb-6 flex items-center gap-2 arabic-text font-display tracking-tight">
                <TrendingUp className="w-5 h-5 text-teal-prime" />
                تطور الأداء عبر الزمن
              </h3>
              {evaluations.filter(e => e.player_id === selectedPlayer.id).length > 0 ? (
                <div className="relative h-48 flex items-end gap-2">
                  {/* Background grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[25, 50, 75, 100].map(v => (
                      <div key={v} className="border-t border-white/[0.04] relative">
                        <span className="absolute -right-1 -top-2.5 text-[10px] text-ice-muted/30">{v}</span>
                      </div>
                    ))}
                  </div>
                  {evaluations
                    .filter(e => e.player_id === selectedPlayer.id)
                    .slice(0, 12)
                    .map((ev, i) => (
                      <div key={ev.id} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-teal-prime/50 to-teal-prime rounded-t-lg transition-all hover:from-scout-blue/50 hover:to-scout-blue" 
                             style={{ height: `${ev.overall * 1.8}px` }} />
                        <span className="text-[10px] text-ice-muted/60">{ev.evaluation_date ? new Date(ev.evaluation_date).getMonth() + 1 : i + 1}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-ice-muted arabic-text">لا توجد بيانات أداء كافية</p>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}