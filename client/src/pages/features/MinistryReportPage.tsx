import { useLocation } from "wouter";
import { Landmark, Users, BarChart3, MapPin, Trophy, Building2, ArrowRight } from "lucide-react";

function DashboardSVG() {
  const provinces = [
    { name: "RUH", val: 87, color: "#00DCC8" },
    { name: "JED", val: 72, color: "#007ABA" },
    { name: "DAM", val: 65, color: "#00DCC8" },
    { name: "MAK", val: 54, color: "#007ABA" },
    { name: "MED", val: 48, color: "#00DCC8" },
    { name: "QAS", val: 38, color: "#007ABA" },
    { name: "TAB", val: 30, color: "#00DCC8" },
  ];
  const sports = [
    { sport: "Football", pct: 42, color: "#00DCC8" },
    { sport: "Basketball", pct: 18, color: "#007ABA" },
    { sport: "Swimming", pct: 15, color: "#FFD700" },
    { sport: "Athletics", pct: 14, color: "#CD7F32" },
    { sport: "Other", pct: 11, color: "rgba(255,255,255,0.3)" },
  ];
  return (
    <svg width="100%" height="220" viewBox="0 0 480 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="220" rx="16" fill="rgba(0,10,15,0.6)" stroke="rgba(0,220,200,0.2)" strokeWidth="1"/>
      <rect width="480" height="36" rx="16" fill="rgba(0,220,200,0.07)"/>
      <rect x="0" y="20" width="480" height="16" fill="rgba(0,220,200,0.07)"/>
      <circle cx="18" cy="18" r="5" fill="#FF5F57"/>
      <circle cx="34" cy="18" r="5" fill="#FEBC2E"/>
      <circle cx="50" cy="18" r="5" fill="#28C840"/>
      <text x="70" y="22" fontSize="10" fill="rgba(255,255,255,0.5)" fontFamily="'Orbitron', monospace">MINISTRY SPORT ANALYTICS · LIVE</text>
      <circle cx="448" cy="18" r="4" fill="#00DCC8" opacity="0.8"/>
      <text x="20" y="56" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="'Orbitron', monospace">PARTICIPATION BY PROVINCE</text>
      {provinces.map((p, i) => (
        <g key={p.name}>
          <rect x={20 + i * 34} y={60 + (90 - p.val)} width="26" height={p.val} rx="3" fill={p.color} fillOpacity="0.7"/>
          <text x={20 + i * 34 + 13} y="162" fontSize="8" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontFamily="monospace">{p.name}</text>
          <text x={20 + i * 34 + 13} y={56 + (90 - p.val)} fontSize="8" textAnchor="middle" fill={p.color}>{p.val}</text>
        </g>
      ))}
      <line x1="265" y1="44" x2="265" y2="210" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      <text x="280" y="56" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="'Orbitron', monospace">SPORT BREAKDOWN</text>
      {sports.map((s, i) => (
        <g key={s.sport}>
          <rect x="280" y={66 + i * 26} width={s.pct * 1.6} height="16" rx="4" fill={s.color} fillOpacity="0.6"/>
          <text x={280 + s.pct * 1.6 + 6} y={78 + i * 26} fontSize="9" fill="rgba(255,255,255,0.6)" fontFamily="monospace">{s.sport} {s.pct}%</text>
        </g>
      ))}
      <path d="M180 175 L200 165 L225 168 L235 180 L230 195 L210 200 L185 195 Z" fill="rgba(0,122,186,0.15)" stroke="rgba(0,122,186,0.4)" strokeWidth="1"/>
      <text x="207" y="185" textAnchor="middle" fontSize="8" fill="#007ABA" fontFamily="monospace">KSA</text>
    </svg>
  );
}

