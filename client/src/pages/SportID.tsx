import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import FifaCard, { type FifaCardPlayer } from "@/components/FifaCard";
/**
 * SportID Page — SportScout Platform
 * Design: Saudi Tech Noir + Saudi Ministry of Sports branding
 * Features:
 *   - QR Attendance (تسجيل حضور QR فوري)
 *   - Sports Points & Performance Tracking (نقاط رياضية وتتبع الأداء)
 *   - Ministry Reports & Analytics (تقارير وتحليلات مباشرة للوزارة)
 *   - Points & Levels (Bronze → Silver → Gold → Platinum)
 *   - Radar Chart for skills
 */

import { useState, useEffect, useRef } from "react";


import {
  Shield, QrCode, Award, Calendar, ChevronRight,
  Fingerprint, CheckCircle, BarChart2, Activity,
  Trophy, Clock, MapPin, Share2, Copy
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip
} from "recharts";
import { toast } from "sonner";

// ── Demo players database ────────────────────────────────────────────────────
const DEMO_PLAYERS = [
  {
    name: "فيصل المطيري", nameEn: "Faisal Al-Mutairi", nationality: "Saudi Arabia",
    id: "SA-2024-00142", city: "الدمام", sport: "كرة القدم", position: "وسط مهاجم",
    academy: "أكاديمية كابتن", level: "Gold" as const, points: 2840,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    skills: [{ skill: "السرعة", A: 88 }, { skill: "المراوغة", A: 82 }, { skill: "التسديد", A: 79 }, { skill: "الرؤية", A: 85 }, { skill: "التحمل", A: 76 }, { skill: "التمرير", A: 91 }],
  },
  {
    name: "خالد العتيبي", nameEn: "Khalid Al-Otaibi", nationality: "Saudi Arabia",
    id: "SA-2024-00089", city: "الخبر", sport: "كرة القدم", position: "مهاجم",
    academy: "أكاديمية الظهران", level: "Silver" as const, points: 1650,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    skills: [{ skill: "السرعة", A: 92 }, { skill: "المراوغة", A: 75 }, { skill: "التسديد", A: 88 }, { skill: "الرؤية", A: 71 }, { skill: "التحمل", A: 80 }, { skill: "التمرير", A: 68 }],
  },
  {
    name: "عمر الشهري", nameEn: "Omar Al-Shahri", nationality: "Saudi Arabia",
    id: "SA-2024-00211", city: "ظهران", sport: "كرة القدم", position: "ظهير أيمن",
    academy: "أكاديمية الموهبة الكروية", level: "Bronze" as const, points: 720,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    skills: [{ skill: "السرعة", A: 85 }, { skill: "المراوغة", A: 78 }, { skill: "التسديد", A: 65 }, { skill: "الرؤية", A: 80 }, { skill: "التحمل", A: 88 }, { skill: "التمرير", A: 82 }],
  },
  {
    name: "يوسف القحطاني", nameEn: "Yousef Al-Qahtani", nationality: "Saudi Arabia",
    id: "SA-2024-00334", city: "الدمام", sport: "كرة القدم", position: "حارس مرمى",
    academy: "أكاديمية كابتن", level: "Platinum" as const, points: 3900,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face",
    skills: [{ skill: "السرعة", A: 72 }, { skill: "المراوغة", A: 60 }, { skill: "التسديد", A: 55 }, { skill: "الرؤية", A: 94 }, { skill: "التحمل", A: 85 }, { skill: "التمرير", A: 78 }],
  },
];

const PLAYER = DEMO_PLAYERS[0];

// Skills are now per-player (see DEMO_PLAYERS[i].skills)

const STATS = [
  { label: "المباريات", value: "47", icon: "⚽", color: "#00C2A8" },
  { label: "الأهداف", value: "23", icon: "🎯", color: "#22c55e" },
  { label: "التمريرات الحاسمة", value: "18", icon: "📈", color: "#F59E0B" },
  { label: "ساعات التدريب", value: "312", icon: "⏱️", color: "#8B5CF6" },
];

