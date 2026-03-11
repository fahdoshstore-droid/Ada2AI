import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Shield, QrCode, Star, TrendingUp, Award, Calendar, Clock,
  CheckCircle, Copy, Share2, X, Zap, Target, Users, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

// ── Mock athlete data ──────────────────────────────────────────────────────
const athlete = {
  id: "SA-2024-0042",
  nafathId: "1098765432",
  name: "Mohammed Al-Omari",
  nameAr: "محمد العمري",
  age: 16,
  city: "دمام",
  sports: ["Football", "Athletics"],
  sportPoints: 1340,
  careerScore: 84,
  level: "Gold" as const,
  sessions: [
    { id: 1, sport: "Football", facilityName: "أكاديمية كابتن", facilityId: "f1", duration: 90, points: 45, date: "2024-03-10" },
    { id: 2, sport: "Football", facilityName: "أكاديمية كابتن", facilityId: "f1", duration: 90, points: 45, date: "2024-03-07" },
    { id: 3, sport: "Athletics", facilityName: "ملعب الدمام الرياضي", facilityId: "f2", duration: 60, points: 30, date: "2024-03-05" },
    { id: 4, sport: "Football", facilityName: "أكاديمية الموهبة الكروية", facilityId: "f3", duration: 90, points: 45, date: "2024-03-02" },
    { id: 5, sport: "Football", facilityName: "أكاديمية كابتن", facilityId: "f1", duration: 90, points: 45, date: "2024-02-28" },
  ],
  achievements: [
    { id: 1, icon: "🏆", title: "أسرع لاعب", description: "سجّل أعلى سرعة في أكاديمية كابتن هذا الموسم", points: 200, date: "2024-03-01" },
    { id: 2, icon: "⚽", title: "هداف الشهر", description: "أكثر لاعب تسجيلاً للأهداف في فبراير 2024", points: 150, date: "2024-02-29" },
    { id: 3, icon: "🌟", title: "موهبة واعدة", description: "اختيار AI كأفضل موهبة في المنطقة الشرقية", points: 300, date: "2024-02-15" },
  ],
  certifications: [
    { id: 1, name: "شهادة التميز الرياضي", issuedBy: "الاتحاد السعودي لكرة القدم", issuedAt: "2024-01-15", points: 100, verified: true },
    { id: 2, name: "برنامج تطوير المهارات", issuedBy: "أكاديمية كابتن", issuedAt: "2023-12-01", points: 75, verified: true },
  ],
  radarData: [
    { subject: "الثبات", A: 85, avg: 70 },
    { subject: "الجلسات", A: 72, avg: 65 },
    { subject: "المهارة", A: 88, avg: 72 },
    { subject: "المنافسات", A: 65, avg: 60 },
    { subject: "الشهادات", A: 90, avg: 68 },
  ],
};

const levelConfig = {
  Bronze:   { gradient: "from-amber-700 to-amber-500", glow: "rgba(251,146,60,0.2)", border: "rgba(251,146,60,0.4)", accent: "#F97316", next: "Silver", needed: 160, start: 0 },
  Silver:   { gradient: "from-gray-400 to-gray-200", glow: "rgba(156,163,175,0.15)", border: "rgba(209,213,219,0.4)", accent: "#9CA3AF", next: "Gold", needed: 500, start: 500 },
  Gold:     { gradient: "from-yellow-500 to-yellow-300", glow: "rgba(234,179,8,0.25)", border: "rgba(234,179,8,0.45)", accent: "#EAB308", next: "Platinum", needed: 660, start: 1000 },
  Platinum: { gradient: "from-cyan-400 to-blue-300", glow: "rgba(34,211,238,0.2)", border: "rgba(34,211,238,0.4)", accent: "#22D3EE", next: null, needed: 0, start: 2000 },
};

const sportIcons: Record<string, string> = {
  Football: "⚽", Swimming: "🏊", Basketball: "🏀", Athletics: "🏃", Tennis: "🎾",
};

