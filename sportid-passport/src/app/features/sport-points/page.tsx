'use client';
import { useLang } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Ada2aiMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs><linearGradient id="mg3" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs>
      <rect width="40" height="40" rx="9" fill="url(#mg3)"/>
      <text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text>
    </svg>
  );
}

function LeaderboardSVG() {
  const bars = [
    { x: 30, h: 90, color: '#007ABA', rank: 2 },
    { x: 90, h: 130, color: '#00DCC8', rank: 1 },
    { x: 150, h: 60, color: '#007ABA', rank: 3 },
    { x: 210, h: 45, color: 'rgba(0,122,186,0.5)', rank: 4 },
    { x: 270, h: 30, color: 'rgba(0,122,186,0.35)', rank: 5 },
  ];
  return (
    <svg width="320" height="180" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00DCC8"/>
          <stop offset="100%" stopColor="#007ABA" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[40, 80, 120, 160].map(y => (
        <line key={y} x1="10" y1={y} x2="310" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      ))}
      {/* Bars */}
      {bars.map((bar) => (
        <g key={bar.rank}>
          <rect x={bar.x} y={170 - bar.h} width="40" height={bar.h} rx="6" fill={bar.color} fillOpacity="0.7"/>
          {/* Star on top */}
          {bar.rank === 1 && (
            <text x={bar.x + 20} y={170 - bar.h - 8} textAnchor="middle" fontSize="14" fill="#FFD700">★</text>
          )}
          {/* Rank number */}
          <text x={bar.x + 20} y="178" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="'Orbitron', monospace">#{bar.rank}</text>
        </g>
      ))}
      {/* Points labels */}
      <text x="110" y={170 - 130 - 14} textAnchor="middle" fontSize="11" fill="#00DCC8" fontFamily="'Orbitron', monospace" fontWeight="700">2840</text>
      <text x="50" y={170 - 90 - 8} textAnchor="middle" fontSize="10" fill="#007ABA" fontFamily="monospace">2310</text>
      <text x="170" y={170 - 60 - 8} textAnchor="middle" fontSize="10" fill="#007ABA" fontFamily="monospace">1850</text>
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
};

const TIERS = [
  { name: 'Bronze', nameAr: 'برونز', range: '0 – 499', color: '#CD7F32', width: '15%' },
  { name: 'Silver', nameAr: 'فضة', range: '500 – 1,499', color: '#C0C0C0', width: '25%' },
  { name: 'Gold', nameAr: 'ذهب', range: '1,500 – 3,999', color: '#FFD700', width: '35%' },
  { name: 'Elite', nameAr: 'نخبة', range: '4,000+', color: '#00DCC8', width: '25%' },
];

const LEADERBOARD = [
  { rank: 1, name: 'A. Al-Shamri', sport: 'Football', pts: 2840 },
  { rank: 2, name: 'K. Al-Harbi', sport: 'Basketball', pts: 2310 },
  { rank: 3, name: 'M. Al-Qahtani', sport: 'Swimming', pts: 1850 },
  { rank: 4, name: 'F. Al-Zahrani', sport: 'Athletics', pts: 1240 },
  { rank: 5, name: 'S. Al-Otaibi', sport: 'Volleyball', pts: 890 },
];