const CERTIFICATIONS = [
  { title: "شهادة التميز الرياضي", issuer: "وزارة الرياضة السعودية", date: "2024-11-15", verified: true, color: "#F59E0B" },
  { title: "دورة تطوير المهارات", issuer: "أكاديمية كابتن", date: "2024-08-20", verified: true, color: "#00C2A8" },
  { title: "بطولة المنطقة الشرقية", issuer: "الاتحاد السعودي لكرة القدم", date: "2024-05-10", verified: true, color: "#22c55e" },
];

const TRIALS = [
  { title: "تجربة الهلال الأكاديمية", date: "2025-04-05", location: "الرياض", status: "مؤكد", color: "#00C2A8" },
  { title: "كشف موهبة الاتحاد", date: "2025-04-18", location: "جدة", status: "قيد المراجعة", color: "#F59E0B" },
  { title: "معسكر المنتخب تحت 19", date: "2025-05-02", location: "الدمام", status: "مؤكد", color: "#22c55e" },
];

const SESSIONS = [
  { date: "12 مارس 2025", academy: "أكاديمية كابتن", duration: "90 دقيقة", points: "+50", type: "تدريب" },
  { date: "10 مارس 2025", academy: "ملعب الدمام الرياضي", duration: "60 دقيقة", points: "+30", type: "مباراة" },
  { date: "8 مارس 2025", academy: "أكاديمية كابتن", duration: "90 دقيقة", points: "+50", type: "تدريب" },
  { date: "5 مارس 2025", academy: "أكاديمية الموهبة", duration: "120 دقيقة", points: "+80", type: "بطولة" },
];

const LEVELS = [
  { name: "Bronze", min: 0, max: 1000, color: "#CD7F32" },
  { name: "Silver", min: 1000, max: 2000, color: "#C0C0C0" },
  { name: "Gold", min: 2000, max: 3000, color: "#FFD700" },
  { name: "Platinum", min: 3000, max: 5000, color: "#00C2A8" },
];

// ── Simple QR canvas renderer ─────────────────────────────────────────────────
function QRCanvas({ value, size = 120, dark = "#0D2B1A", light = "#fff" }: { value: string; size?: number; dark?: string; light?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cell = Math.floor(size / 21);
    const seed = value.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = (i: number) => ((seed * 9301 + i * 49297) % 233280) / 233280;
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = dark;
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        const isCornerZone = (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
        const isInnerFill =
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= 16 && c <= 18) ||
          (r >= 16 && r <= 18 && c >= 2 && c <= 4);
        const isBorder =
          (r === 0 || r === 6) && c >= 0 && c <= 6 ||
          (c === 0 || c === 6) && r >= 0 && r <= 6 ||
          (r === 0 || r === 6) && c >= 14 && c <= 20 ||
          (c === 14 || c === 20) && r >= 0 && r <= 6 ||
          (r === 14 || r === 20) && c >= 0 && c <= 6 ||
          (c === 0 || c === 6) && r >= 14 && r <= 20;
        if (isCornerZone) {
          if (isBorder || isInnerFill) ctx.fillRect(c * cell, r * cell, cell, cell);
        } else if (rand(r * 21 + c) > 0.5) {
          ctx.fillRect(c * cell, r * cell, cell, cell);
        }
      }
    }
  }, [value, size, dark, light]);
  return <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: "pixelated", display: "block" }} />;
}

