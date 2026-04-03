import { useState } from 'react';
import { mockAthletes } from '@/lib/passport/mock-data';
import { useLang, LanguageProvider } from '@/lib/passport/LanguageContext';
import { t } from '@/lib/passport/i18n';
import NavBar from '@/components/passport/NavBar';

const athlete = mockAthletes[0];

type HistoryItem = {
  id: string;
  type: 'session' | 'achievement' | 'certification';
  icon: string;
  title: string;
  titleAr: string;
  sub: string;
  subAr: string;
  pts: number;
  date: string;
  meta: string;
};

const SPORT_ICONS: Record<string, string> = { Football: '⚽', Swimming: '🏊', Basketball: '🏀' };
const SPORT_AR: Record<string, string>    = { Football: 'كرة القدم', Swimming: 'السباحة', Basketball: 'كرة السلة' };

const baseHistory: HistoryItem[] = [
  ...athlete.sessions.map(s => ({
    id: `s-${s.id}`, type: 'session' as const,
    icon: SPORT_ICONS[s.sport] ?? '🏟️',
    title: `${s.sport} Training`,      titleAr: `تدريب ${SPORT_AR[s.sport] ?? s.sport}`,
    sub: s.facilityName,               subAr: s.facilityName,
    pts: s.points, date: s.date,       meta: `${s.duration}min`,
  })),
  ...athlete.achievements.map(a => ({
    id: `a-${a.id}`, type: 'achievement' as const,
    icon: a.icon,
    title: a.title,   titleAr: a.title,
    sub: a.description, subAr: a.description,
    pts: a.points, date: a.date, meta: '',
  })),
  ...athlete.certifications.map(c => ({
    id: `c-${c.id}`, type: 'certification' as const,
    icon: '📜',
    title: c.name,    titleAr: c.name,
    sub: c.issuedBy,  subAr: c.issuedBy,
    pts: c.points, date: c.issuedAt, meta: c.sport,
  })),
];

