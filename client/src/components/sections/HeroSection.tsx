import { useEffect, useState } from "react";
import { ChevronDown, Play, MapPin, Zap } from "lucide-react";

const stats = [
  { value: "30M+", label: "شاب سعودي" },
  { value: "200+", label: "نادي وأكاديمية" },
  { value: "96.2%", label: "دقة التحليل" },
  { value: "0", label: "منافس محلي" },
];

export default function HeroSection() {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "اكتشف المواهب بالذكاء الاصطناعي";

  useEffect(() => {
    let i = 0;
    const delay = setTimeout(() => {
      const interval = setInterval(() => {
        if (i <= fullText.length) {
          setTypedText(fullText.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          // Blink cursor after typing
          const blink = setInterval(() => setShowCursor((v) => !v), 600);
          setTimeout(() => clearInterval(blink), 3000);
        }
      }, 55);
      return () => clearInterval(interval);
    }, 800);
    return () => clearTimeout(delay);
  }, []);

  const scrollToNext = () => {
    document.querySelector("#problem")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ paddingTop: "4rem" }}
    >
      {/* Hero background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/scout-ai-hero-bg-K8zgnitrWWupru7JHQnRda.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
        }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[oklch(0.08_0.02_240/0.5)] via-transparent to-[oklch(0.08_0.02_240)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[oklch(0.08_0.02_240/0.8)] via-transparent to-[oklch(0.08_0.02_240/0.8)]" />

      {/* Grid */}
      <div className="absolute inset-0 z-0 grid-bg opacity-25" />

      {/* Glowing orb */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.2 145 / 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
        {/* Top badge */}
        <div
          className="inline-flex items-center gap-2 mb-8"
          style={{ opacity: 0, animation: "fade-up 0.8s ease 0.2s forwards" }}
        >
          <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_145)] animate-pulse" />
          <span className="tag-green text-xs">
            🇸🇦 المنطقة الشرقية · دمام · خبر · ظهران
          </span>
          <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.2_145)] animate-pulse" />
        </div>

        {/* Main logo title */}
        <div
          className="mb-5"
          style={{ opacity: 0, animation: "fade-up 0.8s ease 0.4s forwards" }}
        >
          <h1
            className="font-black text-white leading-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              direction: "ltr",
              fontSize: "clamp(3.5rem, 10vw, 7rem)",
              letterSpacing: "-0.02em",
            }}
          >
            SCOUT{" "}
            <span
              style={{
                color: "oklch(0.65 0.2 145)",
                textShadow: "0 0 40px oklch(0.65 0.2 145 / 0.5), 0 0 80px oklch(0.65 0.2 145 / 0.2)",
              }}
            >
              AI
            </span>
          </h1>
        </div>

        {/* Typing subtitle */}
        <div
          className="mb-6 min-h-[3.5rem] flex items-center justify-center"
          style={{ opacity: 0, animation: "fade-up 0.8s ease 0.6s forwards" }}
        >
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            {typedText}
            <span
              className="text-[oklch(0.65_0.2_145)]"
              style={{ opacity: showCursor ? 1 : 0, transition: "opacity 0.1s" }}
            >
              |
            </span>
          </h2>
        </div>

        {/* Description */}
        <p
          className="text-white/55 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            opacity: 0,
            animation: "fade-up 0.8s ease 0.8s forwards",
          }}
        >
          ارفع فيديو لاعبك — يحلله الذكاء الاصطناعي في دقائق — ويصلك تقرير أداء احترافي مقارنة بمعايير FIFA الدولية
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          style={{ opacity: 0, animation: "fade-up 0.8s ease 1s forwards" }}
        >
          <button
            className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 w-full sm:w-auto"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
            onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Play size={18} />
            ابدأ التحليل الآن
          </button>
          <button
            className="btn-outline-green text-base px-8 py-3.5 flex items-center gap-2 w-full sm:w-auto"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
            onClick={() => document.querySelector("#solution")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Zap size={18} />
            اعرف أكثر
          </button>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
          style={{ opacity: 0, animation: "fade-up 0.8s ease 1.2s forwards" }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="card-dark rounded-xl p-4 neon-border text-center group hover:bg-[oklch(0.65_0.2_145/0.05)] transition-colors"
            >
              <div
                className="stat-number text-2xl md:text-3xl mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
              >
                {stat.value}
              </div>
              <div
                className="text-white/50 text-xs"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Location */}
        <div
          className="mt-8 flex items-center justify-center gap-2 text-white/35 text-sm"
          style={{ opacity: 0, animation: "fade-up 0.8s ease 1.4s forwards" }}
        >
          <MapPin size={13} className="neon-text" />
          <span style={{ fontFamily: "'Tajawal', sans-serif" }}>
            يبدأ من المنطقة الشرقية — ويتوسع لكل مدن المملكة
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 hover:text-[oklch(0.65_0.2_145)] transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
