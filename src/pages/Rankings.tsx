import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Medal, Award, Crown } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';

const categories = [
  { label: 'الأفضل', key: 'all' },
  { label: 'الهدافين', key: 'goals' },
  { label: 'صناع اللعب', key: 'assists' },
  { label: 'الحرس', key: 'goalkeeper' },
  { label: 'المدافعين', key: 'defender' },
];

export default function Rankings() {
  const { players, loading } = usePlayers();
  const [activeCategory, setActiveCategory] = useState('all');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm text-ice-muted font-bold font-display">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'from-gold/20 to-gold/5 border-gold/30';
    if (rank === 2) return 'from-gray-300/10 to-gray-300/5 border-gray-300/20';
    if (rank === 3) return 'from-amber-600/10 to-amber-600/5 border-amber-600/20';
    return 'border-white/5';
  };

  // Map Supabase players to ranking data — sort by real rating from DB
  const rankedPlayers = players
    .map((p) => ({
      id: p.id,
      rank: 0,
      name: p.name || 'لاعب',
      club: p.club || '—',
      position: p.position || '—',
      rating: p.rating || 0,
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
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-gold/10 rounded-full blur-[128px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-6">
              <Trophy className="w-4 h-4" />
              <span className="arabic-text">ترتيب المواهب</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6">
              <span className="text-gradient-teal arabic-text">ترتيب أفضل المواهب</span>
            </h1>
            <p className="text-ice-muted text-lg max-w-2xl mx-auto arabic-text">
              تصنيف شامل للاعبين بناءً على تحليل الأداء والإحصائيات المحدثة باستمرار
            </p>
          </motion.div>
        </div>
      </section>

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

          {topPlayers.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-ice-muted mx-auto mb-4" />
              <p className="text-ice-muted arabic-text text-lg">لا يوجد لاعبين بعد</p>
              <p className="text-ice-muted/60 arabic-text text-sm">سيظهر الترتيب عند تسجيل اللاعبين</p>
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
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold text-xl mb-3 ${i === 1 ? 'ring-4 ring-gold/30' : ''}`}>
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
                        <Star className="w-4 h-4 text-gold fill-gold" />
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