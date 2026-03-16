import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Brain, Zap, Users, BarChart3, MapPin, Play,
  ChevronRight, ArrowRight, CheckCircle2,
  Activity, Trophy, Target, Shield, Globe,
  Waves, TrendingUp, Bike, Swords,
  Database, Network,
  Building2, Award, Handshake,
  Search, UserX, Layers, Lock
} from "lucide-react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";

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

// ── Particle Background ────────────────────────────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5, opacity: Math.random() * 0.3 + 0.05,
      });
    }
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 220, 200, ${p.opacity})`; ctx.fill();
      });
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 220, 200, ${0.06 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.5 }} />;
}

// ── Sports Sectors — Federation-aligned ───────────────────────────────────────
const sportsSectors = [
  { icon: <Trophy size={22} />, name: "Football", color: "#00DCC8" },
  { icon: <Activity size={22} />, name: "Basketball", color: "#007ABA" },
  { icon: <Swords size={22} />, name: "Boxing", color: "#FFA500" },
  { icon: <Bike size={22} />, name: "Cycling", color: "#00DCC8" },
  { icon: <Waves size={22} />, name: "Swimming", color: "#007ABA" },
  { icon: <Waves size={22} />, name: "Free Diving", color: "#00DCC8" },
  { icon: <Globe size={22} />, name: "Other Sports", color: "rgba(238,239,238,0.5)" },
];

// ── 6 Platform Modules ─────────────────────────────────────────────────────────
const modules = [
  {
    num: "01",
    icon: <Shield size={24} />,
    title: "Sport ID",
    badge: "DIGITAL ID",
    badgeColor: "#007ABA",
    desc: "Digital athlete identity with QR code, radar chart, certifications, and verifiable performance history. The athlete's career record, always accessible.",
    link: "/demo",
    cta: "View Demo",
  },
  {
    num: "02",
    icon: <Brain size={24} />,
    title: "AI Analysis",
    badge: "CORE",
    badgeColor: "#00DCC8",
    desc: "Upload image or video → AI processes 18 metrics → delivers a 25-field professional scout report in seconds. No equipment required. Works across all sports.",
    link: "/demo",
    cta: "Try Now",
  },
  {
    num: "03",
    icon: <Users size={24} />,
    title: "Scouts Dashboard",
    badge: "DISCOVERY",
    badgeColor: "#00DCC8",
    desc: "Search, filter, and rank athletes by 18 metrics across all Saudi regions. Discover talent across Saudi Arabia's emerging sports ecosystems from a single interface.",
    link: "/scouts",
    cta: "Explore",
  },
  {
    num: "04",
    icon: <BarChart3 size={24} />,
    title: "Compare Engine",
    badge: "ANALYTICS",
    badgeColor: "#FFA500",
    desc: "Side-by-side dual-athlete analysis with radar chart overlay and AI-generated recommendations. Objective comparison at scale.",
    link: "/compare",
    cta: "Compare",
  },
  {
    num: "05",
    icon: <MapPin size={24} />,
    title: "Partnerships Directory",
    badge: "NETWORK",
    badgeColor: "#007ABA",
    desc: "Google Maps integration with 500+ sports institutes and academies across KSA. Filter by city, sport, age group, and accreditation status. Connecting athletes to pathways.",
    link: "/academies",
    cta: "Find Partner",
  },
  {
    num: "06",
    icon: <Play size={24} />,
    title: "AI Demo",
    badge: "FREE ACCESS",
    badgeColor: "#00DCC8",
    desc: "Experience the full platform before signing up — upload a photo or video and receive a professional athlete analysis report instantly. Zero friction, zero equipment.",
    link: "/demo",
    cta: "Try Free",
  },
];

// ── Stats ──────────────────────────────────────────────────────────────────────
const stats = [
  { value: "500+", label: "Sports Institutes", sub: "Across KSA" },
  { value: "97+", label: "Sports Federations", sub: "Nationwide" },
  { value: "8+", label: "Expansion Regions", sub: "Early Phase" },
  { value: "8+", label: "Sports Sectors", sub: "Covered" },
];

// ── Benefits ───────────────────────────────────────────────────────────────────
const benefits = [
  {
    icon: <Target size={20} />,
    title: "For Athletes",
    accentColor: "#00DCC8",
    points: [
      "Professional AI scout report in seconds",
      "Digital ID with verifiable history",
      "Position-specific performance benchmarking",
      "Networking Among Athletes",
      "Athlete Networking Ecosystem",
    ],
  },
  {
    icon: <Users size={20} />,
    title: "For Partnerships & Clubs",
    accentColor: "#007ABA",
    points: [
      "Discover regional talent at scale",
      "Objective multi-metric comparison",
      "Empower scouting operations through structured talent intelligence.",
      "Recruitment decisions supported by data analytics.",
    ],
  },
  {
    icon: <Globe size={20} />,
    title: "For Saudi Arabia",
    accentColor: "#FFA500",
    points: [
      "Supports national sports development agenda",
      "Democratizes talent discovery nationwide",
      "Builds national sports data infrastructure",
      "Enables grassroots-to-professional pipeline",
    ],
  },
];

// ── How It Works — 6 steps ─────────────────────────────────────────────────────
const steps = [
  { n: "01", title: "Registration", desc: "Athletes and scouts register on the platform to create their verified profile." },
  { n: "02", title: "Upload Media", desc: "Upload a photo or video of the athlete performing in their sport. No special equipment required." },
  { n: "03", title: "AI Analysis", desc: "The AI engine processes performance metrics across sport-specific benchmarks and governance standards." },
  { n: "04", title: "Performance Report", desc: "Receive a professional report with scores, Sport DNA, and development recommendations." },
  { n: "05", title: "Decision Support", desc: "Scouts, coaches, and federations access structured intelligence to make informed decisions." },
  { n: "06", title: "Results Tracking", desc: "Monitor athlete progress over time and track development milestones." },
];

// ── Strategic Alignment pillars ────────────────────────────────────────────────
const strategyPillars = [
  {
    icon: <Database size={22} />,
    title: "National Sports Data Infrastructure",
    desc: "ada2ai builds the first unified athlete data layer in the Kingdom — enabling federations, clubs, and institutes to access structured performance intelligence at national scale.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Athlete Development Pipeline",
    desc: "From grassroots identification to professional pathways — the platform creates a continuous, data-driven development pipeline aligned with Saudi Arabia's sports economy targets.",
  },
  {
    icon: <Network size={22} />,
    title: "Federation Collaboration Model",
    desc: "Designed to integrate with 97+ sports federations — providing standardized reporting, talent pools, and performance benchmarks that support national team development programs.",
  },
];

// ── Partnership categories ─────────────────────────────────────────────────────
const partnerCategories = [
  { icon: <Award size={24} />, label: "Sports Federations", count: "97+" },
  { icon: <Building2 size={24} />, label: "Sports Institutes", count: "500+" },
  { icon: <Trophy size={24} />, label: "Clubs", count: "200+" },
  { icon: <MapPin size={24} />, label: "Academies", count: "300+" },
  { icon: <Handshake size={24} />, label: "Partners", count: "50+" },
];

export default function Home() {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE] overflow-x-hidden">
      <ParticleBackground />
      <Ada2aiNavbar />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,220,200,0.07) 0%, transparent 70%)",
            }}
          />
          {/* Video background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.12, zIndex: 0 }}
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-soccer-player-kicking-ball-in-a-stadium-34761-large.mp4" type="video/mp4" />
          </video>
          {/* Grid overlay */}
          <div className="absolute inset-0 ada-grid-bg opacity-60 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          {/* Badge — item 2: replace "Powered by Claude Vision" */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: "rgba(0,220,200,0.08)", border: "1px solid rgba(0,220,200,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00DCC8] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#00DCC8]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Powered by Saudi Brain's
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-orbitron font-black leading-tight mb-6"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4.5rem)" }}>
            <span className="text-[#EEEFEE]">The AI Platform for</span>
            <br />
            <span style={{
              background: "linear-gradient(135deg, #00DCC8 0%, #007ABA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Sports Talent Discovery
            </span>
          </h1>

          {/* Sub — English only, no Arabic */}
          <p className="text-lg mb-8 max-w-2xl mx-auto"
            style={{ color: "rgba(238,239,238,0.75)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
            A grassroots-to-professional talent discovery platform — identifying and developing athletes across all sports sectors in Saudi Arabia. No equipment. No experts. Just AI.
          </p>

          {/* Sports tags — item 3: federation-aligned sports */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {sportsSectors.map((s) => (
              <span key={s.name}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "rgba(0,220,200,0.06)",
                  border: "1px solid rgba(0,220,200,0.15)",
                  color: "rgba(238,239,238,0.65)",
                  fontFamily: "'Cairo', sans-serif",
                }}>
                {s.name}
              </span>
            ))}
          </div>

          {/* CTA — item 4: single strong CTA */}
          <div className="flex justify-center">
            <Link href="/demo">
              <button className="btn-ada-primary text-sm px-10 py-4 flex items-center gap-2">
                <Zap size={16} />
                Discover Talent Now
              </button>
            </Link>
          </div>

          {/* Trust line — item 2: remove FIFA/SAFF, remove Vision Alignment */}
          <p className="mt-8 text-xs" style={{ color: "rgba(238,239,238,0.35)", fontFamily: "'Cairo', sans-serif" }}>
            Arabic-First Platform · Saudi Innovation · Grassroots to Professional
          </p>
        </div>
      </section>

      {/* ── STATS BAR — item 5 ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-12"
        style={{ background: "rgba(0,220,200,0.04)", borderTop: "1px solid rgba(0,220,200,0.1)", borderBottom: "1px solid rgba(0,220,200,0.1)" }}>
        <div className="container mx-auto px-4">
          {/* Pilot Phase badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full"
              style={{ background: "rgba(255,165,0,0.1)", border: "1px solid rgba(255,165,0,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFA500] animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "#FFA500", fontFamily: "'Orbitron', sans-serif" }}>
                Pilot Phase
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center reveal">
                <div className="ada-stat-number text-4xl lg:text-5xl mb-1">{s.value}</div>
                <div className="font-semibold text-sm text-[#EEEFEE] mb-0.5"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>{s.label}</div>
                <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM — item 6 ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 reveal">
            <span className="badge-verified mb-4 inline-block">The Problem</span>
            <h2 className="font-orbitron font-bold text-3xl lg:text-4xl mb-5 text-[#EEEFEE]">
              Talent is Everywhere.<br />
              <span style={{ color: "#00DCC8" }}>Discovery is Broken.</span>
            </h2>
            <p className="text-base" style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
              Across Saudi Arabia and the broader MENA region, thousands of talented athletes go undiscovered every year — not because they lack ability, but because the infrastructure to find them doesn't exist at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,220,200,0.08)", border: "1px solid rgba(0,220,200,0.2)" }}>
                    <Search size={26} style={{ color: "#00DCC8" }} />
                  </div>
                ),
                title: "Scouting is Fragmented",
                desc: "Traditional scouting is manual, inconsistent, and limited to scouts who are physically present — missing thousands of talented athletes in underserved regions.",
              },
              {
                icon: (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,165,0,0.08)", border: "1px solid rgba(255,165,0,0.2)" }}>
                    <Lock size={26} style={{ color: "#FFA500" }} />
                  </div>
                ),
                title: "Access is Locked by Cost",
                desc: "Professional scouting infrastructure is prohibitively expensive — accessible only to top-tier clubs, leaving grassroots athletes without any discovery pathway.",
              },
              {
                icon: (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,122,186,0.08)", border: "1px solid rgba(0,122,186,0.2)" }}>
                    <UserX size={26} style={{ color: "#007ABA" }} />
                  </div>
                ),
                title: "Geographical Blindspots",
                desc: "Talent outside major cities is virtually invisible to clubs and national federations — Saudi Arabia's emerging sports ecosystems remain largely undiscovered.",
              },
              {
                icon: (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,220,200,0.08)", border: "1px solid rgba(0,220,200,0.2)" }}>
                    <Layers size={26} style={{ color: "#00DCC8" }} />
                  </div>
                ),
                title: "No Data Infrastructure",
                desc: "No unified platform tracks athlete development, performance history, or cross-sport potential in the Kingdom — data is siloed, paper-based, or simply absent.",
              },
            ].map((p, i) => (
              <div key={i} className="ada-card p-6 reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="mb-4">{p.icon}</div>
                <h3 className="font-semibold text-sm mb-2 text-[#00DCC8]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>{p.title}</h3>
                <p className="text-sm" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION — 6 MODULES — item 7 ────────────────────────────────────── */}
      <section className="relative z-10 py-24" style={{ background: "rgba(0,10,15,0.6)" }}>
        <div className="absolute inset-0 ada-grid-bg opacity-40 pointer-events-none" />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <span className="badge-pro mb-4 inline-block">The Solution</span>
              <h2 className="font-orbitron font-bold text-3xl lg:text-4xl mb-5">
              <span style={{ background: "linear-gradient(135deg, #00DCC8 0%, #007ABA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ada2ai</span><span className="text-[#EEEFEE]">: One Platform.</span><br />
              <span style={{ color: "#00DCC8" }}>Six Powerful Modules. Zero Barriers.</span>
            </h2>
            <p className="text-base max-w-2xl mx-auto"
              style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
              From Identification to Opportunity — a complete AI-powered talent discovery ecosystem covering all sports sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, i) => (
              <div key={i}
                className="ada-card p-6 flex flex-col gap-4 reveal"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  // item 7: step 2 (index 1 = AI Analysis) gets secondary brand color border
                  borderColor: i === 1 ? "rgba(0,122,186,0.4)" : undefined,
                }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="ada-icon-box" style={{ color: i === 1 ? "#007ABA" : "#00DCC8" }}>{m.icon}</div>
                    <div>
                      <div className="text-xs font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color: "rgba(238,239,238,0.4)" }}>{m.num}</div>
                      <div className="font-bold text-base text-[#EEEFEE]"
                        style={{ fontFamily: "'Orbitron', sans-serif" }}>{m.title}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: `${m.badgeColor}18`,
                      color: m.badgeColor,
                      border: `1px solid ${m.badgeColor}40`,
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.6rem",
                      letterSpacing: "0.08em",
                    }}>
                    {m.badge}
                  </span>
                </div>
                <p className="text-sm flex-1"
                  style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.7 }}>
                  {m.desc}
                </p>
                <Link href={m.link}>
                  <button className="flex items-center gap-1.5 text-xs font-semibold transition-all"
                    style={{ color: i === 1 ? "#007ABA" : "#00DCC8", fontFamily: "'Orbitron', sans-serif" }}
                    onMouseEnter={(e) => (e.currentTarget.style.gap = "8px")}
                    onMouseLeave={(e) => (e.currentTarget.style.gap = "6px")}>
                    {m.cta} <ArrowRight size={13} />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — item 10 ────────────────────────────────────────────── */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <span className="badge-verified mb-4 inline-block">How It Works</span>
            <h2 className="font-orbitron font-bold text-3xl lg:text-4xl mb-5 text-[#EEEFEE]">
              From Upload to<br />
              <span style={{ color: "#00DCC8" }}>Professional Report</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
            {steps.map((s, i) => (
              <div key={i} className="text-center reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 mx-auto"
                  style={{
                    background: "rgba(0,220,200,0.08)",
                    border: "2px solid rgba(0,220,200,0.3)",
                    boxShadow: "0 0 30px rgba(0,220,200,0.12)",
                  }}>
                  <span className="ada-stat-number text-xl">{s.n}</span>
                </div>
                <h3 className="font-bold text-base mb-2 text-[#EEEFEE]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>{s.title}</h3>
                <p className="text-sm" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPORTS SECTORS — item 11 ──────────────────────────────────────────── */}
      <section className="relative z-10 py-20"
        style={{ background: "rgba(0,122,186,0.04)", borderTop: "1px solid rgba(0,122,186,0.1)", borderBottom: "1px solid rgba(0,122,186,0.1)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <span className="badge-pro mb-4 inline-block">Multi-Sport Platform</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
              Not Just Football.<br />
              <span style={{ color: "#007ABA" }}>Every Sport. Every Athlete.</span>
            </h2>
            <p className="text-sm max-w-xl mx-auto"
              style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
              ada2ai adapts to the biomechanics and performance metrics of each sport — delivering sport-specific insights for every athlete across Saudi Arabia's emerging sports ecosystems.
            </p>
          </div>

          {/* item 11: no Arabic text, modern sports icons */}
          <div className="flex flex-wrap justify-center gap-4">
            {sportsSectors.map((s, i) => (
              <div key={i}
                className="ada-card px-6 py-4 flex items-center gap-3 reveal cursor-pointer"
                style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <div className="text-sm font-semibold text-[#EEEFEE]"
                  style={{ fontFamily: "'Cairo', sans-serif" }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUSINESS BENEFITS — item 12, 13, 15, 16 ──────────────────────────── */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <span className="badge-top mb-4 inline-block">Business Benefits</span>
            <h2 className="font-orbitron font-bold text-3xl lg:text-4xl mb-5 text-[#EEEFEE]">
              Value for Every<br />
              <span style={{ color: "#FFA500" }}>Stakeholder</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="ada-card p-7 reveal"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  borderColor: `${b.accentColor}30`,
                }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="ada-icon-box" style={{ color: b.accentColor }}>{b.icon}</div>
                  <h3 className="font-bold text-base text-[#EEEFEE]"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>{b.title}</h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {b.points.map((pt, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" style={{ color: b.accentColor }} />
                      <span className="text-sm" style={{ color: "rgba(238,239,238,0.7)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.6 }}>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* item 15: Pathways — Athletes → Scouts → Academies → Clubs */}
          <div className="mt-14 reveal">
            <div className="ada-card p-8 text-center"
              style={{ background: "rgba(0,122,186,0.04)", borderColor: "rgba(0,122,186,0.2)" }}>
              <h3 className="font-orbitron font-bold text-lg mb-6 text-[#EEEFEE]">Athlete Networking Ecosystem</h3>
              <div className="flex flex-wrap justify-center items-center gap-3">
                {["Athletes", "Scouts", "Partnerships", "Clubs"].map((item, i, arr) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="px-5 py-2.5 rounded-lg text-sm font-semibold"
                      style={{
                        background: i === 0 ? "rgba(0,220,200,0.12)" : i === 1 ? "rgba(0,122,186,0.12)" : i === 2 ? "rgba(255,165,0,0.12)" : "rgba(0,220,200,0.08)",
                        border: `1px solid ${i === 0 ? "rgba(0,220,200,0.3)" : i === 1 ? "rgba(0,122,186,0.3)" : i === 2 ? "rgba(255,165,0,0.3)" : "rgba(0,220,200,0.2)"}`,
                        color: i === 0 ? "#00DCC8" : i === 1 ? "#007ABA" : i === 2 ? "#FFA500" : "#00DCC8",
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: "0.8rem",
                      }}>
                      {item}
                    </div>
                    {i < arr.length - 1 && (
                      <ChevronRight size={16} style={{ color: "rgba(238,239,238,0.3)" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STRATEGIC ALIGNMENT — item 17 ────────────────────────────────────── */}
      <section className="relative z-10 py-20"
        style={{ background: "rgba(0,220,200,0.03)", borderTop: "1px solid rgba(0,220,200,0.08)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <span className="badge-verified mb-4 inline-block">Strategic Alignment</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
              Building Saudi Arabia's<br />
              <span style={{ color: "#00DCC8" }}>Sports Intelligence Layer</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {strategyPillars.map((p, i) => (
              <div key={i} className="ada-card p-7 reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="ada-icon-box">{p.icon}</div>
                  <h3 className="font-bold text-sm text-[#00DCC8]"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}>{p.title}</h3>
                </div>
                <p className="text-sm" style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            {[
              { v: "SAR 27.5B", l: "Sports Economy Target" },
              { v: "1.5M+", l: "Athletes to Reach" },
              { v: "2030", l: "National Sports Goal" },
            ].map((s, i) => (
              <div key={i} className="text-center reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="ada-stat-number text-3xl mb-1">{s.v}</div>
                <div className="text-xs" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERSHIPS — item 18 ────────────────────────────────────────────── */}
      <section className="relative z-10 py-24" style={{ background: "rgba(0,10,15,0.5)" }}>
        <div className="absolute inset-0 ada-grid-bg opacity-30 pointer-events-none" />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-14 reveal">
            <span className="badge-pro mb-4 inline-block">Partnerships</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
              Building the<br />
              <span style={{ color: "#00DCC8" }}>Saudi Sports Ecosystem</span>
            </h2>
            <p className="text-sm max-w-xl mx-auto"
              style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
              ada2ai connects sports federations, institutes, clubs, and academies into a unified talent discovery network across the Kingdom.
            </p>
          </div>

          {/* Partnership category cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
            {partnerCategories.map((cat, i) => (
              <div key={i} className="ada-card p-5 text-center flex flex-col items-center gap-3 reveal"
                style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="ada-icon-box" style={{ color: "#00DCC8" }}>{cat.icon}</div>
                <div className="text-xs font-semibold text-[#EEEFEE]"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>{cat.label}</div>
                <div className="ada-stat-number text-xl">{cat.count}</div>
              </div>
            ))}
          </div>

          {/* Placeholder logos grid */}
          <div className="reveal">
            <p className="text-center text-xs mb-6"
              style={{ color: "rgba(238,239,238,0.35)", fontFamily: "'Cairo', sans-serif" }}>
              Partner Logos — Coming Soon
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i}
                  className="h-16 rounded-lg flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(0,220,200,0.15)",
                  }}>
                  <span className="text-xs" style={{ color: "rgba(238,239,238,0.2)", fontFamily: "'Orbitron', sans-serif" }}>
                    PARTNER
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,220,200,0.06) 0%, transparent 70%)" }} />
        <div className="relative container mx-auto px-4 text-center reveal">
          <h2 className="font-orbitron font-black text-3xl lg:text-5xl mb-6 text-[#EEEFEE]">
            Ready to Discover<br />
            <span style={{ color: "#00DCC8" }}>the Next Champion?</span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
            Upload an athlete photo or video and get a professional AI scout report. Free to start.
          </p>
          <div className="flex justify-center">
            <Link href="/demo">
              <button className="btn-ada-primary text-sm px-10 py-4 flex items-center gap-2">
                <Zap size={16} />
                Discover Talent Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-12"
        style={{ borderTop: "1px solid rgba(0,220,200,0.1)", background: "rgba(0,10,15,0.8)" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "#00DCC8" }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: "14px", color: "#000A0F" }}>A</span>
              </div>
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 700, fontSize: "14px" }}>
                  <span style={{ color: "#EEEFEE" }}>ada</span>
                  <span style={{ color: "#00DCC8" }}>2</span>
                  <span style={{ color: "#EEEFEE" }}>ai</span>
                </div>
                <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                  AI Sports Talent Discovery
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm"
              style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif" }}>
              <Link href="/product" className="hover:text-[#00DCC8] transition-colors">Product</Link>
              <Link href="/demo" className="hover:text-[#00DCC8] transition-colors">AI Demo</Link>
              <Link href="/academies" className="hover:text-[#00DCC8] transition-colors">Partnerships</Link>
              <Link href="/governance/team" className="hover:text-[#00DCC8] transition-colors">Governance</Link>
            </div>
            <div className="text-xs text-center" style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Cairo', sans-serif" }}>
              © 2026 ada2ai · Saudi Innovation · Arabic-First Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
