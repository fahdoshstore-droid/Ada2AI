import { useLang, LanguageProvider } from '@/lib/passport/LanguageContext';
import { useLocation } from 'wouter';

function Ada2aiMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs><linearGradient id="mg7" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs>
      <rect width="40" height="40" rx="9" fill="url(#mg7)"/>
      <text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text>
    </svg>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '28px',
};

const COMPLIANCE_BADGES = [
  { label: 'PDPL', sub: 'Saudi Data Law', color: '#007ABA' },
  { label: 'ISO 27001', sub: 'Info Security', color: '#00DCC8' },
  { label: 'Sport ID', sub: 'Certified', color: '#00DCC8' },
  { label: 'Vision 2030', sub: 'Aligned', color: '#FFD700' },
  { label: 'KSA Data', sub: 'Sovereignty', color: '#007ABA' },
];

const SECTIONS = (t: (en: string, ar: string) => string) => [
  {
    icon: '🔒',
    title: t('Data Protection', 'حماية البيانات'),
    color: '#007ABA',
    points: [
      t('PDPL (Saudi Personal Data Protection Law) fully compliant', 'متوافق تمامًا مع نظام حماية البيانات الشخصية السعودي (PDPL)'),
      t('ISO 27001 certified information security management', 'إدارة أمن المعلومات معتمدة بـ ISO 27001'),
      t('End-to-end encryption for all athlete data in transit and at rest', 'تشفير شامل لجميع بيانات الرياضيين أثناء النقل والتخزين'),
      t('Data residency exclusively within Saudi Arabia', 'إقامة البيانات حصريًا داخل المملكة العربية السعودية'),
    ],
  },
  {
    icon: '🎯',
    title: t('Vision 2030 Alignment', 'التوافق مع رؤية 2030'),
    color: '#FFD700',
    points: [
      t('Supports Saudi 2030 sport participation targets: 40% active population', 'يدعم أهداف المشاركة الرياضية السعودية 2030: 40٪ من السكان النشطين'),
      t('Digital transformation of national sport administration infrastructure', 'التحول الرقمي للبنية التحتية الوطنية لإدارة الرياضة'),
      t('Integrated with national identity infrastructure (Sport ID)', 'متكامل مع البنية التحتية للهوية الوطنية (Sport ID)'),
      t('Contributes to Vision 2030 quality of life and health KPIs', 'يُسهم في مؤشرات جودة الحياة والصحة لرؤية 2030'),
    ],
  },
  {
    icon: '📋',
    title: t('Audit & Transparency', 'التدقيق والشفافية'),
    color: '#00DCC8',
    points: [
      t('Complete immutable audit trails for every data access event', 'سجلات تدقيق كاملة وغير قابلة للتغيير لكل حدث وصول إلى البيانات'),
      t('Ministry of Sport has full oversight access to platform logs', 'تمتلك وزارة الرياضة صلاحية الإشراف الكامل على سجلات المنصة'),
      t('Quarterly compliance reports submitted to SDAIA', 'تقارير الامتثال الفصلية مقدَّمة إلى هيئة البيانات والذكاء الاصطناعي'),
      t('Open data exports available to authorised government bodies', 'تصدير البيانات المفتوح متاح للجهات الحكومية المخوَّلة'),
    ],
  },
  {
    icon: '👤',
    title: t('Athlete Rights', 'حقوق الرياضي'),
    color: '#00DCC8',
    points: [
      t('Right to access: view all personal data held in ada2ai', 'حق الوصول: عرض جميع البيانات الشخصية المحفوظة في ada2ai'),
      t('Right to correction: update inaccurate profile information', 'حق التصحيح: تحديث المعلومات الشخصية غير الدقيقة'),
      t('Right to deletion: request removal of non-legally-required data', 'حق الحذف: طلب إزالة البيانات غير المطلوبة قانونيًا'),
      t('Granular consent controls for data sharing with clubs and facilities', 'ضوابط موافقة دقيقة لمشاركة البيانات مع الأندية والمنشآت'),
    ],
  },
];

