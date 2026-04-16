import { useState, useEffect } from 'react';
import type { Facility as FacilityType, CheckIn } from '@/lib/passport/types';
import { useLang, LanguageProvider } from '@/lib/passport/LanguageContext';
import { t } from '@/lib/passport/i18n';
import NavBar from '@/components/passport/NavBar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const hourlyData = [
  { hour: '6AM',  count: 14 }, { hour: '8AM',  count: 48 },
  { hour: '10AM', count: 76 }, { hour: '12PM', count: 61 },
  { hour: '2PM',  count: 38 }, { hour: '4PM',  count: 92 },
  { hour: '6PM',  count: 97 }, { hour: '8PM',  count: 43 },
];

// Facility data is now fetched from the API inside FacilityDashboardInner

function FacilityDashboardInner() {
  const { lang } = useLang();

  const [data, setData] = useState<FacilityType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/facilities')
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : [d]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  if (!data?.length) return <div className="text-white/30 text-center p-8">No facility data available</div>;

  const f = data[0];
  const [checkins, setCheckins] = useState<CheckIn[]>(f.checkins);
  const [scanning, setScanning] = useState(false);

  async function simulateNewCheckin() {
    setScanning(true);
    await new Promise(r => setTimeout(r, 1800));
    const sports = ['Football', 'Basketball', 'Swimming', 'Tennis'];
    const names = ['Omar Al-Saud', 'Lina Al-Harbi', 'Faris Al-Qahtani', 'Hessa Al-Mutairi'];
    const newCheckin: CheckIn = { id: `CI-${Date.now()}`, athleteId: `ATH-${Math.floor(Math.random() * 9000 + 1000)}`, athleteName: names[Math.floor(Math.random() * names.length)], sport: sports[Math.floor(Math.random() * sports.length)], timestamp: new Date().toISOString(), verified: true, pointsAwarded: 10 };
    setCheckins(prev => [newCheckin, ...prev]);
    setScanning(false);
  }

  return (
    <div className="space-y-6">
      <div className="sport-card p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{f.name}</h1>
            <p className="text-white/40 text-sm mt-1" dir="rtl">{f.nameAr}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {f.sports.map(s => <span key={s} className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs">{s}</span>)}
            </div>
          </div>
          <div className="sport-badge px-3 py-1.5 rounded-full text-xs text-green-300">{t('sportidVerified', lang)}</div>
        </div>
      </div>
      {/* ── QR SCANNER MOCK ── */}
      <div className="sport-card p-6 bg-gradient-to-br from-[#00DCC8]/5 to-transparent border-[#00DCC8]/15">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00DCC8]/15 border border-[#00DCC8]/25 flex items-center justify-center text-lg">📷</div>
            <div>
              <h2 className="text-base font-bold text-white">{lang === 'ar' ? 'ماسح ada2ai للتحقق' : 'ada2ai Verify Scanner'}</h2>
              <p className="text-white/40 text-xs mt-0.5">{lang === 'ar' ? 'تسجيل حضور فوري عبر رمز QR' : 'Instant QR credential check-in'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-400 text-xs px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {scanning ? (lang === 'ar' ? 'جارٍ المسح…' : 'Scanning…') : (lang === 'ar' ? 'جاهز' : 'Ready')}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Scanner frame */}
          <div className="relative w-44 h-44 shrink-0 rounded-2xl bg-black/50 border-2 overflow-hidden"
            style={{ borderColor: scanning ? '#00DCC8' : 'rgba(0,220,200,0.3)' }}>
            {/* Corner brackets */}
            {[['top-2 left-2', 'border-t-2 border-l-2 rounded-tl-lg'],
              ['top-2 right-2','border-t-2 border-r-2 rounded-tr-lg'],
              ['bottom-2 left-2','border-b-2 border-l-2 rounded-bl-lg'],
              ['bottom-2 right-2','border-b-2 border-r-2 rounded-br-lg']].map(([pos, border]) => (
              <div key={pos} className={`absolute ${pos} w-7 h-7 border-[#00DCC8] ${border}`} />
            ))}
            {/* Scan line */}
            {scanning && (
              <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#00DCC8] to-transparent scan-line" />
            )}
            {/* QR placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white/8 text-6xl select-none">▣</div>
            </div>
            {/* Scan overlay */}
            {scanning && (
              <div className="absolute inset-0 bg-[#00DCC8]/5 animate-pulse" />
            )}
          </div>
          {/* Last scan result */}
          <div className="flex-1 w-full space-y-3">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-2">{lang === 'ar' ? 'آخر نتيجة مسح' : 'Last Scan Result'}</div>
            {checkins[0] && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/8 border border-green-500/20">
                <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center text-xl">
                  {checkins[0].sport === 'Football' ? '⚽' : checkins[0].sport === 'Basketball' ? '🏀' : checkins[0].sport === 'Swimming' ? '🏊' : '🎾'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{checkins[0].athleteName}</div>
                  <div className="text-white/40 text-xs">{checkins[0].sport} · {checkins[0].athleteId}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-xs font-black">{t('qrVerified', lang)}</div>
                  <div className="text-white/25 text-xs">{new Date(checkins[0].timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            )}
            <button
              onClick={simulateNewCheckin}
              disabled={scanning}
              className="w-full py-3 rounded-2xl text-white text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #007ABA, #00DCC8)' }}
            >
              {scanning ? (lang === 'ar' ? '⏳ جارٍ المسح…' : '⏳ Scanning QR…') : (lang === 'ar' ? '📷 محاكاة مسح QR' : '📷 Simulate QR Scan')}
            </button>
          </div>
        </div>
      </div>

      {/* ── HOURLY FOOTFALL ── */}
      <div className="sport-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-lg">📊</div>
          <div>
            <h2 className="text-base font-bold text-white">{lang === 'ar' ? 'حركة اليوم' : "Today's Footfall"}</h2>
            <p className="text-white/40 text-xs mt-0.5">{lang === 'ar' ? 'تسجيلات حضور الرياضيين بالساعة' : 'Athlete check-ins per hour'}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xl font-black text-[#00DCC8]">{checkins.length}</div>
            <div className="text-white/25 text-[10px]">{lang === 'ar' ? 'إجمالي اليوم' : 'Total Today'}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={hourlyData} barCategoryGap="25%">
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: 12 }}
              formatter={(v) => [`${v} ${lang === 'ar' ? 'رياضي' : 'athletes'}`, lang === 'ar' ? 'تسجيل الحضور' : 'Check-ins']}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {hourlyData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.count === Math.max(...hourlyData.map(d => d.count))
                    ? '#00DCC8'
                    : 'rgba(37,99,235,0.45)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-white/30">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#00DCC8]" /> {lang === 'ar' ? 'ذروة' : 'Peak hour'}</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#007ABA]/50" /> {lang === 'ar' ? 'عادي' : 'Regular'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('activeAthletes', lang), value: f.activeAthletes.toLocaleString(), icon: '🏃', color: 'text-blue-400' },
          { label: t('todayCheckins', lang), value: checkins.length.toString(), icon: '✅', color: 'text-green-400' },
          { label: t('monthlyRevenue', lang), value: `SAR ${(f.monthlyRevenue / 1000).toFixed(0)}K`, icon: '💰', color: 'text-yellow-400' },
          { label: t('avgCheckinTime', lang), value: '2.3 sec', icon: '⚡', color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="sport-card p-4 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="sport-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">{t('liveCheckinFeed', lang)}</h2>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{t('live', lang)}
            </div>
            <a href="/passport/facility/checkin" className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/30 transition-colors">{t('openQRScanner', lang)}</a>
            <button onClick={simulateNewCheckin} disabled={scanning} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#007ABA] to-[#00DCC8] text-white text-sm disabled:opacity-50">
              {scanning ? t('scanning', lang) : t('simulateNew', lang)}
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
          {checkins.map((c, i) => (
            <div key={c.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${i === 0 && !scanning ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-transparent'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm">
                  {c.sport === 'Football' ? '⚽' : c.sport === 'Basketball' ? '🏀' : c.sport === 'Swimming' ? '🏊' : '🎾'}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{c.athleteName}</div>
                  <div className="text-white/40 text-xs">{c.sport} · {c.athleteId}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 text-xs font-bold">{t('qrVerified', lang)}</div>
                <div className="text-white/30 text-xs">{new Date(c.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sport-card p-6 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">📡</div>
          <div>
            <h3 className="text-white font-semibold">{t('ministryReporting', lang)}</h3>
            <p className="text-white/40 text-xs mt-0.5">{t('autoSynced', lang)}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-green-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{t('syncing', lang)}
          </div>
        </div>
        <div className="flex gap-3">
          {[[t('lastSync', lang), t('secAgo', lang)], [t('sessionsToday', lang), checkins.length.toString()], [t('pointsIssued', lang), `${checkins.length * 10}`]].map(([k, v]) => (
            <div key={k} className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <div className="text-white font-semibold text-sm">{v}</div>
              <div className="text-white/30 text-xs mt-0.5">{k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function FacilityLayout() {
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
        <FacilityDashboardInner />
      </main>
    </div>
  );
}

export default function Facility() {
  return (
    <LanguageProvider>
      <FacilityLayout />
    </LanguageProvider>
  );
}
