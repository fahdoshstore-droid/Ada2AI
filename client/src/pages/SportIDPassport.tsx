import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLang, LanguageProvider } from '@/lib/passport/LanguageContext';
import { t } from '@/lib/passport/i18n';
import BackButton from '@/components/BackButton';

/* ── ada2ai "A" Logo Mark ── */
function Ada2aiMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="markG" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#007ABA" />
          <stop offset="100%" stopColor="#00DCC8" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="9" fill="url(#markG)" />
      <text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text>
    </svg>
  );
}

/* ── PDF System Icons ── */
function SysIcon({ type, size = 16 }: { type: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: '#00DCC8', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'USER_TRACK')   return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
  if (type === 'QR_VERIFY')    return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 17h3M17 14v3"/></svg>;
  if (type === 'POWER_STAT')   return <svg {...p}><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>;
  if (type === 'MINISTRY')     return <svg {...p}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>;
  if (type === 'AI_ANALYTICS') return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>;
  if (type === 'GEO_TRACK')    return <svg {...p}><path d="M12 22s-8-6-8-12a8 8 0 0 1 16 0c0 6-8 12-8 12z"/><circle cx="12" cy="10" r="3"/></svg>;
  if (type === 'SHIELD')       return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  if (type === 'CHART')        return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  return <svg {...p}><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg>;
}

