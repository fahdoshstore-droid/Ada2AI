import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users, Calendar, TrendingUp, Target, ClipboardList, PlayCircle, Star } from 'lucide-react';
import { useCoachPlayers } from '../hooks/useCoachPlayers';
import { useMatches } from '../hooks/useMatches';

export default function CoachDashboard() {
  const { players, loading: playersLoading } = useCoachPlayers();
  const { matches, loading: matchesLoading } = useMatches();
  const navigate = useNavigate();

  const loading = playersLoading || matchesLoading;

  // Compute team stats dynamically from matches
  const totalMatches = matches.length;
  const wins = matches.filter(m => (m.home_score ?? 0) > (m.away_score ?? 0)).length;
  const draws = matches.filter(m => (m.home_score ?? 0) === (m.away_score ?? 0)).length;
  const losses = totalMatches - wins - draws;

  const teamStats = [
    { label: 'المباريات', value: String(totalMatches), icon: Calendar, color: 'text-teal-prime' },
    { label: 'الفوز', value: String(wins), icon: Target, color: 'text-gold' },
    { label: 'التعادل', value: String(draws), icon: Users, color: 'text-scout-blue' },
    { label: 'الخسارة', value: String(losses), icon: TrendingUp, color: 'text-red-400' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[128px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-6">
              <Dumbbell className="w-4 h-4" />
              <span className="arabic-text">لوحة المدربين</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-teal arabic-text">إدارة فريقك</span>
              <br />
              <span className="text-ice-white arabic-text">باحترافية عالية</span>
            </h1>
            <p className="text-ice-muted text-lg leading-relaxed max-w-2xl arabic-text">
              أدوات متكاملة لإدارة الفريق، تخطيط التدريبات، تحليل الأداء، 
              واتخاذ قرارات تكتيكية مبنية على البيانات.
            </p>
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
      {!loading && players.length === 0 && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Users className="w-16 h-16 text-ice-muted mb-4" />
          <p className="text-ice-muted text-lg arabic-text">لا توجد بيانات متاحة</p>
        </div>
      )}

      {!loading && (players.length > 0 || matches.length > 0) && (
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {teamStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <span className="text-sm text-ice-muted arabic-text">{stat.label}</span>
                    </div>
                    <div className="text-3xl font-bold text-ice-white">{stat.value}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Matches */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-ice-white flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-teal-prime" />
                      <span className="arabic-text">المباريات الأخيرة</span>
                    </h3>
                    <button className="text-sm text-teal-prime hover:underline arabic-text">عرض الكل</button>
                  </div>
                  {matches.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-ice-muted arabic-text">لا توجد مباريات</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matches.slice(0, 5).map((match, _i) => {
                        const isWin = (match.home_score ?? 0) > (match.away_score ?? 0);
                        const isDraw = (match.home_score ?? 0) === (match.away_score ?? 0);
                        const resultLabel = isWin ? 'فوز' : isDraw ? 'تعادل' : 'خسارة';
                        const score = `${match.home_score ?? 0}-${match.away_score ?? 0}`;
                        return (
                          <div key={match.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${isWin ? 'bg-green-400' : isDraw ? 'bg-gold' : 'bg-red-400'}`} />
                              <span className="text-ice-white font-medium arabic-text">{match.home_team && match.away_team ? `${match.home_team} vs ${match.away_team}` : 'مباراة'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-ice-white font-bold">{score}</span>
                              <span className={`text-xs px-2 py-1 rounded-lg ${
                                isWin ? 'bg-green-400/10 text-green-400' : 
                                isDraw ? 'bg-gold/10 text-gold' : 'bg-red-400/10 text-red-400'
                              } arabic-text`}>
                                {resultLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Players Performance */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-ice-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-teal-prime" />
                      <span className="arabic-text">أداء اللاعبين</span>
                    </h3>
                    <button className="text-sm text-teal-prime hover:underline arabic-text">عرض الكل</button>
                  </div>
                  {players.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-ice-muted arabic-text">لا يوجد لاعبين</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {players.slice(0, 5).map((player, _i) => (
                        <div key={player.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-sm">
                              {(player.name || '؟').charAt(0)}
                            </div>
                            <div>
                              <div className="text-ice-white font-medium text-sm arabic-text">{player.name || 'غير معروف'}</div>
                              <div className="text-ice-muted text-xs">{player.position || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {player.age && (
                              <div className="text-center">
                                <div className="text-xs text-ice-muted arabic-text">العمر</div>
                                <div className="text-ice-white font-bold">{player.age}</div>
                              </div>
                            )}
                            {player.height_cm && (
                              <div className="text-center">
                                <div className="text-xs text-ice-muted arabic-text">الطول</div>
                                <div className="text-ice-white font-bold">{player.height_cm}</div>
                              </div>
                            )}
                            <button
                              onClick={() => navigate(`/coach/evaluate/${player.id}`)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gold/10 text-gold text-xs font-medium hover:bg-gold/20 transition-colors arabic-text"
                            >
                              <Star className="w-3 h-3" />
                              تقييم
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Training Plans CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-8 glass-card rounded-2xl p-8 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <PlayCircle className="w-8 h-8 text-teal-prime" />
              </div>
              <h3 className="text-xl font-bold text-ice-white mb-2 arabic-text">خطط تدريبية مدعومة بالذكاء الاصطناعي</h3>
              <p className="text-ice-muted mb-6 max-w-xl mx-auto arabic-text">
                احصل على خطط تدريبية مخصصة لكل لاعب بناءً على تحليل أدائه ونقاط القوة والضعف
              </p>
              <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold hover:shadow-xl hover:shadow-teal-prime/25 transition-all arabic-text">
                إنشاء خطة تدريبية
              </button>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}