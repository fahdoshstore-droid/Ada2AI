import { motion } from 'framer-motion';
import { Users, TrendingUp, Building2, Shield, FileBarChart } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';

export default function OrganizationsDashboard() {
  const { players, loading } = usePlayers();

  // Compute dynamic stats from real data
  const totalPlayers = players.length;
  const stats = [
    { label: 'المنشآت', value: '—', icon: Building2 },
    { label: 'اللاعبين', value: String(totalPlayers || '0'), icon: Users },
    { label: 'التقارير', value: '—', icon: FileBarChart },
    { label: 'النمو', value: '+0%', icon: TrendingUp },
  ];

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
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-teal-prime/10 rounded-full blur-[128px]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-prime/10 border border-teal-prime/20 text-teal-prime text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              <span className="arabic-text">لوحة المنشآت</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-teal arabic-text">إدارة المنشآت الرياضية</span>
            </h1>
            <p className="text-ice-muted text-lg max-w-2xl arabic-text">
              عرض شامل للأندية والأكاديميات الرياضية المسجلة في المنصة
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-teal-prime mx-auto mb-3" />
                <div className="text-2xl font-bold text-ice-white arabic-text">{stat.value}</div>
                <div className="text-sm text-ice-muted arabic-text">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Organizations List */}
          {players.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-ice-muted mx-auto mb-4" />
              <p className="text-ice-muted arabic-text text-lg">لا توجد منشآت بعد</p>
              <p className="text-ice-muted/60 arabic-text text-sm">ستظهر المنشآت عند تسجيل الأندية والأكاديميات</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-ice-white arabic-text">المنشآت المسجلة</h2>
              </div>
              <div className="divide-y divide-white/5">
                {players.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold">
                      {(player.profile?.full_name || 'م').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-ice-white arabic-text">
                        {player.profile?.full_name || 'لاعب'}
                      </div>
                      <div className="text-sm text-ice-muted arabic-text">
                        {player.position || '—'} • {player.profile?.region || '—'}
                      </div>
                    </div>
                    <Shield className="w-5 h-5 text-teal-prime" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}