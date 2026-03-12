import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronDown, Zap, Shield } from "lucide-react";

const VIDEO_URL =
  "https://private-us-east-1.manuscdn.com/user_upload_by_module/session_file/115062705/fgWPNJSEdMZeRqbF.mp4?Expires=1804876422&Signature=KhA1M5QZFDYK1NaXDtIfPpbYEFNeP9DgjIB1QnEAJ1gx234uN9UhgfxDURf0Cyl17HUj-veP6ANpFgtZ4~WPfT2PWLIzR8X-f6iEeBVDUzRXcXtnhF~BYLK3J~j617ZBFzNdsBTKXhEU4n~DJRqXwKd2TBeNEbmIbU6f5A4CKqDZIlo37rp~h1R8OEOzFE0eqscaLT8jcPduds7NqWVqvgREuMt-feLr~fk-8A02zqO8Bm4ehnYBxXblEiJ7SxXhQLYzi-ij3~ah9Y6pbSa8XhDHVztBHTrUNLUv8yH~R2r43Ugu4inqRs~wahshK1CdEk-zxz68m2G~HQq16cD65g__&Key-Pair-Id=K2HSFNDJXOU9YS";

// Design: Saudi Digital Noir — deep navy #0A1628 + teal #00C2A8 + neon green
// Two pillars: Scout AI (talent discovery) + SportID (digital passport)

const stats = [
  { value: "12+", label: "لاعب موثق" },
  { value: "10", label: "أكاديمية محلية" },
  { value: "96.2%", label: "دقة التحليل AI" },
  { value: "3", label: "مدن مُغطاة" },
];

export default function HeroSection() {
  const [, navigate] = useLocation();
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [activeCard, setActiveCard] = useState<"scout" | "sport">("scout");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullText = "اكتشف · حلّل · وثّق";

  // Autoplay video on mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  useEffect(() => {
    let i = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        if (i <= fullText.length) {
          setTypedText(fullText.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          const blink = setInterval(() => setShowCursor((v) => !v), 600);
          setTimeout(() => clearInterval(blink), 4000);
        }
      }, 80);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveCard((c) => (c === "scout" ? "sport" : "scout")), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ paddingTop: "4rem" }}>
      {/* ── VIDEO BACKGROUND ── */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: videoLoaded ? 0.28 : 0,
          transition: "opacity 2s ease",
          zIndex: 0,
        }}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        onCanPlay={() => setVideoLoaded(true)}
      />
      {/* Dark overlay on top of video */}
      <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(180deg, oklch(0.06 0.02 240 / 0.85) 0%, oklch(0.08 0.02 240 / 0.55) 40%, oklch(0.08 0.02 240 / 0.75) 75%, oklch(0.06 0.02 240) 100%)" }} />
      {/* Vignette */}
      <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse at center, transparent 25%, oklch(0.04 0.02 240 / 0.65) 100%)" }} />
      <div className="absolute inset-0 z-0 grid-bg opacity-10" />

      {/* Dual glow orbs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, oklch(0.65 0.2 145 / 0.07) 0%, transparent 70%)" }} />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(0,194,168,0.07) 0%, transparent 70%)" }} />

      <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
        {/* Platform badge */}
        <div className="inline-flex items-center gap-3 mb-8" style={{ opacity: 0, animation: "fade-up 0.8s ease 0.2s forwards" }}>
          <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_145)] animate-pulse" />
          <span className="tag-green text-xs">🇸🇦 المنطقة الشرقية · منصة رياضية متكاملة</span>
          <div className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse" />
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Tajawal', sans-serif", opacity: 0, animation: "fade-up 0.8s ease 0.4s forwards" }}>
          <span className="neon-text">{typedText}</span>
          <span className={`neon-text ${showCursor ? "opacity-100" : "opacity-0"}`}>|</span>
        </h1>

        <p className="text-white/55 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", opacity: 0, animation: "fade-up 0.8s ease 0.6s forwards" }}>
          منصة <strong className="text-white">SportScout</strong> تجمع تحليل المواهب بالذكاء الاصطناعي مع جواز السفر الرياضي الرقمي الموثق بـ نفاذ
        </p>

        {/* Dual platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10" style={{ opacity: 0, animation: "fade-up 0.8s ease 0.7s forwards" }}>
          {/* Scout AI Card */}
          <div
            onClick={() => navigate("/demo")}
            className={`cursor-pointer rounded-2xl p-5 text-right transition-all duration-500 border ${activeCard === "scout" ? "border-[oklch(0.65_0.2_145/0.6)] bg-[oklch(0.65_0.2_145/0.08)] scale-[1.02]" : "border-white/10 bg-white/3 hover:border-[oklch(0.65_0.2_145/0.3)]"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.65_0.2_145/0.15)] flex items-center justify-center">
                <Zap size={20} className="text-[oklch(0.65_0.2_145)]" />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[oklch(0.65_0.2_145/0.15)] text-[oklch(0.65_0.2_145)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>Scout AI</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>اكتشاف المواهب</h3>
            <p className="text-white/45 text-sm leading-relaxed" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
              تحليل فيديو اللاعب بالذكاء الاصطناعي · تقارير أداء شاملة · لوحة الكشافين
            </p>
          </div>

          {/* SportID Card */}
          <div
            onClick={() => navigate("/sportid")}
            className={`cursor-pointer rounded-2xl p-5 text-right transition-all duration-500 border ${activeCard === "sport" ? "border-[#00C2A8/60] bg-[rgba(0,194,168,0.08)] scale-[1.02]" : "border-white/10 bg-white/3 hover:border-[rgba(0,194,168,0.3)]"}`}
            style={{ borderColor: activeCard === "sport" ? "rgba(0,194,168,0.6)" : undefined, background: activeCard === "sport" ? "rgba(0,194,168,0.06)" : undefined }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,194,168,0.15)" }}>
                <Shield size={20} style={{ color: "#00C2A8" }} />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(0,194,168,0.15)", color: "#00C2A8", fontFamily: "'Tajawal', sans-serif" }}>SportID</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>جواز السفر الرياضي</h3>
            <p className="text-white/45 text-sm leading-relaxed" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
              هوية رقمية موثقة بنفاذ · QR للحضور · نظام النقاط والمستويات
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12" style={{ opacity: 0, animation: "fade-up 0.8s ease 0.9s forwards" }}>
          <button onClick={() => navigate("/upload")} className="btn-primary px-8 py-3.5 text-base flex items-center justify-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <Zap size={18} /> ابدأ تحليل AI
          </button>
          <button onClick={() => navigate("/sportid")} className="px-8 py-3.5 text-base rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border hover:opacity-90" style={{ background: "rgba(0,194,168,0.15)", borderColor: "rgba(0,194,168,0.4)", color: "#00C2A8", fontFamily: "'Tajawal', sans-serif" }}>
            <Shield size={18} /> احصل على SportID
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto" style={{ opacity: 0, animation: "fade-up 0.8s ease 1.1s forwards" }}>
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: i % 2 === 0 ? "oklch(0.65 0.2 145)" : "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
              <div className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button onClick={() => document.querySelector("#problem")?.scrollIntoView({ behavior: "smooth" })} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/30 hover:text-white/60 transition-colors animate-bounce">
        <ChevronDown size={24} />
      </button>
    </section>
  );
}