const FAQS = (t: (en: string, ar: string) => string) => [
  {
    q: t('Is my personal data shared with third parties?', 'هل تتم مشاركة بياناتي الشخصية مع جهات خارجية؟'),
    a: t('No personal data is shared without explicit consent. Aggregated, anonymised statistics may be shared with the Ministry of Sport for national planning. Your individual data is never sold or transferred to commercial third parties.', 'لا تتم مشاركة أي بيانات شخصية دون موافقة صريحة. قد تتم مشاركة إحصاءات مجمعة ومجهولة الهوية مع وزارة الرياضة للتخطيط الوطني. لا تُباع بياناتك الفردية أو تُنقل إلى جهات تجارية خارجية.'),
  },
  {
    q: t('Where is my data stored?', 'أين تُخزَّن بياناتي؟'),
    a: t('All athlete data is stored exclusively within Saudi Arabia on certified cloud infrastructure. ada2ai maintains strict data sovereignty — no data leaves the Kingdom of Saudi Arabia.', 'تُخزَّن جميع بيانات الرياضيين حصريًا داخل المملكة العربية السعودية على بنية تحتية سحابية معتمدة. تحافظ ada2ai على سيادة بيانات صارمة — لا تغادر أي بيانات المملكة العربية السعودية.'),
  },
  {
    q: t('How does Sport ID verification protect my identity?', 'كيف يحمي التحقق عبر Sport ID هويتي؟'),
    a: t('Sport ID uses government-grade biometric verification. After one-time verification, only a cryptographic reference (not your ID number) is stored in ada2ai. Your Absher credentials are never exposed to ada2ai systems.', 'يستخدم Sport ID تحققًا بيومتريًا بمستوى حكومي. بعد التحقق لمرة واحدة، يُخزَّن فقط مرجع تشفيري (وليس رقم هويتك) في ada2ai. لا تتعرض بيانات اعتماد أبشر الخاصة بك لأنظمة ada2ai.'),
  },
  {
    q: t('Can I delete my sport profile?', 'هل يمكنني حذف ملفي الرياضي؟'),
    a: t('Yes. You may request full account deletion at any time through the athlete app. Legally required records (e.g. official competition results) may be retained in anonymised form per PDPL Article 18.', 'نعم. يمكنك طلب حذف الحساب بالكامل في أي وقت من خلال تطبيق الرياضي. قد يتم الاحتفاظ بالسجلات المطلوبة قانونيًا (مثل نتائج المنافسات الرسمية) في شكل مجهول الهوية وفقًا للمادة 18 من نظام PDPL.'),
  },
  {
    q: t('Who audits ada2ai compliance?', 'من يراجع امتثال ada2ai؟'),
    a: t('ada2ai undergoes annual ISO 27001 certification audits by accredited third-party auditors, plus quarterly regulatory reviews submitted to SDAIA (Saudi Data and AI Authority) and the Ministry of Sport.', 'تخضع ada2ai لمراجعات سنوية لشهادة ISO 27001 من قِبل مدققين خارجيين معتمدين، بالإضافة إلى مراجعات تنظيمية فصلية مقدَّمة لهيئة البيانات والذكاء الاصطناعي ووزارة الرياضة.'),
  },
];

function GovernancePageInner() {
  const { lang, toggleLang } = useLang();
  const [, navigate] = useLocation();
  const t = (en: string, ar: string) => lang === 'ar' ? ar : en;
  const sections = SECTIONS(t);
  const faqs = FAQS(t);

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ background: '#000A0F', minHeight: '100vh', color: 'white', fontFamily: "'Cairo', sans-serif" }}>

      {/* Sticky Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(0,10,15,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Ada2aiMark size={32} />
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '15px', color: '#00DCC8' }}>ada2ai</span>
        </div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
          {t('GOVERNANCE', 'الحوكمة')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleLang} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px 12px', color: 'white', cursor: 'pointer', fontSize: '13px' }}>
            {lang === 'en' ? 'عربي' : 'EN'}
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'rgba(0,220,200,0.1)', border: '1px solid rgba(0,220,200,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#00DCC8', cursor: 'pointer', fontSize: '13px' }}>
            {lang === 'ar' ? '→ رجوع' : '← Back'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <section style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,122,186,0.12)', border: '1px solid rgba(0,122,186,0.35)', borderRadius: '100px', padding: '6px 18px', fontSize: '11px', fontFamily: "'Orbitron', monospace", letterSpacing: '0.15em', color: '#007ABA', marginBottom: '24px' }}>
            {t('GOVERNANCE', 'الحوكمة')}
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: 'clamp(24px, 4.5vw, 48px)', lineHeight: 1.1, marginBottom: '20px', background: 'linear-gradient(135deg, #ffffff, #007ABA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('Governance & Compliance', 'الحوكمة والامتثال')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            {t('ada2ai operates under Saudi Arabia\'s most rigorous data governance and regulatory framework — built for trust, transparency, and national compliance from day one.', 'تعمل ada2ai ضمن أصرم إطار للبيانات والرقابة التنظيمية في المملكة العربية السعودية — مبنية على الثقة والشفافية والامتثال الوطني منذ اليوم الأول.')}
          </p>
        </section>

        {/* Compliance Badges */}
        <section style={{ marginBottom: '72px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {COMPLIANCE_BADGES.map((badge) => (
              <div key={badge.label} style={{ background: `${badge.color}12`, border: `1px solid ${badge.color}40`, borderRadius: '12px', padding: '14px 20px', textAlign: 'center', minWidth: '120px' }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '13px', color: badge.color, marginBottom: '4px' }}>{badge.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{badge.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 governance sections */}
        <section style={{ marginBottom: '72px', display: 'grid', gap: '20px' }}>
          {sections.map((sec) => (
            <div key={sec.title} style={{ ...cardStyle, borderLeft: `3px solid ${sec.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>{sec.icon}</span>
                <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: '16px', color: sec.color, margin: 0 }}>{sec.title}</h2>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                {sec.points.map((point) => (
                  <li key={point} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    <span style={{ color: sec.color, marginTop: '3px', flexShrink: 0 }}>✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: '72px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: '22px', color: 'white', marginBottom: '28px' }}>
            {t('Frequently Asked Questions', 'الأسئلة المتكررة')}
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', color: '#00DCC8', marginBottom: '14px', fontWeight: 600, lineHeight: 1.4 }}>
                  Q{i + 1}. {faq.q}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <section style={{ textAlign: 'center', padding: '32px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', lineHeight: 1.7 }}>
            {t('ada2ai Sport Passport · POC v1.0 · March 2026 · Confidential', 'ada2ai جواز السفر الرياضي · POC v1.0 · مارس 2026 · سري')}
            <br/>
            {t('Questions about data governance? Contact: privacy@ada2ai.sa', 'أسئلة حول حوكمة البيانات؟ تواصل: privacy@ada2ai.sa')}
          </p>
        </section>

      </main>
    </div>
  );
}


export default function Governance() {
  return (
    <LanguageProvider>
      <GovernancePageInner />
    </LanguageProvider>
  );
}