// ── Passport Card ─────────────────────────────────────────────────────────────
function PassportCard({ flipped, onFlip }: { flipped: boolean; onFlip: () => void }) {
  return (
    <div
      className="relative cursor-pointer select-none mx-auto"
      style={{ width: "100%", maxWidth: 380, height: 240, perspective: "1000px" }}
      onClick={onFlip}
    >
      <div style={{
        width: "100%", height: "100%", position: "relative",
        transformStyle: "preserve-3d",
        transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
      }}>
        {/* FRONT */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(135deg, #0D3B2A 0%, #0A2A1E 50%, #071A14 100%)",
          border: "1px solid rgba(0,194,168,0.4)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,194,168,0.08)"
        }}>
          {/* Top accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #00C2A8, transparent)" }} />
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,194,168,0.2)" }}>
                <Shield size={14} style={{ color: "#00C2A8" }} />
              </div>
              <span className="text-[#EEEFEE] font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SportID Passport</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#EEEFEE]/40" style={{ fontFamily: "'Tajawal', sans-serif" }}>وزارة الرياضة</span>
              <span style={{ fontSize: 14 }}>🇸🇦</span>
            </div>
          </div>
          {/* Body */}
          <div className="flex gap-3 px-5 py-3">
            <div className="relative flex-shrink-0">
              <img src={PLAYER.avatar} alt={PLAYER.nameEn} className="w-16 h-20 object-cover rounded-xl" style={{ border: "2px solid rgba(0,194,168,0.4)" }} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#00C2A8" }}>
                <CheckCircle size={11} className="text-[#EEEFEE]" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#EEEFEE] font-black text-base leading-tight mb-0.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>{PLAYER.name}</div>
              <div className="text-[#EEEFEE]/50 text-xs mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{PLAYER.nameEn} · {PLAYER.nationality}</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {[["الرياضة", PLAYER.sport], ["المركز", PLAYER.position], ["المدينة", PLAYER.city], ["الأكاديمية", PLAYER.academy]].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[#EEEFEE]/30 text-[9px]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{k}</div>
                    <div className="text-[#EEEFEE]/80 text-[11px] font-semibold truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="rounded-lg overflow-hidden p-1.5" style={{ background: "#fff" }}>
                <QRCanvas value={PLAYER.id} size={58} />
              </div>
              <span className="text-[9px] text-[#EEEFEE]/30 font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SPORTID</span>
            </div>
          </div>
          {/* Features badges */}
          <div className="flex gap-2 px-5 pb-4">
            <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <QrCode size={13} style={{ color: "#00C2A8" }} />
              <span className="text-[#EEEFEE]/70 text-[11px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>QR الحضور</span>
            </div>
            <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <BarChart2 size={13} style={{ color: "#22c55e" }} />
              <span className="text-[#EEEFEE]/70 text-[11px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>التقارير</span>
            </div>
          </div>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[#EEEFEE]/20 text-[9px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>اضغط لعرض QR الكامل</div>
        </div>
        {/* BACK */}
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden",
          transform: "rotateY(180deg)", borderRadius: 20, overflow: "hidden",
          background: "linear-gradient(135deg, #0D3B2A 0%, #071A14 100%)",
          border: "1px solid rgba(0,194,168,0.4)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10
        }}>
          <div className="text-[#EEEFEE]/50 text-xs font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SPORTID · {PLAYER.id}</div>
          <div className="rounded-2xl overflow-hidden p-3" style={{ background: "#fff", boxShadow: "0 0 30px rgba(0,194,168,0.3)" }}>
            <QRCanvas value={`https://ada2ai.sa/athlete/${PLAYER.id}`} size={140} />
          </div>
          <div className="text-[#00C2A8] text-xs font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>امسح للتحقق من الهوية</div>
          <div className="text-[#EEEFEE]/20 text-[9px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>اضغط للرجوع</div>
        </div>
      </div>
    </div>
  );
}

