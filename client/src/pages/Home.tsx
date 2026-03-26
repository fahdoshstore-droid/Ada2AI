import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Brain, Zap, Users, BarChart3,
  ChevronRight, ArrowRight, CheckCircle2,
  Activity, Trophy, Shield, Globe,
  TrendingUp, Database, Network,
  Building2, Award, Handshake,
  Search, UserX, Layers, Lock,
  IdCard, Upload, BarChart2, Link2,
  Play, ChevronDown
} from "lucide-react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";

// ── Scroll Reveal Hook ─────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

// ── Sport Logo Component ───────────────────────────────────────────────────────
function SportLogo({ src, name, color }: { src: string; name: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group cursor-pointer">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{
          background: `${color}12`,
          border: `1px solid ${color}30`,
          boxShadow: `0 0 20px ${color}10`,
        }}
      >
        <img
          src={src}
          alt={name}
          className="w-12 h-12 object-contain"
          style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
        />
      </div>
      <span
        className="text-xs font-medium text-center"
        style={{ color: "rgba(238,239,238,0.7)", fontFamily: "'Cairo', sans-serif" }}
      >
        {name}
      </span>
    </div>
  );
}

// ── Animated Counter ───────────────────────────────────────────────────────────
function AnimatedStat({ value, label, color }: { value: string; label: string; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div
        className="font-black text-3xl lg:text-4xl mb-1 transition-all duration-700"
        style={{
          color,
          fontFamily: "'Orbitron', sans-serif",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {value}
      </div>
      <div className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Home() {
  const { t, isRTL, lang } = useLanguage();
  useScrollReveal();

  const sports = [
    { key: "football", src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/football_0d0c7b9e.png", color: "#00DCC8" },
    { key: "basketball", src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/basketball_0451a053.png", color: "#FFA500" },
    { key: "boxing", src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/boxing_ed80ecdb.png", color: "#FF3B30" },
    { key: "swimming", src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/swimming_e1ebf2aa.png", color: "#007ABA" },
    { key: "freediving", src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/freediving_a7b6b82b.png", color: "#003D7A" },
    { key: "other", src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/other-sports_f2223de7.png", color: "#7B2FBE" },
  ];

  const problems = [
    {
      icon: <IdCard size={26} style={{ color: "#00DCC8" }} />,
      bg: "rgba(0,220,200,0.08)",
      border: "rgba(0,220,200,0.2)",
      title: t("problem.1.title"),
      desc: t("problem.1.desc"),
    },
    {
      icon: <Search size={26} style={{ color: "#FFA500" }} />,
      bg: "rgba(255,165,0,0.08)",
      border: "rgba(255,165,0,0.2)",
      title: t("problem.2.title"),
      desc: t("problem.2.desc"),
    },
    {
      icon: <BarChart2 size={26} style={{ color: "#007ABA" }} />,
      bg: "rgba(0,122,186,0.08)",
      border: "rgba(0,122,186,0.2)",
      title: t("problem.3.title"),
      desc: t("problem.3.desc"),
    },
    {
      icon: <Layers size={26} style={{ color: "#00DCC8" }} />,
      bg: "rgba(0,220,200,0.08)",
      border: "rgba(0,220,200,0.2)",
      title: t("problem.4.title"),
      desc: t("problem.4.desc"),
    },
  ];

  const modules = [
    {
      num: "01",
      icon: <Shield size={22} />,
      title: t("module.sportId.title"),
      desc: t("module.sportId.desc"),
      color: "#00DCC8",
      href: "/upload",
    },
    {
      num: "02",
      icon: <Brain size={22} />,
      title: t("module.aiEngine.title"),
      desc: t("module.aiEngine.desc"),
      color: "#007ABA",
      href: "/upload",
    },
    {
      num: "03",
      icon: <Users size={22} />,
      title: t("module.scouts.title"),
      desc: t("module.scouts.desc"),
      color: "#FFA500",
      href: "/scouts",
    },
    {
      num: "04",
      icon: <BarChart3 size={22} />,
      title: t("module.compare.title"),
      desc: t("module.compare.desc"),
      color: "#00DCC8",
      href: "/compare",
    },
    {
      num: "05",
      icon: <Building2 size={22} />,
      title: t("module.institutes.title"),
      desc: t("module.institutes.desc"),
      color: "#007ABA",
      href: "/academies",
    },
    {
      num: "06",
      icon: <Trophy size={22} />,
      title: t("module.training.title"),
      desc: t("module.training.desc"),
      color: "#FFA500",
      href: "/training",
    },
  ];

  const steps = [
    { num: "01", icon: <IdCard size={20} />, title: t("how.1.title"), desc: t("how.1.desc"), color: "#00DCC8" },
    { num: "02", icon: <Upload size={20} />, title: t("how.2.title"), desc: t("how.2.desc"), color: "#007ABA" },
    { num: "03", icon: <Brain size={20} />, title: t("how.3.title"), desc: t("how.3.desc"), color: "#FFA500" },
    { num: "04", icon: <Search size={20} />, title: t("how.4.title"), desc: t("how.4.desc"), color: "#00DCC8" },
    { num: "05", icon: <Link2 size={20} />, title: t("how.5.title"), desc: t("how.5.desc"), color: "#007ABA" },
  ];

  return (
    <div
      className="min-h-screen bg-[#000A0F] text-[#EEEFEE] overflow-x-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Ada2aiNavbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION — Full-screen with background image
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/hero-bg_f16bf027.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,10,15,0.75) 0%, rgba(0,10,15,0.55) 50%, rgba(0,10,15,0.95) 100%)",
          }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 ada-grid-bg opacity-20 pointer-events-none z-0" />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,220,200,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-16">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span
              className="badge-verified text-xs px-4 py-1.5 rounded-full font-semibold tracking-widest"
              style={{
                background: "rgba(0,220,200,0.12)",
                color: "#00DCC8",
                border: "1px solid rgba(0,220,200,0.3)",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              {t("hero.badge")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-orbitron font-black text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            <span className="block text-[#EEEFEE]">{t("hero.headline1")}</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, #00DCC8 0%, #007ABA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("hero.headline2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{
              color: "rgba(238,239,238,0.75)",
              fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
            }}
          >
            {t("hero.sub")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            <Link href="/product">
              <button className="btn-ada-outline text-sm px-8 py-4 flex items-center gap-2 text-base">
                <Play size={16} /> {t("hero.cta2")}
              </button>
            </Link>
          </div>

          {/* Stats Row */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mb-12"
          >
            {[
              { val: t("hero.stat1.val"), label: t("hero.stat1.label"), color: "#00DCC8" },
              { val: t("hero.stat2.val"), label: t("hero.stat2.label"), color: "#007ABA" },
              { val: t("hero.stat3.val"), label: t("hero.stat3.label"), color: "#FFA500" },
              { val: t("hero.stat4.val"), label: t("hero.stat4.label"), color: "#00DCC8" },
            ].map((s, i) => (
              <AnimatedStat key={i} value={s.val} label={s.label} color={s.color} />
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center">
            <div
              className="flex flex-col items-center gap-1 animate-bounce cursor-pointer"
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
            >
              <span className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? "اكتشف المزيد" : "Discover More"}
              </span>
              <ChevronDown size={18} style={{ color: "rgba(238,239,238,0.3)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SPORTS SECTION — 6 Sport Logos
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(0,220,200,0.08)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-3 text-[#EEEFEE]">
              {t("sports.title")}
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{
                color: "rgba(238,239,238,0.55)",
                fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                lineHeight: 1.8,
              }}
            >
              {t("sports.sub")}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {sports.map((s) => (
              <div key={s.key} className="reveal">
                <SportLogo
                  src={s.src}
                  name={t(`sports.${s.key}`)}
                  color={s.color}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PROBLEM SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 relative"
        style={{ background: "rgba(0,5,10,0.6)", borderTop: "1px solid rgba(0,220,200,0.06)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/about-bg_14f2ff5e.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.06,
          }}
        />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <span className="badge-pro mb-4 inline-block">{t("problem.badge")}</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
              {t("problem.title")}
            </h2>
            <p
              className="text-base max-w-2xl mx-auto"
              style={{
                color: "rgba(238,239,238,0.55)",
                fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                lineHeight: 1.9,
              }}
            >
              {t("problem.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {problems.map((p, i) => (
              <div key={i} className="ada-card p-6 reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}
                >
                  {p.icon}
                </div>
                <h3
                  className="font-bold text-base mb-2 text-[#EEEFEE]"
                  style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}
                >
                  {p.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: "rgba(238,239,238,0.55)",
                    fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                    lineHeight: 1.8,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SOLUTION / MODULES SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(0,220,200,0.06)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <span className="badge-verified mb-4 inline-block">{t("solution.badge")}</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
              {t("solution.title")}
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{
                color: "rgba(238,239,238,0.55)",
                fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                lineHeight: 1.9,
              }}
            >
              {t("solution.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {modules.map((m, i) => (
              <Link key={i} href={m.href}>
                <div
                  className="ada-card p-6 cursor-pointer group transition-all duration-300 hover:scale-[1.02] reveal"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ background: `${m.color}15`, color: m.color }}
                    >
                      {m.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold"
                          style={{ color: m.color, fontFamily: "'Orbitron', sans-serif" }}
                        >
                          {m.num}
                        </span>
                      </div>
                      <h3
                        className="font-bold text-sm mb-2 text-[#EEEFEE]"
                        style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}
                      >
                        {m.title}
                      </h3>
                      <p
                        className="text-xs"
                        style={{
                          color: "rgba(238,239,238,0.5)",
                          fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                          lineHeight: 1.8,
                        }}
                      >
                        {m.desc}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1 mt-4 text-xs font-medium transition-all duration-200 group-hover:gap-2"
                    style={{ color: m.color }}
                  >
                    <span style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit" }}>
                      {t("common.learnMore")}
                    </span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{ background: "rgba(0,5,10,0.5)", borderTop: "1px solid rgba(0,220,200,0.06)" }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <span className="badge-pro mb-4 inline-block">{t("how.badge")}</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl text-[#EEEFEE]">
              {t("how.title")}
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-6 mb-8 reveal ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Number */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg"
                  style={{
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}30`,
                    color: step.color,
                    fontFamily: "'Orbitron', sans-serif",
                  }}
                >
                  {step.num}
                </div>
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: step.color }}>{step.icon}</span>
                    <h3
                      className="font-bold text-base text-[#EEEFEE]"
                      style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p
                    className="text-sm"
                    style={{
                      color: "rgba(238,239,238,0.55)",
                      fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                      lineHeight: 1.8,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute"
                    style={{
                      left: isRTL ? "auto" : "27px",
                      right: isRTL ? "27px" : "auto",
                      width: "2px",
                      height: "32px",
                      background: `linear-gradient(to bottom, ${step.color}40, transparent)`,
                      marginTop: "56px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ATHLETE SHOWCASE SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(0,220,200,0.06)" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Image */}
            <div className={`reveal ${isRTL ? "reveal-right" : "reveal-left"}`}>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid rgba(0,220,200,0.15)",
                  boxShadow: "0 0 60px rgba(0,220,200,0.08)",
                }}
              >
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/athlete-profile_0c5f1de1.jpg"
                  alt="Athlete"
                  className="w-full object-cover"
                  style={{ maxHeight: "480px", objectPosition: "top" }}
                />
                {/* Overlay card */}
                <div
                  className="absolute bottom-4 left-4 right-4 rounded-xl p-4"
                  style={{
                    background: "rgba(0,10,15,0.85)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(0,220,200,0.2)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div
                        className="font-bold text-sm text-[#EEEFEE]"
                        style={{ fontFamily: "'Cairo', sans-serif" }}
                      >
                        {isRTL ? "أحمد الشمري" : "Ahmed Al-Shamri"}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "#00DCC8", fontFamily: "'Cairo', sans-serif" }}
                      >
                        {isRTL ? "مهاجم • كرة القدم" : "Forward • Football"}
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: "rgba(0,220,200,0.15)",
                        color: "#00DCC8",
                        fontFamily: "'Orbitron', sans-serif",
                      }}
                    >
                      92/100
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { k: isRTL ? "سرعة" : "Speed", v: "88" },
                      { k: isRTL ? "قوة" : "Strength", v: "82" },
                      { k: isRTL ? "تقنية" : "Technique", v: "92" },
                      { k: isRTL ? "تحمل" : "Endurance", v: "79" },
                    ].map((m, j) => (
                      <div key={j}>
                        <div
                          className="font-black text-sm"
                          style={{ color: "#00DCC8", fontFamily: "'Orbitron', sans-serif" }}
                        >
                          {m.v}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}
                        >
                          {m.k}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className={`reveal ${isRTL ? "reveal-left" : "reveal-right"}`}>
              <span className="badge-verified mb-5 inline-block">
                {isRTL ? "الهوية الرياضية الرقمية" : "Sport Digital ID"}
              </span>
              <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-5 text-[#EEEFEE]">
                {isRTL ? (
                  <>كل رياضي يستحق<br /><span style={{ color: "#00DCC8" }}>هوية رقمية</span></>
                ) : (
                  <>Every Athlete Deserves<br /><span style={{ color: "#00DCC8" }}>a Digital Identity</span></>
                )}
              </h2>
              <p
                className="text-base mb-6"
                style={{
                  color: "rgba(238,239,238,0.6)",
                  fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                  lineHeight: 1.9,
                }}
              >
                {isRTL
                  ? "ada2ai تمنح كل رياضي هوية رقمية موثقة — ملف شامل مع بيانات أداء محللة بالذكاء الاصطناعي ورمز QR قابل للمسح وتقرير قياسي دولي."
                  : "ada2ai gives every athlete a verified digital identity — a comprehensive profile with AI-analyzed performance data, scannable QR code, and internationally standardized report."}
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                {(isRTL
                  ? ["تحليل أداء فوري بالذكاء الاصطناعي", "هوية رقمية قابلة للمشاركة والتحقق", "مقاييس خاصة بكل رياضة", "معايير حوكمة دولية"]
                  : ["Instant AI performance analysis", "Shareable & verifiable digital identity", "Sport-specific performance metrics", "International governance standards"]
                ).map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 size={15} className="flex-shrink-0" style={{ color: "#00DCC8" }} />
                    <span
                      className="text-sm"
                      style={{
                        color: "rgba(238,239,238,0.7)",
                        fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/upload">
                <button className="btn-ada-primary text-sm px-7 py-3 flex items-center gap-2">
                  <Zap size={15} />
                  {isRTL ? "جرّب الآن" : "Try It Now"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{
          background: "rgba(0,5,10,0.7)",
          borderTop: "1px solid rgba(0,220,200,0.06)",
          borderBottom: "1px solid rgba(0,220,200,0.06)",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { val: t("hero.stat1.val"), label: t("hero.stat1.label"), color: "#00DCC8" },
              { val: t("hero.stat2.val"), label: t("hero.stat2.label"), color: "#007ABA" },
              { val: t("hero.stat3.val"), label: t("hero.stat3.label"), color: "#FFA500" },
              { val: t("hero.stat4.val"), label: t("hero.stat4.label"), color: "#00DCC8" },
            ].map((s, i) => (
              <div key={i} className="reveal text-center">
                <AnimatedStat value={s.val} label={s.label} color={s.color} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          VISION 2030 SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(0,220,200,0.06)" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 reveal">
              <span className="badge-pro mb-4 inline-block">{t("vision.badge")}</span>
              <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
                {t("vision.title")}
              </h2>
              <p
                className="text-base max-w-xl mx-auto"
                style={{
                  color: "rgba(238,239,238,0.55)",
                  fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                  lineHeight: 1.9,
                }}
              >
                {t("vision.sub")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 reveal">
              {[
                {
                  icon: <Globe size={22} />,
                  title: isRTL ? "التحول الرقمي" : "Digital Transformation",
                  desc: isRTL ? "تحويل عمليات الكشف الرياضي من يدوية إلى رقمية ذكية" : "Transforming sports scouting from manual to intelligent digital processes",
                  color: "#00DCC8",
                },
                {
                  icon: <Award size={22} />,
                  title: isRTL ? "تطوير المواهب" : "Talent Development",
                  desc: isRTL ? "بناء منظومة متكاملة لاكتشاف وتطوير المواهب الرياضية السعودية" : "Building an integrated ecosystem for discovering and developing Saudi sports talent",
                  color: "#007ABA",
                },
                {
                  icon: <Network size={22} />,
                  title: isRTL ? "الاقتصاد الرياضي" : "Sports Economy",
                  desc: isRTL ? "المساهمة في رفع نسبة مشاركة المواطنين في الأنشطة الرياضية" : "Contributing to raising citizen participation rates in sports activities",
                  color: "#FFA500",
                },
              ].map((item, i) => (
                <div key={i} className="ada-card p-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color}15`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className="font-bold text-sm mb-2 text-[#EEEFEE]"
                    style={{ fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-xs"
                    style={{
                      color: "rgba(238,239,238,0.55)",
                      fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
                      lineHeight: 1.8,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

         {/* ════════════════════════════════════════════════════════════
          ADA2AI VIDEO SHOWCASE
      ════════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ background: "#000A0F", borderTop: "1px solid rgba(0,220,200,0.08)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,122,186,0.06) 0%, transparent 70%)" }} />
        <div className="relative container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4" style={{ background: "rgba(0,220,200,0.06)", borderColor: "rgba(0,220,200,0.2)" }}>
              <span className="w-2 h-2 rounded-full bg-[#00DCC8] animate-pulse" />
              <span className="text-[#00DCC8] text-[10px] font-orbitron tracking-widest">ADA2AI PLATFORM</span>
            </div>
            <h2 className="font-orbitron font-black text-2xl lg:text-3xl text-[#EEEFEE] mb-3">
              {lang === "ar" ? "شاهد كيف تعمل المنصة" : "See Ada2ai in Action"}
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.9 }}>
              {lang === "ar" ? "من الاكتشاف إلى بطاقة SportID إلى الاحتراف — منظومة متكاملة بالذكاء الاصطناعي" : "From discovery to SportID to Pro — one integrated AI platform"}
            </p>
          </motion.div>

          {/* Main Featured Video */}
          <motion.div
            className="max-w-xs mx-auto mb-10"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,220,200,0.2)", boxShadow: "0 0 60px rgba(0,220,200,0.08), 0 0 120px rgba(0,122,186,0.06)" }}>
              <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded text-[10px] font-bold" style={{ background: "rgba(0,220,200,0.15)", border: "1px solid rgba(0,220,200,0.3)", color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                Ada2ai
              </div>
              <video
                src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/ada2ai_v3_with_music_33ecafdd.mp4"
                className="w-full"
                style={{ aspectRatio: "9/16", objectFit: "cover", display: "block" }}
                controls
                playsInline
                preload="metadata"
              />
            </div>
          </motion.div>

          {/* 3 Clip Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/clip1_final_d6652735.mp4",
                label: lang === "ar" ? "شعار Ada2ai" : "Ada2ai Opening",
                color: "#00DCC8",
              },
              {
                src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/clip2_final_2b5e6708.mp4",
                label: lang === "ar" ? "تحليل اللاعب" : "AI Analysis",
                color: "#007ABA",
              },
              {
                src: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/clip3_fifa_v4_4e9e0fe7.mp4",
                label: lang === "ar" ? "بطاقة SportID" : "SportID Card",
                color: "#FFD700",
              },
            ].map((clip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${clip.color}25`, background: "rgba(255,255,255,0.02)" }}
              >
                <video
                  src={clip.src}
                  className="w-full"
                  style={{ aspectRatio: "9/16", objectFit: "cover", display: "block" }}
                  controls
                  playsInline
                  preload="metadata"
                  muted
                />
                <div className="px-3 py-2 text-xs font-semibold" style={{ color: clip.color, fontFamily: "'Cairo', sans-serif" }}>
                  {clip.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: "rgba(0,5,10,0.8)", borderTop: "1px solid rgba(0,220,200,0.08)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,122,186,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="font-orbitron font-black text-3xl lg:text-4xl mb-5 text-[#EEEFEE] reveal">
            {t("cta.title")}
          </h2>
          <p
            className="text-base mb-10 max-w-xl mx-auto reveal"
            style={{
              color: "rgba(238,239,238,0.6)",
              fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit",
              lineHeight: 1.9,
            }}
          >
            {t("cta.sub")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 reveal">
            <Link href="/upload">
              <button className="btn-ada-primary text-base px-10 py-4 flex items-center gap-2">
                <Zap size={18} /> {t("cta.btn1")}
              </button>
            </Link>
            <Link href="/product">
              <button className="btn-ada-outline text-base px-8 py-4 flex items-center gap-2">
                {t("cta.btn2")} <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer
        className="py-12"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#000A0F" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
                style={{
                  background: "linear-gradient(135deg, #00DCC8, #007ABA)",
                  fontFamily: "'Orbitron', sans-serif",
                  color: "#000A0F",
                }}
              >
                A
              </div>
              <div>
                <div className="font-black text-base text-[#EEEFEE]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  ada2ai
                </div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}
                >
                  {t("footer.tagline")}
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div
              className="flex flex-wrap justify-center gap-6 text-sm"
              style={{ color: "rgba(238,239,238,0.5)", fontFamily: lang === "ar" ? "'Cairo', sans-serif" : "inherit" }}
            >
              <Link href="/product" className="hover:text-[#00DCC8] transition-colors">{t("nav.product")}</Link>
              <Link href="/training" className="hover:text-[#00DCC8] transition-colors">{t("nav.training")}</Link>
              <Link href="/academies" className="hover:text-[#00DCC8] transition-colors">{t("nav.partnerships")}</Link>
              <Link href="/governance/team" className="hover:text-[#00DCC8] transition-colors">{t("nav.governance")}</Link>
            </div>
          </div>

          <div
            className="text-xs text-center"
            style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Cairo', sans-serif" }}
          >
            {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
