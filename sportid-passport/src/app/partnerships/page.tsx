'use client';
import { useLang } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

function Ada2aiMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs><linearGradient id="mg6" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs>
      <rect width="40" height="40" rx="9" fill="url(#mg6)"/>
      <text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text>
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
};

const FEDERATIONS = [
  { en: 'Saudi Football Federation', ar: 'الاتحاد السعودي لكرة القدم', icon: '⚽' },
  { en: 'Saudi Basketball Federation', ar: 'الاتحاد السعودي لكرة السلة', icon: '🏀' },
  { en: 'Saudi Athletics Federation', ar: 'الاتحاد السعودي لألعاب القوى', icon: '🏃' },
  { en: 'Saudi Swimming Federation', ar: 'الاتحاد السعودي للسباحة', icon: '🏊' },
  { en: 'Saudi Volleyball Federation', ar: 'الاتحاد السعودي للكرة الطائرة', icon: '🏐' },
  { en: 'Saudi Tennis Federation', ar: 'الاتحاد السعودي للتنس', icon: '🎾' },
];

const TECH_PARTNERS = [
  { en: 'Cloud Infrastructure', ar: 'البنية السحابية', tag: 'AWS / Azure' },
  { en: 'Cybersecurity', ar: 'الأمن السيبراني', tag: 'ISO 27001' },
  { en: 'AI / ML Platform', ar: 'منصة الذكاء الاصطناعي', tag: 'ada2ai Core' },
  { en: 'Payment Gateway', ar: 'بوابة الدفع', tag: 'Mada / STC Pay' },
];

const GOV_PARTNERS = [
  { en: 'Ministry of Sport', ar: 'وزارة الرياضة', icon: '🏛️' },
  { en: 'Saudi Vision 2030', ar: 'رؤية السعودية 2030', icon: '🎯' },
  { en: 'Sport ID / NIC', ar: 'SPORT ID', icon: '🔐' },
  { en: 'Saudi Data & AI Authority', ar: 'هيئة البيانات والذكاء الاصطناعي', icon: '📊' },
];

