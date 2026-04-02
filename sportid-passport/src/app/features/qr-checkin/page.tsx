'use client';
import { useLang } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Ada2aiMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs><linearGradient id="mg2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs>
      <rect width="40" height="40" rx="9" fill="url(#mg2)"/>
      <text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text>
    </svg>
  );
}

function QRCodeSVG() {
  /* 21×21 QR-style pattern — manually crafted representative pattern */
  const modules = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,0],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1,0,0],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1,0,0],
    [1,0,1,1,1,0,1,0,0,1,1,1,1,0,1,1,1,0,1,0,0],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1,0,0],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
    [0,1,0,0,1,0,0,1,1,0,0,1,0,1,0,0,1,0,0,1,0],
    [1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1],
    [0,0,1,1,0,0,0,1,0,1,1,0,0,1,0,0,0,1,0,0,1],
    [1,1,1,1,1,0,1,0,0,0,1,0,1,1,1,1,1,0,1,0,0],
    [0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,0,1,1,0,1,0,0,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,1,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,1,1,0,1,0,1,0,0,1,1,0,0,1],
    [1,1,1,1,1,1,1,0,0,0,1,0,1,0,1,1,0,0,1,0,1],
  ];
  const cell = 9;
  const size = 21 * cell;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '12px', background: 'rgba(0,220,200,0.06)', padding: '12px' }}>
        <rect width={size} height={size} fill="rgba(0,10,15,0.8)" rx="8"/>
        {modules.map((row, r) =>
          row.map((col, c) =>
            col ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell + 1}
                y={r * cell + 1}
                width={cell - 2}
                height={cell - 2}
                rx="2"
                fill={r < 7 && c < 7 ? '#00DCC8' : r < 7 && c > 13 ? '#007ABA' : r > 13 && c < 7 ? '#007ABA' : 'rgba(0,220,200,0.8)'}
              />
            ) : null
          )
        )}
      </svg>
      {/* Scanning beam */}
      <div style={{
        position: 'absolute', left: '12px', right: '12px', height: '3px',
        background: 'linear-gradient(90deg, transparent, #00DCC8, transparent)',
        top: '50%', borderRadius: '2px', boxShadow: '0 0 12px #00DCC8',
        animation: 'scanBeam 2s ease-in-out infinite',
      }}/>
      <style>{`@keyframes scanBeam { 0%,100%{top:15%} 50%{top:85%} }`}</style>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
};

