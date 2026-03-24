import { useLocation } from "wouter";
import { Shield, CheckCircle, User, Calendar, Globe, Trophy, Building2, Landmark, ArrowRight } from "lucide-react";

export default function NafathPage() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.08 0.02 240)", color: "white", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(0,10,15,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="nh1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs><rect width="40" height="40" rx="9" fill="url(#nh1)"/><text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text></svg>
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "15px", color: "#00DCC8" }}>ada2ai</span>
        </div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>التحقق عبر نفاذ</span>
        <button onClick={() => navigate("/product")} style={{ background: "rgba(0,220,200,0.1)", border: "1px solid rgba(0,220,200,0.3)", borderRadius: "8px", padding: "6px 14px", color: "#00DCC8", cursor: "pointer", fontSize: "13px" }}>
          رجوع ←
        </button>
      </header>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
            <div style={{ width: "120px", height: "120px", background: "linear-gradient(135deg, rgba(0,122,186,0.2), rgba(0,220,200,0.2))", border: "2px solid rgba(0,220,200,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={56} color="#00DCC8" />
            </div>
          </div>
          <div style={{ display: "inline-block", background: "rgba(0,122,186,0.12)", border: "1px solid rgba(0,122,186,0.35)", borderRadius: "100px", padding: "6px 18px", fontSize: "11px", fontFamily: "'Orbitron', monospace", letterSpacing: "0.15em", color: "#007ABA", marginBottom: "24px" }}>
            NAFATH INTEGRATION
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.1, marginBottom: "20px", background: "linear-gradient(135deg, #ffffff, #00DCC8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            هوية رياضية موثقة عبر نفاذ
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            كل رياضي سعودي يحصل على هوية رقمية موثقة مرتبطة بهويته الوطنية عبر منصة نفاذ — لا أوراق، لا تزوير، لا حواجز.
          </p>
        </section>

        {/* Stats */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            {[
              { val: "<2s", label: "وقت التحقق" },
              { val: "ISO 27001", label: "معيار الأمان" },
              { val: "أبشر", label: "النظام المرتبط" },
              { val: "0", label: "أوراق يدوية" },
            ].map((stat) => (
              <div key={stat.val} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "24px", color: "#00DCC8", marginBottom: "8px" }}>{stat.val}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* What gets verified */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            ما الذي يتم التحقق منه
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {[
              { icon: <User size={22} color="#00DCC8" />, label: "الاسم القانوني الكامل" },
              { icon: <Calendar size={22} color="#00DCC8" />, label: "تاريخ الميلاد" },
              { icon: <Globe size={22} color="#00DCC8" />, label: "الجنسية" },
              { icon: <Trophy size={22} color="#00DCC8" />, label: "التخصص الرياضي" },
              { icon: <Building2 size={22} color="#00DCC8" />, label: "انتماء النادي" },
              { icon: <Landmark size={22} color="#00DCC8" />, label: "تسجيل الوزارة" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(0,122,186,0.08)", border: "1px solid rgba(0,122,186,0.2)", borderRadius: "12px", padding: "16px" }}>
                {item.icon}
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why it matters */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            لماذا يهم هذا
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            {[
              { audience: "للرياضيين", desc: "سجل رياضي موثق مدى الحياة لا يمكن تزويره. إنجازاتك ترافقك في كل مكان — الأندية والمنشآت والمنتخبات الوطنية.", color: "#00DCC8" },
              { audience: "للمنشآت", desc: "تسجيل دخول فوري موثوق. اعرف بالضبط من يدخل منشأتك بضمان هوية بمستوى حكومي في أقل من 3 ثوان.", color: "#007ABA" },
              { audience: "للوزارة", desc: "بيانات رياضية وطنية دقيقة مبنية على هويات موثقة — وليس أرقامًا ذاتية التقرير. رؤى حقيقية على مستوى السكان لرؤية 2030.", color: "#00DCC8" },
            ].map((card) => (
              <div key={card.audience} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${card.color}33`, borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "13px", color: card.color, marginBottom: "12px" }}>{card.audience}</div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: 1.7 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            الخصوصية والأمان
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {[
              { icon: "🔄", title: "تجديد كل 15 دقيقة", desc: "ينتهي رمز QR ويتجدد كل 15 دقيقة — يمنع إعادة استخدام لقطات الشاشة." },
              { icon: "🔒", title: "لا بيانات شخصية", desc: "لا يُكشف عن اسم أو رقم هوية للماسح. فقط مرجع تشفيري." },
              { icon: "🛡️", title: "تشفير شامل", desc: "جميع حمولات QR موقَّعة بـ RSA-2048 وتتحقق منها الخادم في الوقت الفعلي." },
            ].map((item) => (
              <div key={item.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: "13px", color: "#00DCC8", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: "center", padding: "48px 0" }}>
          <button onClick={() => navigate("/product")} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #007ABA, #00DCC8)", borderRadius: "12px", padding: "16px 40px", color: "white", border: "none", cursor: "pointer", fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "15px", letterSpacing: "0.05em" }}>
            <ArrowRight size={18} />
            ابدأ التحقق
          </button>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "16px" }}>
            مؤمَّن بنفاذ · ISO 27001 · متوافق مع نظام PDPL
          </p>
        </section>
      </main>
    </div>
  );
}
