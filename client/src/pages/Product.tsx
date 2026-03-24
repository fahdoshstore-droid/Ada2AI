'use client';
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Brain, Shield, Users, BarChart3, Building2, Trophy,
  ArrowRight, Zap, Globe, Cpu, Target,
  Star, Activity, IdCard, Upload, Search, Link2,
  CheckCircle2, BarChart2
} from "lucide-react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── SVG System Icons (from SportID design) ── */
function SysIcon({ type, size = 16 }: { type: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: '#00DCC8', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'USER_TRACK')   return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
  if (type === 'QR_VERIFY')    return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 17h3M17 14v3"/></svg>;
  if (type === 'POWER_STAT')   return <svg {...p}><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>;
  if (type === 'MINISTRY')     return <svg {...p}><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>;
  if (type === 'AI_ANALYTICS') return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>;
  if (type === 'SHIELD')       return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  if (type === 'CHART')        return <svg {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (type === 'TRAINING')     return <svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
  return <svg {...p}><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/></svg>;
}

export default function Product() {
  const { t, lang, isRTL } = useLanguage();
  const [showNafath, setShowNafath] = useState(false);
  const [nafathId, setNafathId] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Waitlist form state
  const [wlName, setWlName] = useState('');
  const [wlEmail, setWlEmail] = useState('');
  const [wlRole, setWlRole] = useState<'athlete'|'scout'|'coach'|'academy'|'federation'|'other'>('athlete');
  const [wlSport, setWlSport] = useState('');
  const [wlSubmitted, setWlSubmitted] = useState(false);
  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: () => setWlSubmitted(true),
    onError: (err) => toast.error(isRTL ? `خطأ: ${err.message}` : `Error: ${err.message}`),
  });

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wlName || !wlEmail) return;
    joinWaitlist.mutate({ name: wlName, email: wlEmail, role: wlRole, sport: wlSport || undefined });
  }

  async function handleNafathVerify() {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 2200));
    setVerifying(false);
    setShowNafath(false);
  }

  const metrics = [
    { label: isRTL ? 'السرعة' : 'Speed', val: 88, color: '#00DCC8' },
    { label: isRTL ? 'القوة' : 'Strength', val: 82, color: '#007ABA' },
    { label: isRTL ? 'التقنية' : 'Technique', val: 92, color: '#00DCC8' },
    { label: isRTL ? 'التحمل' : 'Endurance', val: 79, color: '#007ABA' },
  ];

  const modules = [
    {
      num: "01",
      iconType: "USER_TRACK",
      title: t("module.sportId.title"),
      badge: isRTL ? "الهوية الرقمية" : "DIGITAL IDENTITY",
      color: "#00DCC8",
      headline: isRTL ? "الهوية الرياضية الرقمية الموثقة للرياضي" : "The Athlete's Verifiable Digital Identity",
      desc: t("module.sportId.desc"),
      features: isRTL
        ? ["هوية رياضية موثقة عبر نفاذ", "تسجيل حضور QR فوري في المنشآت", "نقاط رياضية وتتبع الأداء", "تقارير وتحليلات مباشرة للوزارة"]
        : ["Nafath-verified sport identity", "Instant QR check-in at facilities", "Sport Points & performance tracking", "Live ministry reporting & analytics"],      link: "/modules/sport-id",
    },
    {
      num: "02",
      iconType: "AI_ANALYTICS",
      title: t("module.aiEngine.title"),
      badge: isRTL ? "الوحدة الأساسية" : "CORE MODULE",
      color: "#007ABA",
      headline: isRTL ? "تقرير رياضي احترافي في ثوانٍ" : "Professional Athlete Report in Seconds",
      desc: t("module.aiEngine.desc"),
      features: isRTL
        ? ["تحليل متعدد المقاييس", "تقرير احترافي موحد", "يعمل مع أي رياضة وأي جهاز", "دعم ثنائي اللغة"]
        : ["Multi-metric performance analysis", "Standardized professional report", "Works with any sport, any device", "Bilingual Arabic/English output"],
      link: "/modules/ai-engine",
    },
    {
      num: "03",
      iconType: "USER_TRACK",
      title: t("module.scouts.title"),
      badge: isRTL ? "اكتشاف المواهب" : "TALENT DISCOVERY",
      color: "#FFA500",
      headline: isRTL ? "اكتشف المواهب الإقليمية على نطاق واسع" : "Discover Regional Talent at Scale",
      desc: t("module.scouts.desc"),
      features: isRTL
        ? ["بحث متعدد المعايير", "تغطية جميع مناطق المملكة", "تصفية حسب الرياضة والعمر", "تصدير تقارير احترافية"]
        : ["Multi-metric filter search", "Coverage across all KSA regions", "Sport & age category filtering", "Export professional reports"],
      link: "/modules/scouts",
    },
    {
      num: "04",
      iconType: "CHART",
      title: t("module.compare.title"),
      badge: isRTL ? "التحليلات" : "ANALYTICS",
      color: "#00DCC8",
      headline: isRTL ? "مقارنة موضوعية جنباً إلى جنب بين الرياضيين" : "Objective Side-by-Side Athlete Comparison",
      desc: t("module.compare.desc"),
      features: isRTL
        ? ["تراكب مزدوج لمخطط الرادار", "مقارنة مقياس بمقياس", "توصيات مولدة بالذكاء الاصطناعي", "تقارير مقارنة قابلة للمشاركة"]
        : ["Dual radar chart overlay", "Side-by-side metric comparison", "AI-generated recommendations", "Shareable comparison reports"],
      link: "/modules/compare",
    },
    {
      num: "05",
      iconType: "MINISTRY",
      title: t("module.institutes.title"),
      badge: isRTL ? "الشبكة" : "NETWORK",
      color: "#007ABA",
      headline: isRTL ? "ربط الرياضيين بمساراتهم" : "Connect Athletes to Their Pathways",
      desc: t("module.institutes.desc"),
      features: isRTL
        ? ["أكثر من 500 معهد مرسوم على الخريطة", "تصفية متعددة الرياضات والفئات العمرية", "التحقق من حالة الاعتماد", "التواصل المباشر والتسجيل"]
        : ["500+ institutes mapped across KSA", "Multi-sport & age group filtering", "Accreditation status verification", "Direct contact & enrollment"],
      link: "/modules/institutes",
    },
    {
      num: "06",
      iconType: "TRAINING",
      title: t("module.training.title"),
      badge: isRTL ? "جديد" : "NEW",
      color: "#FFA500",
      headline: isRTL ? "منصة تدريب ذكية للمدربين والأندية" : "AI-Powered Training Platform for Coaches & Clubs",
      desc: t("module.training.desc"),
      features: isRTL
        ? ["خطط تدريب مخصصة بالذكاء الاصطناعي", "تتبع تقدم الرياضيين", "إدارة المباريات والجلسات", "مساعد تدريب فوري بالدردشة"]
        : ["AI-generated personalized training plans", "Athlete progress tracking", "Match & session management", "Real-time AI coaching assistant"],
      link: "/modules/training",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#000A0F] text-[#EEEFEE] overflow-x-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Ada2aiNavbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO — Cinematic Athlete Card + Marketing Content
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-10 lg:py-16 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 ada-grid-bg opacity-10 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,122,186,0.07) 0%, transparent 70%)" }}
        />

        <div className="relative container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">

            {/* LEFT — Cinematic Athlete Card */}
            <div
              className={`relative rounded-2xl overflow-hidden order-2 lg:order-1 ${isRTL ? "lg:order-2" : "lg:order-1"}`}
              style={{
                height: '520px',
                background: 'linear-gradient(155deg, #071828 0%, #050e18 50%, #000e10 100%)',
                boxShadow: '0 0 80px rgba(0,122,186,0.18), 0 0 160px rgba(0,220,200,0.08)',
                border: '1px solid rgba(0,220,200,0.12)',
                animation: 'border-glow-pulse 3s ease-in-out infinite',
              }}
            >
              {/* Athlete photo */}
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/saudi-athlete_a8a3434a.jpg"
                alt="Athlete"
                className="absolute inset-0 w-full h-full object-cover object-top"
                style={{ opacity: 0.82, mixBlendMode: 'luminosity' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />

              {/* Depth gradient overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(180deg, rgba(0,10,15,0.28) 0%, rgba(0,10,15,0.05) 30%, rgba(0,10,15,0.5) 65%, rgba(0,10,15,0.97) 100%)',
              }} />
              {/* Side vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(90deg, rgba(0,10,15,0.5) 0%, transparent 25%, transparent 75%, rgba(0,10,15,0.5) 100%)',
              }} />
              {/* Tech grid */}
              <div className="absolute inset-0 pointer-events-none" style={{
                opacity: 0.05,
                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 47px,rgba(0,220,200,1) 47px,rgba(0,220,200,1) 48px),repeating-linear-gradient(90deg,transparent,transparent 47px,rgba(0,220,200,1) 47px,rgba(0,220,200,1) 48px)',
              }} />

              {/* Animated scan line */}
              <div className="absolute left-0 right-0 pointer-events-none z-20" style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,220,200,0.0) 10%, rgba(0,220,200,0.6) 50%, rgba(0,220,200,0.0) 90%, transparent 100%)',
                animation: 'card-scan-line 4s ease-in-out infinite',
                boxShadow: '0 0 12px rgba(0,220,200,0.5)',
              }} />

              {/* Data stream particles */}
              {[{left:'15%',delay:'0s',dur:'3s'},{left:'35%',delay:'1.2s',dur:'2.5s'},{left:'60%',delay:'0.6s',dur:'3.5s'},{left:'80%',delay:'1.8s',dur:'2.8s'}].map((p,i)=>(
                <div key={i} className="absolute bottom-0 pointer-events-none z-10" style={{
                  left: p.left, width: '1px', height: '40px',
                  background: 'linear-gradient(0deg, transparent, rgba(0,220,200,0.4), transparent)',
                  animation: `data-stream ${p.dur} ease-in-out infinite`,
                  animationDelay: p.delay,
                }} />
              ))}

              {/* Corner brackets */}
              {(['top-4 left-4 border-t-2 border-l-2','top-4 right-4 border-t-2 border-r-2','bottom-20 left-4 border-b-2 border-l-2','bottom-20 right-4 border-b-2 border-r-2'] as const).map((cls, i) => (
                <div key={i} className={`absolute w-7 h-7 ${cls}`} style={{ borderColor: 'rgba(0,220,200,0.5)' }} />
              ))}

              {/* LIVE TRACKING badge */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md border" style={{ background: 'rgba(0,10,15,0.75)', borderColor: 'rgba(0,220,200,0.3)' }}>
                  <span className="w-2 h-2 rounded-full bg-[#00DCC8] animate-pulse" />
                  <span className="text-[#00DCC8] text-[10px] font-orbitron tracking-widest font-bold">
                    {isRTL ? 'تتبع مباشر' : 'LIVE TRACKING'}
                  </span>
                </div>
              </div>

              {/* Overall score */}
              <div className="absolute top-14 left-5 z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md border"
                  style={{ background: 'rgba(0,10,15,0.75)', borderColor: 'rgba(0,220,200,0.25)' }}
                >
                  <span className="text-[#00DCC8] text-2xl font-black font-orbitron leading-none">92</span>
                  <span className="text-white/30 text-[9px] font-cairo mt-0.5">/100</span>
                </div>
              </div>

              {/* Metric bars */}
              <div className="absolute top-14 right-5 z-10 space-y-2 w-32">
                {metrics.map(m => (
                  <div key={m.label} className="rounded-xl px-3 py-2 backdrop-blur-md border" style={{ background: 'rgba(0,10,15,0.7)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-white/45 text-[9px] font-cairo">{m.label}</span>
                      <span className="text-[9px] font-orbitron font-bold" style={{ color: m.color }}>{m.val}</span>
                    </div>
                    <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${m.val}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom info panel */}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <div className="px-5 pt-4 pb-5" style={{ background: 'linear-gradient(0deg, rgba(0,10,15,1) 0%, rgba(0,10,15,0.9) 80%, transparent 100%)' }}>
                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="text-white font-black text-xl font-orbitron leading-tight">Ahmed Al-Shamri</div>
                      <div className="text-white/40 text-xs font-cairo mt-1">
                        {isRTL ? 'عداء · ألعاب القوى' : 'Sprinter · Athletics'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.25)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-400 text-[9px] font-orbitron font-bold">
                        {isRTL ? 'موثق' : 'VERIFIED'}
                      </span>
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {metrics.map(m => (
                      <div key={m.label} className="text-center">
                        <div className="text-sm font-black font-orbitron" style={{ color: m.color }}>{m.val}</div>
                        <div className="text-white/30 text-[8px] font-cairo mt-0.5">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* ID strip + QR */}
                  <div className="pt-3 border-t flex items-center justify-between gap-2.5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #007ABA, #00DCC8)' }}>
                        <span className="text-white text-[10px] font-black font-orbitron">A</span>
                      </div>
                      <span className="text-white/20 text-[9px] font-orbitron tracking-widest">
                        ADA2AI · SPORT PASSPORT ID · ATH-9841
                      </span>
                    </div>
                    {/* QR Code SVG */}
                    <div className="relative flex-shrink-0" style={{ width: 44, height: 44 }}>
                      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* QR border glow */}
                        <rect x="0.5" y="0.5" width="43" height="43" rx="3.5" stroke="#00DCC8" strokeOpacity="0.4" fill="rgba(0,10,15,0.85)"/>
                        {/* Top-left finder */}
                        <rect x="4" y="4" width="13" height="13" rx="1" fill="none" stroke="#00DCC8" strokeWidth="1.5"/>
                        <rect x="6.5" y="6.5" width="8" height="8" rx="0.5" fill="#00DCC8" fillOpacity="0.9"/>
                        {/* Top-right finder */}
                        <rect x="27" y="4" width="13" height="13" rx="1" fill="none" stroke="#00DCC8" strokeWidth="1.5"/>
                        <rect x="29.5" y="6.5" width="8" height="8" rx="0.5" fill="#00DCC8" fillOpacity="0.9"/>
                        {/* Bottom-left finder */}
                        <rect x="4" y="27" width="13" height="13" rx="1" fill="none" stroke="#00DCC8" strokeWidth="1.5"/>
                        <rect x="6.5" y="29.5" width="8" height="8" rx="0.5" fill="#00DCC8" fillOpacity="0.9"/>
                        {/* Data modules - row 1 */}
                        <rect x="20" y="4" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="24" y="4" width="3" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        {/* Data modules - row 2 */}
                        <rect x="20" y="8" width="3" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="24" y="8" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        {/* Data modules - row 3 */}
                        <rect x="20" y="12" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        {/* Data modules - bottom right area */}
                        <rect x="20" y="20" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="24" y="20" width="3" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="28" y="20" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="32" y="20" width="3" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="36" y="20" width="4" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="20" y="24" width="3" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="28" y="24" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="36" y="24" width="4" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="20" y="28" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="24" y="28" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="32" y="28" width="3" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="20" y="32" width="3" height="3" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="28" y="32" width="3" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="36" y="32" width="4" height="3" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="20" y="36" width="3" height="4" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        <rect x="24" y="36" width="3" height="4" rx="0.3" fill="#007ABA" fillOpacity="0.7"/>
                        <rect x="32" y="36" width="3" height="4" rx="0.3" fill="#00DCC8" fillOpacity="0.7"/>
                        {/* Scan line animation */}
                        <rect x="2" y="22" width="40" height="1" rx="0.5" fill="#00DCC8" fillOpacity="0.35"
                          style={{animation:'qr-scan 2s ease-in-out infinite'}} />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Marketing Content */}
            <div className={`flex flex-col gap-6 order-1 ${isRTL ? "lg:order-1" : "lg:order-2"}`}>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full border" style={{ background: 'rgba(0,122,186,0.1)', borderColor: 'rgba(0,122,186,0.3)' }}>
                <span className="w-2 h-2 rounded-full bg-[#00DCC8] animate-pulse" />
                <span className="text-[#00DCC8] text-[11px] font-orbitron font-bold tracking-widest">
                  {isRTL ? 'الهوية الرياضية الرقمية' : 'SPORT DIGITAL ID'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-[50px] font-black text-white leading-[1.05] font-orbitron">
                {isRTL ? (
                  <>
                    كل رياضي
                    <br />يستحق
                    <br />
                    <span style={{ background: 'linear-gradient(135deg, #007ABA, #00DCC8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      هوية رقمية
                    </span>
                  </>
                ) : (
                  <>
                    Every Athlete
                    <br />Deserves a
                    <br />
                    <span style={{ background: 'linear-gradient(135deg, #007ABA, #00DCC8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Digital Identity
                    </span>
                  </>
                )}
              </h1>

              {/* Description */}
              <p className="text-white/50 text-base leading-relaxed font-cairo max-w-[440px]">
                {isRTL
                  ? 'ada2ai تمنح كل رياضي سعودي هوية رقمية موحدة — موثقة، مرتبطة ببيانات الأداء الحقيقية، ومعترف بها رسمياً.'
                  : 'ada2ai gives every Saudi athlete a unified digital identity — verified, linked to real performance data, and officially recognized.'}
              </p>

              {/* Feature bullets */}
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { icon: 'USER_TRACK', en: 'Nafath-verified sport identity', ar: 'هوية رياضية موثقة عبر نفاذ' },
                  { icon: 'QR_VERIFY', en: 'Instant QR check-in at facilities', ar: 'تسجيل حضور QR فوري في المنشآت' },
                  { icon: 'POWER_STAT', en: 'Sport Points & performance tracking', ar: 'نقاط رياضية وتتبع الأداء' },
                  { icon: 'MINISTRY', en: 'Live ministry reporting & analytics', ar: 'تقارير وتحليلات مباشرة للوزارة' },
                ].map(f => (
                  <div key={f.en}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(0,220,200,0.1)', border: '1px solid rgba(0,220,200,0.2)' }}>
                      <SysIcon type={f.icon} size={15} />
                    </div>
                    <span className="text-white/70 text-sm font-cairo">{isRTL ? f.ar : f.en}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => { setNafathId(''); setShowNafath(true); }}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl font-black text-[#000A0F] font-orbitron tracking-wide text-base transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)',
                    boxShadow: '0 0 40px rgba(0,220,200,0.2)',
                  }}
                >
                  <span className="text-lg">✦</span>
                  <span>{isRTL ? 'جرّب الآن' : 'TRY IT NOW'}</span>
                </button>
                <Link href="/scouts">
                  <button className="flex items-center gap-2 px-6 py-4 rounded-xl border text-white/55 hover:text-white/80 hover:bg-white/5 transition-all text-sm font-cairo"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {isRTL ? 'عرض لوحة التحكم' : 'View Dashboard'}
                  </button>
                </Link>
              </div>

              {/* Trust line */}
              <p className="text-white/20 text-xs font-cairo">
                {isRTL
                  ? '🔐 متوافق مع رؤية 2030 · سيادة البيانات السعودية'
                  : '🔐 Vision 2030 aligned · Saudi data sovereignty'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <div className="border-y" style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(0,220,200,0.06)' }}>
        <div className="container mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4">
          {[
            { num: '6', en: 'Integrated Modules', ar: 'وحدات متكاملة' },
            { num: '6+', en: 'IP Rights', ar: 'حقوق ملكية فكرية' },
            { num: '500+', en: 'Target Ecosystems', ar: 'منظومات مستهدفة' },
            { num: isRTL ? 'في ثواني' : 'Seconds', en: 'Analysis Time', ar: 'وقت التحليل' },
          ].map((s, i) => (
            <div key={s.en} className={`flex flex-col items-center justify-center py-2 gap-1 ${i < 3 ? 'border-e border-white/5' : ''}`}>
              <div className="text-2xl font-black font-orbitron" style={{ color: '#00DCC8' }}>{s.num}</div>
              <div className="text-white/30 text-xs font-cairo">{isRTL ? s.ar : s.en}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES GRID — 4 key features
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4" style={{ borderBottom: '1px solid rgba(0,220,200,0.06)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4" style={{ background: 'rgba(0,220,200,0.06)', borderColor: 'rgba(0,220,200,0.2)' }}>
              <span className="text-[#00DCC8] text-[10px] font-orbitron tracking-widest">
                {isRTL ? 'المنصة الذكية' : 'INTELLIGENT PLATFORM'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white font-orbitron mb-3">
              {isRTL ? 'كل ما تحتاجه في مكان واحد' : 'Everything in One Platform'}
            </h2>
            <p className="text-white/35 text-sm font-cairo max-w-lg mx-auto leading-relaxed">
              {isRTL
                ? 'منصة متكاملة تجمع الهوية الرياضية والأداء والتحليلات والتواصل مع الجهات الرسمية.'
                : 'A complete platform combining sport identity, performance, analytics and official connectivity.'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: 'SHIELD', en: 'Verified Identity', ar: 'هوية موثقة', desc_en: 'Nafath-linked national sport ID', desc_ar: 'هوية رياضية وطنية موثقة' },
              { icon: 'POWER_STAT', en: 'Performance AI', ar: 'ذكاء الأداء', desc_en: '12+ metrics tracked in real time', desc_ar: 'أكثر من 12 مقياساً فورياً' },
              { icon: 'QR_VERIFY', en: 'Instant QR Access', ar: 'دخول QR فوري', desc_en: 'Check-in any facility in under 60s', desc_ar: 'دخول أي منشأة في أقل من 60 ثانية' },
              { icon: 'CHART', en: 'Ministry Analytics', ar: 'تحليلات الوزارة', desc_en: 'Live dashboards for governing bodies', desc_ar: 'لوحات تحكم مباشرة للجهات الرسمية' },
            ].map(f => (
              <div key={f.en} className="p-5 rounded-2xl border transition-all hover:border-[#00DCC8]/25 group" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-[#00DCC8]/15" style={{ background: 'rgba(0,220,200,0.08)', border: '1px solid rgba(0,220,200,0.15)' }}>
                  <SysIcon type={f.icon} size={20} />
                </div>
                <div className="text-white font-bold font-orbitron text-sm mb-1.5">{isRTL ? f.ar : f.en}</div>
                <div className="text-white/35 text-xs font-cairo leading-relaxed">{isRTL ? f.desc_ar : f.desc_en}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ATHLETE SILHOUETTES — Animated SVG (from SportID design)
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4" style={{ borderBottom: '1px solid rgba(0,220,200,0.06)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-3"
              style={{ background: 'rgba(0,220,200,0.06)', borderColor: 'rgba(0,220,200,0.18)' }}>
              <span className="text-[#00DCC8] text-[10px] font-orbitron tracking-widest">
                {isRTL ? 'رياضيون في حركة' : 'ATHLETES IN MOTION'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white font-orbitron">
              {isRTL ? 'كل رياضة. كل لاعب. موثق.' : 'Every Sport. Every Athlete. Tracked.'}
            </h2>
          </div>

          <div className="relative rounded-2xl overflow-hidden border"
            style={{ background: '#000A0F', borderColor: 'rgba(0,220,200,0.12)' }}>
            <style>{`
              @keyframes ath-float  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-12px)} }
              @keyframes glow-pulse { 0%,100%{opacity:0.06}              50%{opacity:0.22} }
              @keyframes stat-pulse { 0%,100%{opacity:0.55}              50%{opacity:1} }
              @keyframes scan-line  { 0%{transform:translateY(-5px);opacity:.4} 100%{transform:translateY(385px);opacity:0} }
              @keyframes trail-fade { 0%,100%{opacity:0.04}              50%{opacity:0.14} }
              @keyframes dot-drift  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-30px)} }
            `}</style>
            <svg viewBox="0 0 1100 380" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <defs>
                <radialGradient id="bCenterGlow2" cx="50%" cy="50%" r="55%">
                  <stop offset="0%"  stopColor="#007ABA" stopOpacity="0.14"/>
                  <stop offset="100%" stopColor="#000A0F" stopOpacity="0"/>
                </radialGradient>
                <filter id="bGlow2" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="1100" height="380" fill="#000A0F"/>
              {Array.from({length:19}).map((_,i)=>(
                <line key={`v${i}`} x1={i*62} y1="0" x2={i*62} y2="380" stroke="white" strokeOpacity="0.022" strokeWidth="1"/>
              ))}
              {Array.from({length:7}).map((_,i)=>(
                <line key={`h${i}`} x1="0" y1={i*65} x2="1100" y2={i*65} stroke="white" strokeOpacity="0.022" strokeWidth="1"/>
              ))}
              <rect width="1100" height="380" fill="url(#bCenterGlow2)"/>
              <line x1="0" y1="0" x2="1100" y2="0" stroke="#00DCC8" strokeWidth="1.5" strokeOpacity="0.35"
                style={{animation:'scan-line 5s linear infinite'}}/>
              {[210,415,665,875].map((x,i)=>(
                <line key={i} x1={x} y1="30" x2={x} y2="340" stroke="white" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="4,7"/>
              ))}

              {/* RUNNER */}
              <g transform="translate(105,0)" filter="url(#bGlow2)">
              <g style={{animation:'ath-float 3.2s ease-in-out infinite',animationDelay:'0s'}}>
                <g transform="translate(-16,7)" style={{animation:'trail-fade 3.2s ease-in-out infinite'}}>
                  <circle cx="12" cy="46" r="18" fill="#00DCC8"/>
                  <path d="M8,62 C5,90 2,115 -2,138" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none"/>
                </g>
                <circle cx="12" cy="46" r="18" fill="#00DCC8" opacity="0.88"/>
                <path d="M8,62 C5,90 2,115 -2,138" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M5,84 C25,76 40,82 48,94" stroke="#00DCC8" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M0,82 C-20,96 -30,118 -34,136" stroke="#00DCC8" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-2,138 C12,162 22,194 18,228 C16,250 20,268 14,285" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-2,138 C-18,158 -30,186 -34,215 C-37,237 -28,258 -34,275" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <ellipse cx="0" cy="295" rx="42" ry="8" fill="#00DCC8" style={{animation:'glow-pulse 3.2s ease-in-out infinite'}}/>
                <g style={{animation:'stat-pulse 3.2s ease-in-out infinite',animationDelay:'0.4s'}}>
                  <rect x="36" y="78" width="62" height="28" rx="5" fill="#000A0F" fillOpacity="0.95" stroke="#00DCC8" strokeOpacity="0.45" strokeWidth="1"/>
                  <text x="67" y="92" textAnchor="middle" fill="#007ABA" fontSize="7" fontFamily="'Orbitron',monospace" fontWeight="700">SPEED</text>
                  <text x="67" y="102" textAnchor="middle" fill="#00DCC8" fontSize="9" fontFamily="'Orbitron',monospace" fontWeight="900">88 km/h</text>
                </g>
                <text x="0" y="318" textAnchor="middle" fill="white" fillOpacity="0.35" fontSize="10" fontFamily="'Cairo',sans-serif">{isRTL?'العدو':'Running'}</text>
              </g>
              </g>

              {/* FOOTBALL KICKER */}
              <g transform="translate(313,0)" filter="url(#bGlow2)">
              <g style={{animation:'ath-float 2.8s ease-in-out infinite',animationDelay:'0.7s'}}>
                <circle cx="-5" cy="44" r="18" fill="#00DCC8" opacity="0.88"/>
                <path d="M-5,61 C-8,92 -8,116 -6,138" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-6,84 C-26,68 -42,58 -52,52" stroke="#00DCC8" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-3,84 C14,96 24,112 28,126" stroke="#00DCC8" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-8,138 C-16,166 -18,200 -14,230 C-10,252 -14,272 -10,288" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-4,138 C14,132 38,128 64,126 C86,124 102,130 114,140" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <circle cx="128" cy="142" r="15" fill="#00DCC8" fillOpacity="0.1" stroke="#00DCC8" strokeWidth="1.5" strokeOpacity="0.75"/>
                <circle cx="128" cy="142" r="5" fill="#00DCC8" opacity="0.85"/>
                <ellipse cx="0" cy="298" rx="46" ry="8" fill="#00DCC8" style={{animation:'glow-pulse 2.8s ease-in-out infinite',animationDelay:'0.3s'}}/>
                <g style={{animation:'stat-pulse 2.8s ease-in-out infinite',animationDelay:'1s'}}>
                  <rect x="-100" y="44" width="66" height="28" rx="5" fill="#000A0F" fillOpacity="0.95" stroke="#00DCC8" strokeOpacity="0.45" strokeWidth="1"/>
                  <text x="-67" y="58" textAnchor="middle" fill="#007ABA" fontSize="7" fontFamily="'Orbitron',monospace" fontWeight="700">TECHNIQUE</text>
                  <text x="-67" y="68" textAnchor="middle" fill="#00DCC8" fontSize="9" fontFamily="'Orbitron',monospace" fontWeight="900">92 / 100</text>
                </g>
                <text x="55" y="318" textAnchor="middle" fill="white" fillOpacity="0.35" fontSize="10" fontFamily="'Cairo',sans-serif">{isRTL?'كرة القدم':'Football'}</text>
              </g>
              </g>

              {/* BASKETBALL */}
              <g transform="translate(540,0)" filter="url(#bGlow2)">
              <g style={{animation:'ath-float 3.8s ease-in-out infinite',animationDelay:'0.2s'}}>
                <circle cx="0" cy="12" r="22" fill="#00DCC8" fillOpacity="0.12" stroke="#00DCC8" strokeWidth="1.5" strokeOpacity="0.8"/>
                <circle cx="0" cy="12" r="8" fill="#00DCC8" opacity="0.9"/>
                <circle cx="0" cy="42" r="24" fill="#00DCC8" opacity="0.92"/>
                <path d="M0,65 C2,100 2,125 2,148" stroke="#00DCC8" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.92"/>
                <path d="M2,88 C22,68 34,48 36,30" stroke="#00DCC8" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.92"/>
                <path d="M-2,88 C-22,68 -34,48 -36,30" stroke="#00DCC8" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.92"/>
                <path d="M0,148 C-14,170 -24,194 -26,218 C-24,236 -18,250 -20,265" stroke="#00DCC8" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.92"/>
                <path d="M2,148 C18,168 28,192 30,215 C30,232 24,246 26,260" stroke="#00DCC8" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.92"/>
                <g style={{animation:'stat-pulse 3.8s ease-in-out infinite'}}>
                  <rect x="48" y="72" width="80" height="42" rx="6" fill="#000A0F" fillOpacity="0.96" stroke="#00DCC8" strokeOpacity="0.55" strokeWidth="1.2"/>
                  <text x="88" y="89" textAnchor="middle" fill="#007ABA" fontSize="7.5" fontFamily="'Orbitron',monospace" fontWeight="700">TOP ATHLETE</text>
                  <text x="88" y="104" textAnchor="middle" fill="#00DCC8" fontSize="13" fontFamily="'Orbitron',monospace" fontWeight="900">96/100</text>
                </g>
                <text x="0" y="285" textAnchor="middle" fill="white" fillOpacity="0.42" fontSize="11" fontFamily="'Cairo',sans-serif">{isRTL?'كرة السلة':'Basketball'}</text>
              </g>
              </g>

              {/* SWIMMER */}
              <g transform="translate(770,0)" filter="url(#bGlow2)">
              <g style={{animation:'ath-float 2.6s ease-in-out infinite',animationDelay:'1.1s'}}>
                <ellipse cx="0" cy="202" rx="90" ry="7" fill="none" stroke="#007ABA" strokeWidth="1.2" strokeOpacity="0.28"/>
                <ellipse cx="0" cy="202" rx="65" ry="5" fill="none" stroke="#007ABA" strokeWidth="0.8" strokeOpacity="0.18"/>
                <circle cx="-75" cy="185" r="15" fill="#00DCC8" opacity="0.88"/>
                <path d="M-61,187 C-25,182 20,184 58,186 C82,188 100,184 118,181" stroke="#00DCC8" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-61,181 C-38,170 -8,166 22,167 C50,169 72,175 92,180" stroke="#00DCC8" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M118,180 C136,172 154,164 170,160" stroke="#00DCC8" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M118,186 C138,195 156,200 172,198" stroke="#00DCC8" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.88"/>
                <g style={{animation:'stat-pulse 2.6s ease-in-out infinite',animationDelay:'1.3s'}}>
                  <rect x="-78" y="155" width="66" height="28" rx="5" fill="#000A0F" fillOpacity="0.95" stroke="#00DCC8" strokeOpacity="0.45" strokeWidth="1"/>
                  <text x="-45" y="169" textAnchor="middle" fill="#007ABA" fontSize="7" fontFamily="'Orbitron',monospace" fontWeight="700">ENDURANCE</text>
                  <text x="-45" y="179" textAnchor="middle" fill="#00DCC8" fontSize="9" fontFamily="'Orbitron',monospace" fontWeight="900">94 / 100</text>
                </g>
                <text x="0" y="228" textAnchor="middle" fill="white" fillOpacity="0.35" fontSize="10" fontFamily="'Cairo',sans-serif">{isRTL?'السباحة':'Swimming'}</text>
              </g>
              </g>

              {/* WEIGHTLIFTER */}
              <g transform="translate(990,0)" filter="url(#bGlow2)">
              <g style={{animation:'ath-float 4.2s ease-in-out infinite',animationDelay:'0.5s'}}>
                <circle cx="0" cy="64" r="19" fill="#00DCC8" opacity="0.88"/>
                <path d="M0,82 C0,112 0,128 0,148" stroke="#00DCC8" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M-2,96 C-22,80 -44,64 -62,56 C-74,50 -84,48 -92,48" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M2,96 C22,80 44,64 62,56 C74,50 84,48 92,48" stroke="#00DCC8" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.88"/>
                <line x1="-110" y1="48" x2="110" y2="48" stroke="#00DCC8" strokeWidth="8" strokeOpacity="0.88"/>
                <circle cx="-112" cy="48" r="18" fill="none" stroke="#00DCC8" strokeWidth="2" strokeOpacity="0.72"/>
                <circle cx="-112" cy="48" r="11" fill="#00DCC8" fillOpacity="0.12"/>
                <circle cx="112" cy="48" r="18" fill="none" stroke="#00DCC8" strokeWidth="2" strokeOpacity="0.72"/>
                <circle cx="112" cy="48" r="11" fill="#00DCC8" fillOpacity="0.12"/>
                <path d="M-4,148 C-22,172 -34,200 -38,228 C-38,248 -34,266 -36,282" stroke="#00DCC8" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.88"/>
                <path d="M4,148 C22,170 34,198 38,226 C38,246 34,264 36,280" stroke="#00DCC8" strokeWidth="13" strokeLinecap="round" fill="none" opacity="0.88"/>
                <ellipse cx="0" cy="290" rx="50" ry="9" fill="#00DCC8" style={{animation:'glow-pulse 4.2s ease-in-out infinite',animationDelay:'0.5s'}}/>
                <g style={{animation:'stat-pulse 4.2s ease-in-out infinite',animationDelay:'0.8s'}}>
                  <rect x="50" y="88" width="62" height="28" rx="5" fill="#000A0F" fillOpacity="0.95" stroke="#00DCC8" strokeOpacity="0.45" strokeWidth="1"/>
                  <text x="81" y="102" textAnchor="middle" fill="#007ABA" fontSize="7" fontFamily="'Orbitron',monospace" fontWeight="700">STRENGTH</text>
                  <text x="81" y="112" textAnchor="middle" fill="#00DCC8" fontSize="9" fontFamily="'Orbitron',monospace" fontWeight="900">89 / 100</text>
                </g>
                <text x="0" y="308" textAnchor="middle" fill="white" fillOpacity="0.35" fontSize="10" fontFamily="'Cairo',sans-serif">{isRTL?'رفع الأثقال':'Weightlifting'}</text>
              </g>
              </g>

              {/* Floating particles */}
              {[{cx:180,cy:80,r:2,d:'0s'},{cx:390,cy:55,r:1.5,d:'1.2s'},{cx:540,cy:310,r:2.5,d:'0.6s'},
                {cx:700,cy:60,r:1.8,d:'1.8s'},{cx:880,cy:90,r:2,d:'0.9s'},{cx:260,cy:140,r:1.5,d:'2.2s'},
              ].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#00DCC8" fillOpacity="0.35"
                  style={{animation:`dot-drift 4s ease-in-out infinite`,animationDelay:p.d}}/>
              ))}
              <text x="550" y="16" textAnchor="middle" fill="#00DCC8" fillOpacity="0.1" fontSize="8"
                fontFamily="'Orbitron',monospace" letterSpacing="3">
                ada2ai · SPORT INTELLIGENCE · 6 SPORTS TRACKED
              </text>
            </svg>
            <div className="absolute inset-0 pointer-events-none"
              style={{background:'linear-gradient(90deg,rgba(0,10,15,0.7) 0%,transparent 5%,transparent 95%,rgba(0,10,15,0.7) 100%)'}}/>
          </div>

          {/* Sport tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {[
              {emoji:'🏃',en:'Running',ar:'العدو'},
              {emoji:'⚽',en:'Football',ar:'كرة القدم'},
              {emoji:'🏀',en:'Basketball',ar:'كرة السلة'},
              {emoji:'🏊',en:'Swimming',ar:'السباحة'},
              {emoji:'🏋️',en:'Weightlifting',ar:'رفع الأثقال'},
              {emoji:'🥊',en:'Boxing',ar:'الملاكمة'},
            ].map(s=>(
              <span key={s.en} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-cairo border"
                style={{background:'rgba(255,255,255,0.025)',borderColor:'rgba(255,255,255,0.07)',color:'rgba(255,255,255,0.4)'}}>
                <span>{s.emoji}</span>
                {isRTL?s.ar:s.en}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          6 MODULES — Detailed cards
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4" style={{ borderBottom: '1px solid rgba(0,220,200,0.06)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="badge-verified mb-4 inline-block">
              {isRTL ? "وحدات المنصة" : "Platform Modules"}
            </span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl text-[#EEEFEE] mb-4">
              {isRTL ? "ست وحدات. منصة واحدة." : "Six Modules. One Platform."}
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(238,239,238,0.45)', fontFamily: "'Cairo', sans-serif", lineHeight: 1.9 }}>
              {isRTL
                ? 'من الاكتشاف إلى الاحتراف — وللرياضيين والكشافة والمدربين.'
                : 'From discovery to professionalism — for athletes, scouts, and coaches.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {modules.map((m, i) => (
              <Link key={i} href={m.link}>
                <div
                  className="group cursor-pointer rounded-2xl border transition-all duration-300 hover:border-[#00DCC8]/30 hover:scale-[1.02] overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  {/* Accent top bar */}
                  <div style={{ height: '3px', background: `linear-gradient(90deg, ${m.color}, transparent)` }} />

                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}
                      >
                        <SysIcon type={m.iconType} size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold font-orbitron" style={{ color: m.color }}>
                            {m.num}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-orbitron font-bold"
                            style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}40` }}>
                            {m.badge}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[#EEEFEE] font-orbitron"
                          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
                          {m.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs mb-4 leading-relaxed"
                      style={{ color: 'rgba(238,239,238,0.45)', fontFamily: "'Cairo', sans-serif" }}>
                      {m.desc}
                    </p>

                    <ul className="flex flex-col gap-1.5 mb-4">
                      {m.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                          <span className="text-xs font-cairo" style={{ color: 'rgba(238,239,238,0.55)' }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-1 text-xs font-medium transition-all duration-200 group-hover:gap-2"
                      style={{ color: m.color }}>
                      <span style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                        {isRTL ? 'استكشف' : 'Explore'}
                      </span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WAITLIST SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4" style={{ borderBottom: '1px solid rgba(0,220,200,0.06)', background: 'linear-gradient(180deg, rgba(0,122,186,0.04) 0%, transparent 100%)' }}>
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4" style={{ background: 'rgba(0,220,200,0.06)', borderColor: 'rgba(0,220,200,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-[#00DCC8] animate-pulse" />
              <span className="text-[#00DCC8] text-[10px] font-orbitron tracking-widest">
                {isRTL ? 'قائمة الانتظار' : 'EARLY ACCESS'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white font-orbitron mb-3">
              {isRTL ? 'انضم إلى قائمة الانتظار' : 'Join the Waitlist'}
            </h2>
            <p className="text-white/40 text-sm font-cairo max-w-md mx-auto leading-relaxed">
              {isRTL
                ? 'كن من أوائل المستفيدين من منصة ada2ai — سجّل اهتمامك الآن وسنتواصل معك عند الإطلاق.'
                : 'Be among the first to access ada2ai — register your interest now and we\'ll reach out at launch.'}
            </p>
          </div>

          {wlSubmitted ? (
            <div className="text-center py-12 rounded-2xl border" style={{ background: 'rgba(0,220,200,0.04)', borderColor: 'rgba(0,220,200,0.2)' }}>
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-black text-[#00DCC8] font-orbitron mb-2">
                {isRTL ? 'تم التسجيل بنجاح!' : 'You\'re on the list!'}
              </h3>
              <p className="text-white/40 text-sm font-cairo">
                {isRTL ? 'سنتواصل معك قريباً عند الإطلاق الرسمي.' : 'We\'ll reach out when we officially launch.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="rounded-2xl border p-8 flex flex-col gap-5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/50 text-xs font-cairo">{isRTL ? 'الاسم الكامل' : 'Full Name'} *</label>
                  <input
                    type="text" required value={wlName} onChange={e => setWlName(e.target.value)}
                    placeholder={isRTL ? 'أدخل اسمك' : 'Your name'}
                    className="w-full border rounded-xl px-4 py-3 text-white text-sm outline-none font-cairo transition-colors focus:border-[#00DCC8]/50"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/50 text-xs font-cairo">{isRTL ? 'البريد الإلكتروني' : 'Email'} *</label>
                  <input
                    type="email" required value={wlEmail} onChange={e => setWlEmail(e.target.value)}
                    placeholder={isRTL ? 'بريدك الإلكتروني' : 'your@email.com'}
                    className="w-full border rounded-xl px-4 py-3 text-white text-sm outline-none font-cairo transition-colors focus:border-[#00DCC8]/50"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/50 text-xs font-cairo">{isRTL ? 'دورك' : 'Your Role'} *</label>
                  <select
                    value={wlRole} onChange={e => setWlRole(e.target.value as typeof wlRole)}
                    className="w-full border rounded-xl px-4 py-3 text-white text-sm outline-none font-cairo transition-colors focus:border-[#00DCC8]/50"
                    style={{ background: 'rgba(10,20,30,0.95)', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {[
                      { val: 'athlete', en: 'Athlete', ar: 'رياضي' },
                      { val: 'scout', en: 'Scout', ar: 'كشاف' },
                      { val: 'coach', en: 'Coach', ar: 'مدرب' },
                      { val: 'academy', en: 'Academy / Club', ar: 'أكاديمية / نادي' },
                      { val: 'federation', en: 'Federation', ar: 'اتحاد' },
                      { val: 'other', en: 'Other', ar: 'أخرى' },
                    ].map(r => (
                      <option key={r.val} value={r.val}>{isRTL ? r.ar : r.en}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/50 text-xs font-cairo">{isRTL ? 'الرياضة (اختياري)' : 'Sport (optional)'}</label>
                  <input
                    type="text" value={wlSport} onChange={e => setWlSport(e.target.value)}
                    placeholder={isRTL ? 'مثال: كرة القدم' : 'e.g. Football'}
                    className="w-full border rounded-xl px-4 py-3 text-white text-sm outline-none font-cairo transition-colors focus:border-[#00DCC8]/50"
                    style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={joinWaitlist.isPending}
                className="w-full py-4 rounded-xl font-black text-[#000A0F] font-orbitron tracking-wide text-sm transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)', boxShadow: '0 0 40px rgba(0,220,200,0.15)' }}
              >
                {joinWaitlist.isPending
                  ? (isRTL ? 'جارٍ التسجيل...' : 'Submitting...')
                  : (isRTL ? 'سجّل اهتمامك الآن ✦' : 'Register My Interest ✦')}
              </button>

              <p className="text-center text-white/20 text-xs font-cairo">
                {isRTL ? '🔐 لن نشارك بياناتك مع أي طرف ثالث.' : '🔐 We will never share your data with third parties.'}
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BRAND STRIP
      ══════════════════════════════════════════════════════════════ */}
      <div className="py-4 px-6 flex items-center justify-center gap-8 overflow-hidden border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {['ATHLETIC AI', 'VISION 2030', 'NAFATH READY', 'ISO 27001', 'SAUDI DATA LAW', 'SPORT PASSPORT ID'].map(item => (
          <span key={item} className="whitespace-nowrap text-[10px] font-orbitron tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>{item}</span>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          NAFATH MODAL
      ══════════════════════════════════════════════════════════════ */}
      {showNafath && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-8 max-w-md w-full border" style={{ background: 'rgba(5,18,30,0.97)', borderColor: 'rgba(0,122,186,0.25)' }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: 'rgba(0,122,186,0.15)', border: '1px solid rgba(0,220,200,0.2)' }}>🔐</div>
              <h3 className="text-xl font-black text-white font-orbitron">
                {isRTL ? 'التحقق عبر نفاذ' : 'Nafath Verification'}
              </h3>
              <p className="text-white/40 text-sm mt-1 font-cairo">
                {isRTL ? 'أدخل رقمك الوطني للمتابعة' : 'Enter your national ID to continue'}
              </p>
            </div>

            <div className="rounded-xl p-3 mb-5 border flex items-center gap-3" style={{ background: 'rgba(0,122,186,0.1)', borderColor: 'rgba(0,220,200,0.15)' }}>
              <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #007ABA, #00DCC8)' }}>
                <span className="text-white text-sm font-black font-orbitron">A</span>
              </div>
              <div>
                <div className="text-sm font-bold text-[#00DCC8] font-orbitron">Sport Passport ID</div>
                <div className="text-white/30 text-xs font-cairo">{isRTL ? 'الجواز الرياضي الرقمي' : 'Digital Athletic Identity'}</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-white/55 text-sm mb-2 block font-cairo">
                {isRTL ? 'رقم الهوية الوطنية' : 'National ID Number'}
              </label>
              <input
                type="text"
                value={nafathId}
                onChange={e => setNafathId(e.target.value)}
                placeholder={isRTL ? '10 أرقام' : '10 digits'}
                maxLength={10}
                className="w-full border rounded-xl px-4 py-3 text-white outline-none transition-colors font-cairo"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
              />
            </div>

            {verifying ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-12 h-12 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(0,122,186,0.2)', borderTopColor: '#00DCC8' }} />
                <p className="text-[#00DCC8] text-sm font-orbitron">
                  {isRTL ? 'جارٍ التحقق...' : 'Verifying...'}
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setShowNafath(false)}
                  className="flex-1 py-3 rounded-xl border text-white/55 hover:bg-white/5 transition-colors font-cairo"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={handleNafathVerify}
                  className="flex-1 py-3 rounded-xl font-black text-[#000A0F] transition-opacity hover:opacity-90 font-orbitron tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #007ABA, #00DCC8)' }}>
                  {isRTL ? 'تحقق وادخل' : 'Verify & Enter'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
