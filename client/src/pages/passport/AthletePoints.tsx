import { useState, useEffect } from 'react';
import { getLevelInfo } from '@/lib/passport/levels';
import type { Athlete } from '@/lib/passport/types';
import { useLang, LanguageProvider } from '@/lib/passport/LanguageContext';
import { t } from '@/lib/passport/i18n';
import NavBar from '@/components/passport/NavBar';

// Athlete data is now fetched from the API inside PointsPageInner

const transactions = [
  { id: 1,  type: 'session',       icon: '⚽', label: 'Football Training',       labelAr: 'تدريب كرة القدم',         sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل', pts: 10,  date: '2026-03-10' },
  { id: 2,  type: 'session',       icon: '🏊', label: 'Swimming Training',        labelAr: 'تدريب السباحة',            sub: 'Riyadh Aquatic Center',       subAr: 'مركز الرياض المائي', pts: 10,  date: '2026-03-08' },
  { id: 3,  type: 'session',       icon: '⚽', label: 'Football Training',       labelAr: 'تدريب كرة القدم',         sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل', pts: 10,  date: '2026-03-06' },
  { id: 4,  type: 'achievement',   icon: '🥇', label: '50m Sprint Record',        labelAr: 'رقم قياسي 50م سباحة',     sub: 'Club record broken',          subAr: 'رقم النادي محطوم',  pts: 50,  date: '2026-02-05' },
  { id: 5,  type: 'achievement',   icon: '⭐', label: 'Consistency Badge',        labelAr: 'شارة الانتظام',           sub: '30 sessions in a month',      subAr: '30 جلسة في شهر',    pts: 10,  date: '2026-01-31' },
  { id: 6,  type: 'certification', icon: '📜', label: 'Swimming Level 3',         labelAr: 'مستوى السباحة 3',         sub: 'Saudi Aquatics Federation',   subAr: 'اتحاد الرياضات المائية', pts: 100, date: '2026-01-15' },
  { id: 7,  type: 'session',       icon: '⚽', label: 'Football Training',       labelAr: 'تدريب كرة القدم',         sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل', pts: 10,  date: '2026-01-14' },
  { id: 8,  type: 'session',       icon: '🏊', label: 'Swimming Training',        labelAr: 'تدريب السباحة',            sub: 'Riyadh Aquatic Center',       subAr: 'مركز الرياض المائي', pts: 10,  date: '2026-01-12' },
  { id: 9,  type: 'achievement',   icon: '🏆', label: 'Regional Champion',        labelAr: 'بطل إقليمي',              sub: 'U16 Riyadh Regional Football', subAr: 'دوري الرياض الإقليمي تحت 16', pts: 50, date: '2025-12-10' },
  { id: 10, type: 'session',       icon: '⚽', label: 'Football Training',       labelAr: 'تدريب كرة القدم',         sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل', pts: 10,  date: '2025-12-09' },
  { id: 11, type: 'certification', icon: '📜', label: 'Junior Football License',  labelAr: 'رخصة كرة القدم الناشئين', sub: 'Saudi Football Federation',   subAr: 'الاتحاد السعودي لكرة القدم', pts: 100, date: '2025-11-01' },
  { id: 12, type: 'session',       icon: '⚽', label: 'Football Training',       labelAr: 'تدريب كرة القدم',         sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل', pts: 10,  date: '2025-10-28' },
];

const challenges = [
  { id: 1, icon: '🔥', label: 'Train 5 Days This Week',   labelAr: 'تدرب 5 أيام هذا الأسبوع', progress: 3, total: 5,  bonus: 50,  done: false },
  { id: 2, icon: '🏆', label: 'Enter a Competition',       labelAr: 'شارك في منافسة',            progress: 1, total: 1,  bonus: 50,  done: true  },
  { id: 3, icon: '📜', label: 'Earn a New Certification', labelAr: 'احصل على شهادة جديدة',      progress: 0, total: 1,  bonus: 100, done: false },
  { id: 4, icon: '⚡', label: '10 Sessions This Month',   labelAr: '10 جلسات هذا الشهر',        progress: 3, total: 10, bonus: 75,  done: false },
];

const rewards = [
  { pts: 500,  name: 'Training Kit',               nameAr: 'طقم تدريبي',           icon: '👕', featured: false },
  { pts: 1000, name: 'Coaching Session (1hr)',      nameAr: 'جلسة تدريب (ساعة)',    icon: '🏋️', featured: true  },
  { pts: 1500, name: 'Facility Premium Access',     nameAr: 'وصول مميز للمنشأة',   icon: '🏟️', featured: false },
  { pts: 2000, name: 'National Team Tryout Invite', nameAr: 'دعوة لتجارب المنتخب', icon: '🏆', featured: false },
];

const LEVELS = [
  { name: 'Bronze',   min: 0,    color: '#CD7F32' },
  { name: 'Silver',   min: 500,  color: '#C0C0C0' },
  { name: 'Gold',     min: 1000, color: '#FFD700' },
  { name: 'Platinum', min: 2000, color: '#22D3EE' },
];

const FILTERS = ['all', 'session', 'achievement', 'certification'] as const;
type Filter = typeof FILTERS[number];

const filterLabels: Record<Filter, { en: string; ar: string }> = {
  all:           { en: 'All',            ar: 'الكل'    },
  session:       { en: 'Sessions',       ar: 'جلسات'   },
  achievement:   { en: 'Achievements',   ar: 'إنجازات' },
  certification: { en: 'Certifications', ar: 'شهادات'  },
};

const typeStyle: Record<string, string> = {
  session:       'bg-[#00DCC8]/12 text-[#00DCC8] border-[#00DCC8]/20',
  achievement:   'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  certification: 'bg-blue-500/15  text-blue-400   border-blue-500/20',
};

function PointsPageInner() {
  const { lang } = useLang();
  const [filter, setFilter]     = useState<Filter>('all');
  const [redeemed, setRedeemed] = useState<number | null>(null);

  const [data, setData] = useState<Athlete[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/athletes/0/points')
      .then(r => r.json())
      .then(d => { setData(Array.isArray(d) ? d : [d]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (error) return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  if (!data?.length) return <div className="text-white/30 text-center p-8">No athlete data available</div>;

  const athlete = data[0];
  const levelInfo = getLevelInfo(athlete.sportPoints);

  const currentLevelIdx = LEVELS.findIndex(l => l.name === levelInfo.level);
  const progressPct = levelInfo.next
    ? Math.round(((athlete.sportPoints - LEVELS[currentLevelIdx].min) /
        (LEVELS[Math.min(currentLevelIdx + 1, LEVELS.length - 1)].min - LEVELS[currentLevelIdx].min)) * 100)
    : 100;

  const thisMonthPts = transactions
    .filter(tx => tx.date.startsWith('2026-03'))
    .reduce((sum, tx) => sum + tx.pts, 0);
  const thisMonthSessions = transactions
    .filter(tx => tx.date.startsWith('2026-03') && tx.type === 'session').length;

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(tx => tx.type === filter);

  return (
    <div className="space-y-5">

      {/* ── Hero Points Card ── */}
      <div className="sport-card p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, rgba(234,179,8,0.03) 100%)' }}>
        <div className="absolute inset-0 holographic pointer-events-none" />
        <div className="relative">
          <p className="text-white/50 text-sm mb-1">
            {lang === 'ar' ? 'إجمالي النقاط الرياضية' : 'Total Sport Points'}
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-6xl font-black text-yellow-400 tabular-nums">
              {athlete.sportPoints.toLocaleString()}
            </span>
            <span className="text-yellow-400/50 text-xl font-semibold mb-2">pts</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}>
              ⭐ {t(levelInfo.level as 'Gold' | 'Silver' | 'Bronze' | 'Platinum', lang)}{' '}
              {lang === 'ar' ? 'رياضي' : 'Athlete'}
            </span>
            {levelInfo.next && (
              <span className="text-white/35 text-xs">
                {levelInfo.needed} pts {lang === 'ar' ? 'للوصول إلى' : 'to'} {levelInfo.next}
              </span>
            )}
          </div>

          {levelInfo.next && (
            <>
              <div className="flex justify-between text-xs text-white/35 mb-1.5">
                <span>{t(levelInfo.level as 'Gold', lang)}</span>
                <span className="font-semibold text-yellow-400/70">{progressPct}%</span>
                <span>{levelInfo.next}</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #EAB308, #FFD700)' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── This Month Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="sport-card p-4 text-center">
          <div className="text-2xl font-black text-[#00DCC8]">+{thisMonthPts}</div>
          <div className="text-white/40 text-xs mt-1">
            {lang === 'ar' ? 'نقاط مارس' : 'March pts'}
          </div>
        </div>
        <div className="sport-card p-4 text-center">
          <div className="text-2xl font-black text-white">{thisMonthSessions}</div>
          <div className="text-white/40 text-xs mt-1">
            {lang === 'ar' ? 'الجلسات' : 'Sessions'}
          </div>
        </div>
        <div className="sport-card p-4 text-center">
          <div className="text-2xl font-black text-orange-400">🔥 5</div>
          <div className="text-white/40 text-xs mt-1">
            {lang === 'ar' ? 'سلسلة أيام' : 'Day Streak'}
          </div>
        </div>
      </div>

      {/* ── Level Journey ── */}
      <div className="sport-card p-5">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-5">
          {lang === 'ar' ? 'مسار المستوى' : 'Level Journey'}
        </h2>
        <div className="relative flex justify-between items-start px-2">
          {/* base connector */}
          <div className="absolute top-5 left-7 right-7 h-0.5 bg-white/8 rounded-full" />
          {/* filled connector */}
          <div className="absolute top-5 left-7 h-0.5 rounded-full transition-all duration-700"
            style={{
              width: `${(currentLevelIdx / (LEVELS.length - 1)) * (100 - 14)}%`,
              background: `linear-gradient(90deg, ${LEVELS[0].color}, ${LEVELS[currentLevelIdx].color})`,
            }} />

          {LEVELS.map((lvl, i) => {
            const isCurrent = lvl.name === levelInfo.level;
            const isPast    = i < currentLevelIdx;
            return (
              <div key={lvl.name} className="flex flex-col items-center z-10 w-14">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all duration-300 ${isCurrent ? 'scale-125' : ''}`}
                  style={{
                    borderColor: isCurrent || isPast ? lvl.color : 'rgba(255,255,255,0.12)',
                    background: isCurrent
                      ? `${lvl.color}30`
                      : isPast ? `${lvl.color}18` : '#0A1628',
                    boxShadow: isCurrent ? `0 0 18px ${lvl.color}55` : undefined,
                    color: isCurrent || isPast ? lvl.color : 'rgba(255,255,255,0.2)',
                  }}>
                  {isPast ? '✓' : isCurrent ? '★' : '○'}
                </div>
                <span className="text-[11px] mt-2 font-semibold text-center leading-tight"
                  style={{ color: isCurrent || isPast ? lvl.color : 'rgba(255,255,255,0.25)' }}>
                  {lang === 'ar' ? t(lvl.name as 'Gold', lang) : lvl.name}
                </span>
                <span className="text-[10px] text-white/20 mt-0.5">
                  {lvl.min === 0 ? '0' : `${(lvl.min / 1000).toFixed(lvl.min >= 1000 ? 0 : 1)}k`}+
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Challenges ── */}
      <div className="sport-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">
            {lang === 'ar' ? '🎯 التحديات' : '🎯 Challenges'}
          </h2>
          <span className="text-xs text-yellow-400 font-medium bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
            {lang === 'ar' ? 'نقاط مكافأة' : 'Bonus Points'}
          </span>
        </div>
        <div className="space-y-3">
          {challenges.map(ch => (
            <div key={ch.id}
              className={`p-4 rounded-xl border transition-all ${
                ch.done
                  ? 'bg-[#00DCC8]/10 border-[#00DCC8]/25'
                  : 'bg-white/3 border-white/8'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{ch.icon}</span>
                  <span className={`text-sm font-medium ${ch.done ? 'text-[#00DCC8]' : 'text-white'}`}>
                    {lang === 'ar' ? ch.labelAr : ch.label}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                  ch.done
                    ? 'bg-[#00DCC8]/20 text-[#00DCC8]'
                    : 'bg-yellow-500/15 text-yellow-400'
                }`}>
                  {ch.done
                    ? (lang === 'ar' ? '✓ مكتمل' : '✓ Done')
                    : `+${ch.bonus} pts`}
                </span>
              </div>
              {!ch.done && (
                <div>
                  <div className="flex justify-between text-xs text-white/35 mb-1.5">
                    <span>{ch.progress}/{ch.total}</span>
                    <span>{Math.round((ch.progress / ch.total) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(ch.progress / ch.total) * 100}%`,
                        background: 'linear-gradient(90deg, #EAB308, #F59E0B)',
                      }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Rewards Catalogue ── */}
      <div className="sport-card p-5">
        <h2 className="text-base font-bold text-white mb-4">{t('rewardsCatalogue', lang)}</h2>
        <div className="space-y-3">
          {rewards.map(r => {
            const canRedeem  = athlete.sportPoints >= r.pts;
            const isRedeemed = redeemed === r.pts;
            return (
              <div key={r.name}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  r.featured && canRedeem
                    ? 'border-[#00DCC8]/35'
                    : canRedeem
                      ? 'border-[#00DCC8]/18'
                      : 'border-white/6 opacity-55'
                }`}
                style={r.featured && canRedeem
                  ? { background: 'linear-gradient(135deg, rgba(0,220,200,0.12), rgba(37,99,235,0.07))' }
                  : { background: canRedeem ? 'rgba(0,220,200,0.06)' : 'rgba(255,255,255,0.02)' }
                }>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{r.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {lang === 'ar' ? r.nameAr : r.name}
                      </span>
                      {r.featured && (
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold border border-yellow-500/25">
                          ★ {lang === 'ar' ? 'مميز' : 'Featured'}
                        </span>
                      )}
                    </div>
                    <div className="text-white/35 text-xs mt-0.5">
                      {r.pts.toLocaleString()} {t('sportPoints', lang)}
                    </div>
                  </div>
                </div>
                <button
                  disabled={!canRedeem}
                  onClick={() => canRedeem && setRedeemed(r.pts)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    isRedeemed
                      ? 'bg-[#007ABA] text-white'
                      : canRedeem
                        ? 'bg-gradient-to-r from-[#007ABA] to-[#00DCC8] text-white hover:opacity-90 active:scale-95'
                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}>
                  {isRedeemed
                    ? (lang === 'ar' ? '✓ تم' : '✓ Redeemed')
                    : canRedeem
                      ? t('redeem', lang)
                      : `🔒 ${(r.pts - athlete.sportPoints).toLocaleString()} ${lang === 'ar' ? 'نقطة' : 'more'}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Points History ── */}
      <div className="sport-card p-5">
        <h2 className="text-base font-bold text-white mb-4">
          {lang === 'ar' ? 'سجل النقاط' : 'Points History'}
        </h2>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                filter === f
                  ? 'bg-[#007ABA] text-white'
                  : 'bg-white/8 text-white/50 hover:bg-white/12'
              }`}>
              {filterLabels[f][lang]}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border flex-shrink-0 ${typeStyle[tx.type]}`}>
                  {tx.icon}
                </div>
                <div>
                  <div className="text-white text-sm font-medium leading-tight">
                    {lang === 'ar' ? tx.labelAr : tx.label}
                  </div>
                  <div className="text-white/30 text-xs mt-0.5">
                    {lang === 'ar' ? tx.subAr : tx.sub} · {tx.date}
                  </div>
                </div>
              </div>
              <div className="text-[#00DCC8] font-bold text-sm flex-shrink-0 ml-2">
                +{tx.pts}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


function AthletePointsLayout() {
  const { lang } = useLang();
  const navItems = [
    { label: t('passport', lang),    path: '/passport/athlete',         icon: '🪪' },
    { label: t('sportPoints', lang), path: '/passport/athlete/points',  icon: '⭐' },
    { label: t('history', lang),     path: '/passport/athlete/history', icon: '📋' },
    { label: t('career', lang),      path: '/passport/athlete/career',  icon: '🚀' },
  ];
  return (
    <div className="min-h-screen bg-[#000A0F]">
      <NavBar
        items={navItems}
        title={`ada2ai · ${t('appSubtitle', lang)}`}
        subtitle={t('athletePortal', lang)}
        accentColor="text-[#00DCC8]"
      />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <PointsPageInner />
      </main>
    </div>
  );
}

export default function AthletePoints() {
  return (
    <LanguageProvider>
      <AthletePointsLayout />
    </LanguageProvider>
  );
}
