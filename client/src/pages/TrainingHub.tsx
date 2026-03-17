import { useState, useRef, useEffect } from "react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/training-hub/components/Sidebar";
import HubDashboard from "@/training-hub/pages/Dashboard";
import HubAIChat from "@/training-hub/pages/AIChat";
import HubPlayers from "@/training-hub/pages/Players";
import HubTraining from "@/training-hub/pages/Training";
import HubProgress from "@/training-hub/pages/Progress";
import HubMatches from "@/training-hub/pages/Matches";
import HubCoachDashboard from "@/training-hub/pages/CoachDashboard";
import HubSettings from "@/training-hub/pages/Settings";
import { X } from "lucide-react";
import {
  Brain, Dumbbell, Users, TrendingUp, Trophy, MessageCircle,
  Play, Zap, Target, Activity, ChevronRight, Star, Shield,
  BarChart3, Calendar, Clock, CheckCircle2, ArrowRight,
  Cpu, Layers, Radar
} from "lucide-react";
import { Link } from "wouter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: <Brain size={24} />,
    title: "AI Training Assistant",
    titleAr: "مساعد التدريب الذكي",
    desc: "Conversational AI coach that generates personalized training plans, analyzes performance data, and provides real-time tactical recommendations for every athlete.",
    color: "#00DCC8",
  },
  {
    icon: <Layers size={24} />,
    title: "Coach Dashboard",
    titleAr: "لوحة المدرب",
    desc: "Interactive tactical pitch map with live player positioning, injury alerts, formation management, and team statistics across the last 5 matches.",
    color: "#007ABA",
  },
  {
    icon: <Users size={24} />,
    title: "Player Profiles",
    titleAr: "ملفات اللاعبين",
    desc: "Detailed athlete cards showing speed, strength, technique, endurance, and teamwork metrics with progress tracking over time.",
    color: "#00DCC8",
  },
  {
    icon: <Dumbbell size={24} />,
    title: "Training Sessions",
    titleAr: "جلسات التدريب",
    desc: "AI-generated training plans tailored to each athlete's position and performance gaps. 8 training types: speed, technical, strength, tactical, fitness, reaction, passing, shooting.",
    color: "#FFA500",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Progress Tracking",
    titleAr: "تتبع التقدم",
    desc: "6-month team performance trend charts, individual player progress over 4 weeks, and goal achievement tracking with visual analytics.",
    color: "#007ABA",
  },
  {
    icon: <Trophy size={24} />,
    title: "Match Management",
    titleAr: "إدارة المباريات",
    desc: "Complete match log with AI season analysis, performance comparison across last 5 matches, and AI-powered preparation plans for upcoming fixtures.",
    color: "#FFA500",
  },
];

const stats = [
  { value: "81%", label: "Average Progress Rate", labelAr: "متوسط معدل التقدم", icon: <TrendingUp size={18} />, color: "#00DCC8" },
  { value: "8+", label: "Training Types", labelAr: "أنواع التدريبات", icon: <Dumbbell size={18} />, color: "#007ABA" },
  { value: "AI", label: "Powered Plans", labelAr: "خطط مدعومة بالذكاء الاصطناعي", icon: <Brain size={18} />, color: "#FFA500" },
  { value: "RTL", label: "Arabic-First Design", labelAr: "تصميم عربي أولاً", icon: <Star size={18} />, color: "#00DCC8" },
];

const demoPlayers = [
  { name: "أحمد الشمري", pos: "مهاجم", club: "الأهلي", age: 22, speed: 88, strength: 80, technique: 92, endurance: 75, teamwork: 85, progress: 78 },
  { name: "محمد القحطاني", pos: "وسط", club: "الهلال", age: 25, speed: 82, strength: 80, technique: 88, endurance: 90, teamwork: 92, progress: 85 },
  { name: "خالد العتيبي", pos: "مدافع", club: "الاتحاد", age: 28, speed: 75, strength: 92, technique: 78, endurance: 85, teamwork: 88, progress: 72 },
  { name: "عبدالله النصار", pos: "حارس مرمى", club: "النصر", age: 24, speed: 70, strength: 85, technique: 90, endurance: 82, teamwork: 80, progress: 90 },
];

