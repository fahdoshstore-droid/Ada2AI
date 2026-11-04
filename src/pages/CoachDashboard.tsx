import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Users, Calendar, TrendingUp, Target, ClipboardList, PlayCircle, Star, AlertCircle, Briefcase, Settings } from 'lucide-react';
import { useCoachPlayers } from '../hooks/useCoachPlayers';
import { useMatches } from '../hooks/useMatches';
import { useAuth, isAdmin } from '../contexts/AuthContext';
import { EASE, GhostNumber, Letterbox, SideReveal, SplitReveal, Stagger, StaggerItem } from '../components/cinema/Cinema';
import coachTouchline from '../assets/cinema/coach-touchline.jpg';

export default function CoachDashboard() {
  const { players, loading: playersLoading, error: playersError } = useCoachPlayers();
  const { matches, loading: matchesLoading, error: matchesError } = useMatches();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { profile } = useAuth();
  const showAdmin = isAdmin(profile);

  const loading = playersLoading || matchesLoading;

  // Compute team stats dynamically from matches
  const totalMatches = matches.length;
  const wins = matches.filter(m => (m.home_score ?? 0) > (m.away_score ?? 0)).length;
  const draws = matches.filter(m => (m.home_score ?? 0) === (m.away_score ?? 0)).length;
  const losses = totalMatches - wins - draws;

  const teamStats = [
    { label: 'المباريات', value: String(totalMatches), icon: Calendar, color: 'text-teal-prime' },
    { label: 'الفوز', value: String(wins), icon: Target, color: 'text-teal-prime' },
    { label: 'التعادل', value: String(draws), icon: Users, color: 'text-scout-blue' },
    { label: 'الخسارة', value: String(losses), icon: TrendingUp, color: 'text-red-400' },
  ];

  return (
    <div className="bg-[#000A0F]">
      {/* Hero — cinematic touchline frame */}
      <section className="relative flex min-h-[64svh] items-end overflow-hidden" aria-label="لوحة المدربين">
        <motion.img
          src={coachTouchline}
          alt=""
          decoding="async"
          initial={reduced ? false : { scale: 1.14 }}
          animate={{ scale: 1 }}
          transition={{ duration: 18, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-cover object-[18%_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000A0F] via-[#000A0F]/40 to-[#000A0F]/65" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#000A0F]/90 via-[#000A0F]/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(45%_45%_at_85%_25%,rgba(0,220,200,0.14),transparent_70%)]" aria-hidden="true" />
        <div className="grain-overlay" />
        <Letterbox height="5svh" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-[11svh] pt-36 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-teal-prime">
            <span className="h-px w-10 bg-teal-prime" />
            <Dumbbell className="h-4 w-4" />
            <span className="arabic-text">لوحة المدربين</span>
          </div>
          <h1 className="text-5xl font-black leading-[1.22] tracking-tightest md:text-7xl lg:text-8xl">
            <SplitReveal text="إدارة فريقك" immediate delay={0.3} className="block text-teal-prime arabic-text" />
            <SplitReveal text="باحترافية عالية" immediate delay={0.55} className="block text-ice-white arabic-text" />
          </h1>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1 }}
          >
            <div className="mb-5 mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/coach/workspace')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue px-6 py-3 text-sm font-bold text-navy-dark transition-all hover:shadow-xl hover:shadow-teal-prime/25 arabic-text"
              >
                <Briefcase className="h-4 w-4" />
                مساحة العمل
              </button>
              {showAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="glass-card flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-ice-muted transition-colors hover:text-ice-white arabic-text"
                >
                  <Settings className="h-4 w-4" />
                  لوحة الإدارة
                </button>
              )}
            </div>
            <p className="max-w-2xl text-lg leading-relaxed text-ice-white/75 arabic-text">
              أدوات متكاملة لإدارة الفريق، تخطيط التدريبات، تحليل الأداء،
              واتخاذ قرارات تكتيكية مبنية على البيانات.
            </p>
          </motion.div>
        </div>
        <span className="absolute bottom-[1.2svh] start-4 z-30 text-[10px] text-ice-muted/70 arabic-text sm:start-6 lg:start-8">صورة مولّدة بالذكاء الاصطناعي</span>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-prime border-t-transparent" />
        </div>
      )}

      {/* Error State */}
      {(playersError || matchesError) && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
          <p className="mb-4 text-lg text-ice-muted arabic-text">تعذّر تحميل البيانات</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-teal-prime/10 px-5 py-2.5 text-sm font-medium text-teal-prime transition-colors hover:bg-teal-prime/20 arabic-text"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !playersError && !matchesError && players.length === 0 && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Users className="mb-4 h-16 w-16 text-ice-muted" />
          <p className="text-lg text-ice-muted arabic-text">لا توجد بيانات متاحة</p>
        </div>
      )}

      {!loading && (players.length > 0 || matches.length > 0) && (
        <section className="relative overflow-hidden py-16 md:py-24">
          <GhostNumber n="01" className="-top-4 start-[-2%]" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Oversized stats */}
            <Stagger gap={0.1} className="mb-16 grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:mb-24 md:grid-cols-4">
              {teamStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <StaggerItem key={stat.label} y={20} className="bg-[#000A0F] p-5 md:p-7">
                    <div className="mb-3 flex items-center gap-2 text-sm text-ice-muted">
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                      <span className="arabic-text">{stat.label}</span>
                    </div>
                    <div className="font-display text-6xl font-black leading-none text-ice-white md:text-7xl">{stat.value}</div>
                  </StaggerItem>
                );
              })}
            </Stagger>

            {/* Two Column Layout — panels slide in from opposite sides */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Recent Matches */}
              <SideReveal from="start">
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-ice-white">
                      <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">01</span>
                      <ClipboardList className="h-5 w-5 text-teal-prime" />
                      <span className="arabic-text">المباريات الأخيرة</span>
                    </h3>
                    <button className="text-sm text-teal-prime hover:underline arabic-text">عرض الكل</button>
                  </div>
                  {matches.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-ice-muted arabic-text">لا توجد مباريات</p>
                    </div>
                  ) : (
                    <Stagger gap={0.08} delay={0.25} className="space-y-3">
                      {matches.slice(0, 5).map((match) => {
                        const isWin = (match.home_score ?? 0) > (match.away_score ?? 0);
                        const isDraw = (match.home_score ?? 0) === (match.away_score ?? 0);
                        const resultLabel = isWin ? 'فوز' : isDraw ? 'تعادل' : 'خسارة';
                        const score = `${match.home_score ?? 0}-${match.away_score ?? 0}`;
                        return (
                          <StaggerItem key={match.id} x={24} y={0} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${isWin ? 'bg-teal-prime' : isDraw ? 'bg-scout-blue' : 'bg-red-400'}`} />
                              <span className="font-medium text-ice-white arabic-text">{match.home_team && match.away_team ? `${match.home_team} vs ${match.away_team}` : 'مباراة'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-display font-bold text-ice-white">{score}</span>
                              <span className={`rounded-lg px-2 py-1 text-xs ${
                                isWin ? 'bg-teal-prime/10 text-teal-prime' :
                                isDraw ? 'bg-scout-blue/10 text-scout-blue' : 'bg-red-400/10 text-red-400'
                              } arabic-text`}>
                                {resultLabel}
                              </span>
                            </div>
                          </StaggerItem>
                        );
                      })}
                    </Stagger>
                  )}
                </div>
              </SideReveal>

              {/* Players Performance */}
              <SideReveal from="end" delay={0.1}>
                <div className="glass-card rounded-2xl p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="flex items-center gap-3 text-lg font-bold text-ice-white">
                      <span className="font-display text-2xl font-black text-teal-prime/80" aria-hidden="true">02</span>
                      <Users className="h-5 w-5 text-teal-prime" />
                      <span className="arabic-text">أداء اللاعبين</span>
                    </h3>
                    <button className="text-sm text-teal-prime hover:underline arabic-text">عرض الكل</button>
                  </div>
                  {players.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-ice-muted arabic-text">لا يوجد لاعبين</p>
                    </div>
                  ) : (
                    <Stagger gap={0.08} delay={0.3} className="space-y-3">
                      {players.slice(0, 5).map((player) => (
                        <StaggerItem key={player.id} x={-24} y={0} className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-prime to-scout-blue text-sm font-bold text-white">
                              {(player.name || '؟').charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-ice-white arabic-text">{player.name || 'غير معروف'}</div>
                              <div className="text-xs text-ice-muted">{player.position || '-'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {player.age && (
                              <div className="text-center">
                                <div className="text-xs text-ice-muted arabic-text">العمر</div>
                                <div className="font-display font-bold text-ice-white">{player.age}</div>
                              </div>
                            )}
                            {player.height_cm && (
                              <div className="text-center">
                                <div className="text-xs text-ice-muted arabic-text">الطول</div>
                                <div className="font-display font-bold text-ice-white">{player.height_cm}</div>
                              </div>
                            )}
                            <button
                              onClick={() => navigate(`/coach/evaluate/${player.id}`)}
                              className="flex items-center gap-1 rounded-lg bg-teal-prime/10 px-2.5 py-1.5 text-xs font-medium text-teal-prime transition-colors hover:bg-teal-prime/20 arabic-text"
                            >
                              <Star className="h-3 w-3" />
                              تقييم
                            </button>
                          </div>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </div>
              </SideReveal>
            </div>

            {/* Training Plans CTA */}
            <SideReveal from="start" delay={0.05} className="mt-8">
              <div className="relative overflow-hidden rounded-2xl border border-teal-prime/20 bg-gradient-to-l from-teal-prime/10 via-transparent to-transparent p-8 text-center">
                <div className="mb-4 flex items-center justify-center gap-3">
                  <PlayCircle className="h-8 w-8 text-teal-prime" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-ice-white arabic-text">خطط تدريبية مدعومة بالذكاء الاصطناعي</h3>
                <p className="mx-auto mb-6 max-w-xl text-ice-muted arabic-text">
                  احصل على خطط تدريبية مخصصة لكل لاعب بناءً على تحليل أدائه ونقاط القوة والضعف
                </p>
                <button className="rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue px-8 py-3 font-bold text-navy-dark transition-all hover:shadow-xl hover:shadow-teal-prime/25 arabic-text">
                  إنشاء خطة تدريبية
                </button>
              </div>
            </SideReveal>
          </div>
        </section>
      )}
    </div>
  );
}