// ── Demo Onboarding Modal (no OTP) ───────────────────────────────────────────
function OnboardingModal({ onComplete, onSelectPlayer }: { onComplete: () => void; onSelectPlayer: (idx: number) => void }) {
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    onSelectPlayer(selected);
    setLoading(true);
    setTimeout(() => { setLoading(false); onComplete(); }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{ background: "linear-gradient(180deg, #0D3B2A 0%, #071A14 100%)", border: "1px solid rgba(0,194,168,0.3)", boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-5 px-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(0,194,168,0.15)", border: "1px solid rgba(0,194,168,0.3)" }}>
            <span style={{ fontSize: 28 }}>🏃</span>
          </div>
          <div className="text-[#EEEFEE]/40 text-xs mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>وزارة الرياضة السعودية</div>
          <div className="text-[#EEEFEE] font-black text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SportID</div>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>
            ⚡ Demo Mode — اختر لاعباً للمعاينة
          </div>
        </div>
        <div className="px-5 py-5 flex flex-col gap-3">
          {DEMO_PLAYERS.map((p, i) => {
            const levelColors: Record<string, string> = { Bronze: "#CD7F32", Silver: "#C0C0C0", Gold: "#FFD700", Platinum: "#00C2A8" };
            return (
              <button
                key={p.id}
                onClick={() => setSelected(i)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-right"
                style={{
                  background: selected === i ? "rgba(0,194,168,0.12)" : "rgba(255,255,255,0.03)",
                  border: selected === i ? "1.5px solid rgba(0,194,168,0.5)" : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <img src={p.avatar} alt={p.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" style={{ border: selected === i ? "2px solid #00C2A8" : "2px solid rgba(255,255,255,0.1)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[#EEEFEE] font-bold text-sm truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{p.name}</div>
                  <div className="text-[#EEEFEE]/40 text-xs truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{p.position} · {p.city}</div>
                </div>
                <div className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: `${levelColors[p.level]}20`, color: levelColors[p.level], border: `1px solid ${levelColors[p.level]}40`, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {p.level}
                </div>
              </button>
            );
          })}
          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-[#EEEFEE] text-sm transition-all mt-1 flex items-center justify-center gap-2"
            style={{ background: loading ? "rgba(0,194,168,0.4)" : "linear-gradient(135deg, #00A896, #007A6E)", fontFamily: "'Tajawal', sans-serif", boxShadow: "0 8px 24px rgba(0,168,150,0.3)" }}
          >
            {loading ? (
              <><span className="animate-spin inline-block">⏳</span> جاري الدخول...</>
            ) : (
              <><CheckCircle size={16} /> دخول فوري — بدون OTP</>
            )}
          </button>
          <p className="text-[#EEEFEE]/25 text-center text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>وضع تجريبي — التسجيل عبر Ministry API</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SportIDPage() {
  const { isRTL, t, lang } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "certs" | "trials" | "sessions">("stats");
  const [showFifaCard, setShowFifaCard] = useState(false);

  const activePlayer = DEMO_PLAYERS[selectedPlayerIdx];

  const currentLevel = LEVELS.find((l) => activePlayer.points >= l.min && activePlayer.points < l.max) || LEVELS[2];
  const progressPct = Math.round(((activePlayer.points - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100);

  function handleShare() {
    const text = `مرحباً، أنا ${activePlayer.name} — لاعب ${activePlayer.sport} من ${activePlayer.city}.\nملفي الرياضي على Ada2ai: https://ada2ai.sa/athlete/${activePlayer.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleCopy() {
    navigator.clipboard?.writeText(`https://ada2ai.sa/athlete/${activePlayer.id}`).then(() => {
      toast.success("تم نسخ الرابط!");
    });
  }

  return (
    <div className="min-h-screen text-[#EEEFEE]" style={{ background: "oklch(0.08 0.02 240)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }} dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => { setShowOnboarding(false); setIsAuthenticated(true); }}
          onSelectPlayer={(idx) => setSelectedPlayerIdx(idx)}
        />
      )}

      {/* Page Banner */}
      <div className="relative pt-24 pb-12 overflow-hidden" style={{ background: "linear-gradient(180deg, #071A14 0%, oklch(0.08 0.02 240) 100%)", borderBottom: "1px solid rgba(0,194,168,0.1)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,194,168,0.07) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(0,194,168,0.1)", border: "1px solid rgba(0,194,168,0.3)", color: "#00C2A8" }}>
            <Shield size={12} /> {lang === "ar" ? "هوية رياضية رقمية موثّقة" : "Verified Digital Sport Identity"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#EEEFEE] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Sport<span style={{ color: "#00C2A8" }}>ID</span>
          </h1>
          <p className="text-[#EEEFEE]/50 max-w-lg mx-auto text-sm leading-relaxed">
            {lang === "ar" ? "جواز سفرك الرياضي الرقمي — معترف به في جميع الأكاديميات والمنشآت الرياضية" : "Your digital sports passport — recognized across all academies and sports facilities"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">

        {/* ── UNAUTHENTICATED STATE ── */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center gap-8">
            {/* Blurred passport preview */}
            <div className="relative w-full max-w-sm">
              <div style={{ filter: "blur(3px)", opacity: 0.5, pointerEvents: "none" }}>
                <PassportCard flipped={false} onFlip={() => {}} />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="px-8 py-4 rounded-2xl text-center" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,194,168,0.3)" }}>
                  <Shield size={28} style={{ color: "#00C2A8" }} className="mx-auto mb-2" />
                  <p className="text-[#EEEFEE] font-bold mb-1" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{lang === "ar" ? "سجّل دخولك للوصول" : "Sign in to access"}</p>
                  <p className="text-[#EEEFEE]/50 text-xs" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{lang === "ar" ? "تسجيل حضور فوري" : "Instant QR Check-in"}</p>
                </div>
              </div>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              {[
                { icon: "🔲", title: "QR للحضور", desc: "سجّل حضورك في أي منشأة رياضية بمسح QR واحد", color: "#00C2A8" },
                { icon: "🏆", title: "نظام النقاط", desc: "اكسب نقاطاً مع كل تدريب وارتقِ من Bronze إلى Platinum", color: "#FFD700" },
                { icon: "🎖️", title: "شهادات موثّقة", desc: "شهاداتك الرياضية معترف بها من وزارة الرياضة", color: "#22c55e" },
              ].map((f) => (
                <div key={f.title} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <div className="text-[#EEEFEE] font-bold text-sm mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{f.title}</div>
                  <div className="text-[#EEEFEE]/40 text-xs leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── AUTHENTICATED STATE ── */
          <div className="flex flex-col gap-8">

            {/* ── FIFA SportID Card Preview ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(0,122,186,0.06)", border: "1px solid rgba(0,220,200,0.2)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(0,220,200,0.1)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#007ABA,#00DCC8)" }}>
                    <Trophy size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-[#EEEFEE] font-black text-base" style={{ fontFamily: "'Tajawal',sans-serif" }}>بطاقة SportID — FIFA Edition</div>
                    <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal',sans-serif" }}>بطاقتك الرياضية الرقمية بتصميم FIFA Ultimate Team</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowFifaCard(!showFifaCard)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{ background: showFifaCard ? "rgba(0,220,200,0.15)" : "rgba(0,122,186,0.2)", border: `1px solid ${showFifaCard ? "rgba(0,220,200,0.4)" : "rgba(0,122,186,0.4)"}`, color: showFifaCard ? "#00DCC8" : "#007ABA", fontFamily: "'Tajawal',sans-serif" }}
                >
                  {showFifaCard ? "إخفاء البطاقة" : "عرض البطاقة ▼"}
                </button>
              </div>

              {/* Card Preview */}
              {showFifaCard && (() => {
                const fifaPlayer: FifaCardPlayer = {
                  name: activePlayer.name,
                  nameEn: activePlayer.nameEn,
                  jerseyNumber: selectedPlayerIdx === 0 ? 10 : selectedPlayerIdx === 1 ? 7 : selectedPlayerIdx === 2 ? 11 : 1,
                  position: activePlayer.position,
                  sport: activePlayer.sport,
                  birthYear: 2009 - selectedPlayerIdx,
                  sportId: activePlayer.id,
                  avatar: activePlayer.avatar,
                  level: activePlayer.level,
                  stats: {
                    speed:    activePlayer.skills.find(s => s.skill === "السرعة")?.A ?? 75,
                    passing:  activePlayer.skills.find(s => s.skill === "التمرير")?.A ?? 75,
                    shooting: activePlayer.skills.find(s => s.skill === "التسديد")?.A ?? 75,
                    defense:  activePlayer.skills.find(s => s.skill === "الرؤية")?.A ?? 70,
                    skill:    activePlayer.skills.find(s => s.skill === "المراوغة")?.A ?? 75,
                    strength: activePlayer.skills.find(s => s.skill === "التحمل")?.A ?? 75,
                  },
                };
                return (
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-6">
                    {/* Card */}
                    <div className="flex-shrink-0">
                      <FifaCard player={fifaPlayer} />
                    </div>
                    {/* Info panel */}
                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                      <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-[#00DCC8] text-xs font-bold mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 1 }}>SPORTID</div>
                        <div className="text-[#EEEFEE] font-black text-xl mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 2 }}>{activePlayer.id}</div>
                        <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal',sans-serif" }}>هوية رياضية رقمية موحّدة — معترف بها في جميع الأكاديميات</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "الاسم", value: activePlayer.name },
                          { label: "الرياضة", value: activePlayer.sport },
                          { label: "المركز", value: activePlayer.position },
                          { label: "المدينة", value: activePlayer.city },
                          { label: "الأكاديمية", value: activePlayer.academy },
                          { label: "المستوى", value: activePlayer.level },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="text-[#EEEFEE]/30 text-[10px] mb-0.5" style={{ fontFamily: "'Tajawal',sans-serif" }}>{label}</div>
                            <div className="text-[#EEEFEE] font-bold text-sm truncate" style={{ fontFamily: "'Tajawal',sans-serif" }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl p-4" style={{ background: "rgba(0,220,200,0.05)", border: "1px solid rgba(0,220,200,0.15)" }}>
                        <div className="text-[#EEEFEE]/50 text-xs mb-3" style={{ fontFamily: "'Tajawal',sans-serif" }}>مقاييس الأداء</div>
                        <div className="grid grid-cols-3 gap-2">
                          {fifaPlayer.stats && Object.entries({ السرعة: fifaPlayer.stats.speed, التمرير: fifaPlayer.stats.passing, التسديد: fifaPlayer.stats.shooting, الدفاع: fifaPlayer.stats.defense, المهارة: fifaPlayer.stats.skill, القوة: fifaPlayer.stats.strength }).map(([label, val]) => (
                            <div key={label} className="text-center">
                              <div className="font-black text-2xl" style={{ color: val >= 85 ? "#00DCC8" : val >= 70 ? "#FFD700" : "#CD7F32", fontFamily: "'Space Grotesk',sans-serif" }}>{val}</div>
                              <div className="text-[#EEEFEE]/40 text-[10px]" style={{ fontFamily: "'Tajawal',sans-serif" }}>{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Passport + Level side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center gap-4">
                <PassportCard flipped={cardFlipped} onFlip={() => setCardFlipped(!cardFlipped)} />
                <div className="flex gap-2">
                  <button
                    onClick={() => setCardFlipped(!cardFlipped)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: "rgba(0,194,168,0.1)", border: "1px solid rgba(0,194,168,0.25)", color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <QrCode size={13} /> عرض QR الكامل
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Share2 size={13} /> مشاركة
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Copy size={13} /> نسخ الرابط
                  </button>
                  <a
                    href={`https://sportid-passport.vercel.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                    style={{ background: "rgba(0,194,168,0.15)", border: "1px solid rgba(0,194,168,0.35)", color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    <Shield size={13} /> عرض البروفايل الكامل
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Level card */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[#EEEFEE]/40 text-xs mb-0.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>المستوى الحالي</div>
                      <div className="font-black text-2xl" style={{ color: currentLevel.color, fontFamily: "'Space Grotesk', sans-serif" }}>{currentLevel.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#EEEFEE]/40 text-xs mb-0.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>النقاط</div>
                      <div className="font-black text-2xl text-[#EEEFEE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{PLAYER.points.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}99)` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#EEEFEE]/30" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    <span>{currentLevel.min.toLocaleString()}</span>
                    <span>{currentLevel.max - PLAYER.points} نقطة للمستوى التالي</span>
                    <span>{currentLevel.max.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {LEVELS.map((l) => (
                      <div key={l.name} className="flex-1 py-1.5 rounded-lg text-center text-[10px] font-bold transition-all" style={{
                        background: PLAYER.points >= l.min ? `${l.color}20` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${PLAYER.points >= l.min ? l.color + "60" : "rgba(255,255,255,0.06)"}`,
                        color: PLAYER.points >= l.min ? l.color : "rgba(255,255,255,0.2)",
                        fontFamily: "'Space Grotesk', sans-serif"
                      }}>
                        {l.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radar Chart */}
                <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-[#EEEFEE]/60 text-xs font-semibold mb-2 text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>خريطة المهارات</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={activePlayer.skills}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "'Tajawal', sans-serif" }} />
                      <Radar name="المهارات" dataKey="A" stroke="#00C2A8" fill="#00C2A8" fillOpacity={0.15} strokeWidth={1.5} />
                      <Tooltip
                        contentStyle={{ background: "#0D2B1A", border: "1px solid rgba(0,194,168,0.3)", borderRadius: 8, fontSize: 11 }}
                        labelStyle={{ color: "#fff" }}
                        itemStyle={{ color: "#00C2A8" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span className="text-xl">{s.icon}</span>
                  <div className="font-black text-2xl text-[#EEEFEE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                  <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {([
                  { key: "stats" as const, label: "الإحصائيات", icon: <Activity size={13} /> },
                  { key: "certs" as const, label: "الشهادات", icon: <Award size={13} /> },
                  { key: "trials" as const, label: "التجارب القادمة", icon: <Calendar size={13} /> },
                  { key: "sessions" as const, label: "الجلسات", icon: <Clock size={13} /> },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: activeTab === tab.key ? "rgba(0,194,168,0.15)" : "transparent",
                      color: activeTab === tab.key ? "#00C2A8" : "rgba(255,255,255,0.4)",
                      border: activeTab === tab.key ? "1px solid rgba(0,194,168,0.3)" : "1px solid transparent",
                      fontFamily: "'Tajawal', sans-serif"
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "stats" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activePlayer.skills.map((s) => (
                    <div key={s.skill} className="flex items-center gap-3">
                      <div className="text-[#EEEFEE]/60 text-sm w-24 text-right flex-shrink-0" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.skill}</div>
                      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.A}%`, background: "linear-gradient(90deg, #00C2A8, #22c55e)" }} />
                      </div>
                      <div className="text-[#EEEFEE]/80 text-sm font-bold w-8 text-left flex-shrink-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.A}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "certs" && (
                <div className="flex flex-col gap-3">
                  {CERTIFICATIONS.map((c) => (
                    <div key={c.title} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}15`, border: `1px solid ${c.color}40` }}>
                        <Award size={18} style={{ color: c.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#EEEFEE] font-bold text-sm truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{c.title}</div>
                        <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{c.issuer}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[#EEEFEE]/30 text-xs mb-1">{c.date}</div>
                        {c.verified && (
                          <div className="flex items-center gap-1 text-[10px]" style={{ color: "#00C2A8" }}>
                            <CheckCircle size={10} /> موثّق
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "trials" && (
                <div className="flex flex-col gap-3">
                  {TRIALS.map((t) => (
                    <div key={t.title} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}15`, border: `1px solid ${t.color}40` }}>
                        <Calendar size={18} style={{ color: t.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#EEEFEE] font-bold text-sm truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{t.title}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[#EEEFEE]/40 text-xs flex items-center gap-1"><Clock size={10} />{t.date}</span>
                          <span className="text-[#EEEFEE]/40 text-xs flex items-center gap-1"><MapPin size={10} />{t.location}</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-[10px] font-bold flex-shrink-0" style={{ background: `${t.color}15`, border: `1px solid ${t.color}40`, color: t.color, fontFamily: "'Tajawal', sans-serif" }}>
                        {t.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "sessions" && (
                <div className="flex flex-col gap-3">
                  {SESSIONS.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,194,168,0.1)", border: "1px solid rgba(0,194,168,0.2)" }}>
                        <Activity size={18} style={{ color: "#00C2A8" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#EEEFEE] font-bold text-sm truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.academy}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.date}</span>
                          <span className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.duration}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontFamily: "'Tajawal', sans-serif" }}>{s.type}</span>
                        </div>
                      </div>
                      <div className="font-bold text-sm flex-shrink-0" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>{s.points}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WhatsApp CTA */}
            <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.2)" }}>
              <div>
                <div className="text-[#EEEFEE] font-bold mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>شارك جواز سفرك الرياضي</div>
                <div className="text-[#EEEFEE]/40 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>أرسل ملفك الرياضي للأكاديميات والكشافين عبر واتساب</div>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[#EEEFEE] text-sm transition-all hover:scale-105 flex-shrink-0"
                style={{ background: "#25D366", boxShadow: "0 4px 16px rgba(37,211,102,0.3)", fontFamily: "'Tajawal', sans-serif" }}
              >
                <span>📱</span> مشاركة عبر واتساب
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