const trainingTypes = [
  { label: "تدريب السرعة", icon: "⚡", color: "#FFA500" },
  { label: "تدريب تقني", icon: "⚽", color: "#00DCC8" },
  { label: "تدريب القوة", icon: "💪", color: "#007ABA" },
  { label: "تدريب تكتيكي", icon: "🧠", color: "#00DCC8" },
  { label: "تدريب اللياقة", icon: "🏃", color: "#FFA500" },
  { label: "ردود الفعل", icon: "⚡", color: "#007ABA" },
  { label: "تدريب التمرير", icon: "🎯", color: "#00DCC8" },
  { label: "تدريب التسديد", icon: "🥅", color: "#FFA500" },
];

// ─── Animated Stat Bar ─────────────────────────────────────────────────────────

function StatBar({ value, color }: { value: number; color: string }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setWidth(value); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

// ─── Radar Hexagon (CSS-only) ──────────────────────────────────────────────────

function RadarHex({ data, color }: { data: number[]; color: string }) {
  const size = 80;
  const center = size / 2;
  const labels = ["السرعة", "القوة", "التقنية", "التحمل", "التعاون"];
  const maxVal = 100;

  const toXY = (angle: number, val: number) => {
    const r = (val / maxVal) * (center - 10);
    const rad = (angle * Math.PI) / 180;
    return { x: center + r * Math.sin(rad), y: center - r * Math.cos(rad) };
  };

  const angles = [0, 72, 144, 216, 288];
  const points = data.map((v, i) => toXY(angles[i], v));
  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const bgPoints = angles.map((a) => toXY(a, 100));
  const bgPoly = bgPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon points={bgPoly} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <polygon points={polyPoints} fill={`${color}22`} stroke={color} strokeWidth="1.5" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
      ))}
    </svg>
  );
}

// ─── Hub App (full-screen overlay) ─────────────────────────────────────────────

type HubPage = "dashboard" | "ai-chat" | "coach" | "players" | "training" | "progress" | "matches" | "settings";
interface HubNavContext { prompt?: string; }

