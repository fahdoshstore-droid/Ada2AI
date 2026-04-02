'use client';
import { useLang } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Ada2aiMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs><linearGradient id="mg5" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs>
      <rect width="40" height="40" rx="9" fill="url(#mg5)"/>
      <text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text>
    </svg>
  );
}

function SportIcon({ sport }: { sport: string }) {
  const icons: Record<string, string> = { speed: '⚡', strength: '💪', endurance: '🏃', technical: '🎯' };
  return <span style={{ fontSize: '36px' }}>{icons[sport] ?? '⚽'}</span>;
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
};

const PROGRAMS = [
  { key: 'speed', en: 'Speed & Agility', ar: 'السرعة والرشاقة', diffEn: 'Intermediate', diffAr: 'متوسط', dur: '8 weeks', durAr: '8 أسابيع', pts: '+240 pts' },
  { key: 'strength', en: 'Strength & Conditioning', ar: 'القوة واللياقة', diffEn: 'Advanced', diffAr: 'متقدم', dur: '12 weeks', durAr: '12 أسبوعًا', pts: '+360 pts' },
  { key: 'endurance', en: 'Endurance & Stamina', ar: 'التحمل والقدرة', diffEn: 'Beginner', diffAr: 'مبتدئ', dur: '6 weeks', durAr: '6 أسابيع', pts: '+180 pts' },
  { key: 'technical', en: 'Technical Skills', ar: 'المهارات الفنية', diffEn: 'Intermediate', diffAr: 'متوسط', dur: '10 weeks', durAr: '10 أسابيع', pts: '+300 pts' },
];

const COMING_SOON = [
  { icon: '🎥', en: 'AI Video Analysis', ar: 'تحليل الفيديو بالذكاء الاصطناعي', descEn: 'Upload training clips for instant biomechanical feedback.', descAr: 'ارفع مقاطع التدريب للحصول على تغذية راجعة بيوميكانيكية فورية.' },
  { icon: '⌚', en: 'Wearable Integration', ar: 'تكامل الأجهزة القابلة للارتداء', descEn: 'Sync Garmin, Apple Watch & Fitbit to your sport passport.', descAr: 'زامن Garmin وApple Watch وFitbit مع جواز سفرك الرياضي.' },
  { icon: '👨‍🏫', en: 'Coach Connect', ar: 'ربط المدرب', descEn: 'Get matched with certified coaches across Saudi Arabia.', descAr: 'تواصل مع مدربين معتمدين في جميع أنحاء المملكة العربية السعودية.' },
];

export default function HubPage() {
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
          {t('TRAINING HUB', 'مركز التدريب')}
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
          <div style={{ display: 'inline-block', background: 'rgba(0,220,200,0.1)', border: '1px solid rgba(0,220,200,0.3)', borderRadius: '100px', padding: '6px 18px', fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', color: '#00DCC8', marginBottom: '24px' }}>
            {t('TRAINING HUB', 'مركز التدريب')}
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 'clamp(28px, 5vw, 56px)', lineHeight: 1.1, marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff, #00DCC8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('Training Hub', 'مركز التدريب')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            {t('AI-powered training resources for Saudi athletes. Build your performance, earn Sport Points, and track every gain.', 'موارد تدريبية مدعومة بالذكاء الاصطناعي للرياضيين السعوديين. طوّر أداءك واكسب النقاط الرياضية وتتبع كل تحسن.')}
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {[
              { val: '24', label: t('Programs Available', 'برنامج متاح') },
              { val: '6', label: t('Sport Categories', 'فئة رياضية') },
              { val: 'AI', label: t('Powered Recommendations', 'توصيات بالذكاء الاصطناعي') },
            ].map((s) => (
              <div key={s.val} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '28px', color: '#00DCC8' }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Programs */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '8px' }}>
            {t('Performance Programs', 'برامج الأداء')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
            {t('Structured training programs linked to verified Sport Points — complete a program, earn your points automatically.', 'برامج تدريبية منظمة مرتبطة بنقاط رياضية موثقة — أتمم برنامجًا واكسب نقاطك تلقائيًا.')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {PROGRAMS.map((prog) => (
              <div key={prog.key} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SportIcon sport={prog.key} />
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '13px', color: '#00DCC8', lineHeight: 1.3 }}>
                  {lang === 'ar' ? prog.ar : prog.en}
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: 'rgba(0,122,186,0.15)', border: '1px solid rgba(0,122,186,0.3)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', color: '#007ABA' }}>
                    {lang === 'ar' ? prog.diffAr : prog.diffEn}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    {lang === 'ar' ? prog.durAr : prog.dur}
                  </span>
                </div>
                <div style={{ marginTop: 'auto', fontFamily: "'Orbitron', monospace", fontSize: '12px', color: '#00DCC8', fontWeight: 700 }}>{prog.pts}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Track Your Progress */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '24px' }}>
            {t('Track Your Progress', 'تتبع تقدمك')}
          </h2>
          <div style={{ background: 'rgba(0,220,200,0.04)', border: '1px solid rgba(0,220,200,0.15)', borderRadius: '16px', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { icon: '📋', title: t('Training Logs', 'سجلات التدريب'), desc: t('Every session auto-logged when you check in at a registered facility.', 'كل جلسة تُسجَّل تلقائيًا عند تسجيل دخولك في منشأة مسجلة.') },
              { icon: '🔗', title: t('Sport Points Link', 'ارتباط النقاط'), desc: t('Training logs automatically calculate and award Sport Points based on verified activity.', 'سجلات التدريب تحسب وتمنح النقاط تلقائيًا بناءً على النشاط الموثق.') },
              { icon: '🏛️', title: t('Ministry Reporting', 'تقارير الوزارة'), desc: t('Aggregated training data feeds national participation metrics for Vision 2030 tracking.', 'بيانات التدريب المجمعة تُغذي مقاييس المشاركة الوطنية لتتبع رؤية 2030.') },
            ].map((item) => (
              <div key={item.title}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', color: '#00DCC8', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '8px' }}>
            {t('Coming Soon', 'قريبًا')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '24px' }}>
            {t('Launching 2026 — powered by ada2ai AI infrastructure', 'الإطلاق في 2026 — مدعوم بالبنية التحتية لـ ada2ai')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {COMING_SOON.map((item) => (
              <div key={item.en} style={{ ...cardStyle, opacity: 0.7, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px 8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Orbitron', monospace" }}>
                  {t('SOON', 'قريبًا')}
                </div>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', color: 'rgba(0,220,200,0.7)', marginBottom: '8px' }}>
                  {lang === 'ar' ? item.ar : item.en}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>
                  {lang === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: 'center', padding: '48px 0' }}>
          <Link href="/athlete" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #007ABA, #00DCC8)', borderRadius: '12px', padding: '16px 40px', color: 'white', textDecoration: 'none', fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '15px', letterSpacing: '0.05em' }}>
            {t('Start Training →', '← ابدأ التدريب')}
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '16px' }}>
            {t('Requires Sport ID verification to earn points', 'يتطلب التحقق عبر Sport ID لكسب النقاط')}
          </p>
        </section>

      </main>
    </div>
  );
}
