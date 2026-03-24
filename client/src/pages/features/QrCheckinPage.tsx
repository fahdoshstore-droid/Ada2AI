import { useLocation } from "wouter";
import { QrCode, Scan, CheckCircle2, Clock, Lock, ShieldCheck, ArrowRight } from "lucide-react";

function QRCodeSVG() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="180" rx="16" fill="rgba(0,10,15,0.8)" stroke="rgba(0,220,200,0.4)" strokeWidth="2"/>
      {/* Top-left finder */}
      <rect x="16" y="16" width="48" height="48" rx="4" fill="none" stroke="#00DCC8" strokeWidth="3"/>
      <rect x="26" y="26" width="28" height="28" rx="2" fill="#00DCC8" fillOpacity="0.8"/>
      {/* Top-right finder */}
      <rect x="116" y="16" width="48" height="48" rx="4" fill="none" stroke="#00DCC8" strokeWidth="3"/>
      <rect x="126" y="26" width="28" height="28" rx="2" fill="#00DCC8" fillOpacity="0.8"/>
      {/* Bottom-left finder */}
      <rect x="16" y="116" width="48" height="48" rx="4" fill="none" stroke="#00DCC8" strokeWidth="3"/>
      <rect x="26" y="126" width="28" height="28" rx="2" fill="#00DCC8" fillOpacity="0.8"/>
      {/* Data modules */}
      {[
        [80,16],[88,16],[96,16],[80,24],[96,24],[80,32],[88,32],[96,32],
        [16,80],[24,80],[32,80],[16,88],[32,88],[16,96],[24,96],[32,96],
        [80,80],[96,80],[88,88],[80,96],[96,96],
        [112,80],[120,80],[128,80],[136,80],[144,80],[152,80],[160,80],
        [112,88],[128,88],[144,88],[160,88],
        [112,96],[120,96],[136,96],[152,96],
        [80,112],[96,112],[112,112],[128,112],[144,112],[160,112],
        [80,120],[88,120],[112,120],[136,120],[152,120],
        [80,128],[96,128],[120,128],[144,128],[160,128],
        [80,136],[112,136],[128,136],[160,136],
        [80,144],[88,144],[96,144],[112,144],[120,144],[136,144],[144,144],[152,144],[160,144],
        [80,152],[96,152],[112,152],[128,152],[144,152],
        [80,160],[88,160],[96,160],[112,160],[120,160],[128,160],[136,160],[152,160],[160,160],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill={i % 3 === 0 ? "#007ABA" : "#00DCC8"} fillOpacity="0.7"/>
      ))}
      {/* Scan line animation */}
      <rect x="8" y="0" width="164" height="3" rx="1.5" fill="url(#scanGrad)" opacity="0.8">
        <animateTransform attributeName="transform" type="translate" values="0,8;0,164;0,8" dur="2.5s" repeatCount="indefinite"/>
      </rect>
      <defs>
        <linearGradient id="scanGrad" x1="0" y1="0" x2="164" y2="0">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="50%" stopColor="#00DCC8"/>
          <stop offset="100%" stopColor="transparent"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function QrCheckinPage() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.08 0.02 240)", color: "white", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(0,10,15,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none"><defs><linearGradient id="qh1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#007ABA"/><stop offset="100%" stopColor="#00DCC8"/></linearGradient></defs><rect width="40" height="40" rx="9" fill="url(#qh1)"/><text x="20" y="28" textAnchor="middle" fontFamily="'Orbitron', monospace" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">A</text></svg>
          <span style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "15px", color: "#00DCC8" }}>ada2ai</span>
        </div>
        <span style={{ fontFamily: "'Orbitron', monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>تسجيل QR</span>
        <button onClick={() => navigate("/product")} style={{ background: "rgba(0,220,200,0.1)", border: "1px solid rgba(0,220,200,0.3)", borderRadius: "8px", padding: "6px 14px", color: "#00DCC8", cursor: "pointer", fontSize: "13px" }}>
          رجوع ←
        </button>
      </header>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Hero */}
        <section style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
            <QRCodeSVG />
          </div>
          <div style={{ display: "inline-block", background: "rgba(0,122,186,0.12)", border: "1px solid rgba(0,122,186,0.35)", borderRadius: "100px", padding: "6px 18px", fontSize: "11px", fontFamily: "'Orbitron', monospace", letterSpacing: "0.15em", color: "#007ABA", marginBottom: "24px" }}>
            ACCESS SYSTEM
          </div>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "clamp(28px, 5vw, 52px)", lineHeight: 1.1, marginBottom: "20px", background: "linear-gradient(135deg, #ffffff, #00DCC8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            تسجيل الدخول الفوري بـ QR
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "18px", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            يعرض الرياضيون رمز QR الخاص بـ ada2ai في أي منشأة مسجلة. يتم التحقق في الوقت الفعلي. يُسجَّل الحضور تلقائيًا. في أقل من 3 ثوان.
          </p>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "32px" }}>
            كيف يعمل
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            {[
              { step: "01", icon: <QrCode size={28} color="#00DCC8" />, title: "افتح التطبيق", desc: "شغّل تطبيق ada2ai على هاتفك." },
              { step: "02", icon: <Scan size={28} color="#00DCC8" />, title: 'اضغط "عرض QR"', desc: "يظهر رمز QR المشفر الفريد فورًا — يتجدد كل 15 دقيقة." },
              { step: "03", icon: <ShieldCheck size={28} color="#00DCC8" />, title: "امسح عند المدخل", desc: "ارفع رمز QR الخاص بك أمام ماسح مدخل المنشأة." },
              { step: "04", icon: <CheckCircle2 size={28} color="#00DCC8" />, title: "تم منح الوصول", desc: "موثق بالأخضر — تم منح الوصول وتسجيل الحضور في الوقت الفعلي." },
            ].map((item) => (
              <div key={item.step} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontSize: "10px", color: "#007ABA", marginBottom: "10px", letterSpacing: "0.1em" }}>STEP {item.step}</div>
                <div style={{ marginBottom: "10px" }}>{item.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, fontSize: "13px", color: "#00DCC8", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key numbers */}
        <section style={{ marginBottom: "72px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            {[
              { val: "<3s", label: "وقت التحقق" },
              { val: "15 دقيقة", label: "صلاحية الرمز" },
              { val: "+400", label: "منشأة مسجلة" },
              { val: "24/7", label: "توفر النظام" },
            ].map((stat) => (
              <div key={stat.val} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "24px", color: "#00DCC8", marginBottom: "8px" }}>{stat.val}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section style={{ marginBottom: "72px" }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "22px", color: "white", marginBottom: "24px" }}>
            الأمان والخصوصية
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {[
              { icon: <Clock size={28} color="#00DCC8" />, title: "تجديد تلقائي", desc: "ينتهي رمز QR ويتجدد كل 15 دقيقة — يمنع إعادة استخدام لقطات الشاشة." },
              { icon: <Lock size={28} color="#00DCC8" />, title: "لا بيانات شخصية", desc: "لا يُكشف عن اسم أو رقم هوية للماسح. فقط مرجع تشفيري." },
              { icon: <ShieldCheck size={28} color="#00DCC8" />, title: "تشفير RSA-2048", desc: "جميع حمولات QR موقَّعة بـ RSA-2048 وتتحقق منها الخادم في الوقت الفعلي." },
            ].map((item) => (
              <div key={item.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,220,200,0.15)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ marginBottom: "12px" }}>{item.icon}</div>
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
            عرض رمز QR الخاص بك
          </button>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", marginTop: "16px" }}>
            يعمل في أكثر من 400 منشأة مسجلة في المملكة العربية السعودية
          </p>
        </section>
      </main>
    </div>
  );
}
