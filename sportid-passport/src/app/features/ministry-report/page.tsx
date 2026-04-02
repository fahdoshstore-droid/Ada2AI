'use client';
import { useLang } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Ada2aiMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs><linearGradient id="mg4" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs>
      <rect width="40" height="40" rx="9" fill="url(#mg4)"/>
      <text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text>
    </svg>
  );
}

function DashboardSVG() {
  const provinces = [
    { name: 'RUH', val: 87, color: '#00DCC8' },
    { name: 'JED', val: 72, color: '#007ABA' },
    { name: 'DAM', val: 65, color: '#00DCC8' },
    { name: 'MAK', val: 54, color: '#007ABA' },
    { name: 'MED', val: 48, color: '#00DCC8' },
    { name: 'QAS', val: 38, color: '#007ABA' },
    { name: 'TAB', val: 30, color: '#00DCC8' },
  ];
  const sports = [
    { sport: 'Football', pct: 42, color: '#00DCC8' },
    { sport: 'Basketball', pct: 18, color: '#007ABA' },
    { sport: 'Swimming', pct: 15, color: '#FFD700' },
    { sport: 'Athletics', pct: 14, color: '#CD7F32' },
    { sport: 'Other', pct: 11, color: 'rgba(255,255,255,0.3)' },
  ];
  return (
    <svg width="480" height="220" viewBox="0 0 480 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dashboard frame */}
      <rect width="480" height="220" rx="16" fill="rgba(0,10,15,0.6)" stroke="rgba(0,220,200,0.2)" strokeWidth="1"/>
      {/* Title bar */}
      <rect width="480" height="36" rx="16" fill="rgba(0,220,200,0.07)"/>
      <rect x="0" y="20" width="480" height="16" fill="rgba(0,220,200,0.07)"/>
      <circle cx="18" cy="18" r="5" fill="#FF5F57"/>
      <circle cx="34" cy="18" r="5" fill="#FEBC2E"/>
      <circle cx="50" cy="18" r="5" fill="#28C840"/>
      <text x="70" y="22" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="'Orbitron', monospace">MINISTRY SPORT ANALYTICS · LIVE</text>
      <circle cx="448" cy="18" r="4" fill="#00DCC8" opacity="0.8"/>

      {/* Bar chart — provinces */}
      <text x="20" y="56" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="'Orbitron', monospace">PARTICIPATION BY PROVINCE</text>
      {provinces.map((p, i) => (
        <g key={p.name}>
          <rect x={20 + i * 34} y={60 + (90 - p.val)} width="26" height={p.val} rx="3" fill={p.color} fillOpacity="0.7"/>
          <text x={20 + i * 34 + 13} y="162" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{p.name}</text>
          <text x={20 + i * 34 + 13} y={56 + (90 - p.val)} fontSize="8" textAnchor="middle" fill={p.color}>{p.val}</text>
        </g>
      ))}

      {/* Divider */}
      <line x1="265" y1="44" x2="265" y2="210" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>

      {/* Pie-style legend */}
      <text x="280" y="56" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="'Orbitron', monospace">SPORT BREAKDOWN</text>
      {sports.map((s, i) => (
        <g key={s.sport}>
          <rect x="280" y={66 + i * 26} width={s.pct * 1.6} height="16" rx="4" fill={s.color} fillOpacity="0.6"/>
          <text x={280 + s.pct * 1.6 + 6} y={78 + i * 26} fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{s.sport} {s.pct}%</text>
        </g>
      ))}

      {/* Saudi map outline — abstract */}
      <path d="M180 175 L200 165 L225 168 L235 180 L230 195 L210 200 L185 195 Z" fill="rgba(0,122,186,0.15)" stroke="rgba(0,122,186,0.4)" strokeWidth="1"/>
      <text x="207" y="185" textAnchor="middle" fontSize="8" fill="#007ABA" fontFamily="monospace">KSA</text>
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
};

export default function MinistryReportPage() {
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
          {t('MINISTRY ANALYTICS', 'تحليلات الوزارة')}
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', overflowX: 'auto' }}>
            <DashboardSVG />
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(0,122,186,0.12)', border: '1px solid rgba(0,122,186,0.35)', borderRadius: '100px', padding: '6px 18px', fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', color: '#007ABA', marginBottom: '24px' }}>
            {t('MINISTRY LAYER', 'طبقة الوزارة')}
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 'clamp(26px, 5vw, 48px)', lineHeight: 1.1, marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff, #007ABA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('Live Ministry Analytics', 'تحليلات الوزارة الحية')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.7 }}>
            {t('Ministry of Sport officials access real-time dashboards showing participation, performance, and compliance data across all 13 Saudi provinces — powered by verified ada2ai sport passport data.', 'يصل مسؤولو وزارة الرياضة إلى لوحات معلومات في الوقت الفعلي تُظهر بيانات المشاركة والأداء والامتثال عبر جميع المناطق الـ 13 في المملكة — مدعومة ببيانات جواز السفر الرياضي الموثق من ada2ai.')}
          </p>
        </section>

        {/* What dashboard shows */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '24px' }}>
            {t('What the Dashboard Shows', 'ما تُظهره اللوحة')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { icon: '👥', label: t('Active Athletes by Province', 'الرياضيون النشطون بالمنطقة') },
              { icon: '⚽', label: t('Sport Type Breakdown', 'تفصيل أنواع الرياضات') },
              { icon: '🏟️', label: t('Facility Utilisation Rates', 'معدلات استخدام المنشآت') },
              { icon: '🏅', label: t('Top Performing Clubs', 'الأندية الأعلى أداءً') },
              { icon: '📊', label: t('National KPIs vs Vision 2030', 'مؤشرات الأداء مقابل رؤية 2030') },
              { icon: '📍', label: t('Geographic Heat Maps', 'خرائط حرارية جغرافية') },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,122,186,0.08)', border: '1px solid rgba(0,122,186,0.18)', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '22px' }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Data flow */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '28px' }}>
            {t('Data Flow', 'تدفق البيانات')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexWrap: 'wrap' }}>
            {[
              { label: t('Athletes', 'الرياضيون'), icon: '🏃', color: '#00DCC8' },
              { arrow: true },
              { label: t('ada2ai Platform', 'منصة ada2ai'), icon: '⚡', color: '#007ABA' },
              { arrow: true },
              { label: t('Ministry Dashboard', 'لوحة الوزارة'), icon: '🏛️', color: '#00DCC8' },
            ].map((item, i) =>
              'arrow' in item ? (
                <div key={i} style={{ color: '#007ABA', fontSize: '24px', margin: '0 8px' }}>→</div>
              ) : (
                <div key={i} style={{ background: `${item.color}11`, border: `1px solid ${item.color}30`, borderRadius: '12px', padding: '16px 24px', textAlign: 'center', minWidth: '140px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '11px', color: item.color }}>{item.label}</div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Access levels */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '24px' }}>
            {t('Access Levels', 'مستويات الوصول')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { level: t('Federal Ministry', 'الوزارة الاتحادية'), scope: t('All provinces · All sports · Full KPI suite', 'جميع المناطق · جميع الرياضات · مجموعة مؤشرات الأداء الكاملة'), color: '#00DCC8' },
              { level: t('Regional Director', 'المدير الإقليمي'), scope: t('Province-level data · Regional clubs · Regional facilities', 'بيانات مستوى المنطقة · الأندية الإقليمية · المنشآت الإقليمية'), color: '#007ABA' },
              { level: t('Club Admin', 'مدير النادي'), scope: t('Club athletes only · Club check-ins · Club performance', 'رياضيو النادي فقط · تسجيلات النادي · أداء النادي'), color: 'rgba(255,255,255,0.5)' },
            ].map((item) => (
              <div key={item.level} style={{ ...cardStyle, borderLeft: `3px solid ${item.color}` }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '13px', color: item.color, marginBottom: '10px' }}>{item.level}</div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.6 }}>{item.scope}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section style={{ marginBottom: '72px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { val: '13', label: t('Provinces Covered', 'منطقة مشمولة') },
              { val: 'Live', label: t('Data Updates', 'تحديثات البيانات') },
              { val: '99.9%', label: t('Uptime SLA', 'اتفاقية التشغيل') },
              { val: 'PDF/XLS', label: t('Export Formats', 'صيغ التصدير') },
            ].map((s) => (
              <div key={s.val} style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '24px', color: '#007ABA', marginBottom: '8px' }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section style={{ marginBottom: '72px' }}>
          <div style={{ background: 'rgba(0,122,186,0.07)', border: '1px solid rgba(0,122,186,0.2)', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '15px', color: '#007ABA', marginBottom: '16px' }}>
              {t('Compliance & Privacy', 'الامتثال والخصوصية')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                t('PDPL Compliant — Saudi data law', 'متوافق مع PDPL — نظام البيانات السعودي'),
                t('Anonymized aggregation — no individual exposure', 'تجميع مجهول الهوية — لا تعرض فردي'),
                t('Full audit trails with timestamps', 'سجلات تدقيق كاملة مع الطوابع الزمنية'),
                t('Export to official government formats', 'تصدير إلى الصيغ الحكومية الرسمية'),
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ color: '#007ABA', marginTop: '2px', flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '48px 0' }}>
          <Link href="/ministry" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #007ABA, #00DCC8)', borderRadius: '12px', padding: '16px 40px', color: 'white', textDecoration: 'none', fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '15px', letterSpacing: '0.05em' }}>
            {t('Open Ministry Dashboard →', '← فتح لوحة الوزارة')}
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '16px' }}>
            {t('Access requires Ministry credentials · PDPL compliant', 'الوصول يتطلب بيانات اعتماد الوزارة · متوافق مع PDPL')}
          </p>
        </section>

      </main>
    </div>
  );
}