export default function SportID() {
  const [, navigate] = useLocation();
  const [flipped, setFlipped] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "achievements" | "certs">("overview");

  const cfg = levelConfig[athlete.level];
  const progressPct = Math.round(
    ((athlete.sportPoints - cfg.start) / (cfg.needed + (athlete.sportPoints - cfg.start))) * 100
  );

  useEffect(() => {
    QRCode.toDataURL(
      JSON.stringify({ id: athlete.id, nafathId: athlete.nafathId, name: athlete.name, level: athlete.level, points: athlete.sportPoints, ts: new Date().toISOString() }),
      { width: 260, margin: 2, color: { dark: "#00C2A8", light: "#071020" } }
    ).then(setQrDataUrl);
  }, []);

  async function handleCheckIn() {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 2500));
    setScanning(false);
    setScanned(true);
    toast.success("تم تسجيل الحضور بنجاح! +45 نقطة");
    setTimeout(() => setScanned(false), 4000);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(`${athlete.nameAr} · ${athlete.level} Athlete · ${athlete.sportPoints} pts · SportScout SA`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(180deg, #071020 0%, #0A1628 50%, #071020 100%)" }} dir="rtl">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-15" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4" style={{ background: "rgba(0,194,168,0.12)", border: "1px solid rgba(0,194,168,0.3)", color: "#00C2A8", fontFamily: "'Tajawal', sans-serif" }}>
            <Shield size={12} /> جواز السفر الرياضي الرقمي
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 mt-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>SportID</h1>
          <p className="text-white/45 text-base" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>هويتك الرياضية الرقمية الموثقة · موثق بنفاذ</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">

            {/* ── FLIP PASSPORT CARD ── */}
            <div className="mb-6" style={{ perspective: "1400px" }}>
              <div style={{
                transformStyle: "preserve-3d",
                transition: "transform 0.75s cubic-bezier(0.4,0,0.2,1)",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                position: "relative",
                minHeight: "420px",
              }}>

                {/* FRONT */}
                <div className="rounded-3xl overflow-hidden" style={{
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(135deg, #0F2340 0%, #0A1628 60%, #071020 100%)",
                  border: `1px solid ${cfg.border}`,
                  boxShadow: `0 0 60px ${cfg.glow}, 0 20px 40px rgba(0,0,0,0.4)`,
                }}>
                  {/* Holographic shimmer */}
                  <div className="absolute inset-0 rounded-3xl z-10 pointer-events-none" style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)",
                  }} />
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />
                  {/* Glow orbs */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cfg.accent}30, transparent 70%)` }} />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #1E90FF20, transparent 70%)" }} />

                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r ${cfg.gradient} text-white shadow`}>
                            {athlete.level} Athlete
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
                            ✓ نفاذ موثق
                          </span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{athlete.name}</h2>
                          <p className="text-white/40 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{athlete.nameAr}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowShare(true)} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Share2 size={16} />
                      </button>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: "ID", value: athlete.id },
                        { label: "نفاذ", value: `****${athlete.nafathId.slice(-4)}` },
                        { label: "المدينة", value: athlete.city },
                        { label: "العمر", value: `${athlete.age} سنة` },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="text-white/30 text-xs mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{label}</div>
                          <div className="text-white font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Sports */}
                    <div className="mb-4">
                      <div className="text-white/30 text-xs mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>الرياضات</div>
                      <div className="flex gap-2 flex-wrap">
                        {athlete.sports.map((s) => (
                          <span key={s} className="px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: "rgba(0,194,168,0.12)", border: "1px solid rgba(0,194,168,0.25)", color: "#00C2A8" }}>
                            {sportIcons[s] || "🏅"} {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Points bar */}
                    <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-white/50 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>نقاط رياضية</span>
                        <span className="text-2xl font-black" style={{ color: cfg.accent, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {athlete.sportPoints.toLocaleString()} ⭐
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full transition-all duration-1000`} style={{ width: `${progressPct}%` }} />
                      </div>
                      {cfg.next && (
                        <div className="text-white/30 text-xs mt-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                          {cfg.needed} نقطة للوصول إلى {cfg.next}
                        </div>
                      )}
                    </div>

                    <button onClick={() => setFlipped(true)} className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${cfg.accent}cc, ${cfg.accent}77)`, border: `1px solid ${cfg.accent}44`, fontFamily: "'Tajawal', sans-serif" }}>
                      <QrCode size={16} /> عرض QR للحضور
                    </button>
                  </div>
                </div>

                {/* BACK */}
                <div className="rounded-3xl overflow-hidden absolute inset-0" style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  background: "linear-gradient(135deg, #071020 0%, #0A1628 60%, #0F2340 100%)",
                  border: `1px solid ${cfg.border}`,
                  boxShadow: `0 0 60px ${cfg.glow}, 0 20px 40px rgba(0,0,0,0.4)`,
                }}>
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />
                  <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cfg.accent}20, transparent 70%)` }} />

                  <div className="relative p-6 flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-4">
                      <span className="text-white/40 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SportID QR</span>
                      <button onClick={() => setFlipped(false)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <X size={16} />
                      </button>
                    </div>

                    {qrDataUrl ? (
                      <div className="rounded-2xl p-3 mb-4" style={{ background: "#071020", border: `2px solid ${cfg.border}` }}>
                        <img src={qrDataUrl} alt="QR Code" className="w-52 h-52 rounded-xl" />
                      </div>
                    ) : (
                      <div className="w-52 h-52 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: cfg.accent }} />
                      </div>
                    )}

                    <p className="text-white/40 text-xs text-center mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      امسح الكود في المنشأة الرياضية لتسجيل الحضور وكسب النقاط
                    </p>

                    <button
                      onClick={handleCheckIn}
                      disabled={scanning || scanned}
                      className="w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: scanned ? "rgba(34,197,94,0.3)" : `linear-gradient(135deg, ${cfg.accent}cc, ${cfg.accent}77)`, border: `1px solid ${scanned ? "rgba(34,197,94,0.5)" : cfg.accent + "44"}`, fontFamily: "'Tajawal', sans-serif" }}
                    >
                      {scanning ? (
                        <><div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin border-white" /> جاري المسح...</>
                      ) : scanned ? (
                        <><CheckCircle size={16} /> تم تسجيل الحضور! +45 نقطة</>
                      ) : (
                        <><QrCode size={16} /> تسجيل الحضور يدوياً</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TABS ── */}
            <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "rgba(255,255,255,0.05)" }}>
              {[
                { key: "overview", label: "نظرة عامة" },
                { key: "sessions", label: "الجلسات" },
                { key: "achievements", label: "الإنجازات" },
                { key: "certs", label: "الشهادات" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.key ? "text-white" : "text-white/40 hover:text-white/70"}`}
                  style={activeTab === tab.key ? { background: `linear-gradient(135deg, ${cfg.accent}30, ${cfg.accent}15)`, fontFamily: "'Tajawal', sans-serif", border: `1px solid ${cfg.accent}30` } : { fontFamily: "'Tajawal', sans-serif" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "إجمالي الجلسات", value: athlete.sessions.length, icon: <Calendar size={16} />, color: cfg.accent },
                    { label: "الإنجازات", value: athlete.achievements.length, icon: <Award size={16} />, color: "#EAB308" },
                    { label: "الشهادات", value: athlete.certifications.length, icon: <CheckCircle size={16} />, color: "#4ade80" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex justify-center mb-2" style={{ color: s.color }}>{s.icon}</div>
                      <div className="text-2xl font-black mb-0.5" style={{ color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                      <div className="text-white/35 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Radar */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    <Target size={14} style={{ color: cfg.accent }} /> خريطة الأداء
                  </h3>
                  <div className="flex gap-3 mb-2">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ background: cfg.accent }} /><span className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>أنت</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded-full bg-white/20" style={{ borderTop: "1px dashed rgba(255,255,255,0.2)" }} /><span className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>المتوسط</span></div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={athlete.radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "'Tajawal', sans-serif" }} />
                      <Radar name="أنت" dataKey="A" stroke={cfg.accent} fill={cfg.accent} fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="المتوسط" dataKey="avg" stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.03)" strokeWidth={1} strokeDasharray="4 2" />
                      <Tooltip contentStyle={{ background: "#0A1628", border: `1px solid ${cfg.accent}40`, borderRadius: "8px", color: "white", fontFamily: "'Tajawal', sans-serif", fontSize: "12px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Level progress */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${cfg.border}` }}>
                  <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    <Star size={14} style={{ color: cfg.accent }} /> مسار المستويات
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    {["Bronze", "Silver", "Gold", "Platinum"].map((lvl, i) => {
                      const levels = ["Bronze", "Silver", "Gold", "Platinum"];
                      const currentIdx = levels.indexOf(athlete.level);
                      const lvlIdx = levels.indexOf(lvl);
                      const isDone = lvlIdx <= currentIdx;
                      const lCfg = levelConfig[lvl as keyof typeof levelConfig];
                      return (
                        <div key={lvl} className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isDone ? `bg-gradient-to-r ${lCfg.gradient}` : "bg-white/10"}`} style={{ color: isDone ? "white" : "rgba(255,255,255,0.3)" }}>
                            {isDone ? "✓" : i + 1}
                          </div>
                          <span className="text-xs" style={{ color: isDone ? lCfg.accent : "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}>{lvl}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full`} style={{ width: `${progressPct}%`, transition: "width 1.2s ease" }} />
                  </div>
                  <p className="text-white/30 text-xs mt-2 text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    {cfg.next ? `${cfg.needed} نقطة للوصول إلى ${cfg.next}` : "وصلت إلى أعلى مستوى! 🏆"}
                  </p>
                </div>
              </div>
            )}

            {/* ── SESSIONS TAB ── */}
            {activeTab === "sessions" && (
              <div className="space-y-2.5">
                {athlete.sessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(0,194,168,0.12)", border: "1px solid rgba(0,194,168,0.2)" }}>
                      {sportIcons[s.sport] || "🏅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-semibold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.facilityName}</div>
                      <div className="text-white/40 text-xs mt-0.5 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        <span>{s.sport}</span>
                        <span>·</span>
                        <Clock size={10} />
                        <span>{s.duration} دقيقة</span>
                        <span>·</span>
                        <span>{new Date(s.date).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-black text-sm" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>+{s.points}</div>
                      <div className="text-white/20 text-xs">نقطة</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── ACHIEVEMENTS TAB ── */}
            {activeTab === "achievements" && (
              <div className="grid grid-cols-1 gap-3">
                {athlete.achievements.map((a) => (
                  <div key={a.id} className="relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 group" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "radial-gradient(circle, rgba(234,179,8,0.1), transparent 70%)", transform: "translate(30%, -30%)" }} />
                    <div className="text-4xl mb-3">{a.icon}</div>
                    <div className="text-white font-bold text-sm mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{a.title}</div>
                    <div className="text-white/40 text-xs leading-relaxed mb-3" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{a.description}</div>
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="text-yellow-400 text-xs font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>+{a.points} pts</span>
                      <span className="text-white/20 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{new Date(a.date).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CERTS TAB ── */}
            {activeTab === "certs" && (
              <div className="space-y-2.5">
                {athlete.certifications.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>📜</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{c.name}</div>
                      <div className="text-white/40 text-xs mt-0.5 truncate" style={{ fontFamily: "'Tajawal', sans-serif" }}>{c.issuedBy} · {new Date(c.issuedAt).toLocaleDateString("ar-SA")}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-green-400 font-black text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>+{c.points}</span>
                      {c.verified && (
                        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80", fontFamily: "'Tajawal', sans-serif" }}>
                          ✓ موثق
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA to Scout AI */}
            <div className="mt-6 rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-white/50 text-sm mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                هل أنت كشاف رياضي؟ اكتشف المواهب بالذكاء الاصطناعي
              </p>
              <button onClick={() => navigate("/scouts")} className="btn-primary px-6 py-2.5 flex items-center justify-center gap-2 mx-auto" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <Users size={15} /> لوحة الكشافين
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHARE MODAL ── */}
      {showShare && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowShare(false)}>
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()} style={{
            background: "linear-gradient(135deg, #0F2340 0%, #0A1628 100%)",
            border: `2px solid ${cfg.border}`,
            boxShadow: `${cfg.glow}, 0 25px 50px rgba(0,0,0,0.5)`,
          }}>
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)` }} />
            <div className="relative p-8 text-center">
              <div className="text-6xl mb-4">🪪</div>
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r ${cfg.gradient} text-white mb-3 shadow`}>
                {athlete.level} Athlete
              </span>
              <h3 className="text-2xl font-black text-white mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{athlete.name}</h3>
              <p className="text-white/40 text-sm mt-0.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>{athlete.nameAr}</p>

              <div className="flex justify-center gap-6 my-6">
                {[
                  { value: athlete.sportPoints, label: "نقطة", color: cfg.accent },
                  { value: athlete.careerScore, label: "مسار", color: "#3b82f6" },
                  { value: athlete.sessions.length, label: "جلسة", color: "#00C2A8" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-black" style={{ color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                    <div className="text-white/40 text-xs mt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-white/20 text-xs font-mono mb-5">sportscout.sa · {athlete.id}</div>

              <div className="flex gap-2.5">
                <button onClick={handleCopy} className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, ${cfg.accent}cc, ${cfg.accent}88)`, fontFamily: "'Tajawal', sans-serif" }}>
                  {copied ? <><CheckCircle size={15} /> تم النسخ!</> : <><Copy size={15} /> نسخ البطاقة</>}
                </button>
                <button onClick={() => setShowShare(false)} className="px-4 py-3 rounded-2xl text-white/50 hover:bg-white/10 transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
