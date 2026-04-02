'use client';
import { useState, useEffect } from 'react';
import { mockAthletes, getLevelInfo } from '@/lib/mock-data';
import { useLang } from '@/lib/LanguageContext';
import { t } from '@/lib/i18n';
import QRCode from 'qrcode';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const levelGradients: Record<string, string> = {
  Bronze: 'from-amber-700 to-amber-500',
  Silver:  'from-gray-400 to-gray-200',
  Gold:    'from-yellow-500 to-yellow-300',
  Platinum:'from-cyan-400 to-blue-300',
};
const levelGlows: Record<string, string> = {
  Bronze:  '0 0 60px rgba(251,146,60,0.15)',
  Silver:  '0 0 60px rgba(156,163,175,0.12)',
  Gold:    '0 0 60px rgba(234,179,8,0.2)',
  Platinum:'0 0 60px rgba(34,211,238,0.2)',
};
const levelBorders: Record<string, string> = {
  Bronze:  'rgba(251,146,60,0.35)',
  Silver:  'rgba(209,213,219,0.35)',
  Gold:    'rgba(234,179,8,0.4)',
  Platinum:'rgba(34,211,238,0.4)',
};
const levelAccents: Record<string, string> = {
  Bronze:  '#F97316',
  Silver:  '#9CA3AF',
  Gold:    '#EAB308',
  Platinum:'#22D3EE',
};

const sportIcons: Record<string, string> = {
  Football: '⚽', Swimming: '🏊', Basketball: '🏀',
  Athletics: '🏃', Tennis: '🎾', Volleyball: '🏐', 'Martial Arts': '🥋',
};

// Performance radar data — per sport
const radarDataMap: Record<string, { subject: string; A: number }[]> = {
  Football: [
    { subject: 'Dribbling',    A: 82 },
    { subject: 'Shooting',     A: 75 },
    { subject: 'Stamina',      A: 88 },
    { subject: 'Vision',       A: 70 },
    { subject: 'Heading',      A: 65 },
  ],
  Swimming: [
    { subject: 'Technique',    A: 90 },
    { subject: 'Speed',        A: 78 },
    { subject: 'Endurance',    A: 85 },
    { subject: 'Turns',        A: 72 },
    { subject: 'Starts',       A: 68 },
  ],
  Basketball: [
    { subject: 'Ball Handle',  A: 80 },
    { subject: 'Shooting',     A: 76 },
    { subject: 'Defense',      A: 70 },
    { subject: 'Playmaking',   A: 85 },
    { subject: 'Rebounding',   A: 68 },
  ],
  Athletics: [
    { subject: 'Speed',        A: 92 },
    { subject: 'Endurance',    A: 88 },
    { subject: 'Technique',    A: 85 },
    { subject: 'Strength',     A: 78 },
    { subject: 'Recovery',     A: 80 },
  ],
  Volleyball: [
    { subject: 'Spiking',      A: 83 },
    { subject: 'Blocking',     A: 75 },
    { subject: 'Setting',      A: 70 },
    { subject: 'Serving',      A: 88 },
    { subject: 'Defense',      A: 72 },
  ],
};

// Activity timeline
const activityTimeline = [
  { date: 'Mar 2026', event: 'Bronze Medal, Riyadh Youth Championship',  icon: '🏆', color: '#F59E0B' },
  { date: 'Feb 2026', event: 'Level 3 Swimming Certified',               icon: '📜', color: '#8B5CF6' },
  { date: 'Jan 2026', event: '50 Sessions Milestone Reached',            icon: '⭐', color: '#00DCC8' },
  { date: 'Dec 2025', event: '50m Sprint Record — Club Record',          icon: '🥇', color: '#007ABA' },
  { date: 'Sep 2025', event: 'Joined ada2ai · Sport Passport ID',               icon: '🆔', color: '#6366F1' },
];

