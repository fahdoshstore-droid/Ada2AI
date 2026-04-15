import { Link } from "wouter";
import {
  Users, BarChart3, Upload, Shield,
  ArrowRight, Activity, TrendingUp, Search,
  Zap, Target, Star, ChevronRight
} from "lucide-react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import BackButton from "@/components/BackButton";

export default function Dashboards() {
  const { t, lang, isRTL } = useLanguage();

  const dashboards = [
    {
      id: "scout",
      icon: <Users size={32} />,
      title: t("dash.scout"),
      desc: t("dash.scout.desc"),
      href: "/scouts",
      color: "#00DCC8",
      badge: isRTL ? "الكشف" : "DISCOVERY",
      stats: [
        { val: isRTL ? "متعدد" : "Multi", label: isRTL ? "مناطق" : "Regions" },
        { val: isRTL ? "جميع" : "All", label: isRTL ? "رياضات" : "Sports" },
        { val: isRTL ? "فوري" : "Live", label: isRTL ? "تصفية" : "Filter" },
      ],
      features: isRTL
        ? ["بحث متقدم متعدد المعايير", "تصفية حسب الرياضة والمنطقة والعمر", "عرض ملفات الرياضيين الكاملة", "تتبع المواهب المفضلة"]
        : ["Advanced multi-criteria search", "Filter by sport, region & age", "Full athlete profile viewer", "Track favorite talents"],
      img: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/football_0d0c7b9e.png",
    },
    {
      id: "compare",
      icon: <BarChart3 size={32} />,
      title: t("dash.compare"),
      desc: t("dash.compare.desc"),
      href: "/compare",
      color: "#007ABA",
      badge: isRTL ? "التحليلات" : "ANALYTICS",
      stats: [
        { val: "2", label: isRTL ? "رياضيان" : "Athletes" },
        { val: isRTL ? "رادار" : "Radar", label: isRTL ? "مخططات" : "Charts" },
        { val: isRTL ? "ذكاء اصطناعي" : "AI", label: isRTL ? "توصيات" : "Recs" },
      ],
      features: isRTL
        ? ["تراكب مزدوج لمخطط الرادار", "مقارنة مقياس بمقياس", "توصيات الكشف بالذكاء الاصطناعي", "تصدير تقارير المقارنة"]
        : ["Dual radar chart overlay", "Metric-by-metric breakdown", "AI scouting recommendations", "Export comparison reports"],
      img: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/basketball_0451a053.png",
    },
    {
      id: "upload",
      icon: <Upload size={32} />,
      title: t("dash.upload"),
      desc: t("dash.upload.desc"),
      href: "/upload",
      color: "#FFA500",
      badge: isRTL ? "التحليل" : "ANALYSIS",
      stats: [
        { val: "<60s", label: isRTL ? "وقت التحليل" : "Analysis Time" },
        { val: "12+", label: isRTL ? "مقاييس" : "Metrics" },
        { val: isRTL ? "مجاني" : "Free", label: isRTL ? "للتجربة" : "to Try" },
      ],
      features: isRTL
        ? ["رفع صورة أو فيديو", "تحليل أداء شامل بالذكاء الاصطناعي", "تقرير احترافي فوري", "يعمل مع أي رياضة"]
        : ["Upload photo or video", "Comprehensive AI performance analysis", "Instant professional report", "Works with any sport"],
      img: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/boxing_ed80ecdb.png",
    },
    {
      id: "sportid",
      icon: <Shield size={32} />,
      title: t("dash.sportid"),
      desc: t("dash.sportid.desc"),
      href: "/sport-id",
      color: "#00DCC8",
      badge: isRTL ? "الهوية" : "IDENTITY",
      stats: [
        { val: "QR", label: isRTL ? "رمز فريد" : "Unique Code" },
        { val: isRTL ? "موثق" : "Verified", label: isRTL ? "ملف" : "Profile" },
        { val: isRTL ? "دائم" : "Permanent", label: isRTL ? "سجل" : "Record" },
      ],
      features: isRTL
        ? ["هوية رقمية موثقة بـ QR", "مقاييس أداء خاصة بالرياضة", "قابل للمشاركة مع الأندية", "معايير حوكمة دولية"]
        : ["QR-verified digital identity", "Sport-specific performance metrics", "Shareable with clubs & federations", "International governance standards"],
      img: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/swimming_e1ebf2aa.png",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#000A0F] text-[#EEEFEE] overflow-x-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Ada2aiNavbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 ada-grid-bg opacity-10 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(0,220,200,0.07) 0%, transparent 70%)" }}
        />
        <div className="relative container mx-auto px-4 text-center">
          <div className="text-left mb-2"><BackButton fallbackRoute="/" /></div>
          <span className="badge-verified mb-5 inline-block">
            {isRTL ? "مركز التحكم" : "Control Center"}
          </span>
          <h1 className="font-orbitron font-black text-4xl md:text-5xl mb-5 text-[#EEEFEE]">
            {t("dash.title")}
          </h1>
          <p
            className="text-base max-w-xl mx-auto mb-10"
            style={{ color: "rgba(238,239,238,0.55)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.9 }}
          >
            {t("dash.sub")}
          </p>

          {/* Quick nav pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {dashboards.map((d) => (
              <Link key={d.id} href={d.href}>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: `${d.color}12`,
                    color: d.color,
                    border: `1px solid ${d.color}30`,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${d.color}25`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${d.color}12`; }}
                >
                  {d.title}
                  <ChevronRight size={12} />
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Cards ───────────────────────────────────────────── */}
      <section className="pb-20" style={{ borderTop: "1px solid rgba(0,220,200,0.06)" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {dashboards.map((d, i) => (
              <div
                key={d.id}
                className="ada-card overflow-hidden reveal group"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Top accent */}
                <div style={{ height: "3px", background: `linear-gradient(90deg, ${d.color}, transparent)` }} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${d.color}15`, color: d.color }}
                      >
                        {d.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2
                            className="font-bold text-lg text-[#EEEFEE]"
                            style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}
                          >
                            {d.title}
                          </h2>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: `${d.color}18`,
                              color: d.color,
                              border: `1px solid ${d.color}35`,
                              fontFamily: "'Orbitron', sans-serif",
                              fontWeight: 700,
                              fontSize: "0.55rem",
                              letterSpacing: "0.07em",
                            }}
                          >
                            {d.badge}
                          </span>
                        </div>
                        <p
                          className="text-xs"
                          style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.7 }}
                        >
                          {d.desc}
                        </p>
                      </div>
                    </div>
                    {/* Sport logo */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 hidden sm:flex"
                      style={{ background: `${d.color}08`, border: `1px solid ${d.color}15` }}
                    >
                      <img src={d.img} alt={d.title} className="w-8 h-8 object-contain" style={{ opacity: 0.75 }} />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                    {d.stats.map((s, j) => (
                      <div key={j} className="text-center">
                        <div
                          className="font-black text-base mb-0.5"
                          style={{ color: d.color, fontFamily: "'Orbitron', sans-serif" }}
                        >
                          {s.val}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-5">
                    {d.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span
                          className="text-xs"
                          style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={d.href}>
                    <button
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                      style={{
                        background: `${d.color}15`,
                        color: d.color,
                        border: `1px solid ${d.color}30`,
                        fontFamily: "'Cairo', sans-serif",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${d.color}28`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${d.color}15`; }}
                    >
                      {t("common.openDashboard")}
                      <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: "rgba(0,5,10,0.5)", borderTop: "1px solid rgba(0,220,200,0.06)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-orbitron font-bold text-xl text-[#EEEFEE] mb-2">
              {isRTL ? "إجراءات سريعة" : "Quick Actions"}
            </h2>
            <p
              className="text-sm"
              style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}
            >
              {isRTL ? "الأكثر استخداماً من قبل الكشافين والمدربين" : "Most used by scouts and coaches"}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: <Zap size={16} />, label: isRTL ? "تحليل رياضي جديد" : "New Athlete Analysis", href: "/upload", color: "#FFA500" },
              { icon: <Search size={16} />, label: isRTL ? "بحث في قاعدة البيانات" : "Search Athlete Database", href: "/scouts", color: "#00DCC8" },
              { icon: <BarChart3 size={16} />, label: isRTL ? "مقارنة رياضيين" : "Compare Two Athletes", href: "/compare", color: "#007ABA" },
              { icon: <Shield size={16} />, label: isRTL ? "إنشاء هوية رياضية" : "Generate Sport ID", href: "/sport-id", color: "#00DCC8" },
              { icon: <Activity size={16} />, label: isRTL ? "مركز التدريب" : "Training Hub", href: "/training", color: "#FFA500" },
            ].map((action, i) => (
              <Link key={i} href={action.href}>
                <button
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: `${action.color}10`,
                    color: action.color,
                    border: `1px solid ${action.color}25`,
                    fontFamily: "'Cairo', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${action.color}22`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${action.color}50`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = `${action.color}10`;
                    (e.currentTarget as HTMLElement).style.borderColor = `${action.color}25`;
                  }}
                >
                  {action.icon}
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#000A0F" }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Cairo', sans-serif" }}>
            {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
