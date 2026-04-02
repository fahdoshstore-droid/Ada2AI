'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockMinistryKPI } from '@/lib/mock-data';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

const kpi = mockMinistryKPI;

export default function SportsPage() {
  const { lang } = useLang();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">{t('sportsIntel', lang)}</h1>
        <p className="text-white/40 text-sm mt-1">{t('sportsIntelDesc', lang)}</p>
      </div>
      <div className="sport-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">{t('sessionsBySport', lang)}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={kpi.sportBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sport" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
            <Bar dataKey="sessions" fill="#00DCC8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpi.sportBreakdown.map(s => (
          <div key={s.sport} className="sport-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-bold">{s.sport}</div>
              <div className="px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/20 text-green-400 text-xs">+{s.growth}% {t('yoyGrowth', lang)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-white font-black text-lg">{(s.athletes / 1000).toFixed(1)}K</div>
                <div className="text-white/40 text-xs">{t('athletes', lang)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-white font-black text-lg">{(s.sessions / 1000).toFixed(0)}K</div>
                <div className="text-white/40 text-xs">{t('sessions', lang)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