// Extended history for a richer timeline
const extraHistory: HistoryItem[] = [
  { id: 'e1', type: 'session' as const,       icon: '⚽', title: 'Football Training',  titleAr: 'تدريب كرة القدم', sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل',   pts: 10,  date: '2026-01-14', meta: '90min' },
  { id: 'e2', type: 'session' as const, icon: '🏊', title: 'Swimming Training',  titleAr: 'تدريب السباحة',   sub: 'Riyadh Aquatic Center',       subAr: 'مركز الرياض المائي', pts: 10, date: '2026-01-12', meta: '60min' },
  { id: 'e3', type: 'session' as const, icon: '⚽', title: 'Football Training', titleAr: 'تدريب كرة القدم', sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل',   pts: 10, date: '2025-12-09', meta: '90min' },
  { id: 'e4', type: 'session' as const, icon: '⚽', title: 'Football Training', titleAr: 'تدريب كرة القدم', sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل',   pts: 10, date: '2025-11-18', meta: '90min' },
  { id: 'e5', type: 'session' as const, icon: '🏊', title: 'Swimming Training',  titleAr: 'تدريب السباحة',   sub: 'Riyadh Aquatic Center',       subAr: 'مركز الرياض المائي', pts: 10, date: '2025-11-05', meta: '60min' },
  { id: 'e6', type: 'session' as const, icon: '⚽', title: 'Football Training', titleAr: 'تدريب كرة القدم', sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل',   pts: 10, date: '2025-10-28', meta: '90min' },
  { id: 'e7', type: 'session' as const, icon: '⚽', title: 'Football Training', titleAr: 'تدريب كرة القدم', sub: 'Prince Faisal Sports Center', subAr: 'مركز الأمير فيصل',   pts: 10, date: '2025-10-14', meta: '90min' },
];

const allHistory: HistoryItem[] = [...baseHistory, ...extraHistory]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const FILTERS = ['all', 'session', 'achievement', 'certification'] as const;
type Filter = typeof FILTERS[number];

const filterLabels: Record<Filter, { en: string; ar: string }> = {
  all:           { en: 'All',            ar: 'الكل'    },
  session:       { en: 'Sessions',       ar: 'جلسات'   },
  achievement:   { en: 'Achievements',   ar: 'إنجازات' },
  certification: { en: 'Certifications', ar: 'شهادات'  },
};

const typeStyle: Record<string, { bg: string; border: string; text: string; label: { en: string; ar: string } }> = {
  session:       { bg: 'bg-[#00DCC8]/10',  border: 'border-[#00DCC8]/20',  text: 'text-[#00DCC8]', label: { en: 'Session',        ar: 'جلسة'   } },
  achievement:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', label: { en: 'Achievement',    ar: 'إنجاز'  } },
  certification: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', label: { en: 'Certification',  ar: 'شهادة'  } },
};

const MONTHS = [
  { key: '2025-10', label: 'Oct', labelAr: 'أكت' },
  { key: '2025-11', label: 'Nov', labelAr: 'نوف' },
  { key: '2025-12', label: 'Dec', labelAr: 'ديس' },
  { key: '2026-01', label: 'Jan', labelAr: 'يناير' },
  { key: '2026-02', label: 'Feb', labelAr: 'فبراير' },
  { key: '2026-03', label: 'Mar', labelAr: 'مارس'  },
];

const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function groupByMonth(items: HistoryItem[]) {
  const groups: { key: string; label: string; labelAr: string; items: HistoryItem[] }[] = [];
  const map: Record<string, number> = {};
  for (const item of items) {
    const d   = new Date(item.date);
    const key = item.date.slice(0, 7);
    if (map[key] === undefined) {
      map[key] = groups.length;
      groups.push({ key, label: `${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`, labelAr: `${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`, items: [] });
    }
    groups[map[key]].items.push(item);
  }
  return groups;
}

function HistoryPageInner() {
  const { lang } = useLang();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? allHistory : allHistory.filter(i => i.type === filter);
  const grouped  = groupByMonth(filtered);

  const totalPts          = allHistory.reduce((s, i) => s + i.pts, 0);
  const totalSessions     = allHistory.filter(i => i.type === 'session').length;
  const totalCerts        = allHistory.filter(i => i.type === 'certification').length;
  const totalAchievements = allHistory.filter(i => i.type === 'achievement').length;

  const activityPerMonth = Object.fromEntries(
    MONTHS.map(m => [m.key, allHistory.filter(i => i.date.startsWith(m.key)).length])
  );
  const maxActivity = Math.max(...Object.values(activityPerMonth), 1);

  return (
    <div className="space-y-5">

      {/* ── Stats Header ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: lang === 'ar' ? 'الجلسات'      : 'Sessions',       value: totalSessions,     color: 'text-green-400'  },
          { label: lang === 'ar' ? 'إجمالي النقاط' : 'Total pts',      value: totalPts,          color: 'text-yellow-400' },
          { label: lang === 'ar' ? 'الإنجازات'     : 'Achievements',   value: totalAchievements, color: 'text-orange-400' },
          { label: lang === 'ar' ? 'الشهادات'      : 'Certifications', value: totalCerts,        color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="sport-card p-3 text-center">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-white/40 text-[11px] mt-0.5 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Monthly Activity Bar Chart ── */}
      <div className="sport-card p-5">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          {lang === 'ar' ? 'النشاط الشهري' : 'Monthly Activity'}
        </h2>
        <div className="flex gap-2 items-end h-20">
          {MONTHS.map(m => {
            const count = activityPerMonth[m.key] ?? 0;
            const pct   = count / maxActivity;
            return (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                {count > 0 && (
                  <span className="text-[10px] text-white/40 font-mono">{count}</span>
                )}
                <div className="w-full rounded-t-md transition-all duration-700"
                  style={{
                    height: `${Math.max(pct * 52, count > 0 ? 10 : 4)}px`,
                    background: count === 0
                      ? 'rgba(255,255,255,0.05)'
                      : `rgba(0,220,200,${0.25 + pct * 0.75})`,
                  }} />
                <span className="text-[10px] text-white/40">{lang === 'ar' ? m.labelAr : m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f ? 'bg-[#007ABA] text-white' : 'bg-white/8 text-white/50 hover:bg-white/12'
            }`}>
            {filterLabels[f][lang]}
          </button>
        ))}
      </div>

      {/* ── Month-Grouped Timeline ── */}
      {grouped.length === 0 && (
        <div className="sport-card p-8 text-center text-white/30 text-sm">
          {lang === 'ar' ? 'لا توجد نتائج' : 'No results'}
        </div>
      )}

      {grouped.map(group => (
        <div key={group.key}>
          {/* Month header */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
              {lang === 'ar' ? group.labelAr : group.label}
            </span>
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-xs text-white/20">
              {group.items.length} {lang === 'ar' ? 'نشاط' : 'activities'}
            </span>
          </div>

          <div className="space-y-2">
            {group.items.map(item => {
              const style = typeStyle[item.type];
              return (
                <div key={item.id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:brightness-110 ${style.bg} ${style.border}`}>
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border ${style.bg} ${style.border}`}>
                    {item.icon}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium leading-tight truncate">
                      {lang === 'ar' ? item.titleAr : item.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-semibold ${style.text}`}>
                        {style.label[lang]}
                      </span>
                      <span className="text-white/20 text-[10px]">·</span>
                      <span className="text-white/30 text-[10px]">
                        {new Date(item.date).toLocaleDateString(
                          lang === 'ar' ? 'ar-SA' : 'en-GB',
                          { day: 'numeric', month: 'short' }
                        )}
                      </span>
                      {item.meta && (
                        <>
                          <span className="text-white/20 text-[10px]">·</span>
                          <span className="text-white/30 text-[10px]">{item.meta}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Points */}
                  <div className="text-[#00DCC8] font-bold text-sm flex-shrink-0">+{item.pts}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}


function AthleteHistoryLayout() {
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
        <HistoryPageInner />
      </main>
    </div>
  );
}

export default function AthleteHistory() {
  return (
    <LanguageProvider>
      <AthleteHistoryLayout />
    </LanguageProvider>
  );
}
