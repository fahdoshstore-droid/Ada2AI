import { Link } from "wouter";
import {
  Brain, Shield, Users, BarChart3, MapPin, Play,
  ArrowRight, CheckCircle2, Zap, Globe, Cpu, Target,
  ChevronRight, Star, Activity, Trophy
} from "lucide-react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";

const modules = [
  {
    num: "01", icon: <Shield size={28} />, title: "SportID",
    badge: "DIGITAL IDENTITY", badgeColor: "#007ABA",
    headline: "The Athlete's Verifiable Digital Identity",
    desc: "Every athlete gets a permanent digital profile with a unique QR code, radar chart visualization, certifications, and a tamper-proof performance history. Shareable with clubs, institutes, and national federations across all sports.",
    features: [
      "Unique QR code for instant sharing",
      "Radar chart performance visualization",
      "Verifiable performance history",
      "Certification and achievement tracking",
      "Institute and federation submission ready",
    ],
    link: "/demo", cta: "View Example",
  },
  {
    num: "02", icon: <Brain size={28} />, title: "AI Analysis Engine",
    badge: "CORE MODULE", badgeColor: "#00DCC8",
    headline: "Professional Athlete Report in Seconds",
    desc: "Upload a photo or video of any athlete. The AI engine analyzes performance metrics and delivers a comprehensive professional scout report — no equipment, no specialist required. Works across all sports sectors.",
    features: [
      "Multi-metric performance analysis",
      "Standardized professional report format",
      "Sport DNA position prediction",
      "Works with any sport, any device",
      "Arabic-first output with bilingual support",
    ],
    link: "/demo", cta: "Try Free Demo",
  },
  {
    num: "03", icon: <Users size={28} />, title: "Scouts Dashboard",
    badge: "TALENT DISCOVERY", badgeColor: "#00DCC8",
    headline: "Discover Regional Talent at Scale",
    desc: "Search, filter, and rank athletes by performance metrics across all Saudi regions. From Riyadh to Abha, discover grassroots talent that would otherwise be invisible. Built for professional scouts, institute directors, and federation talent managers.",
    features: [
      "Multi-metric filter search",
      "Geographic coverage across all KSA regions",
      "Age category and sport filtering",
      "Bulk comparison and shortlisting",
      "Export professional reports",
    ],
    link: "/scouts", cta: "Explore Dashboard",
  },
  {
    num: "04", icon: <BarChart3 size={28} />, title: "Compare Engine",
    badge: "ANALYTICS", badgeColor: "#FFA500",
    headline: "Objective Side-by-Side Athlete Comparison",
    desc: "Compare any two athletes with overlaid radar charts, metric-by-metric breakdowns, and AI-generated recommendations. Eliminate subjective bias from recruitment decisions with data-driven insights.",
    features: [
      "Dual radar chart overlay",
      "Side-by-side metric comparison",
      "AI-generated recommendation summary",
      "Sport-specific benchmarking",
      "Shareable comparison reports",
    ],
    link: "/compare", cta: "Compare Athletes",
  },
  {
    num: "05", icon: <MapPin size={28} />, title: "Partnerships Directory",
    badge: "NETWORK", badgeColor: "#007ABA",
    headline: "Connect Athletes to Pathways",
    desc: "Google Maps integration with 500+ sports institutes and academies across KSA. Filter by city, sport, age group, and accreditation status. Athletes find their pathway; institutes find their next intake.",
    features: [
      "500+ institutes mapped across KSA",
      "Multi-sport and age group filtering",
      "Accreditation status verification",
      "Direct contact and enrollment",
      "Institute performance ratings",
    ],
    link: "/academies", cta: "Find Partners",
  },
  {
    num: "06", icon: <Play size={28} />, title: "AI Demo",
    badge: "FREE ACCESS", badgeColor: "#00DCC8",
    headline: "Experience the Platform Before Signing Up",
    desc: "Zero-friction onboarding — upload a photo or video, get a real AI analysis report immediately. No registration required. Designed to deliver immediate, tangible value on first visit.",
    features: [
      "No registration required",
      "Full AI analysis on first visit",
      "Instant professional report generation",
      "Conversion-optimized flow",
      "Available in Arabic and English",
    ],
    link: "/demo", cta: "Start Now — Free",
  },
];

