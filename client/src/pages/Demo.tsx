import { useState, useEffect } from "react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Play,
  Download,
  MessageCircle,
  Star,
  TrendingUp,
  Zap,
  Target,
  Award,
  ChevronRight,
  Loader2,
  CheckCircle,
} from "lucide-react";

// Sample player data
const players = [
  {
    id: 1,
    name: "محمد العمري",
    age: 16,
    position: "مهاجم",
    city: "دمام",
    academy: "أكاديمية كابتن",
    overallScore: 87,
    potential: 94,
    skills: [
      { skill: "السرعة", value: 92, benchmark: 75 },
      { skill: "المهارة", value: 88, benchmark: 70 },
      { skill: "التكتيك", value: 78, benchmark: 65 },
      { skill: "اللياقة", value: 85, benchmark: 72 },
      { skill: "التمرير", value: 82, benchmark: 68 },
      { skill: "التسديد", value: 90, benchmark: 73 },
    ],
    strengths: ["سرعة استثنائية", "تسديد قوي بالقدمين", "حركة بدون كرة ممتازة"],
    improvements: ["تطوير التكتيك الدفاعي", "تحسين الرأسيات"],
    recommendation: "مرشح قوي للمستوى الاحترافي — يُنصح بالانضمام لأكاديمية الفتح",
    videoUrl: "#",
    stats: { goals: 23, assists: 12, matches: 31, rating: 8.4 },
  },
  {
    id: 2,
    name: "عبدالله الشهري",
    age: 14,
    position: "وسط",
    city: "خبر",
    academy: "أكاديمية الموهبة الكروية",
    overallScore: 82,
    potential: 91,
    skills: [
      { skill: "السرعة", value: 78, benchmark: 72 },
      { skill: "المهارة", value: 85, benchmark: 70 },
      { skill: "التكتيك", value: 90, benchmark: 68 },
      { skill: "اللياقة", value: 80, benchmark: 71 },
      { skill: "التمرير", value: 93, benchmark: 75 },
      { skill: "التسديد", value: 76, benchmark: 65 },
    ],
    strengths: ["رؤية الملعب استثنائية", "تمرير دقيق", "ذكاء تكتيكي عالي"],
    improvements: ["تطوير السرعة", "تقوية التسديد من بعيد"],
    recommendation: "موهبة نادرة في الوسط — يُنصح بمتابعة مكثفة من الكشافين",
    videoUrl: "#",
    stats: { goals: 8, assists: 27, matches: 28, rating: 8.1 },
  },
  {
    id: 3,
    name: "فيصل القحطاني",
    age: 17,
    position: "حارس مرمى",
    city: "ظهران",
    academy: "أكاديمية الظهران الرياضية",
    overallScore: 85,
    potential: 89,
    skills: [
      { skill: "الردود", value: 91, benchmark: 78 },
      { skill: "التمركز", value: 87, benchmark: 74 },
      { skill: "التوزيع", value: 83, benchmark: 68 },
      { skill: "القيادة", value: 88, benchmark: 72 },
      { skill: "الشجاعة", value: 92, benchmark: 80 },
      { skill: "اللياقة", value: 84, benchmark: 76 },
    ],
    strengths: ["ردود فعل فائقة", "قيادة الدفاع بثقة", "شجاعة في الخروج"],
    improvements: ["تطوير التوزيع بالقدم", "تحسين الكرات الثابتة"],
    recommendation: "حارس مرمى واعد — مستوى الدوري الأول بعد سنتين من التطوير",
    videoUrl: "#",
    stats: { goals: 0, assists: 3, matches: 25, rating: 7.9 },
  },
];

const radarColors = {
  player: "oklch(0.65 0.2 145)",
  benchmark: "oklch(0.85 0.18 85)",
};

type AnalysisStep = "select" | "analyzing" | "report";

