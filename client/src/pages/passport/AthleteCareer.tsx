import { useState } from 'react';
import { mockAthletes } from '@/lib/passport/mock-data';
import { useLang, LanguageProvider } from '@/lib/passport/LanguageContext';
import { t } from '@/lib/passport/i18n';
import NavBar from '@/components/passport/NavBar';

const athlete = mockAthletes[0];

/* ── Circular SVG progress ring ── */
function CircleRing({ score, size = 110, stroke = 9 }: { score: number; size?: number; stroke?: number }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="url(#cGrad)" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      <defs>
        <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const skills = [
  { label: 'Consistency',    labelAr: 'الانتظام',      value: 85, color: '#00DCC8' },
  { label: 'Certifications', labelAr: 'الشهادات',      value: 90, color: '#8B5CF6' },
  { label: 'Skill Level',    labelAr: 'مستوى المهارة', value: 80, color: '#F59E0B' },
  { label: 'Competition',    labelAr: 'المنافسات',      value: 65, color: '#EF4444' },
  { label: 'Team Play',      labelAr: 'اللعب الجماعي', value: 75, color: '#06B6D4' },
];

/* ── Radar / Spider Chart ── */
function RadarChart({ lang }: { lang: 'en' | 'ar' }) {
  const cx = 130, cy = 130, maxR = 85;
  const n = skills.length;

  function getAngle(i: number) {
    return (2 * Math.PI * i / n) - Math.PI / 2;
  }
  function pt(i: number, r: number): [number, number] {
    const a = getAngle(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function polygonPts(r: number): string {
    return Array.from({ length: n }, (_, i) => pt(i, r).join(',')).join(' ');
  }

  const dataPts = skills.map((s, i) => pt(i, (s.value / 100) * maxR));
  const dataPolygon = dataPts.map(p => p.join(',')).join(' ');

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width="260" height="260"
        viewBox="0 0 260 260"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#007ABA" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#00DCC8" stopOpacity="0.10" />
          </radialGradient>
          <linearGradient id="radarEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#007ABA" />
            <stop offset="100%" stopColor="#00DCC8" />
          </linearGradient>
          <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Grid rings ── */}
        {gridLevels.map((pct, li) => (
          <polygon
            key={pct}
            points={polygonPts((pct / 100) * maxR)}
            fill="none"
            stroke={li === gridLevels.length - 1
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(255,255,255,0.04)'}
            strokeWidth="1"
          />
        ))}

        {/* ── Axis spokes ── */}
        {skills.map((_, i) => {
          const [ax, ay] = pt(i, maxR);
          return (
            <line key={i}
              x1={cx} y1={cy} x2={ax} y2={ay}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1"
            />
          );
        })}

        {/* ── Grid percentage labels (innermost ring) ── */}
        {[20, 40, 60, 80].map(pct => {
          const [lx, ly] = pt(0, (pct / 100) * maxR);
          return (
            <text key={pct}
              x={lx + 4} y={ly}
              fill="rgba(255,255,255,0.18)" fontSize="8"
              fontFamily="Inter, sans-serif" dominantBaseline="middle">
              {pct}
            </text>
          );
        })}

        {/* ── Data polygon — glow ── */}
        <polygon
          points={dataPolygon}
          fill="none"
          stroke="#00DCC8"
          strokeWidth="3"
          opacity="0.35"
          filter="url(#radarGlow)"
        />

        {/* ── Data polygon — fill ── */}
        <polygon points={dataPolygon} fill="url(#radarFill)" />

        {/* ── Data polygon — crisp border ── */}
        <polygon
          points={dataPolygon}
          fill="none"
          stroke="url(#radarEdge)"
          strokeWidth="1.8"
          opacity="0.9"
        />

        {/* ── Skill dots with halos ── */}
        {dataPts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="8"  fill={skills[i].color} opacity="0.15" />
            <circle cx={x} cy={y} r="4"  fill={skills[i].color} />
            <circle cx={x} cy={y} r="1.8" fill="white" opacity="0.8" />
          </g>
        ))}

        {/* ── Skill value labels (just outside each dot) ── */}
        {dataPts.map(([x, y], i) => {
          const valR = (skills[i].value / 100) * maxR + 16;
          const [vx, vy] = pt(i, valR);
          return (
            <text key={i}
              x={vx} y={vy}
              textAnchor="middle" dominantBaseline="middle"
              fill={skills[i].color}
              fontSize="10" fontWeight="700"
              fontFamily="Inter, sans-serif">
              {skills[i].value}
            </text>
          );
        })}

        {/* ── Skill name labels (far outside) ── */}
        {skills.map((s, i) => {
          const [lx, ly] = pt(i, maxR + 24);
          return (
            <text key={i}
              x={lx} y={ly}
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.50)"
              fontSize="10" fontWeight="500"
              fontFamily="Inter, sans-serif">
              {lang === 'ar' ? s.labelAr : s.label}
            </text>
          );
        })}

        {/* ── Center dot ── */}
        <circle cx={cx} cy={cy} r="2.5" fill="rgba(255,255,255,0.20)" />
      </svg>

      {/* ── Legend row ── */}
      <div className="flex flex-wrap justify-center gap-3">
        {skills.map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-white/45 text-[11px]">{s.label}</span>
            <span className="font-black text-[11px]" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const milestones = [
  { icon: '⚽', text: '2 more sessions this month',  textAr: 'جلستان إضافيتان هذا الشهر', reward: 'Trial Eligibility', rewardAr: 'أهلية التجارب' },
  { icon: '📜', text: 'Earn 1 more certification',   textAr: 'احصل على شهادة واحدة إضافية',  reward: '+100 pts',          rewardAr: '+100 نقطة'         },
  { icon: '🏆', text: 'Compete in 1 more event',     textAr: 'شارك في حدث إضافي واحد',      reward: 'Regional unlock',   rewardAr: 'فتح مستوى إقليمي' },
];

function CareerPageInner() {
  const { lang } = useLang();
  const [applied, setApplied] = useState<string | null>(null);

  const aiRecommendations = [
    { id: 'r1', title: 'Regional U18 Football Trials',    titleAr: 'تجارب كرة القدم تحت 18 إقليمياً', match: 94, deadline: '2026-04-15', type: t('trial', lang),       icon: '⚽', urgent: true  },
    { id: 'r2', title: 'Riyadh Youth League Season 2',   titleAr: 'دوري شباب الرياض - الموسم 2',      match: 91, deadline: '2026-04-01', type: t('competition', lang), icon: '🏆', urgent: true  },
    { id: 'r3', title: 'Saudi Swimming Federation Camp', titleAr: 'معسكر اتحاد السباحة السعودي',      match: 87, deadline: '2026-05-01', type: t('development', lang), icon: '🏊', urgent: false },
    { id: 'r4', title: 'Grassroots Coaching Certificate',titleAr: 'شهادة التدريب الشعبي',             match: 82, deadline: '2026-03-30', type: t('certification', lang),icon: '📜', urgent: false },
  ];

  const pathway = [
    { stage: 'Grassroots',     stageAr: 'القاعدة الشعبية',    status: 'completed', desc: 'Local club training + check-ins',       descAr: 'تدريبات النادي المحلي وتسجيلات الحضور' },
    { stage: 'Regional',       stageAr: 'الإقليمي',            status: 'active',    desc: 'Regional competitions & trials',        descAr: 'المنافسات الإقليمية والتجارب'           },
    { stage: 'National Dev',   stageAr: 'التطوير الوطني',      status: 'upcoming',  desc: 'Federation development programs',       descAr: 'برامج تطوير الاتحادات'                  },
    { stage: 'Elite / Pro',    stageAr: 'النخبة / الاحتراف',   status: 'locked',    desc: 'National team & professional contracts',descAr: 'المنتخب الوطني وعقود الاحتراف'          },
  ];

  return (
    <div className="space-y-5">

      {/* ── AI Score Hero ── */}
      <div className="sport-card p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(139,92,246,0.05))' }}>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <CircleRing score={athlete.careerScore} size={110} stroke={9} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white leading-none">{athlete.careerScore}</span>
              <span className="text-white/40 text-xs">/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white mb-0.5">{t('careerPathway', lang)}</h1>
            <p className="text-white/40 text-xs mb-3">{t('aiPowered', lang)}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] bg-blue-500/15 border border-blue-500/25 text-blue-400 px-2 py-0.5 rounded-full font-semibold">
                🤖 {t('aiPoweredBadge', lang)}
              </span>
              <span className="text-[11px] bg-[#00DCC8]/15 border border-[#00DCC8]/25 text-[#00DCC8] px-2 py-0.5 rounded-full font-semibold">
                {lang === 'ar' ? '📈 ترقية قريبة' : '📈 Upgrade Soon'}
              </span>
            </div>
            <p className="text-white/25 text-[11px] mt-3 leading-relaxed">{t('careerScoreDesc', lang)}</p>
          </div>
        </div>
      </div>

      {/* ── Skills Radar ── */}
      <div className="sport-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">
            {lang === 'ar' ? '💪 ملف المهارات' : '💪 Skills Profile'}
          </h2>
          <span className="text-[11px] text-white/25 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            {lang === 'ar' ? 'رادار الأداء' : 'Performance Radar'}
          </span>
        </div>
        <RadarChart lang={lang} />
      </div>

      {/* ── Development Pathway ── */}
      <div className="sport-card p-5">
        <h2 className="text-base font-bold text-white mb-5">{t('devPathway', lang)}</h2>
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-white/8 rounded-full" />
          <div className="space-y-5">
            {pathway.map((p, i) => (
              <div key={p.stage} className="flex items-start gap-4 relative">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold z-10 flex-shrink-0 transition-all ${
                  p.status === 'completed' ? 'bg-[#00DCC8] border-[#00DCC8]/70 text-white shadow-lg shadow-[#00DCC8]/30' :
                  p.status === 'active'    ? 'bg-blue-500   border-blue-400   text-white shadow-lg shadow-blue-500/40 animate-pulse' :
                  p.status === 'upcoming'  ? 'bg-white/8    border-white/20   text-white/40' :
                                             'bg-white/3    border-white/8    text-white/15'
                }`}>
                  {p.status === 'completed' ? '✓' : p.status === 'active' ? '●' : p.status === 'upcoming' ? i + 1 : '🔒'}
                </div>
                <div className={`pt-1.5 flex-1 ${p.status === 'locked' ? 'opacity-30' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">
                      {lang === 'ar' ? p.stageAr : p.stage}
                    </span>
                    {p.status === 'active' && (
                      <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                        {t('current', lang)}
                      </span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">
                    {lang === 'ar' ? p.descAr : p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Next Milestones ── */}
      <div className="sport-card p-5">
        <h2 className="text-base font-bold text-white mb-4">
          {lang === 'ar' ? '🎯 الخطوات التالية' : '🎯 Next Milestones'}
        </h2>
        <div className="space-y-2.5">
          {milestones.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/3 border border-white/8 hover:bg-white/5 transition-all">
              <span className="text-xl flex-shrink-0">{m.icon}</span>
              <span className="text-white/65 text-sm flex-1">
                {lang === 'ar' ? m.textAr : m.text}
              </span>
              <span className="text-xs font-bold text-[#00DCC8] bg-[#00DCC8]/10 border border-[#00DCC8]/20 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                {lang === 'ar' ? m.rewardAr : m.reward}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Recommendations ── */}
      <div className="sport-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-white">{t('aiRecommendations', lang)}</h2>
          <span className="text-[10px] bg-blue-500/15 border border-blue-500/25 text-blue-400 px-2 py-0.5 rounded-full font-bold">
            🤖 {t('aiPoweredBadge', lang)}
          </span>
        </div>
        <div className="space-y-3">
          {aiRecommendations.map(r => (
            <div key={r.id}
              className={`p-4 rounded-xl border transition-all ${
                r.urgent ? 'bg-blue-500/7 border-blue-500/20' : 'bg-white/3 border-white/8'
              }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-white text-sm font-semibold leading-tight">
                      {lang === 'ar' ? r.titleAr : r.title}
                    </span>
                    {r.urgent && (
                      <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full border border-orange-500/25 flex-shrink-0 font-bold">
                        {lang === 'ar' ? 'عاجل' : 'Urgent'}
                      </span>
                    )}
                  </div>
                  <div className="text-white/35 text-xs mb-2">
                    {r.type} · {lang === 'ar' ? 'الموعد:' : 'Deadline:'}{' '}
                    {new Date(r.deadline).toLocaleDateString(
                      lang === 'ar' ? 'ar-SA' : 'en-GB',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${r.match}%`, background: 'linear-gradient(90deg, #007ABA, #00DCC8)' }} />
                    </div>
                    <span className="text-[#00DCC8] font-black text-sm flex-shrink-0">{r.match}%</span>
                    <span className="text-white/30 text-xs">{t('match', lang)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setApplied(r.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    applied === r.id
                      ? 'bg-[#007ABA] text-white'
                      : 'bg-[#007ABA]/12 border border-[#007ABA]/25 text-[#007ABA] hover:bg-[#007ABA]/20'
                  }`}>
                  {applied === r.id
                    ? (lang === 'ar' ? '✓ تم التقديم' : '✓ Applied')
                    : t('apply', lang)}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


function AthleteCareerLayout() {
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
        <CareerPageInner />
      </main>
    </div>
  );
}

export default function AthleteCareer() {
  return (
    <LanguageProvider>
      <AthleteCareerLayout />
    </LanguageProvider>
  );
}