function TrainingHubApp({ onClose, lang, isRTL }: { onClose: () => void; lang: "ar" | "en"; isRTL: boolean }) {
  const [activePage, setActivePage] = useState<HubPage>("dashboard");
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const handleNavigate = (page: string, context?: unknown) => {
    setActivePage(page as HubPage);
    if (context && typeof context === "object" && (context as HubNavContext).prompt) {
      setPendingPrompt((context as HubNavContext).prompt!);
    }
  };

  useEffect(() => {
    if (activePage !== "ai-chat") setPendingPrompt(null);
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <HubDashboard onNavigate={handleNavigate} lang={lang} />;
      case "ai-chat": return <HubAIChat initialPrompt={pendingPrompt} onPromptConsumed={() => setPendingPrompt(null)} lang={lang} />;
      case "players": return <HubPlayers onNavigate={handleNavigate} lang={lang} />;
      case "training": return <HubTraining lang={lang} />;
      case "coach": return <HubCoachDashboard onNavigate={handleNavigate} lang={lang} />;
      case "progress": return <HubProgress lang={lang} />;
      case "matches": return <HubMatches onNavigate={handleNavigate} lang={lang} />;
      case "settings": return <HubSettings lang={lang} />;
      default: return <HubDashboard onNavigate={handleNavigate} lang={lang} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <TooltipProvider>
        <Toaster position="top-center" richColors />
        {isRTL && <Sidebar activePage={activePage} onNavigate={handleNavigate} lang={lang} />}
        <main className="flex-1 overflow-hidden relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{
              [isRTL ? "left" : "right"]: "16px",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(238,239,238,0.5)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <X size={13} />
            {lang === "ar" ? "إغلاق" : "Close"}
          </button>
          {renderPage()}
        </main>
        {!isRTL && <Sidebar activePage={activePage} onNavigate={handleNavigate} lang={lang} />}
      </TooltipProvider>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function TrainingHub() {
  const [activeTab, setActiveTab] = useState<"overview" | "players" | "training">("overview");
  const [hubOpen, setHubOpen] = useState(false);
  const { isRTL, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
      {hubOpen && <TrainingHubApp onClose={() => setHubOpen(false)} lang={lang} isRTL={isRTL} />}
      <Ada2aiNavbar />

      {/* ── Hero ── */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 ada-grid-bg opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,122,186,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative container mx-auto px-4 text-center">
          <span
            className="badge-verified mb-6 inline-block"
            style={{ background: "rgba(0,122,186,0.15)", color: "#007ABA", border: "1px solid rgba(0,122,186,0.3)" }}
          >
            MODULE 06 — TRAINING HUB
          </span>
          <h1 className="font-orbitron font-black text-4xl lg:text-6xl mb-5 leading-tight">
            <span
              style={{
                background: "linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Training Hub
            </span>
          </h1>
          <p
            className="text-xl mb-3 font-medium"
            style={{ color: "rgba(238,239,238,0.85)", fontFamily: "'Cairo', sans-serif" }}
          >
            مساعد التدريب الرياضي الذكي
          </p>
          <p
            className="text-base max-w-2xl mx-auto mb-10"
            style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.9 }}
          >
            AI-powered training management platform for coaches and athletes. Generate personalized training plans, track progress, manage matches, and get real-time AI coaching — all in Arabic.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18`, color: s.color }}
                >
                  {s.icon}
                </div>
                <div className="text-left">
                  <div
                    className="font-black text-xl leading-none"
                    style={{ color: s.color, fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>
                    {s.labelAr}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setHubOpen(true)} className="btn-ada-primary text-sm px-8 py-3.5 flex items-center gap-2">
                <Zap size={16} /> {lang === "ar" ? "فتح Training Hub" : "Open Training Hub"}
              </button>
            <Link href="/upload">
              <button className="btn-ada-outline text-sm px-8 py-3.5 flex items-center gap-2">
                <Activity size={16} /> Analyze Athlete
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Interactive Preview ── */}
      <section className="py-16" style={{ borderTop: "1px solid rgba(0,220,200,0.06)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="badge-pro mb-4 inline-block">Live Preview</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl text-[#EEEFEE]">
              Explore the Platform
            </h2>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-8">
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {(["overview", "players", "training"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    background: activeTab === tab ? "rgba(0,220,200,0.15)" : "transparent",
                    color: activeTab === tab ? "#00DCC8" : "rgba(238,239,238,0.5)",
                    border: activeTab === tab ? "1px solid rgba(0,220,200,0.3)" : "1px solid transparent",
                  }}
                >
                  {tab === "overview" ? "Dashboard" : tab === "players" ? "Players" : "Training"}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <div className="ada-card p-6 max-w-4xl mx-auto" dir="rtl">
              {/* Mini dashboard */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-orbitron font-bold text-lg text-[#EEEFEE]">لوحة التحكم</h3>
                  <p className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                    الأحد 16 مارس 2026
                  </p>
                </div>
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(0,220,200,0.12)", color: "#00DCC8", fontFamily: "'Orbitron', sans-serif" }}
                >
                  81% متوسط النقدم
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { val: "12", label: "أهداف محققة", color: "#FFA500" },
                  { val: "84%", label: "متوسط الأداء", color: "#00DCC8" },
                  { val: "6", label: "جلسات اليوم", color: "#007ABA" },
                  { val: "4", label: "إجمالي اللاعبين", color: "#00DCC8" },
                ].map((kpi, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="font-black text-2xl mb-1"
                      style={{ color: kpi.color, fontFamily: "'Orbitron', sans-serif" }}
                    >
                      {kpi.val}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>
                      {kpi.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active players */}
              <div>
                <h4 className="text-sm font-semibold mb-3" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}>
                  اللاعبون النشطون
                </h4>
                <div className="flex flex-col gap-2">
                  {demoPlayers.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "#00DCC820", color: "#00DCC8" }}
                      >
                        {p.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#EEEFEE]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                            {p.name}
                          </span>
                          <span className="text-xs" style={{ color: "#00DCC8", fontFamily: "'Orbitron', sans-serif" }}>
                            {p.progress}%
                          </span>
                        </div>
                        <StatBar value={p.progress} color={i % 2 === 0 ? "#00DCC8" : "#007ABA"} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "players" && (
            <div className="max-w-4xl mx-auto" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoPlayers.map((p, i) => (
                  <div
                    key={i}
                    className="ada-card p-5"
                    style={{ background: "rgba(0,220,200,0.02)" }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                        style={{ background: i % 2 === 0 ? "#00DCC820" : "#007ABA20", color: i % 2 === 0 ? "#00DCC8" : "#007ABA" }}
                      >
                        {p.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-[#EEEFEE]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                            {p.name}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: "rgba(0,220,200,0.1)",
                              color: "#00DCC8",
                              fontFamily: "'Cairo', sans-serif",
                            }}
                          >
                            {p.pos}
                          </span>
                        </div>
                        <p className="text-xs mb-3" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>
                          {p.club} • {p.age} سنة
                        </p>
                        <div className="grid grid-cols-5 gap-1 text-center mb-3">
                          {[
                            { k: "سرعة", v: p.speed },
                            { k: "قوة", v: p.strength },
                            { k: "تقنية", v: p.technique },
                            { k: "تحمل", v: p.endurance },
                            { k: "تعاون", v: p.teamwork },
                          ].map((m, j) => (
                            <div key={j}>
                              <div
                                className="font-black text-sm"
                                style={{ color: i % 2 === 0 ? "#00DCC8" : "#007ABA", fontFamily: "'Orbitron', sans-serif" }}
                              >
                                {m.v}
                              </div>
                              <div className="text-xs" style={{ color: "rgba(238,239,238,0.35)", fontFamily: "'Cairo', sans-serif" }}>
                                {m.k}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                            التقدم
                          </span>
                          <span className="text-xs font-bold" style={{ color: "#00DCC8", fontFamily: "'Orbitron', sans-serif" }}>
                            {p.progress}%
                          </span>
                        </div>
                        <StatBar value={p.progress} color={i % 2 === 0 ? "#00DCC8" : "#007ABA"} />
                      </div>
                      <RadarHex
                        data={[p.speed, p.strength, p.technique, p.endurance, p.teamwork]}
                        color={i % 2 === 0 ? "#00DCC8" : "#007ABA"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "training" && (
            <div className="max-w-4xl mx-auto" dir="rtl">
              {/* AI plan generator */}
              <div
                className="ada-card p-6 mb-6"
                style={{ background: "rgba(0,122,186,0.04)", border: "1px solid rgba(0,122,186,0.15)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(0,122,186,0.15)", color: "#007ABA" }}
                  >
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#EEEFEE]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      مولّد خطط التدريب بالـ AI
                    </h3>
                    <p className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                      خطة مخصصة بناءً على إحصائيات اللاعب
                    </p>
                  </div>
                </div>
                <div
                  className="rounded-lg px-4 py-2.5 text-sm mb-3 flex items-center justify-between"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}>
                    أحمد الشمري — مهاجم
                  </span>
                  <ChevronRight size={14} style={{ color: "rgba(238,239,238,0.3)" }} />
                </div>
                <button
                  className="btn-ada-primary text-sm px-5 py-2.5 flex items-center gap-2"
                  style={{ background: "rgba(0,122,186,0.8)" }}
                >
                  <Zap size={14} /> توليد الخطة
                </button>
              </div>

              {/* Training types grid */}
              <h4 className="text-sm font-semibold mb-4" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}>
                أنواع التدريبات
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {trainingTypes.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px solid ${t.color}20`,
                    }}
                  >
                    <div className="text-2xl mb-2">{t.icon}</div>
                    <div className="text-xs font-medium" style={{ color: t.color, fontFamily: "'Cairo', sans-serif" }}>
                      {t.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent sessions */}
              <h4 className="text-sm font-semibold mb-3" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}>
                الجلسات الأخيرة
              </h4>
              {[
                { name: "تدريب سرعة", player: "أحمد الشمري", dur: "90 دقيقة", intensity: "عالية", color: "#FFA500" },
                { name: "تدريب تقني", player: "محمد القحطاني", dur: "75 دقيقة", intensity: "متوسطة", color: "#00DCC8" },
                { name: "تدريب قوة", player: "خالد العتيبي", dur: "60 دقيقة", intensity: "عالية", color: "#007ABA" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-4 py-3 mb-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${s.color}18`, color: s.color }}
                    >
                      <Dumbbell size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#EEEFEE]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {s.name}
                      </div>
                      <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                        {s.player} — {s.dur}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: `${s.color}15`,
                      color: s.color,
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    {s.intensity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(0,220,200,0.06)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="badge-pro mb-4 inline-block">Full Feature Set</span>
            <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
              Everything a Coach Needs
            </h2>
            <p
              className="text-base max-w-xl mx-auto"
              style={{ color: "rgba(238,239,238,0.55)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.9 }}
            >
              Six integrated modules covering every aspect of modern sports training management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="ada-card p-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-orbitron font-bold text-base mb-1 text-[#EEEFEE]">{f.title}</h3>
                <p
                  className="text-xs mb-2"
                  style={{ color: f.color, fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}
                >
                  {f.titleAr}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "rgba(238,239,238,0.55)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Chat Preview ── */}
      <section
        className="py-20"
        style={{ background: "rgba(0,10,15,0.7)", borderTop: "1px solid rgba(0,220,200,0.06)" }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <span className="badge-verified mb-5 inline-block">AI Assistant</span>
              <h2 className="font-orbitron font-bold text-2xl lg:text-3xl mb-4 text-[#EEEFEE]">
                Your AI Coaching<br />
                <span style={{ color: "#00DCC8" }}>Partner</span>
              </h2>
              <p
                className="text-base mb-6"
                style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.9 }}
              >
                Ask the AI assistant anything about training plans, player performance analysis, tactical recommendations, or injury management — all in Arabic.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                {[
                  "تحليل أداء اللاععبين وتقديم توصيات مخصصة",
                  "اقتراح خطط تدريبية بناءً على احتياجات الفريق",
                  "تتبع التقدم وتحديد نقاط التحسين",
                  "الإجابة على أسئلتك حول التدريب الرياضي",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#00DCC8" }} />
                    <span
                      className="text-sm"
                      style={{ color: "rgba(238,239,238,0.7)", fontFamily: "'Cairo', sans-serif" }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboards">
                <button className="btn-ada-outline text-sm px-6 py-2.5 flex items-center gap-2">
                  Try AI Assistant <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            {/* Chat UI mockup */}
            <div
              className="ada-card p-5"
              dir="rtl"
              style={{ background: "rgba(0,122,186,0.04)", border: "1px solid rgba(0,122,186,0.15)" }}
            >
              <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(0,220,200,0.15)", color: "#00DCC8" }}
                >
                  <Brain size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#EEEFEE]" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    مساعد Scout AI
                  </div>
                  <div className="text-xs" style={{ color: "#00DCC8", fontFamily: "'Cairo', sans-serif" }}>
                    Qwen AI • متصل
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-4 mb-4 text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(238,239,238,0.8)",
                  fontFamily: "'Cairo', sans-serif",
                  lineHeight: 1.8,
                }}
              >
                مرحباً! أنا Scout AI، مساعدك الذكي للتدريبات الرياضية. يمكنني مساعدتك في:
                <ul className="mt-2 space-y-1 text-xs" style={{ color: "rgba(238,239,238,0.6)" }}>
                  <li>• تحليل أداء اللاعبين</li>
                  <li>• اقتراح خطط تدريبية</li>
                  <li>• تتبع التقدم</li>
                  <li>• الإجابة على أسئلتك</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {["خطة تدريب أسبوعية", "تحليل أداء لاعب", "تمارين تكتيكية", "إدارة الإصابات"].map((q, i) => (
                  <button
                    key={i}
                    className="text-xs px-3 py-1.5 rounded-full transition-all"
                    style={{
                      background: "rgba(0,220,200,0.08)",
                      color: "#00DCC8",
                      border: "1px solid rgba(0,220,200,0.2)",
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div
                className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span
                  className="flex-1 text-sm"
                  style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Cairo', sans-serif" }}
                >
                  اسأل Scout AI عن التدريبات...
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,220,200,0.15)", color: "#00DCC8" }}
                >
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-orbitron font-bold text-3xl mb-5 text-[#EEEFEE]">
            Ready to Transform Training?
          </h2>
          <p
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.9 }}
          >
            Access the full Training Hub — AI coaching, player management, and match analytics in one platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => setHubOpen(true)} className="btn-ada-primary text-sm px-10 py-4 flex items-center gap-2 mx-auto">
                <Zap size={16} /> {lang === "ar" ? "فتح Training Hub" : "Open Training Hub"}
              </button>
            <Link href="/product">
              <button className="btn-ada-outline text-sm px-8 py-4 flex items-center gap-2">
                View All Modules <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
