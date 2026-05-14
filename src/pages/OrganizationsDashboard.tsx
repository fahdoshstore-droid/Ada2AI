import { motion } from 'framer-motion';
import { Users, TrendingUp, Building2, Shield, MapPin, Star, ExternalLink } from 'lucide-react';
import { useOrganizations } from '../hooks/useOrganizations';

export default function OrganizationsDashboard() {
  const { organizations, loading, error } = useOrganizations();

  // Compute dynamic stats from real organization data
  const totalOrgs = organizations.length;
  const totalPlayers = organizations.reduce((sum, o) => sum + (o.players_count || 0), 0);
  const verifiedOrgs = organizations.filter(o => o.is_verified).length;
  const stats = [
    { label: 'المنشآت', value: String(totalOrgs), icon: Building2 },
    { label: 'اللاعبين', value: String(totalPlayers), icon: Users },
    { label: 'موثق', value: String(verifiedOrgs), icon: Shield },
    { label: 'متوسط التقييم', value: totalOrgs ? (organizations.reduce((s, o) => s + (o.rating || 0), 0) / totalOrgs).toFixed(1) : '0', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-ice-white arabic-text text-lg">خطأ في تحميل المنشآت</p>
          <p className="text-ice-muted/60 arabic-text text-sm mt-2">{error}</p>
        </div>
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
          {organizations.length === 0 ? (
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
                {organizations.map((org, i) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center text-white font-bold">
                      {org.name?.charAt(0) || 'م'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ice-white arabic-text truncate">
                        {org.name || 'منشأة'}
                        {org.is_verified && <Shield className="w-4 h-4 text-teal-prime inline mr-2" />}
                      </div>
                      <div className="text-sm text-ice-muted arabic-text flex items-center gap-2">
                        {org.type && <span>{org.type}</span>}
                        {org.city && <>
                          <MapPin className="w-3 h-3" />
                          <span>{org.city}</span>
                        </>}
                        {org.rating && <>
                          <Star className="w-3 h-3" />
                          <span>{org.rating.toFixed(1)}</span>
                        </>}
                      </div>
                    </div>
                    <div className="text-left ml-4">
                      <div className="text-sm text-ice-muted arabic-text">
                        <Users className="w-4 h-4 inline ml-1" />
                        {org.players_count || 0} لاعب
                      </div>
                    </div>
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-ice-muted hover:text-teal-prime transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
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