export default function AthletePage() {
  const { lang } = useLang();
  const [profileIndex, setProfileIndex] = useState(0);
  const [qrDataUrl, setQrDataUrl]       = useState('');
  const [flipped, setFlipped]           = useState(false);
  const [scanning, setScanning]         = useState(false);
  const [scanned, setScanned]           = useState(false);
  const [showShare, setShowShare]       = useState(false);
  const [copied, setCopied]             = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const athlete = mockAthletes[profileIndex];

  // Active sport for radar — default to first sport the athlete plays
  const [activeSport, setActiveSport] = useState<string>(athlete.sports[0]);
  useEffect(() => {
    setActiveSport(athlete.sports[0]);
    setFlipped(false);
    setQrDataUrl('');
  }, [profileIndex, athlete.sports]);

  const radarData = radarDataMap[activeSport] ?? radarDataMap['Football'];
  const stamps = Array.from(
    new Map(athlete.sessions.map(s => [`${s.facilityId}-${s.sport}`, s])).values()
  );

  const levelInfo  = getLevelInfo(athlete.sportPoints);
  const levelStart = levelInfo.level === 'Gold' ? 1000 : levelInfo.level === 'Silver' ? 500 : 0;
  const progressPct = levelInfo.next
    ? Math.round(((athlete.sportPoints - levelStart) / (levelInfo.needed + (athlete.sportPoints - levelStart))) * 100)
    : 100;

  const accent = levelAccents[levelInfo.level];
  const border = levelBorders[levelInfo.level];
  const glow   = levelGlows[levelInfo.level];

  useEffect(() => {
    const data = JSON.stringify({
      id: athlete.id, sportId: athlete.sportId, name: athlete.name,
      sports: athlete.sports, level: levelInfo.level, points: athlete.sportPoints,
      ts: new Date().toISOString(),
    });
    QRCode.toDataURL(data, { width: 280, margin: 2, color: { dark: '#00DCC8', light: '#000A0F' } })
      .then(setQrDataUrl);
  }, []);

  async function handleCheckIn() {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2500));
    setScanning(false);
    setScanned(true);
    setTimeout(() => setScanned(false), 4000);
  }

  function handleCopyShare() {
    const text = `${athlete.id} · ${levelInfo.level} ${lang === 'ar' ? 'رياضي' : 'Athlete'} · ${athlete.sportPoints} pts · ada2ai Sport Passport`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-6">

      {/* ── FLIP PASSPORT CARD ──────────────────────────────── */}
      {/* WebkitPerspective required for iOS Safari 3D flip */}
      <div style={{ perspective: '1400px', WebkitPerspective: '1400px' }}>
        <div style={{
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transition: 'transform 0.75s cubic-bezier(0.4,0,0.2,1), -webkit-transform 0.75s cubic-bezier(0.4,0,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          WebkitTransform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
        }}>

          {/* ── FRONT FACE ── */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg,#0F2340 0%,#0A1628 60%,#071020 100%)',
              border: `1px solid ${border}`,
              boxShadow: glow,
            }}
          >
            <div className="holographic absolute inset-0 rounded-3xl z-10" />
            {/* Decorative orbs */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-15 pointer-events-none"
              style={{ background: `radial-gradient(circle,${accent}55,transparent 70%)` }} />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle,#1E90FF55,transparent 70%)' }} />
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
              style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />

            <div className="relative p-7 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${levelGradients[levelInfo.level]} text-white shadow-md`}>
                      {t(levelInfo.level as 'Gold'|'Silver'|'Bronze'|'Platinum', lang)} {t('athleteRole', lang)}
                    </div>
                    <div className="sport-badge px-2.5 py-0.5 rounded-full text-xs text-green-300">
                      {t('sportIdVerified', lang)}
                    </div>
                  </div>
                  <div>
                    {athlete.name
                      ? <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{athlete.name}</h1>
                      : <h1 className="text-xl font-black text-white/20 tracking-tight font-orbitron">{lang === 'ar' ? '— بانتظار التحقق —' : '— Pending Verification —'}</h1>
                    }
                    {athlete.nameAr
                      ? <p className="text-white/40 text-sm mt-0.5" dir="rtl">{athlete.nameAr}</p>
                      : null
                    }
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* ada2ai "A" brand mark */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl"
                      style={{ background: 'linear-gradient(135deg,#0B2A35,#071828)', border: '1px solid rgba(0,220,200,0.35)' }}>
                      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                        <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="#0B2A35" stroke="rgba(0,220,200,0.5)" strokeWidth="1.5"/>
                        <circle cx="24" cy="26" r="9" fill="none" stroke="rgba(0,220,200,0.6)" strokeWidth="1.2"/>
                        <polygon points="24,17 27,22 33,22 28.5,27 30.5,33 24,29 17.5,33 19.5,27 15,22 21,22" fill="none" stroke="rgba(0,220,200,0.4)" strokeWidth="0.8"/>
                        <polyline points="30,6 38,6 38,14" fill="none" stroke="url(#pg1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="33,3 38,6 35,11" fill="none" stroke="url(#pg1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <defs>
                          <linearGradient id="pg1" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00DCC8"/><stop offset="100%" stopColor="#4DFFF0"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="text-[9px] font-black font-orbitron" style={{ color: '#00DCC8', letterSpacing: '1px' }}>ada2ai</div>
                  </div>
                  <button
                    onClick={() => setShowShare(true)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-lg"
                    title={lang === 'ar' ? 'مشاركة' : 'Share Passport'}
                  >📤</button>
                  <div className="text-white/20 text-[10px] text-right font-mono">{athlete.id}</div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                {[
                  { label: 'ID',              value: athlete.id },
                  { label: 'Sport ID',          value: athlete.sportId.startsWith('*') ? athlete.sportId : `****${athlete.sportId.slice(-4)}` },
                  { label: t('city', lang),   value: athlete.city || '—' },
                  { label: t('age', lang),    value: athlete.age ? `${athlete.age} ${t('years', lang)}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <div className="text-white/30 text-xs mb-1">{label}</div>
                    <div className="text-white font-semibold text-sm">{value}</div>
                  </div>
                ))}
              </div>

              {/* Sports */}
              <div className="mb-4">
                <div className="text-white/30 text-xs mb-2">{t('sports', lang)}</div>
                <div className="flex gap-2 flex-wrap">
                  {athlete.sports.map(s => (
                    <span key={s} className="px-3 py-1.5 rounded-xl bg-[#00DCC8]/12 border border-[#00DCC8]/25 text-[#00DCC8] text-xs font-semibold">
                      {sportIcons[s] || '🏅'} {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Points bar */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/50 text-sm">{t('sportPoints', lang)}</span>
                  <span className="text-2xl font-black" style={{ color: accent }}>
                    {athlete.sportPoints.toLocaleString()} ⭐
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${levelGradients[levelInfo.level]} rounded-full`}
                    style={{ width: `${progressPct}%`, transition: 'width 1.2s ease' }}
                  />
                </div>
                {levelInfo.next && (
                  <div className="text-white/30 text-xs mt-2">
                    {levelInfo.needed} {t('ptsToNext', lang)} {t(levelInfo.next as 'Gold'|'Silver'|'Bronze'|'Platinum', lang)}
                  </div>
                )}
              </div>

              {/* Flip to QR */}
              <button
                onClick={() => setFlipped(true)}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg,${accent}cc,${accent}77)`, border: `1px solid ${accent}44` }}
              >
                {lang === 'ar' ? '📱 عرض رمز QR للحضور' : '📱 Show QR Code for Check-In'}
              </button>
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              WebkitTransform: 'rotateY(180deg)',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg,#071020 0%,#0A1628 60%,#0F2340 100%)',
              border: `1px solid ${border}`,
              boxShadow: glow,
            }}
          >
            <div className="holographic absolute inset-0 rounded-3xl z-10" />
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
              style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: `radial-gradient(circle,${accent}55,transparent 70%)` }} />

            <div className="relative h-full flex flex-col items-center justify-center gap-5 p-7">
              <div className="text-center">
                <div className="text-white font-black text-lg">{athlete.name}</div>
                <div className="text-white/40 text-xs font-mono">{athlete.id}</div>
              </div>

              <div className="qr-pulse rounded-2xl overflow-hidden border-2 bg-[#000A0F] p-3"
                style={{ borderColor: `${accent}50` }}>
                {qrDataUrl
                  ? <img src={qrDataUrl} alt="SportID QR" className="w-52 h-52 rounded-lg" />
                  : <div className="w-52 h-52 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-[#007ABA]/30 border-t-[#007ABA] rounded-full animate-spin" />
                    </div>
                }
              </div>

              <div className="text-white/40 text-xs text-center">{t('scanDesc', lang)}</div>

              <button
                onClick={handleCheckIn}
                disabled={scanning}
                className="w-full max-w-xs py-3.5 rounded-2xl text-white text-sm font-semibold transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#007ABA,#00DCC8)', border: '1px solid rgba(0,220,200,0.3)' }}
              >
                {scanning ? t('verifying', lang) : t('simulateCheckin', lang)}
              </button>

              {scanned && (
                <div className="w-full max-w-xs py-3 rounded-2xl bg-[#00DCC8]/20 border border-[#00DCC8]/30 text-[#00DCC8] text-sm text-center animate-pulse">
                  {t('checkedIn', lang)}
                </div>
              )}

              <button
                onClick={() => setFlipped(false)}
                className="text-white/30 text-xs hover:text-white/60 transition-colors mt-1"
              >
                ← {lang === 'ar' ? 'رجوع للهوية' : 'Back to ID'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── PASSPORT STAMPS / MAP ───────────────────────────── */}
      <div className="sport-card p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00DCC8]/12 border border-[#00DCC8]/25 flex items-center justify-center text-lg">🗺️</div>
            <div>
              <h2 className="text-base font-bold text-white">
                {lang === 'ar' ? 'طوابع الجواز' : 'Passport Stamps'}
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                {lang === 'ar' ? 'رحلتك الرياضية عبر المملكة' : 'Your sports journey across Saudi Arabia'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-black text-[#00DCC8]">{stamps.length}</div>
            <div className="text-white/25 text-[10px]">{lang === 'ar' ? 'منشأة' : 'Facilities'}</div>
          </div>
        </div>

        {/* ── Geographic Map ── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5" style={{ background: '#060D1A', height: 210 }}>
          {/* Dot-grid background */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }} />
          {/* Bottom horizon glow */}
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(0,220,200,0.05), transparent)' }} />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 210" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00DCC8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00DCC8" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="riyadhGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#007ABA" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#007ABA" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ── Dim city nodes ── */}
            {[
              { x: 78,  y: 55,  name: 'Tabuk' },
              { x: 98,  y: 118, name: 'Madinah' },
              { x: 72,  y: 162, name: 'Jeddah' },
              { x: 96,  y: 182, name: 'Mecca' },
              { x: 118, y: 188, name: 'Abha' },
              { x: 192, y: 118, name: 'Qassim' },
              { x: 172, y: 72,  name: "Ha'il" },
              { x: 312, y: 155, name: 'Dammam' },
              { x: 195, y: 192, name: 'Najran' },
            ].map(city => (
              <g key={city.name}>
                <circle cx={city.x} cy={city.y} r={3.5} fill="rgba(255,255,255,0.07)" />
                <text x={city.x} y={city.y - 8} fill="rgba(255,255,255,0.18)" fontSize="7.5"
                  textAnchor="middle" fontFamily="Inter, sans-serif">{city.name}</text>
              </g>
            ))}

            {/* ── Connection line between facilities ── */}
            <line x1="238" y1="158" x2="260" y2="172"
              stroke="rgba(0,220,200,0.22)" strokeWidth="1" strokeDasharray="3 4" />

            {/* ── Riyadh region glow ── */}
            <circle cx="248" cy="164" r="40" fill="url(#riyadhGlow)" />

            {/* ── Animated pulse on active city ── */}
            <circle cx="248" cy="164" r="16" fill="none" stroke="rgba(0,220,200,0.18)" strokeWidth="1.5">
              <animate attributeName="r" values="14;26;14" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="248" cy="164" r="22" fill="none" stroke="rgba(37,99,235,0.1)" strokeWidth="1">
              <animate attributeName="r" values="20;34;20" dur="3s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.25;0;0.25" dur="3s" begin="0.8s" repeatCount="indefinite" />
            </circle>

            {/* ── Facility node 1: Football ── */}
            <circle cx="238" cy="158" r="12" fill="rgba(0,220,200,0.14)" stroke="#00DCC8" strokeWidth="1.5" />
            <text x="238" y="154.5" fill="#00DCC8" fontSize="7.5" textAnchor="middle"
              fontWeight="700" fontFamily="Inter, sans-serif">FOOT</text>
            <text x="238" y="163.5" fill="rgba(0,220,200,0.7)" fontSize="9" textAnchor="middle">⚽</text>

            {/* ── Facility node 2: Swimming ── */}
            <circle cx="260" cy="172" r="12" fill="rgba(0,220,200,0.14)" stroke="#00DCC8" strokeWidth="1.5" />
            <text x="260" y="168.5" fill="#00DCC8" fontSize="7.5" textAnchor="middle"
              fontWeight="700" fontFamily="Inter, sans-serif">SWIM</text>
            <text x="260" y="177.5" fill="rgba(0,220,200,0.7)" fontSize="9" textAnchor="middle">🏊</text>

            {/* ── Riyadh city label ── */}
            <text x="248" y="195" fill="rgba(255,255,255,0.55)" fontSize="9.5" textAnchor="middle"
              fontWeight="600" fontFamily="Inter, sans-serif">Riyadh</text>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00DCC8]" />
              <span className="text-white/35 text-[9px]">{lang === 'ar' ? 'تم الزيارة' : 'Visited'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="text-white/35 text-[9px]">{lang === 'ar' ? 'مدينة' : 'City'}</span>
            </div>
          </div>
          {/* KSA badge */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-white/25 text-[9px] font-mono tracking-wide">
            🇸🇦 KSA
          </div>
        </div>

        {/* ── Stamp chips below map ── */}
        <div className="flex gap-2.5 mt-4 flex-wrap">
          {stamps.map((s) => (
            <div key={`${s.facilityId}-${s.sport}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00DCC8]/8 border border-[#00DCC8]/20 hover:bg-[#00DCC8]/15 transition-colors cursor-default">
              <span className="text-base">{sportIcons[s.sport] || '🏅'}</span>
              <div>
                <div className="text-[#00DCC8] text-[10px] font-black uppercase tracking-wide leading-none">
                  {s.sport.slice(0, 4)}
                </div>
                <div className="text-white/30 text-[9px] leading-none mt-0.5">
                  {s.facilityName.split(' ').slice(0, 2).join(' ')}
                </div>
              </div>
            </div>
          ))}
          {[0, 1].map(i => (
            <div key={`locked-${i}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/8 opacity-25 cursor-default">
              <span className="text-base">🔒</span>
              <div className="text-white/30 text-[10px]">{lang === 'ar' ? 'مقفل' : 'Locked'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PERFORMANCE RADAR ───────────────────────────────── */}
      <div className="sport-card p-6 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/4 w-56 h-56 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#007ABA]/15 border border-[#007ABA]/25 flex items-center justify-center text-lg">📡</div>
            <div>
              <h2 className="text-base font-bold text-white">
                {lang === 'ar' ? 'رادار الأداء' : 'Performance Radar'}
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                {lang === 'ar' ? 'نظرة شاملة على ملفك الرياضي' : 'Complete athletic profile at a glance'}
              </p>
            </div>
          </div>
          {/* Overall score */}
          <div className="text-center px-4 py-2 rounded-xl bg-[#00DCC8]/8 border border-[#00DCC8]/20">
            <div className="text-2xl font-black text-[#00DCC8] font-orbitron">
              {Math.round(radarData.reduce((s, d) => s + d.A, 0) / radarData.length)}
            </div>
            <div className="text-white/30 text-[10px]">{lang === 'ar' ? 'الإجمالي' : 'Overall'}</div>
          </div>
        </div>

        {/* ── Sport switcher tabs ── */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {athlete.sports.map(sport => (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                activeSport === sport
                  ? 'bg-[#00DCC8]/15 border-[#00DCC8]/40 text-[#00DCC8]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
              }`}
            >
              <span>{sportIcons[sport] || '🏅'}</span>
              <span>{sport}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Chart */}
          <div className="w-full md:w-1/2 relative">
            {/* Center glow behind radar */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(0,220,200,0.1) 0%, transparent 70%)' }} />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={88}>
                <defs>
                  <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"   stopColor="#007ABA" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#00DCC8" stopOpacity="0.18" />
                  </radialGradient>
                  <filter id="radarGlow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <PolarGrid
                  stroke="rgba(255,255,255,0.06)"
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                />
                {/* Ghost average layer */}
                <Radar
                  name="average"
                  dataKey="A"
                  stroke="rgba(255,255,255,0.06)"
                  fill="rgba(255,255,255,0.03)"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
                {/* Main performance layer */}
                <Radar
                  name={athlete.name}
                  dataKey="A"
                  stroke="#00DCC8"
                  fill="url(#radarFill)"
                  fillOpacity={1}
                  strokeWidth={2.5}
                  dot={{ r: 4.5, fill: '#00DCC8', stroke: '#000A0F', strokeWidth: 2 }}
                  activeDot={{ r: 6.5, fill: '#007ABA', stroke: '#000A0F', strokeWidth: 2 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats bars */}
          <div className="w-full md:w-1/2 space-y-4">
            {radarData.map((d) => {
              const pct = d.A;
              const grade = pct >= 85 ? 'Elite' : pct >= 70 ? 'Strong' : 'Good';
              const gradeColor = pct >= 85 ? '#00DCC8' : pct >= 70 ? '#007ABA' : '#6366F1';
              return (
                <div key={d.subject}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/60 text-xs font-medium">{d.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                        style={{ color: gradeColor, background: `${gradeColor}18` }}>
                        {grade}
                      </span>
                      <span className="text-xs font-black text-[#00DCC8] w-6 text-right">{d.A}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #007ABA, #00DCC8)',
                        boxShadow: '0 0 8px rgba(0,220,200,0.35)',
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-1.5 rounded-full bg-gradient-to-r from-[#007ABA] to-[#00DCC8]" />
                <span className="text-white/30 text-[10px]">{lang === 'ar' ? 'أنت' : 'You'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-0.5 rounded-full bg-white/15" style={{ borderTop: '1px dashed rgba(255,255,255,0.2)' }} />
                <span className="text-white/30 text-[10px]">{lang === 'ar' ? 'المتوسط' : 'Avg'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACHIEVEMENTS ────────────────────────────────────── */}
      <div className="sport-card p-6">
        <h2 className="text-base font-bold text-white mb-4">{t('achievements', lang)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {athlete.achievements.map(a => (
            <div
              key={a.id}
              className="achievement-card relative overflow-hidden bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-yellow-500/30 hover:-translate-y-1 transition-all cursor-default group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'radial-gradient(circle,rgba(234,179,8,0.1),transparent 70%)', transform: 'translate(30%,-30%)' }} />
              <div className="text-4xl mb-3">{a.icon}</div>
              <div className="text-white font-bold text-sm">{a.title}</div>
              <div className="text-white/40 text-xs mt-1 leading-relaxed">{a.description}</div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-yellow-400 text-xs font-black">+{a.points} pts</span>
                <span className="text-white/20 text-xs">{new Date(a.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECENT SESSIONS ─────────────────────────────────── */}
      <div className="sport-card p-6">
        <h2 className="text-base font-bold text-white mb-4">{t('recentSessions', lang)}</h2>
        <div className="space-y-2.5">
          {athlete.sessions.map(s => (
            <div key={s.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#00DCC8]/20 hover:bg-white/[0.07] transition-all group">
              <div className="w-11 h-11 rounded-xl bg-[#00DCC8]/12 border border-[#00DCC8]/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                {sportIcons[s.sport] || '🏅'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold">{s.facilityName}</div>
                <div className="text-white/40 text-xs mt-0.5">{s.sport} · {s.duration}min · {new Date(s.date).toLocaleDateString()}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[#00DCC8] font-black text-sm">+{s.points}</div>
                <div className="text-white/20 text-xs">pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CERTIFICATIONS ──────────────────────────────────── */}
      <div className="sport-card p-6">
        <h2 className="text-base font-bold text-white mb-4">{t('certifications', lang)}</h2>
        <div className="space-y-2.5">
          {athlete.certifications.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-xl shrink-0">📜</div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm">{c.name}</div>
                <div className="text-white/40 text-xs mt-0.5 truncate">{c.issuedBy} · {new Date(c.issuedAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-green-400 font-black text-sm">+{c.points}</span>
                {c.verified && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs">
                    ✓ {lang === 'ar' ? 'موثق' : 'Verified'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIVITY TIMELINE ───────────────────────────────── */}
      <div className="sport-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/25 flex items-center justify-center text-lg">📅</div>
          <div>
            <h2 className="text-base font-bold text-white">{lang === 'ar' ? 'الجدول الزمني' : 'Activity Timeline'}</h2>
            <p className="text-white/40 text-xs mt-0.5">{lang === 'ar' ? 'مسيرتك الرياضية' : 'Your sports journey milestones'}</p>
          </div>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/8" />
          <div className="space-y-5">
            {activityTimeline.map((item, i) => (
              <div key={i} className="flex gap-4 items-start group">
                {/* Dot */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm z-10 relative border"
                    style={{ background: `${item.color}18`, borderColor: `${item.color}40` }}>
                    {item.icon}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: item.color, background: `${item.color}15` }}>
                      {item.date}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm group-hover:text-white transition-colors">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DEMO MODE TOGGLE (floating) ─────────────────────── */}
      <div className="fixed bottom-6 right-4 z-40">
        <div className="relative">
          {showDemoMenu && (
            <div className="absolute bottom-14 right-0 bg-[#000A0F] border border-white/10 rounded-2xl p-2 shadow-2xl w-52 space-y-1">
              <div className="text-white/30 text-[10px] px-3 py-1 uppercase tracking-widest">Demo Profiles</div>
              {mockAthletes.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => { setProfileIndex(i); setShowDemoMenu(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2.5 ${
                    profileIndex === i
                      ? 'bg-[#00DCC8]/15 text-[#00DCC8] border border-[#00DCC8]/25'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-base">{i === 0 ? '⚽' : i === 1 ? '🏀' : '🏃'}</span>
                  <div>
                    <div className="font-semibold">{a.name}</div>
                    <div className="text-[10px] opacity-60">{a.level} · {a.sports.join(', ')}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowDemoMenu(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#000A0F] border border-white/15 text-white/60 hover:text-white hover:border-white/30 text-xs font-semibold transition-all shadow-lg backdrop-blur-sm"
          >
            <span>🎭</span>
            <span>Demo</span>
            <span className="text-white/30">{profileIndex + 1}/{mockAthletes.length}</span>
          </button>
        </div>
      </div>

      {/* ── SHARE MODAL ─────────────────────────────────────── */}
      {showShare && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowShare(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg,#0F2340 0%,#0A1628 100%)',
              border: `2px solid ${border}`,
              boxShadow: `${glow}, 0 25px 50px rgba(0,0,0,0.5)`,
            }}
          >
            <div className="holographic absolute inset-0 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <div className="relative p-8 text-center">
              <div className="text-6xl mb-4">🪪</div>
              <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r ${levelGradients[levelInfo.level]} text-white mb-3 shadow-lg`}>
                {t(levelInfo.level as 'Gold'|'Silver'|'Bronze'|'Platinum', lang)} {t('athleteRole', lang)}
              </div>
              <h3 className="text-2xl font-black text-white mt-2">{athlete.name}</h3>
              <p className="text-white/40 text-sm mt-0.5" dir="rtl">{athlete.nameAr}</p>

              <div className="flex justify-center gap-6 my-6">
                <div className="text-center">
                  <div className="text-3xl font-black" style={{ color: accent }}>{athlete.sportPoints}</div>
                  <div className="text-white/40 text-xs mt-1">{lang === 'ar' ? 'نقطة' : 'pts'}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400">{athlete.careerScore}</div>
                  <div className="text-white/40 text-xs mt-1">{lang === 'ar' ? 'مسار' : 'career'}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-[#00DCC8]">{athlete.sessions.length}</div>
                  <div className="text-white/40 text-xs mt-1">{lang === 'ar' ? 'جلسة' : 'sessions'}</div>
                </div>
              </div>

              <div className="flex gap-2 justify-center flex-wrap mb-5">
                {athlete.sports.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-[#00DCC8]/12 border border-[#00DCC8]/25 text-[#00DCC8] text-xs font-medium">
                    {sportIcons[s]} {s}
                  </span>
                ))}
              </div>

              <div className="text-white/20 text-xs font-mono mb-5">sportid.sa · {athlete.id}</div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleCopyShare}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: `linear-gradient(135deg,${accent}cc,${accent}88)` }}
                >
                  {copied
                    ? (lang === 'ar' ? '✓ تم النسخ!' : '✓ Copied!')
                    : (lang === 'ar' ? '📋 نسخ البطاقة' : '📋 Copy Card')}
                </button>
                <button
                  onClick={() => setShowShare(false)}
                  className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-all"
                >✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