const techStack = [
  { name: "AI Vision Engine", desc: "Advanced AI model for multi-sport athlete analysis", icon: <Brain size={20} /> },
  { name: "Governance Standards", desc: "Aligned with national sports federation benchmarks", icon: <Trophy size={20} /> },
  { name: "Google Maps API", desc: "Real-time institute geolocation", icon: <Globe size={20} /> },
  { name: "S3 Cloud Storage", desc: "Secure media and report storage", icon: <Cpu size={20} /> },
  { name: "Arabic-First Design", desc: "RTL layout and Arabic output", icon: <Star size={20} /> },
  { name: "Vision 2030 Aligned", desc: "National sports agenda integration", icon: <Target size={20} /> },
];

export default function Product() {
  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]">
      <Ada2aiNavbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 ada-grid-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,220,200,0.06) 0%, transparent 70%)" }} />
        <div className="relative container mx-auto px-4 text-center">
          <span className="badge-verified mb-6 inline-block">Platform Overview</span>
          <h1 className="font-orbitron font-black text-4xl lg:text-5xl mb-5">
            <span style={{ background: "linear-gradient(135deg, #00DCC8 0%, #007ABA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ada2ai</span>
            <span className="text-[#EEEFEE]"> Platform</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8"
            style={{ color: "rgba(238,239,238,0.7)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
            Six integrated modules. One unified platform. Complete AI-powered talent discovery for every sport, every athlete, every region of Saudi Arabia.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/demo">
              <button className="btn-ada-primary text-sm px-8 py-3.5 flex items-center gap-2">
                <Zap size={16} /> Start Free Analysis
              </button>
            </Link>
            <Link href="/scouts">
              <button className="btn-ada-outline text-sm px-8 py-3.5 flex items-center gap-2">
                <Users size={16} /> For Scouts
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-16">
            {modules.map((m, i) => (
              <div key={i}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                style={{ direction: i % 2 === 1 ? "rtl" : "ltr" }}>
                {/* Content */}
                <div style={{ direction: "ltr" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold"
                      style={{ fontFamily: "'Orbitron', sans-serif", color: "rgba(238,239,238,0.35)" }}>
                      {m.num}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded"
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
                  <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-2 text-[#EEEFEE]">
                    {m.title}
                  </h2>
                  <h3 className="text-base mb-4" style={{ color: "#00DCC8", fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}>
                    {m.headline}
                  </h3>
                  <p className="text-sm mb-6"
                    style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
                    {m.desc}
                  </p>
                  <ul className="flex flex-col gap-2.5 mb-6">
                    {m.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#00DCC8" }} />
                        <span className="text-sm" style={{ color: "rgba(238,239,238,0.7)", fontFamily: "'Cairo', sans-serif" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={m.link}>
                    <button className="btn-ada-outline text-xs px-6 py-2.5 flex items-center gap-2">
                      {m.cta} <ArrowRight size={13} />
                    </button>
                  </Link>
                </div>

                {/* Visual card */}
                <div style={{ direction: "ltr" }}>
                  <div className="ada-card p-8 flex flex-col items-center justify-center min-h-[240px]"
                    style={{ background: "rgba(0,220,200,0.03)" }}>
                    <div className="ada-icon-box w-20 h-20 mb-4"
                      style={{ width: "80px", height: "80px", borderRadius: "16px", background: `${m.badgeColor}15`, border: `1px solid ${m.badgeColor}30`, color: m.badgeColor }}>
                      {m.icon}
                    </div>
                    <div className="font-orbitron font-bold text-5xl mb-2"
                      style={{ color: m.badgeColor, textShadow: `0 0 30px ${m.badgeColor}50` }}>
                      {m.num}
                    </div>
                    <div className="font-orbitron font-bold text-lg text-[#EEEFEE] text-center">{m.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20"
        style={{ background: "rgba(0,10,15,0.7)", borderTop: "1px solid rgba(0,220,200,0.08)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="badge-pro mb-4 inline-block">Technology</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
              Built on World-Class<br />
              <span style={{ color: "#00DCC8" }}>AI Infrastructure</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {techStack.map((t, i) => (
              <div key={i} className="ada-card p-5 flex items-start gap-3">
                <div className="ada-icon-box flex-shrink-0" style={{ width: "36px", height: "36px" }}>{t.icon}</div>
                <div>
                  <div className="font-semibold text-sm text-[#EEEFEE] mb-0.5"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "0.75rem" }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif" }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron font-bold text-3xl mb-5 text-[#EEEFEE]">
            Ready to Get Started?
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(238,239,238,0.65)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
            Try the AI analysis demo for free — no registration required.
          </p>
          <Link href="/demo">
            <button className="btn-ada-primary text-sm px-10 py-4 flex items-center gap-2 mx-auto">
              <Zap size={16} /> Analyze Athlete Now — Free
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
