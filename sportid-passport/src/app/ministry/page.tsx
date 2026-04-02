'use client';
import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockMinistryKPI } from '@/lib/mock-data';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';

const kpi = mockMinistryKPI;
const SPORT_COLORS = ['#00DCC8', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

export default function MinistryDashboard() {
  const { lang } = useLang();
  const [liveCount, setLiveCount] = useState(kpi.activeThisMonth);
  useEffect(() => {
    const interval = setInterval(() => setLiveCount(c => c + Math.floor(Math.random() * 3)), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">{t('nationalDashboard', lang)}</h1>
          <p className="text-white/40 text-sm mt-1">{t('ministryOfSports', lang)}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{t('liveData', lang)}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">{lang === 'ar' ? 'مارس 2026' : 'March 2026'}</div>
        </div>
      </div>
      <div className="sport-card p-6 bg-gradient-to-br from-[#1a0a2e] to-[#0A1628] border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🎯</div>
          <div>
            <h2 className="text-white font-bold text-lg">{t('vision2030Progress', lang)}</h2>
            <p className="text-white/40 text-xs">{t('vision2030Desc', lang)}</p>
          </div>
          <div className="ml-auto text-4xl font-black text-purple-400">{kpi.vision2030Progress}%</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: t('youthEngagement', lang), value: kpi.youthEngagement, color: 'from-[#007ABA] to-[#00DCC8]', icon: '👥' },
            { label: t('talentPipeline', lang), value: kpi.talentPipelineScore, color: 'from-blue-500 to-cyan-400', icon: '🚀' },
            { label: t('nationalKPI', lang), value: kpi.vision2030Progress, color: 'from-purple-500 to-pink-400', icon: '📊' },
          ].map(m => (
            <div key={m.label} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">{m.icon} {m.label}</span>
                <span className="text-white font-bold">{m.value}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${m.color} rounded-full`} style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('totalAthletes', lang), value: kpi.totalAthletes.toLocaleString(), sub: t('vsLastYear', lang), color: 'text-green-400', icon: '🏃' },
          { label: t('activeThisMonth', lang), value: liveCount.toLocaleString(), sub: t('participationRate', lang), color: 'text-blue-400', icon: '📡' },
          { label: t('certFacilities', lang), value: kpi.totalFacilities.toLocaleString(), sub: t('allProvinces', lang), color: 'text-yellow-400', icon: '🏟️' },
          { label: t('totalSessions', lang), value: `${(kpi.totalSessions / 1000000).toFixed(2)}M`, sub: t('sinceSep', lang), color: 'text-purple-400', icon: '⚡' },
        ].map(s => (
          <div key={s.label} className="sport-card p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-white/60 text-xs mt-1">{s.label}</div>
            <div className="text-white/30 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="sport-card p-6">
        <h2 className="text-lg font-bold text-white mb-6">{t('growthChart', lang)}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={kpi.monthlyGrowth}>
            <defs>
              <linearGradient id="athletes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00DCC8" stopOpacity={0.3} /><stop offset="95%" stopColor="#00DCC8" stopOpacity={0} /></linearGradient>
              <linearGradient id="sessions" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
              formatter={(v, name) => [Number(v).toLocaleString(), String(name) === 'athletes' ? t('athletes', lang) : t('sessions', lang)]} />
            <Legend formatter={v => v === 'athletes' ? t('athletes', lang) : t('sessions', lang)} />
            <Area type="monotone" dataKey="athletes" stroke="#00DCC8" fill="url(#athletes)" strokeWidth={2} />
            <Area type="monotone" dataKey="sessions" stroke="#3B82F6" fill="url(#sessions)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sport-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('athletesByRegion', lang)}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={kpi.regionBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <YAxis dataKey="region" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
              <Bar dataKey="athletes" fill="#00DCC8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="sport-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">{t('athletesBySport', lang)}</h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={kpi.sportBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="athletes" paddingAngle={3}>
                  {kpi.sportBreakdown.map((_, i) => <Cell key={i} fill={SPORT_COLORS[i % SPORT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {kpi.sportBreakdown.map((s, i) => (
                <div key={s.sport} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: SPORT_COLORS[i % SPORT_COLORS.length] }} />
                    <span className="text-white/70">{s.sport}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{(s.athletes / 1000).toFixed(1)}K</span>
                    <span className="text-green-400 text-xs">+{s.growth}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ── KSA PROVINCE HEATMAP ── */}
      <div className="sport-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-lg">🗺️</div>
          <div>
            <h2 className="text-base font-bold text-white">{lang === 'ar' ? 'خريطة النشاط الرياضي' : 'National Activity Heatmap'}</h2>
            <p className="text-white/40 text-xs mt-0.5">{lang === 'ar' ? 'المشاركة الرياضية حسب المنطقة' : 'Sport participation by province'}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[10px] text-white/20">🇸🇦 KSA · 13 Provinces</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* SVG Map */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5 shrink-0 w-full lg:w-[360px]" style={{ background: '#060D1A', height: 220 }}>
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="riyadhHeat" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00DCC8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00DCC8" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="makkahHeat" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#007ABA" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#007ABA" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="eastHeat" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Province nodes with activity glow */}
              {[
                { x: 248, y: 155, name: 'Riyadh',          athletes: 28400, color: '#00DCC8', grad: 'riyadhHeat', r: 36, ring: true },
                { x: 110, y: 175, name: 'Makkah',           athletes: 22100, color: '#007ABA', grad: 'makkahHeat', r: 30, ring: false },
                { x: 320, y: 148, name: 'Eastern',          athletes: 16800, color: '#8B5CF6', grad: 'eastHeat',   r: 26, ring: false },
                { x: 105, y: 128, name: 'Madinah',          athletes: 9200,  color: '#06B6D4', grad: null,         r: 18, ring: false },
                { x: 145, y: 215, name: 'Asir',             athletes: 7100,  color: '#F59E0B', grad: null,         r: 15, ring: false },
                { x: 76,  y: 58,  name: 'Tabuk',            athletes: 4200,  color: '#6366F1', grad: null,         r: 12, ring: false },
                { x: 170, y: 72,  name: "Ha'il",            athletes: 3800,  color: '#6366F1', grad: null,         r: 11, ring: false },
                { x: 192, y: 118, name: 'Qassim',           athletes: 5100,  color: '#06B6D4', grad: null,         r: 13, ring: false },
                { x: 185, y: 195, name: 'Najran',           athletes: 3100,  color: '#F59E0B', grad: null,         r: 10, ring: false },
              ].map(p => (
                <g key={p.name}>
                  {p.grad && <circle cx={p.x} cy={p.y} r={p.r * 1.8} fill={`url(#${p.grad})`} />}
                  {p.ring && (
                    <circle cx={p.x} cy={p.y} r={p.r + 10} fill="none" stroke={`${p.color}25`} strokeWidth="1.5">
                      <animate attributeName="r" values={`${p.r + 8};${p.r + 20};${p.r + 8}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={p.x} cy={p.y} r={p.r} fill={`${p.color}22`} stroke={p.color} strokeWidth="1.5" />
                  <text x={p.x} y={p.y - p.r - 4} fill="rgba(255,255,255,0.45)" fontSize="7.5" textAnchor="middle" fontFamily="Inter, sans-serif">{p.name}</text>
                  <text x={p.x} y={p.y + 3.5} fill={p.color} fontSize="8" textAnchor="middle" fontWeight="700" fontFamily="Inter, sans-serif">
                    {p.athletes >= 1000 ? `${(p.athletes / 1000).toFixed(0)}K` : p.athletes}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Province ranking */}
          <div className="flex-1 w-full space-y-2.5">
            {kpi.regionBreakdown.map((r, i) => {
              const max = kpi.regionBreakdown[0].athletes;
              const pct = Math.round((r.athletes / max) * 100);
              const colors = ['#00DCC8', '#007ABA', '#8B5CF6', '#06B6D4', '#F59E0B', '#6366F1'];
              const color = colors[i % colors.length];
              return (
                <div key={r.region}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-white/70 text-xs">{r.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 text-[10px]">{r.facilities} facilities</span>
                      <span className="text-white font-bold text-xs">{(r.athletes / 1000).toFixed(1)}K</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}55` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t('sportIdIntegration', lang), value: '100%', desc: t('fullBiometric', lang), icon: '🔐', color: 'from-[#007ABA]/10 to-[#00DCC8]/5 border-[#007ABA]/20' },
          { label: t('dataCompliant', lang), value: '✓', desc: t('dataDesc', lang), icon: '⚖️', color: 'from-blue-500/10 to-cyan-500/5 border-blue-500/20' },
          { label: t('absherIntegration', lang), value: lang === 'ar' ? 'نشط' : 'Active', desc: t('guardianConsent', lang), icon: '📱', color: 'from-purple-500/10 to-pink-500/5 border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`sport-card p-5 bg-gradient-to-br ${s.color} border`}>
            <div className="text-3xl mb-3">{s.icon}</div>
            <div className="text-white font-black text-2xl">{s.value}</div>
            <div className="text-white/60 text-sm mt-1">{s.label}</div>
            <div className="text-white/30 text-xs mt-1">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