export default function SportPointsPage() {
  const { lang, toggleLang } = useLang();
  const router = useRouter();
  const t = (en: string, ar: string) => lang === 'ar' ? ar : en;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ background: '#000A0F', minHeight: '100vh', color: 'white', fontFamily: "'Cairo', sans-serif" }}>

      {/* Sticky Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(0,10,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Ada2aiMark size={32} />
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '15px', color: '#00DCC8' }}>ada2ai</span>
        </div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
          {t('SPORT POINTS', 'النقاط الرياضية')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleLang} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 12px', color: 'white', cursor: 'pointer', fontSize: '13px' }}>
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(0,220,200,0.1)', border: '1px solid rgba(0,220,200,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#00DCC8', cursor: 'pointer', fontSize: '13px' }}>
            {lang === 'ar' ? '→ رجوع' : '← Back'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <section style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <LeaderboardSVG />
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '100px', padding: '6px 18px', fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', color: '#FFD700', marginBottom: '24px' }}>
            {t('PERFORMANCE ENGINE', 'محرك الأداء')}
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.1, marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff, #00DCC8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('Sport Points System', 'نظام النقاط الرياضية')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            {t('Athletes earn Sport Points through verified activities — sessions, competitions, performance gains, facility check-ins, and ministry events. Every action is tracked and rewarded.', 'يكسب الرياضيون نقاطًا رياضية من خلال الأنشطة الموثقة — الجلسات والمنافسات وتحسين الأداء وتسجيلات الحضور وفعاليات الوزارة. كل إجراء يُتتبع ويُكافأ.')}
          </p>
        </section>

        {/* Point categories */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '28px' }}>
            {t('Point Categories', 'فئات النقاط')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {[
              { icon: '🏃', cat: t('Training Points', 'نقاط التدريب'), desc: t('Earned for attendance and completed training sessions at registered facilities.', 'تُكسب مقابل الحضور وإتمام جلسات التدريب في المنشآت المسجلة.'), color: '#007ABA' },
              { icon: '🏆', cat: t('Competition Points', 'نقاط المنافسة'), desc: t('Awarded for participating in matches, leagues, and tournaments — scaled by level.', 'تُمنح مقابل المشاركة في المباريات والدوريات والبطولات — مُدرَّجة حسب المستوى.'), color: '#FFD700' },
              { icon: '📈', cat: t('Performance Points', 'نقاط الأداء'), desc: t('Unlocked when verifiable metric improvements are recorded: speed, strength, endurance.', 'تُفتَح عند تسجيل تحسينات قابلة للتحقق في المقاييس: السرعة والقوة والتحمل.'), color: '#00DCC8' },
              { icon: '🎖️', cat: t('Achievement Points', 'نقاط الإنجازات'), desc: t('Bonus points for milestones, badges, national records, and ministry programme completion.', 'نقاط مكافأة على المعالم والشارات والأرقام الوطنية وإتمام برامج الوزارة.'), color: '#CD7F32' },
            ].map((item) => (
              <div key={item.cat} style={{ ...cardStyle, borderTop: `2px solid ${item.color}40` }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '13px', color: item.color, marginBottom: '8px' }}>{item.cat}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Status Tiers */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '28px' }}>
            {t('Status Tiers', 'مستويات الحالة')}
          </h2>
          {/* Tier bar */}
          <div style={{ display: 'flex', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', height: '56px' }}>
            {TIERS.map((tier) => (
              <div key={tier.name} style={{ flex: tier.width, background: `${tier.color}22`, borderRight: `2px solid ${tier.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '11px', fontWeight: 700, color: tier.color }}>{lang === 'ar' ? tier.nameAr : tier.name}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{tier.range}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {TIERS.map((tier) => (
              <div key={tier.name} style={{ background: `${tier.color}0D`, border: `1px solid ${tier.color}30`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 700, color: tier.color, marginBottom: '6px' }}>{lang === 'ar' ? tier.nameAr : tier.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{tier.range} {t('pts', 'نقطة')}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample athlete card + Leaderboard */}
        <section style={{ marginBottom: '72px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px' }}>
          {/* Athlete card */}
          <div style={{ background: 'rgba(0,220,200,0.05)', border: '1px solid rgba(0,220,200,0.2)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px', letterSpacing: '0.1em' }}>{t('SAMPLE PROFILE', 'ملف نموذجي')}</div>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚽</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '4px' }}>Ahmed Al-Shamri</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>Football · Al-Riyadh Club</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '36px', color: '#00DCC8', marginBottom: '4px' }}>2,840</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>{t('Sport Points', 'نقطة رياضية')}</div>
            <div style={{ background: '#FFD70020', border: '1px solid #FFD70040', borderRadius: '8px', padding: '8px 14px', display: 'inline-block' }}>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', color: '#FFD700', fontWeight: 700 }}>★ {t('GOLD TIER', 'مستوى ذهب')}</span>
            </div>
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#00DCC8' }}>+120 {t('this month', 'هذا الشهر')} ↑</div>
          </div>

          {/* Leaderboard */}
          <div style={cardStyle}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', color: '#00DCC8', marginBottom: '20px', letterSpacing: '0.08em' }}>{t('TOP ATHLETES', 'أفضل الرياضيين')}</div>
            {LEADERBOARD.map((row) => (
              <div key={row.rank} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', color: row.rank === 1 ? '#FFD700' : 'rgba(255,255,255,0.35)', width: '20px' }}>#{row.rank}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>{row.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{row.sport}</div>
                </div>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', color: '#00DCC8', fontWeight: 700 }}>{row.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Ministry use */}
        <section style={{ marginBottom: '72px' }}>
          <div style={{ background: 'rgba(0,122,186,0.08)', border: '1px solid rgba(0,122,186,0.2)', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '16px', color: '#007ABA', marginBottom: '12px' }}>
              {t('Ministry Use', 'استخدام الوزارة')}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', lineHeight: 1.7 }}>
              {t('Aggregated sport points data feeds Ministry of Sport dashboards with verified participation metrics — powering Vision 2030 KPI tracking, policy decisions, and national talent identification. Every point earned contributes to Saudi Arabia\'s sport development story.', 'تُغذي بيانات النقاط الرياضية المجمعة لوحات معلومات وزارة الرياضة بمقاييس مشاركة موثقة — تدعم تتبع مؤشرات رؤية 2030 وقرارات السياسة وتحديد المواهب الوطنية. كل نقطة مكتسبة تُسهم في قصة التطوير الرياضي السعودي.')}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '48px 0' }}>
          <Link href="/athlete/points" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #007ABA, #00DCC8)', borderRadius: '12px', padding: '16px 40px', color: 'white', textDecoration: 'none', fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '15px', letterSpacing: '0.05em' }}>
            {t('Check Your Points →', '← تحقق من نقاطك')}
          </Link>
        </section>

      </main>
    </div>
  );
}
