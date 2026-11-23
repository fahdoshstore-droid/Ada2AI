import { useState } from 'react';
import PageHeader from '../components/cinema/PageHeader';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Award, Crown } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { useEvaluations } from '../hooks/useEvaluations';

const categories = [
  { label: 'الأفضل', key: 'all' },
  { label: 'الهدافين', key: 'goals' },
  { label: 'صناع اللعب', key: 'assists' },
  { label: 'الحرس', key: 'goalkeeper' },
  { label: 'المدافعين', key: 'defender' },
];

export default function Rankings() {
  const { players, loading: loadingPlayers } = usePlayers();
  const { evaluations, loading: loadingEvaluations } = useEvaluations();
  const loading = loadingPlayers || loadingEvaluations;
  const [activeCategory, setActiveCategory] = useState('all');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-teal-prime" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-scout-blue" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm text-ice-muted font-bold font-display">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'from-teal-prime/20 to-teal-prime/5 border-teal-prime/30';
    if (rank === 2) return 'from-gray-300/10 to-gray-300/5 border-gray-300/20';
    if (rank === 3) return 'from-scout-blue/10 to-scout-blue/5 border-scout-blue/20';
    return 'border-white/5';
  };

  // The ranking uses what users enter: each player's latest coach evaluation
  // (evaluations are newest-first). The stored players.rating is a column
  // default (60) or hand-typed with nothing behind it, so it is not used.
  const latestOverall = new Map<string, number>();
  for (const e of evaluations) {
    if (!latestOverall.has(e.player_id) && typeof e.overall === 'number') latestOverall.set(e.player_id, e.overall);
  }
  const unratedCount = players.filter(p => !latestOverall.has(p.id)).length;

  const rankedPlayers = players
    .filter((p) => latestOverall.has(p.id))
    .map((p) => ({
      id: p.id,
      rank: 0,
      name: p.name || 'لاعب',
      club: p.club || '—',
      position: p.position || '—',
      rating: latestOverall.get(p.id) ?? 0,
      goals: p.goals || 0,
      assists: p.assists || 0,
    }))
    .sort((a, b) => b.rating - a.rating)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  // Filter and sort players based on active category
  const filteredPlayers = (() => {
    if (activeCategory === 'all') return rankedPlayers;
    if (activeCategory === 'goals') {
      return rankedPlayers
        .filter(p => p.goals > 0)
        .sort((a, b) => b.goals - a.goals)
        .map((p, i) => ({ ...p, rank: i + 1 }));
    }
    if (activeCategory === 'assists') {
      return rankedPlayers
        .filter(p => p.assists > 0)
        .sort((a, b) => b.assists - a.assists)
        .map((p, i) => ({ ...p, rank: i + 1 }));
    }
    if (activeCategory === 'goalkeeper') {
      return rankedPlayers
        .filter(p => /حارس|goalkeeper/i.test(p.position))
        .map((p, i) => ({ ...p, rank: i + 1 }));
    }
    if (activeCategory === 'defender') {
      return rankedPlayers
        .filter(p => /مدافع|defender/i.test(p.position))
        .map((p, i) => ({ ...p, rank: i + 1 }));
    }
    return rankedPlayers;
  })();

  const topPlayers = filteredPlayers;

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="ترتيب المواهب"
        icon={Trophy}
        titleTop="ترتيب أفضل المواهب"
        description="تصنيف شامل للاعبين بناءً على تحليل الأداء والإحصائيات المحدثة باستمرار"
        align="center"
      />

      {/* Rankings */}
      <section className="relative py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all arabic-text ${
                  activeCategory === cat.key
                    ? 'bg-teal-prime text-navy-dark'
                    : 'glass-card text-ice-muted hover:text-ice-white hover:border-teal-prime/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {unratedCount > 0 && topPlayers.length > 0 && (
            <p className="mb-6 text-center text-xs text-ice-muted arabic-text">
              {unratedCount} لاعبين لم يُقيَّموا بعد ولا يظهرون في الترتيب.
            </p>
          )}
          {topPlayers.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-ice-muted mx-auto mb-4" />
              <p className="text-ice-muted arabic-text text-lg">
                {activeCategory === 'all' ? 'لا يوجد لاعبون مُقيَّمون بعد' : 'لا يوجد لاعبون في هذه الفئة بعد'}
              </p>
              <p className="text-ice-muted/60 arabic-text text-sm">
                {activeCategory === 'all'
                  ? 'يُبنى الترتيب من تقييمات المدربين. يظهر اللاعب هنا بعد أول تقييم له.'
                  : 'تظهر الفئة حين تُسجَّل أهداف أو صناعة أهداف أو مراكز للاعبين المُقيَّمين.'}
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topPlayers.length >= 3 && (
                <div className="flex items-end justify-center gap-4 mb-12">
                  {[topPlayers[1], topPlayers[0], topPlayers[2]].map((player, i) => {
                    const heights = ['h-48', 'h-64', 'h-52'];
                    const positions = [2, 1, 3];
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-xl mb-3 ${i === 1 ? 'ring-4 ring-teal-prime/30' : ''}`}>
                          {player.name.charAt(0)}
                        </div>
                        <div className="text-center mb-3">
                          <div className="text-ice-white font-bold text-sm arabic-text">{player.name}</div>
                          <div className="text-teal-prime text-xs font-display">{player.rating || '—'}</div>
                        </div>
                        <div className={`w-24 ${heights[i]} rounded-t-xl bg-gradient-to-t from-navy-light to-navy-light/50 border border-teal-prime/20 flex items-center justify-center`}>
                          <span className="text-2xl font-bold font-display text-gradient-teal">{positions[i]}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Full List */}
              <div className="space-y-2">
                {topPlayers.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className={`glass-card rounded-xl p-4 flex items-center gap-4 hover:border-teal-prime/30 transition-all ${getRankBg(player.rank)}`}>
                      <div className="w-8 flex items-center justify-center">
                        {getRankIcon(player.rank)}
                      </div>
                      
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {player.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-ice-white text-sm arabic-text">{player.name}</div>
                        <div className="text-xs text-ice-muted">{player.club} - {player.position}</div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-teal-prime/10 px-3 py-1.5 rounded-lg">
                        <Star className="w-4 h-4 text-teal-prime fill-teal-prime" />
                        <span className="text-teal-prime font-bold font-display">{player.rating || '—'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}