export default function QRCheckinPage() {
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
          {t('QR CHECK-IN', 'تسجيل QR')}
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
        <section style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '36px' }}>
            <QRCodeSVG />
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(0,122,186,0.12)', border: '1px solid rgba(0,122,186,0.35)', borderRadius: '100px', padding: '6px 18px', fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', color: '#007ABA', marginBottom: '24px' }}>
            {t('ACCESS SYSTEM', 'نظام الوصول')}
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.1, marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff, #00DCC8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('Instant QR Check-In', 'تسجيل الدخول الفوري بـ QR')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            {t('Athletes show their ada2ai QR code at any registered facility. Verified in real time. Attendance logged automatically. Under 3 seconds.', 'يعرض الرياضيون رمز QR الخاص بـ ada2ai في أي منشأة مسجلة. يتم التحقق في الوقت الفعلي. يُسجَّل الحضور تلقائيًا. في أقل من 3 ثوان.')}
          </p>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '32px' }}>
            {t('How It Works', 'كيف يعمل')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { step: '01', icon: '📱', title: t('Open App', 'افتح التطبيق'), desc: t('Launch the ada2ai Sport Passport app on your phone.', 'شغّل تطبيق ada2ai على هاتفك.') },
              { step: '02', icon: '🔲', title: t('Tap Show QR', 'اضغط "عرض QR"'), desc: t('Your unique encrypted QR code appears instantly — refreshes every 15 minutes.', 'يظهر رمز QR المشفر الفريد فورًا — يتجدد كل 15 دقيقة.') },
              { step: '03', icon: '📡', title: t('Scan at Entrance', 'امسح عند المدخل'), desc: t('Hold up your QR code at the facility entrance scanner.', 'ارفع رمز QR الخاص بك أمام ماسح مدخل المنشأة.') },
              { step: '04', icon: '✅', title: t('Access Granted', 'تم منح الوصول'), desc: t('Green VERIFIED — access granted and attendance logged in real time.', 'موثق بالأخضر — تم منح الوصول وتسجيل الحضور في الوقت الفعلي.') },
            ].map((item) => (
              <div key={item.step} style={cardStyle}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', color: '#007ABA', marginBottom: '10px', letterSpacing: '0.1em' }}>STEP {item.step}</div>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '13px', color: '#00DCC8', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key numbers */}
        <section style={{ marginBottom: '72px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { val: '<3s', label: t('Scan Time', 'وقت المسح') },
              { val: '0', label: t('Physical Cards', 'بطاقات مادية') },
              { val: '400+', label: t('Registered Facilities', 'منشأة مسجلة') },
              { val: '24/7', label: t('Real-Time Logging', 'تسجيل فوري') },
            ].map((s) => (
              <div key={s.val} style={{ ...cardStyle, textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '26px', color: '#00DCC8', marginBottom: '8px' }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* QR Contents */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '24px' }}>
            {t('What the QR Contains', 'ما يحتويه رمز QR')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: 'rgba(0,220,200,0.04)', border: '1px solid rgba(0,220,200,0.15)', borderRadius: '16px', padding: '28px' }}>
              <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', color: '#00DCC8', marginBottom: '20px' }}>{t('ENCRYPTED PAYLOAD', 'البيانات المشفرة')}</h3>
              {[
                { key: t('Athlete ID', 'معرف الرياضي'), val: t('Encrypted hash', 'تجزئة مشفرة') },
                { key: t('Verification Token', 'رمز التحقق'), val: t('JWT signed', 'JWT موقَّع') },
                { key: t('Expiry Timestamp', 'وقت الانتهاء'), val: t('15-min TTL', 'مدة 15 دقيقة') },
                { key: t('Sport Type', 'نوع الرياضة'), val: t('Encoded enum', 'ترميز رياضي') },
                { key: t('Club ID', 'معرف النادي'), val: t('Hashed reference', 'مرجع مجزأ') },
              ].map((row) => (
                <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{row.key}</span>
                  <span style={{ color: '#00DCC8', fontFamily: 'monospace' }}>{row.val}</span>
                </div>
              ))}
            </div>

            {/* Mock scanner result */}
            <div style={{ background: 'rgba(0,255,128,0.04)', border: '2px solid rgba(0,220,200,0.4)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px', letterSpacing: '0.1em' }}>{t('FACILITY SCANNER VIEW', 'عرض ماسح المنشأة')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00DCC8', boxShadow: '0 0 8px #00DCC8' }}/>
                <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '16px', color: '#00DCC8' }}>VERIFIED</span>
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>⚽ {t('Football · Al-Riyadh Club', 'كرة القدم · نادي الرياض')}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>2026-03-20 · 09:42:17 AST</div>
              <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(0,220,200,0.7)' }}>{t('Identity confirmed via Sport ID', 'تم تأكيد الهوية عبر Sport ID')}</div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '24px' }}>
            {t('Privacy & Security', 'الخصوصية والأمان')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { icon: '🔄', title: t('15-Min Refresh', 'تجديد كل 15 دقيقة'), desc: t('QR code expires and regenerates every 15 minutes — preventing screenshot reuse.', 'ينتهي رمز QR ويتجدد كل 15 دقيقة — يمنع إعادة استخدام لقطات الشاشة.') },
              { icon: '🔒', title: t('Zero Personal Data', 'لا بيانات شخصية'), desc: t('No name, no ID number exposed to the scanner. Only a cryptographic reference.', 'لا يُكشف عن اسم أو رقم هوية للماسح. فقط مرجع تشفيري.') },
              { icon: '🛡️', title: t('End-to-End Encrypted', 'تشفير شامل'), desc: t('All QR payloads are signed with RSA-2048 and verified server-side in real time.', 'جميع حمولات QR موقَّعة بـ RSA-2048 وتتحقق منها الخادم في الوقت الفعلي.') },
            ].map((item) => (
              <div key={item.title} style={cardStyle}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', color: '#00DCC8', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '48px 0' }}>
          <Link href="/athlete" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #007ABA, #00DCC8)', borderRadius: '12px', padding: '16px 40px', color: 'white', textDecoration: 'none', fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '15px', letterSpacing: '0.05em' }}>
            {t('View Your QR Code →', '← عرض رمز QR الخاص بك')}
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '16px' }}>
            {t('Works at 400+ registered facilities across Saudi Arabia', 'يعمل في أكثر من 400 منشأة مسجلة في المملكة العربية السعودية')}
          </p>
        </section>

      </main>
    </div>
  );
}