export default function Demo() {
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]);
  const [step, setStep] = useState<AnalysisStep>("select");
  const [progress, setProgress] = useState(0);
  const [animateRadar, setAnimateRadar] = useState(false);

  const radarData = selectedPlayer.skills.map((s) => ({
    subject: s.skill,
    لاعب: s.value,
    معيار: s.benchmark,
  }));

  const startAnalysis = () => {
    setStep("analyzing");
    setProgress(0);
    setAnimateRadar(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep("report");
          setTimeout(() => setAnimateRadar(true), 300);
          return 100;
        }
        return prev + Math.random() * 8 + 3;
      });
    }, 150);
  };

  const reset = () => {
    setStep("select");
    setProgress(0);
    setAnimateRadar(false);
  };

  const analysisSteps = [
    "تحليل حركة اللاعب...",
    "قياس السرعة والتسارع...",
    "تقييم المهارات الفنية...",
    "مقارنة بمعايير Professional Standards...",
    "توليد تقرير الأداء...",
  ];

  const currentStep = Math.floor((progress / 100) * analysisSteps.length);

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir="rtl">
      <Ada2aiNavbar />

      {/* Header */}
      <section className="pt-24 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="tag-green mb-4">عرض تجريبي</span>
          <h1
            className="text-4xl md:text-5xl font-black text-white mb-3 mt-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            شاهد Ada2ai في العمل
          </h1>
          <p
            className="text-white/50 text-lg max-w-xl mx-auto"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            اختر لاعباً وشاهد كيف يحلل الذكاء الاصطناعي أداءه في ثوانٍ
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          {/* Player selector */}
          {step === "select" && (
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-white/60 text-sm mb-4 text-center"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                اختر لاعباً لتحليله
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {players.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`card-dark rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                      selectedPlayer.id === player.id ? "neon-border" : "hover:border-white/20"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                        style={{
                          background: "oklch(0.65 0.2 145 / 0.15)",
                          color: "oklch(0.65 0.2 145)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <h3
                          className="text-white font-bold"
                          style={{ fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {player.name}
                        </h3>
                        <p
                          className="text-white/40 text-xs"
                          style={{ fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {player.position} · {player.age} سنة
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="tag-green text-xs">{player.city}</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span
                          className="text-yellow-400 text-sm font-bold"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {player.overallScore}
                        </span>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${player.overallScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span
                        className="text-white/30 text-xs"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        التقييم الكلي
                      </span>
                      <span
                        className="neon-text text-xs font-bold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {player.overallScore}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Start analysis button */}
              <div className="text-center">
                <div className="card-dark neon-border rounded-2xl p-6 max-w-md mx-auto mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[oklch(0.65_0.2_145/0.15)] flex items-center justify-center text-[oklch(0.65_0.2_145)] font-black text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {selectedPlayer.name.charAt(0)}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        {selectedPlayer.name}
                      </div>
                      <div className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        {selectedPlayer.position} · {selectedPlayer.academy}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={startAnalysis}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <Play size={18} />
                    ابدأ تحليل AI
                  </button>
                </div>
                <p
                  className="text-white/25 text-xs"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  هذا عرض تجريبي — في الواقع يتم تحليل فيديو حقيقي
                </p>
              </div>
            </div>
          )}

          {/* Analyzing state */}
          {step === "analyzing" && (
            <div className="max-w-lg mx-auto text-center py-12">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div
                  className="absolute inset-0 rounded-full border-2 border-[oklch(0.65_0.2_145/0.2)]"
                  style={{
                    background: "conic-gradient(oklch(0.65 0.2 145) " + Math.min(progress, 100) + "%, transparent 0)",
                    borderRadius: "50%",
                  }}
                />
                <div className="absolute inset-2 rounded-full bg-[oklch(0.08_0.02_240)] flex items-center justify-center">
                  <div>
                    <div
                      className="stat-number text-2xl"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {Math.floor(Math.min(progress, 100))}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="progress-bar max-w-xs mx-auto mb-3">
                  <div
                    className="progress-fill transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p
                  className="neon-text text-sm font-medium animate-pulse"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {analysisSteps[Math.min(currentStep, analysisSteps.length - 1)]}
                </p>
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                {analysisSteps.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-sm transition-all ${
                      i < currentStep
                        ? "text-[oklch(0.65_0.2_145)]"
                        : i === currentStep
                        ? "text-white"
                        : "text-white/25"
                    }`}
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {i < currentStep ? (
                      <CheckCircle size={14} className="flex-shrink-0" />
                    ) : i === currentStep ? (
                      <Loader2 size={14} className="animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />
                    )}
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report */}
          {step === "report" && (
            <div className="max-w-5xl mx-auto">
              {/* Report header */}
              <div className="card-dark neon-border rounded-2xl p-6 mb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                      style={{
                        background: "oklch(0.65 0.2 145 / 0.15)",
                        color: "oklch(0.65 0.2 145)",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {selectedPlayer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2
                          className="text-white font-black text-2xl"
                          style={{ fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {selectedPlayer.name}
                        </h2>
                        <span className="tag-green text-xs">تقرير AI</span>
                      </div>
                      <p
                        className="text-white/50 text-sm"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {selectedPlayer.position} · {selectedPlayer.age} سنة · {selectedPlayer.city} · {selectedPlayer.academy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={reset}
                      className="btn-outline-green text-sm px-4 py-2"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      تحليل آخر
                    </button>
                    <button
                      className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                      onClick={() => window.open(`https://wa.me/966500000000?text=أريد تقرير كامل للاعب ${selectedPlayer.name}`, "_blank")}
                    >
                      <MessageCircle size={15} />
                      احصل على التقرير
                    </button>
                  </div>
                </div>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "التقييم الكلي", value: selectedPlayer.overallScore, unit: "/100", icon: <Star size={16} />, color: "oklch(0.85 0.18 85)" },
                  { label: "الإمكانية", value: selectedPlayer.potential, unit: "/100", icon: <TrendingUp size={16} />, color: "oklch(0.65 0.2 145)" },
                  { label: "المباريات", value: selectedPlayer.stats.matches, unit: "", icon: <Target size={16} />, color: "oklch(0.65 0.2 200)" },
                  { label: "التقييم", value: selectedPlayer.stats.rating, unit: "/10", icon: <Award size={16} />, color: "oklch(0.65 0.22 25)" },
                ].map((card, i) => (
                  <div key={i} className="card-dark rounded-xl p-4 text-center">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                      style={{ background: `${card.color.replace(")", " / 0.12)")}`, color: card.color }}
                    >
                      {card.icon}
                    </div>
                    <div
                      className="text-2xl font-black mb-1"
                      style={{ color: card.color, fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
                    >
                      {card.value}{card.unit}
                    </div>
                    <div
                      className="text-white/40 text-xs"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Radar + Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                {/* Radar Chart */}
                <div className="card-dark rounded-xl p-5">
                  <h3
                    className="text-white font-bold mb-4 flex items-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <Zap size={16} className="neon-text" />
                    خريطة المهارات
                  </h3>
                  <div className="flex gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.65 0.2 145)" }} />
                      <span className="text-white/50 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>اللاعب</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.85 0.18 85)" }} />
                      <span className="text-white/50 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>معيار Professional Standards</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{
                          fill: "rgba(255,255,255,0.6)",
                          fontSize: 11,
                          fontFamily: "'Tajawal', sans-serif",
                        }}
                      />
                      <Radar
                        name="معيار"
                        dataKey="معيار"
                        stroke="oklch(0.85 0.18 85)"
                        fill="oklch(0.85 0.18 85)"
                        fillOpacity={0.1}
                        strokeWidth={1.5}
                        strokeDasharray="4 2"
                      />
                      <Radar
                        name="لاعب"
                        dataKey="لاعب"
                        stroke="oklch(0.65 0.2 145)"
                        fill="oklch(0.65 0.2 145)"
                        fillOpacity={animateRadar ? 0.2 : 0}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "oklch(0.12 0.02 240)",
                          border: "1px solid oklch(0.65 0.2 145 / 0.3)",
                          borderRadius: "8px",
                          color: "white",
                          fontFamily: "'Tajawal', sans-serif",
                          fontSize: "12px",
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Skills breakdown */}
                <div className="card-dark rounded-xl p-5">
                  <h3
                    className="text-white font-bold mb-4 flex items-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <Target size={16} className="neon-text" />
                    تفصيل المهارات
                  </h3>
                  <div className="space-y-3">
                    {selectedPlayer.skills.map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span
                            className="text-white/70 text-sm"
                            style={{ fontFamily: "'Tajawal', sans-serif" }}
                          >
                            {skill.skill}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-white/35 text-xs"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              Professional Standards: {skill.benchmark}
                            </span>
                            <span
                              className="neon-text text-sm font-bold"
                              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                              {skill.value}
                            </span>
                          </div>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: animateRadar ? `${skill.value}%` : "0%",
                              transition: `width 1s ease ${i * 0.1}s`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths + Improvements + Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="card-dark rounded-xl p-5">
                  <h3
                    className="text-[oklch(0.65_0.2_145)] font-bold mb-3 flex items-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    ✅ نقاط القوة
                  </h3>
                  <ul className="space-y-2">
                    {selectedPlayer.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-white/70 text-sm"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        <ChevronRight size={14} className="text-[oklch(0.65_0.2_145)] mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card-dark rounded-xl p-5">
                  <h3
                    className="text-yellow-400 font-bold mb-3 flex items-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    ⚡ نقاط التطوير
                  </h3>
                  <ul className="space-y-2">
                    {selectedPlayer.improvements.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-white/70 text-sm"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        <ChevronRight size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="rounded-xl p-5"
                  style={{
                    background: "oklch(0.65 0.2 145 / 0.07)",
                    border: "1px solid oklch(0.65 0.2 145 / 0.25)",
                  }}
                >
                  <h3
                    className="neon-text font-bold mb-3 flex items-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    🎯 توصية AI
                  </h3>
                  <p
                    className="text-white/75 text-sm leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {selectedPlayer.recommendation}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "oklch(0.65 0.2 145 / 0.05)",
                  border: "1px solid oklch(0.65 0.2 145 / 0.2)",
                }}
              >
                <p
                  className="text-white/70 text-base mb-4"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  هذا مجرد عرض تجريبي — احصل على تقرير حقيقي لاعبك مقابل
                  <span className="neon-text font-bold"> 99 ريال فقط</span>
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    className="btn-primary px-8 py-3 flex items-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                    onClick={() => window.open("https://wa.me/966500000000?text=أريد تحليل AI للاعبي", "_blank")}
                  >
                    <MessageCircle size={18} />
                    احصل على تقريرك الآن
                  </button>
                  <button
                    className="btn-outline-green px-6 py-3 flex items-center gap-2"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                    onClick={reset}
                  >
                    جرب لاعباً آخر
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