export default function PartnershipsPage() {
  const { lang, toggleLang } = useLang();
  const router = useRouter();
  const t = (en: string, ar: string) => lang === 'ar' ? ar : en;
  const [form, setForm] = useState({ name: '', org: '', email: '', type: '' });

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ background: '#000A0F', minHeight: '100vh', color: 'white', fontFamily: "'Cairo', sans-serif" }}>

      {/* Sticky Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(0,10,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Ada2aiMark size={32} />
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '15px', color: '#00DCC8' }}>ada2ai</span>
        </div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
          {t('PARTNERSHIPS', 'الشراكات')}
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
            {t('ECOSYSTEM', 'النظام البيئي')}
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 'clamp(26px, 5vw, 52px)', lineHeight: 1.1, marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff, #00DCC8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('Strategic Partnerships', 'الشراكات الاستراتيجية')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            {t('ada2ai is built on a comprehensive ecosystem of Saudi sport federations, technology providers, government bodies, and facility networks — all unified under one digital identity infrastructure.', 'تُبنى ada2ai على نظام بيئي شامل من الاتحادات الرياضية السعودية ومزودي التكنولوجيا والجهات الحكومية وشبكات المنشآت — كلها موحدة تحت بنية تحتية لهوية رقمية واحدة.')}
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { val: '400+', label: t('Facilities', 'منشأة') },
              { val: '12', label: t('Federations', 'اتحاد') },
              { val: '13', label: t('Provinces', 'منطقة') },
              { val: '2026', label: t('Launch Year', 'سنة الإطلاق') },
            ].map((s) => (
              <div key={s.val} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '28px', color: '#00DCC8' }}>{s.val}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Sport Federations */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '18px', color: '#00DCC8', marginBottom: '20px' }}>
            {t('Sport Federations', 'الاتحادات الرياضية')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {FEDERATIONS.map((fed) => (
              <div key={fed.en} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,220,200,0.04)', border: '1px solid rgba(0,220,200,0.15)', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '20px' }}>{fed.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.3 }}>{lang === 'ar' ? fed.ar : fed.en}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Partners */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '18px', color: '#007ABA', marginBottom: '20px' }}>
            {t('Technology Partners', 'الشركاء التقنيون')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {TECH_PARTNERS.map((tech) => (
              <div key={tech.en} style={cardStyle}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>{lang === 'ar' ? tech.ar : tech.en}</div>
                <div style={{ fontFamily: "monospace", fontSize: '11px', color: '#007ABA' }}>{tech.tag}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Facility Network */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '18px', color: '#00DCC8', marginBottom: '20px' }}>
            {t('Facility Network', 'شبكة المنشآت')}
          </h2>
          <div style={{ background: 'rgba(0,220,200,0.04)', border: '1px solid rgba(0,220,200,0.15)', borderRadius: '16px', padding: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {[
              { num: '180+', type: t('Gyms & Fitness Centres', 'صالات رياضية ومراكز لياقة') },
              { num: '85+', type: t('Stadiums & Arenas', 'ملاعب وصالات') },
              { num: '95+', type: t('Sport Academies', 'أكاديميات رياضية') },
              { num: '40+', type: t('University Facilities', 'منشآت جامعية') },
            ].map((f) => (
              <div key={f.num} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '26px', color: '#00DCC8', marginBottom: '6px' }}>{f.num}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>{f.type}</div>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '12px' }}>
            {t('Across all 13 Saudi provinces — from Riyadh to Tabuk, Jizan to Ha\'il.', 'عبر جميع المناطق الـ 13 في المملكة العربية السعودية — من الرياض إلى تبوك، ومن جازان إلى حائل.')}
          </p>
        </section>

        {/* Government Partners */}
        <section style={{ marginBottom: '64px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '18px', color: '#007ABA', marginBottom: '20px' }}>
            {t('Government Partners', 'الشركاء الحكوميون')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
            {GOV_PARTNERS.map((gov) => (
              <div key={gov.en} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,122,186,0.08)', border: '1px solid rgba(0,122,186,0.2)', borderRadius: '12px', padding: '16px' }}>
                <span style={{ fontSize: '20px' }}>{gov.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.3 }}>{lang === 'ar' ? gov.ar : gov.en}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Partner with ada2ai */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '8px' }}>
            {t('Partner with ada2ai', 'انضم كشريك مع ada2ai')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginBottom: '28px' }}>
            {t('Interested in joining the Saudi sport identity ecosystem? Contact us below.', 'مهتم بالانضمام إلى منظومة الهوية الرياضية السعودية؟ تواصل معنا أدناه.')}
          </p>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { id: 'name', label: t('Full Name', 'الاسم الكامل'), type: 'text', ph: t('Your name', 'اسمك') },
              { id: 'org', label: t('Organisation', 'المنظمة'), type: 'text', ph: t('Organisation name', 'اسم المنظمة') },
              { id: 'email', label: t('Email Address', 'البريد الإلكتروني'), type: 'email', ph: 'name@org.sa' },
              { id: 'type', label: t('Partnership Type', 'نوع الشراكة'), type: 'text', ph: t('Federation / Facility / Tech / Gov', 'اتحاد / منشأة / تقنية / حكومة') },
            ].map((field) => (
              <div key={field.id}>
                <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.05em' }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.ph}
                  value={form[field.id as keyof typeof form]}
                  onChange={(e) => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <button style={{ background: 'linear-gradient(135deg, #007ABA, #00DCC8)', border: 'none', borderRadius: '10px', padding: '14px 32px', color: 'white', fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.05em' }}>
                {t('Submit Partnership Enquiry →', '← إرسال استفسار الشراكة')}
              </button>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '10px' }}>
                {t('This is a demo form — not functional in POC mode.', 'هذا نموذج تجريبي — غير وظيفي في وضع إثبات المفهوم.')}
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
