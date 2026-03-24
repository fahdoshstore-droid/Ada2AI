import { useLocation } from "wouter";
import { Star, TrendingUp, Medal, Trophy, ArrowRight, BarChart3 } from "lucide-react";

const TIERS = [
  { name: "برونز", range: "0 – 499", color: "#CD7F32" },
  { name: "فضة", range: "500 – 1,499", color: "#C0C0C0" },
  { name: "ذهب", range: "1,500 – 3,999", color: "#FFD700" },
  { name: "نخبة", range: "4,000+", color: "#00DCC8" },
];

const LEADERBOARD = [
  { rank: 1, name: "أ. الشمري", sport: "كرة القدم", pts: 2840 },
  { rank: 2, name: "خ. الحربي", sport: "كرة السلة", pts: 2310 },
  { rank: 3, name: "م. القحطاني", sport: "السباحة", pts: 1850 },
  { rank: 4, name: "ف. الزهراني", sport: "ألعاب القوى", pts: 1240 },
  { rank: 5, name: "س. العتيبي", sport: "الكرة الطائرة", pts: 890 },
];

export default function SportPointsPage() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.08 0.02 240)", color: "white", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(0,10,15,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="sp1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs><rect width="40" height="40" rx="9" fill="url(#sp1)"/><text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text></svg>
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "15px", color: "#00DCC8" }}>ada2ai</span>
        </div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>النقاط الرياضية</span>
        <button onClick={() => navigate("/product")} style={{ background: "rgba(0,220,200,0.1)", border: "1px solid rgba(0,220,200,0.3)", borderRadius: "8px", padding: "6px 14px", color: "#00DCC8", cursor: "pointer", fontSize: "13px" }}>
          رجوع ←
        </button>
      </header>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
            <div style={{ width: "120px", height: "120px", background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(0,220,200,0.15))", border: "2px solid rgba(255,215,0,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={56} color="#FFD700" />
            </div>
          </div>
          <div style={{ display: "inline-block", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "100px", padding: "6px 18px", fontSize: "11px", fontFamily: "'Orbitron', monospace", letterSpacing: "0.15em", color: "#FFD700", marginBottom: "24px" }}>
            SPORT POINTS SYSTEM
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.1, marginBottom: "20px", background: "linear-gradient(135deg, #FFD700, #00DCC8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            نقاط رياضية وتتبع الأداء
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            كل تدريب، كل مباراة، كل إنجاز — يتحول إلى نقاط رياضية موثقة تبني سجلك الرياضي وتفتح أمامك أبواب الفرص.
          </p>
        </section>

        {/* Tiers */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            مستويات النقاط
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
            {TIERS.map((tier) => (
              <div key={tier.name} style={{ background: `${tier.color}0D`, border: `1px solid ${tier.color}30`, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "14px", fontWeight: 700, color: tier.color, marginBottom: "6px" }}>{tier.name}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{tier.range} نقطة</div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample athlete card + Leaderboard */}
        <section style={{ marginBottom: "72px", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "24px" }}>
          {/* Athlete card */}
          <div style={{ background: "rgba(0,220,200,0.05)", border: "1px solid rgba(0,220,200,0.2)", borderRadius: "16px", padding: "28px" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "10px", color: "rgba(255,255,255,0.35)", marginBottom: "20px", letterSpacing: "0.1em" }}>ملف نموذجي</div>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚽</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "16px", color: "white", marginBottom: "4px" }}>Ahmed Al-Shamri</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>كرة القدم · نادي الرياض</div>
            <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "36px", color: "#00DCC8", marginBottom: "4px" }}>2,840</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>نقطة رياضية</div>
            <div style={{ background: "#FFD70020", border: "1px solid #FFD70040", borderRadius: "8px", padding: "8px 14px", display: "inline-block" }}>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: "#FFD700", fontWeight: 700 }}>★ مستوى ذهب</span>
            </div>
            <div style={{ marginTop: "16px", fontSize: "12px", color: "#00DCC8" }}>+120 هذا الشهر ↑</div>
          </div>
          {/* Leaderboard */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: "#00DCC8", marginBottom: "20px", letterSpacing: "0.08em" }}>أفضل الرياضيين</div>
            {LEADERBOARD.map((row) => (
              <div key={row.rank} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: row.rank === 1 ? "#FFD700" : "rgba(255,255,255,0.35)", width: "20px" }}>#{row.rank}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>{row.name}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{row.sport}</div>
                </div>
                <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "13px", color: "#00DCC8", fontWeight: 700 }}>{row.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* How points are earned */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            كيف تكسب النقاط
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {[
              { icon: <TrendingUp size={24} color="#00DCC8" />, title: "جلسات التدريب", pts: "+10 نقطة" },
              { icon: <Medal size={24} color="#FFD700" />, title: "المشاركة في المباريات", pts: "+25 نقطة" },
              { icon: <Trophy size={24} color="#FFD700" />, title: "الفوز والإنجازات", pts: "+50 نقطة" },
              { icon: <BarChart3 size={24} color="#00DCC8" />, title: "تحسين مؤشرات الأداء", pts: "+15 نقطة" },
            ].map((item) => (
              <div key={item.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                <div>{item.icon}</div>
                <div>
                  <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}>{item.title}</div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: "#00DCC8", fontWeight: 700 }}>{item.pts}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ministry use */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ background: "rgba(0,122,186,0.08)", border: "1px solid rgba(0,122,186,0.2)", borderRadius: "16px", padding: "28px" }}>
            <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "16px", color: "#007ABA", marginBottom: "12px" }}>
              استخدام الوزارة
            </h3>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: 1.7 }}>
              تُغذي بيانات النقاط الرياضية المجمعة لوحات معلومات وزارة الرياضة بمقاييس مشاركة موثقة — تدعم تتبع مؤشرات رؤية 2030 وقرارات السياسة وتحديد المواهب الوطنية. كل نقطة مكتسبة تُسهم في قصة التطوير الرياضي السعودي.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: "center", padding: "48px 0" }}>
          <button onClick={() => navigate("/product")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #007ABA, #00DCC8)", borderRadius: "12px", padding: "16px 40px", color: "white", border: "none", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "15px", letterSpacing: "0.05em" }}>
            <ArrowRight size={18} />
            تحقق من نقاطك
          </button>
        </section>
      </main>
    </div>
  );
}
