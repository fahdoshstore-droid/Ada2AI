import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockFacility } from '@/lib/passport/mock-data';
import { useLang, LanguageProvider } from '@/lib/passport/LanguageContext';
import { t } from '@/lib/passport/i18n';
import NavBar from '@/components/passport/NavBar';

const f = mockFacility;
const hourlyData = [
  { hour: '6am', checkins: 8 }, { hour: '8am', checkins: 23 }, { hour: '10am', checkins: 31 },
  { hour: '12pm', checkins: 18 }, { hour: '2pm', checkins: 14 }, { hour: '4pm', checkins: 38 },
  { hour: '6pm', checkins: 52 }, { hour: '8pm', checkins: 29 }, { hour: '10pm', checkins: 7 },
];
const weeklyRevenue = [
  { day: 'Mon', revenue: 68000 }, { day: 'Tue', revenue: 72000 }, { day: 'Wed', revenue: 81000 },
  { day: 'Thu', revenue: 79000 }, { day: 'Fri', revenue: 95000 }, { day: 'Sat', revenue: 88000 }, { day: 'Sun', revenue: 45000 },
];

function FacilityAnalyticsInner() {
  const { lang } = useLang();
  const sportDistribution = f.checkins.reduce<Record<string, number>>((acc, c) => { acc[c.sport] = (acc[c.sport] || 0) + 1; return acc; }, {});
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">{t('facilityAnalytics', lang)}</h1>
        <p className="text-white/40 text-sm mt-1">{f.name} · {lang === 'ar' ? 'رؤى تشغيلية فورية' : 'Real-time operational insights'}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('todayRevenue', lang), value: 'SAR 88K', color: 'text-yellow-400' },
          { label: t('monthlyRevenue', lang), value: `SAR ${(f.monthlyRevenue / 1000).toFixed(0)}K`, color: 'text-green-400' },
          { label: t('capacityUsed', lang), value: '74%', color: 'text-blue-400' },
          { label: t('avgSession', lang), value: '87 min', color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="sport-card p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="sport-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">{t('checkinsByHour', lang)}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
            <Bar dataKey="checkins" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sport-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('weeklyRevenue', lang)}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={v => `${v / 1000}K`} />
              <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} formatter={v => [`SAR ${Number(v).toLocaleString()}`, lang === 'ar' ? 'الإيرادات' : 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={2} dot={{ fill: '#FFD700', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="sport-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('sportDistribution', lang)}</h2>
          <div className="space-y-3">
            {Object.entries(sportDistribution).map(([sport, count]) => (
              <div key={sport}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">{sport}</span>
                  <span className="text-white font-medium">{count} {t('sessions', lang)}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#007ABA] to-[#00DCC8] rounded-full" style={{ width: `${(count / f.checkins.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function FacilityAnalyticsLayout() {
  const { lang } = useLang();
  const navItems = [
    { label: t('dashboard', lang), path: '/passport/facility',           icon: '📊' },
    { label: t('checkIn', lang),   path: '/passport/facility/checkin',   icon: '📷' },
    { label: t('analytics', lang), path: '/passport/facility/analytics', icon: '📈' },
  ];
  return (
    <div className="min-h-screen bg-[#000A0F]">
      <NavBar
        items={navItems}
        title={`ada2ai · ${t('facilityPortal', lang)}`}
        subtitle={t('facilityPortal', lang)}
        accentColor="text-[#007ABA]"
      />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <FacilityAnalyticsInner />
      </main>
    </div>
  );
}

export default function FacilityAnalytics() {
  return (
    <LanguageProvider>
      <FacilityAnalyticsLayout />
    </LanguageProvider>
  );
}