export default function MinistryReportPage() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.08 0.02 240)", color: "white", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(0,10,15,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="mr1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs><rect width="40" height="40" rx="9" fill="url(#mr1)"/><text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text></svg>
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "15px", color: "#00DCC8" }}>ada2ai</span>
        </div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>تقارير الوزارة</span>
        <button onClick={() => navigate("/product")} style={{ background: "rgba(0,220,200,0.1)", border: "1px solid rgba(0,220,200,0.3)", borderRadius: "8px", padding: "6px 14px", color: "#00DCC8", cursor: "pointer", fontSize: "13px" }}>
          رجوع ←
        </button>
      </header>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
            <div style={{ width: "120px", height: "120px", background: "linear-gradient(135deg, rgba(0,122,186,0.2), rgba(0,220,200,0.2))", border: "2px solid rgba(0,122,186,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Landmark size={56} color="#007ABA" />
            </div>
          </div>
          <div style={{ display: "inline-block", background: "rgba(0,122,186,0.12)", border: "1px solid rgba(0,122,186,0.35)", borderRadius: "100px", padding: "6px 18px", fontSize: "11px", fontFamily: "'Orbitron', monospace", letterSpacing: "0.15em", color: "#007ABA", marginBottom: "24px" }}>
            MINISTRY ANALYTICS
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.1, marginBottom: "20px", background: "linear-gradient(135deg, #ffffff, #007ABA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            تقارير وتحليلات مباشرة للوزارة
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            لوحة تحكم حية تُمكّن وزارة الرياضة من رؤية البيانات الرياضية الوطنية في الوقت الفعلي — مبنية على هويات موثقة لدعم رؤية 2030.
          </p>
        </section>

        {/* Dashboard preview */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            معاينة لوحة التحكم
          </h2>
          <DashboardSVG />
        </section>

        {/* What dashboard shows */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            ما تُظهره اللوحة
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {[
              { icon: <Users size={22} color="#00DCC8" />, label: "الرياضيون النشطون بالمنطقة" },
              { icon: <BarChart3 size={22} color="#00DCC8" />, label: "تفصيل أنواع الرياضات" },
              { icon: <Building2 size={22} color="#00DCC8" />, label: "معدلات استخدام المنشآت" },
              { icon: <Trophy size={22} color="#00DCC8" />, label: "الأندية الأعلى أداءً" },
              { icon: <BarChart3 size={22} color="#00DCC8" />, label: "مؤشرات الأداء مقابل رؤية 2030" },
              { icon: <MapPin size={22} color="#00DCC8" />, label: "خرائط حرارية جغرافية" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(0,122,186,0.08)", border: "1px solid rgba(0,122,186,0.18)", borderRadius: "12px", padding: "16px" }}>
                {item.icon}
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Access levels */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            مستويات الوصول
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {[
              { level: "الوزارة الاتحادية", scope: "جميع المناطق · جميع الرياضات · مجموعة مؤشرات الأداء الكاملة", color: "#00DCC8" },
              { level: "المدير الإقليمي", scope: "بيانات مستوى المنطقة · الأندية الإقليمية · المنشآت الإقليمية", color: "#007ABA" },
              { level: "مدير النادي", scope: "رياضيو النادي فقط · تسجيلات النادي · أداء النادي", color: "rgba(255,255,255,0.5)" },
            ].map((item) => (
              <div key={item.level} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", borderRight: `3px solid ${item.color}` }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "13px", color: item.color, marginBottom: "10px" }}>{item.level}</div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", lineHeight: 1.6 }}>{item.scope}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
            {[
              { val: "13", label: "منطقة مشمولة" },
              { val: "مباشر", label: "تحديثات البيانات" },
              { val: "99.9%", label: "اتفاقية التشغيل" },
              { val: "PDF/XLS", label: "صيغ التصدير" },
            ].map((stat) => (
              <div key={stat.val} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "24px", color: "#007ABA", marginBottom: "8px" }}>{stat.val}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: "center", padding: "48px 0" }}>
          <button onClick={() => navigate("/product")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #007ABA, #00DCC8)", borderRadius: "12px", padding: "16px 40px", color: "white", border: "none", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "15px", letterSpacing: "0.05em" }}>
            <ArrowRight size={18} />
            طلب عرض تجريبي
          </button>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "16px" }}>
            متوافق مع متطلبات رؤية 2030 · بيانات موثقة ومعتمدة
          </p>
        </section>
      </main>
    </div>
  );
}