function LandingPageInner() {
  const [, navigate] = useLocation();
  const { lang, toggleLang } = useLang();
  const [loading,    setLoading]    = useState(false);
  const [dropdown,   setDropdown]   = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  async function handleEnter() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    navigate('/passport/athlete');
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdown(null);
      }
      setMobileMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);



  return (
    <>
    <div className="min-h-screen bg-[#000A0F] flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#000A0F]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Ada2aiMark size={36} />
            <span className="font-black text-white text-base font-orbitron tracking-wide leading-none">
              ada<span className="text-[#00DCC8]">2</span>ai
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 text-sm" ref={dropRef}>
            <a href="/" className="px-3.5 py-2 rounded-lg text-[13px] font-cairo text-white bg-[#00DCC8]/10 border border-[#00DCC8]/20 select-none">
              {lang === 'ar' ? 'المنتج' : 'Product'}
            </a>
            <a href="/passport/hub" className="px-3.5 py-2 rounded-lg text-[13px] font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all select-none">
              {lang === 'ar' ? 'مركز التدريب' : 'Training Hub'}
            </a>
            <a href="/passport/partnerships" className="px-3.5 py-2 rounded-lg text-[13px] font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all select-none">
              {lang === 'ar' ? 'الشراكات' : 'Partnerships'}
            </a>

            {/* Governance dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdown(d => d === 'gov' ? null : 'gov')}
                className="px-3.5 py-2 rounded-lg text-[13px] font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all select-none flex items-center gap-1"
              >
                {lang === 'ar' ? 'الحوكمة' : 'Governance'}
                <span className="text-[10px] opacity-60">{dropdown === 'gov' ? '▲' : '▾'}</span>
              </button>
              {dropdown === 'gov' && (
                <div className="absolute top-full mt-1 left-0 w-52 rounded-xl border overflow-hidden z-50 py-1"
                  style={{ background: 'rgba(5,18,30,0.98)', borderColor: 'rgba(0,122,186,0.25)', backdropFilter: 'blur(12px)' }}>
                  {[
                    { en: 'Data Governance',   ar: 'حوكمة البيانات',   href: '/passport/governance' },
                    { en: 'Compliance',         ar: 'الامتثال',          href: '/passport/governance' },
                    { en: 'Vision 2030 Alignment', ar: 'رؤية 2030',     href: '/passport/governance' },
                    { en: 'Audit Reports',      ar: 'تقارير التدقيق',   href: '/passport/governance' },
                  ].map(item => (
                    <a key={item.en} href={item.href} onClick={() => setDropdown(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-white/55 hover:text-white hover:bg-white/5 transition-colors text-[12px] font-cairo">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00DCC8]/50" />
                      {lang === 'ar' ? item.ar : item.en}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboards dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdown(d => d === 'dash' ? null : 'dash')}
                className="px-3.5 py-2 rounded-lg text-[13px] font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all select-none flex items-center gap-1"
              >
                {lang === 'ar' ? 'لوحات التحكم' : 'Dashboards'}
                <span className="text-[10px] opacity-60">{dropdown === 'dash' ? '▲' : '▾'}</span>
              </button>
              {dropdown === 'dash' && (
                <div className="absolute top-full mt-1 left-0 w-52 rounded-xl border overflow-hidden z-50 py-1"
                  style={{ background: 'rgba(5,18,30,0.98)', borderColor: 'rgba(0,122,186,0.25)', backdropFilter: 'blur(12px)' }}>
                  {[
                    { en: 'Athlete Dashboard',  ar: 'لوحة الرياضي',    href: '/passport/athlete',   icon: '🏃' },
                    { en: 'Facility Dashboard', ar: 'لوحة المنشأة',    href: '/passport/facility',  icon: '🏟️' },
                    { en: 'Ministry Dashboard', ar: 'لوحة الوزارة',    href: '/passport/ministry',  icon: '🏛️' },
                  ].map(item => (
                    <a key={item.en} href={item.href} onClick={() => setDropdown(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-white/55 hover:text-white hover:bg-white/5 transition-colors text-[12px] font-cairo">
                      <span className="text-base">{item.icon}</span>
                      {lang === 'ar' ? item.ar : item.en}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/55 hover:text-white text-xs transition-all font-cairo"
            >
              🌐 <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/55 text-xs font-cairo">
              <img src="/Saad.jpg" alt="Saad" className="w-7 h-7 rounded-full object-cover border border-white/20" />
              <span>Saad Abubaker</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE NAV DROPDOWN ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/5 bg-[#000A0F]/98 backdrop-blur-md" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            <a href="/" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-white/80 hover:bg-white/5 transition-all">
              {lang === 'ar' ? 'المنتج' : 'Product'}
            </a>
            <a href="/passport/hub" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all">
              {lang === 'ar' ? 'مركز التدريب' : 'Training Hub'}
            </a>
            <a href="/passport/partnerships" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all">
              {lang === 'ar' ? 'الشراكات' : 'Partnerships'}
            </a>
            <a href="/passport/governance" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all">
              {lang === 'ar' ? 'الحوكمة' : 'Governance'}
            </a>
            <a href="/passport/athlete" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all">
              🏃 {lang === 'ar' ? 'لوحة الرياضي' : 'Athlete Dashboard'}
            </a>
            <a href="/passport/facility" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all">
              🏟️ {lang === 'ar' ? 'لوحة المنشأة' : 'Facility Dashboard'}
            </a>
            <a href="/passport/ministry" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-white/45 hover:text-white/80 hover:bg-white/5 transition-all">
              🏛️ {lang === 'ar' ? 'لوحة الوزارة' : 'Ministry Dashboard'}
            </a>
            <div className="border-t border-white/5 my-1" />
            <a href="/dashboards" onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-lg text-sm font-cairo text-[#00DCC8] hover:bg-[#00DCC8]/10 transition-all">
              {lang === 'ar' ? 'لوحات التحكم' : 'Dashboards'}
            </a>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto w-full px-6 py-10 lg:py-16 flex flex-col gap-7 items-center text-center">

          <div className="flex flex-col gap-7 max-w-xl">

            <div className="w-full"><BackButton fallbackRoute="/" /></div>

            {/* SPORT DIGITAL ID pill */}
            <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full border" style={{ background: 'rgba(0,122,186,0.1)', borderColor: 'rgba(0,122,186,0.3)' }}>
              <span className="w-2 h-2 rounded-full bg-[#00DCC8] animate-pulse" />
              <span className="text-[#00DCC8] text-[11px] font-orbitron font-bold tracking-widest">
                {lang === 'ar' ? 'الهوية الرياضية الرقمية' : 'SPORT DIGITAL ID'}
              </span>
            </div>

            {/* Hero Card Image */}
            <div className="w-full max-w-[360px]">
              <img src="/player-photo.jpg" alt="Sport Digital ID" className="w-full rounded-2xl shadow-2xl" />
            </div>

            {/* Description */}
            <p className="text-white/45 text-base leading-relaxed font-cairo max-w-[440px]">
              {lang === 'ar'
                ? 'ada2ai تمنح كل رياضي سعودي هوية رقمية موحدة - مرتبطة ببيانات الأداء الحقيقية، ومعترف بها رسمياً من الوزارة.'
                : 'ada2ai gives every Saudi athlete a unified digital identity — linked to real performance data, and officially recognized.'}
            </p>

            {/* Feature bullets — clickable links */}
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { icon: 'USER_TRACK', en: 'Digital sport identity',      ar: 'هوية رياضية رقمية',         href: '/passport/athlete' },
                { icon: 'QR_VERIFY',  en: 'Instant QR check-in at facilities',   ar: 'تسجيل حضور QR فوري في المنشآت',      href: '/features/qr-checkin' },
                { icon: 'POWER_STAT', en: 'Sport Points & performance tracking', ar: 'نقاط رياضية وتتبع الأداء',            href: '/features/sport-points' },
                { icon: 'MINISTRY',   en: 'Live ministry reporting & analytics', ar: 'تقارير وتحليلات مباشرة للوزارة',      href: '/features/ministry-report' },
              ].map(f => (
                <a key={f.en} href={f.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:border-[#00DCC8]/30 hover:bg-white/[0.04] group"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#00DCC8]/15"
                    style={{ background: 'rgba(0,220,200,0.1)', border: '1px solid rgba(0,220,200,0.2)' }}>
                    <SysIcon type={f.icon} size={15} />
                  </div>
                  <span className="text-white/70 text-sm font-cairo group-hover:text-white/90 transition-colors">{lang === 'ar' ? f.ar : f.en}</span>
                  <svg className="ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,220,200,0.5)" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
                </a>
              ))}
            </div>

            {/* CTA + secondary */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleEnter}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-4 rounded-xl font-black text-[#000A0F] font-orbitron tracking-wide text-base transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)',
                  boxShadow: '0 0 40px rgba(0,220,200,0.25)',
                }}
              >
                <span className="text-lg">✦</span>
                <span>{loading ? (lang === 'ar' ? 'جاري الدخول...' : 'ENTERING...') : (lang === 'ar' ? 'دخول Sport ID' : 'SPORT ID LOGIN')}</span>
              </button>
              <button
                onClick={() => navigate('/passport/ministry')}
                className="flex items-center gap-2 px-6 py-4 rounded-xl border text-white/55 hover:text-white/80 hover:bg-white/5 transition-all text-sm font-cairo"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                {lang === 'ar' ? 'عرض لوحة التحكم' : 'View Dashboard'}
              </button>
            </div>

            {/* Trust line */}
            <p className="text-white/18 text-xs font-cairo">
              {lang === 'ar'
                ? '🔐 موثق بهوية رياضية · متوافق مع رؤية 2030 · سيادة البيانات السعودية'
                : '🔐 SportID verified · Vision 2030 aligned · Saudi data sovereignty'}
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="border-y border-white/5" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4">
          {[
            { num: '6',     en: 'Sports Supported',    ar: 'رياضات مدعومة' },
            { num: '12+',   en: 'Performance Metrics', ar: 'مقياس أداء' },
            { num: '< 60s', en: 'Analysis Time',       ar: 'وقت التحليل' },
            { num: '2026',  en: 'Platform Launch',     ar: 'إطلاق المنصة' },
          ].map((s, i) => (
            <div key={s.en} className={`flex flex-col items-center justify-center py-2 gap-1 ${i < 3 ? 'border-e border-white/5' : ''}`}>
              <div className="text-2xl font-black font-orbitron" style={{ color: '#00DCC8' }}>{s.num}</div>
              <div className="text-white/30 text-xs font-cairo">{lang === 'ar' ? s.ar : s.en}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <section className="py-16 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4" style={{ background: 'rgba(0,220,200,0.06)', borderColor: 'rgba(0,220,200,0.2)' }}>
              <span className="text-[#00DCC8] text-[10px] font-orbitron tracking-widest">
                {lang === 'ar' ? 'المنصة الذكية' : 'INTELLIGENT PLATFORM'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white font-orbitron mb-3">
              {lang === 'ar' ? 'كل ما تحتاجه في مكان واحد' : 'Everything in One Passport'}
            </h2>
            <p className="text-white/35 text-sm font-cairo max-w-lg mx-auto">
              {lang === 'ar'
                ? 'منصة متكاملة تجمع الهوية الرياضية والأداء والتحليلات والتواصل مع الوزارة.'
                : 'A complete platform combining sport identity, performance, analytics and ministry connectivity.'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: 'SHIELD',       en: 'Verified Identity',        ar: 'هوية موثقة',           desc_en: 'Digital sport ID', desc_ar: 'هوية رياضية رقمية' },
              { icon: 'POWER_STAT',   en: 'Performance AI',           ar: 'ذكاء الأداء',          desc_en: '12+ metrics tracked in real time', desc_ar: 'أكثر من 12 مقياساً فورياً' },
              { icon: 'QR_VERIFY',    en: 'Instant QR Access',        ar: 'دخول QR فوري',         desc_en: 'Check-in any facility in under 60s', desc_ar: 'دخول أي منشأة في أقل من 60 ثانية' },
              { icon: 'CHART',        en: 'Ministry Analytics',       ar: 'تحليلات الوزارة',      desc_en: 'Live dashboards for governing bodies', desc_ar: 'لوحات تحكم مباشرة للجهات الرسمية' },
            ].map(f => (
              <div key={f.en} className="p-5 rounded-2xl border transition-all hover:border-[#00DCC8]/25 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-[#00DCC8]/15" style={{ background: 'rgba(0,220,200,0.08)', border: '1px solid rgba(0,220,200,0.15)' }}>
                  <SysIcon type={f.icon} size={20} />
                </div>
                <div className="text-white font-bold font-orbitron text-sm mb-1.5">{lang === 'ar' ? f.ar : f.en}</div>
                <div className="text-white/35 text-xs font-cairo leading-relaxed">{lang === 'ar' ? f.desc_ar : f.desc_en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── BRAND STRIP ── */}
      <div className="py-4 px-6 flex items-center justify-center gap-8 overflow-hidden border-b border-white/[0.04]">
        {['ATHLETIC AI', 'VISION 2030', 'NAFATH READY', 'ISO 27001', 'SAUDI DATA LAW', 'SPORT PASSPORT ID'].map(item => (
          <span key={item} className="whitespace-nowrap text-white/15 text-[10px] font-orbitron tracking-widest">{item}</span>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Ada2aiMark size={22} />
            <span className="text-white/25 text-xs font-orbitron">ada<span className="text-[#00DCC8]">2</span>ai</span>
            <span className="text-white/10 text-xs">·</span>
            <span className="text-white/20 text-xs font-cairo">Sport Passport ID · © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-white/18 text-[10px] font-orbitron tracking-widest">
            {['VISION 2030', 'NAFATH READY', 'ISO 27001'].map((item, i) => (
              <span key={item} className="flex items-center gap-4">
                {i > 0 && <span className="text-white/8">·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </footer>

      {/* ── FOOTER ── */}
    </div>

    </>
  );
}

export default function SportIDPassport() {
  return (
    <LanguageProvider>
      <LandingPageInner />
    </LanguageProvider>
  );
}
