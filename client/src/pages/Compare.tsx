import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo } from "react";


import { useLocation, useSearch } from "wouter";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  GitCompare,
  Star,
  TrendingUp,
  Zap,
  Target,
  Award,
  MessageCircle,
  ArrowLeft,
  ChevronRight,
  Users,
} from "lucide-react";

const allPlayers = [
  { id: 1, name: "محمد العمري", age: 16, position: "مهاجم", city: "دمام", academy: "أكاديمية كابتن", score: 87, potential: 94, speed: 92, skill: 88, tactical: 78, fitness: 85, passing: 82, shooting: 90, goals: 23, assists: 12, matches: 31, rating: 8.4, strengths: ["سرعة استثنائية", "تسديد قوي", "حركة بدون كرة"], improvements: ["التكتيك الدفاعي", "الرأسيات"] },
  { id: 2, name: "عبدالله الشهري", age: 14, position: "وسط", city: "خبر", academy: "أكاديمية الموهبة الكروية", score: 82, potential: 91, speed: 78, skill: 85, tactical: 90, fitness: 80, passing: 93, shooting: 76, goals: 8, assists: 27, matches: 28, rating: 8.1, strengths: ["رؤية الملعب", "تمرير دقيق", "ذكاء تكتيكي"], improvements: ["السرعة", "التسديد من بعيد"] },
  { id: 3, name: "فيصل القحطاني", age: 17, position: "حارس مرمى", city: "ظهران", academy: "أكاديمية الظهران الرياضية", score: 85, potential: 89, speed: 74, skill: 87, tactical: 88, fitness: 84, passing: 83, shooting: 40, goals: 0, assists: 3, matches: 25, rating: 7.9, strengths: ["ردود فعل فائقة", "قيادة الدفاع", "شجاعة"], improvements: ["التوزيع بالقدم", "الكرات الثابتة"] },
  { id: 4, name: "خالد المطيري", age: 15, position: "مدافع", city: "دمام", academy: "مدرسة الأبطال الرياضية", score: 79, potential: 86, speed: 80, skill: 76, tactical: 82, fitness: 83, passing: 74, shooting: 55, goals: 4, assists: 8, matches: 22, rating: 7.6, strengths: ["تدخلات قوية", "تمركز جيد", "قوة بدنية"], improvements: ["التمرير الأمامي", "البناء من الخلف"] },
  { id: 5, name: "سلطان الغامدي", age: 18, position: "مهاجم", city: "خبر", academy: "أكاديمية النجوم الصاعدة", score: 83, potential: 85, speed: 88, skill: 82, tactical: 75, fitness: 86, passing: 78, shooting: 87, goals: 19, assists: 7, matches: 30, rating: 7.8, strengths: ["سرعة عالية", "تسديد قوي", "لياقة ممتازة"], improvements: ["التكتيك", "التمرير الأخير"] },
  { id: 6, name: "عمر الدوسري", age: 13, position: "وسط", city: "ظهران", academy: "أكاديمية الخليج للرياضة", score: 76, potential: 93, speed: 72, skill: 79, tactical: 85, fitness: 74, passing: 88, shooting: 68, goals: 5, assists: 14, matches: 18, rating: 7.4, strengths: ["إمكانية عالية جداً", "ذكاء تكتيكي", "تمرير"], improvements: ["السرعة", "اللياقة البدنية"] },
  { id: 7, name: "يوسف العتيبي", age: 16, position: "جناح", city: "دمام", academy: "أكاديمية كابتن", score: 81, potential: 88, speed: 90, skill: 80, tactical: 74, fitness: 82, passing: 79, shooting: 78, goals: 14, assists: 18, matches: 27, rating: 7.7, strengths: ["سرعة فائقة", "مراوغة", "عرضيات دقيقة"], improvements: ["التسديد", "العمل الدفاعي"] },
  { id: 8, name: "تركي الزهراني", age: 17, position: "مدافع", city: "خبر", academy: "أكاديمية الشرقية للكرة", score: 78, potential: 82, speed: 76, skill: 74, tactical: 80, fitness: 81, passing: 72, shooting: 50, goals: 2, assists: 5, matches: 24, rating: 7.3, strengths: ["تمركز دفاعي", "قراءة اللعب", "ثبات"], improvements: ["السرعة", "الكرات الهوائية"] },
  { id: 9, name: "بدر الحربي", age: 15, position: "مهاجم", city: "ظهران", academy: "أكاديمية الرياضة والتميز", score: 80, potential: 90, speed: 85, skill: 78, tactical: 73, fitness: 83, passing: 75, shooting: 84, goals: 16, assists: 6, matches: 26, rating: 7.5, strengths: ["تسديد قوي", "سرعة", "إمكانية عالية"], improvements: ["التكتيك", "التمرير"] },
  { id: 10, name: "ماجد السبيعي", age: 14, position: "وسط", city: "دمام", academy: "نادي الاتحاد الرياضي", score: 77, potential: 89, speed: 74, skill: 81, tactical: 83, fitness: 76, passing: 86, shooting: 65, goals: 6, assists: 19, matches: 21, rating: 7.6, strengths: ["تمرير دقيق", "رؤية الملعب", "إمكانية"], improvements: ["السرعة", "التسديد"] },
  { id: 11, name: "راشد العنزي", age: 18, position: "جناح", city: "خبر", academy: "أكاديمية النجوم الصاعدة", score: 84, potential: 84, speed: 91, skill: 83, tactical: 76, fitness: 85, passing: 80, shooting: 79, goals: 21, assists: 11, matches: 32, rating: 8.0, strengths: ["سرعة استثنائية", "مراوغة", "تسديد"], improvements: ["التكتيك الدفاعي", "التمرير"] },
  { id: 12, name: "حمد البقمي", age: 16, position: "حارس مرمى", city: "ظهران", academy: "أكاديمية الخليج للرياضة", score: 80, potential: 86, speed: 70, skill: 82, tactical: 84, fitness: 80, passing: 78, shooting: 35, goals: 0, assists: 2, matches: 20, rating: 7.5, strengths: ["تمركز جيد", "ردود فعل", "قيادة"], improvements: ["التوزيع", "الخروج"] },
];

const playerColors = [
  { stroke: "oklch(0.65 0.2 145)", fill: "oklch(0.65 0.2 145)", label: "اللاعب الأول" },
  { stroke: "oklch(0.65 0.22 25)", fill: "oklch(0.65 0.22 25)", label: "اللاعب الثاني" },
];

export default function Compare() {
  const { isRTL, t, lang } = useLanguage();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initP1 = parseInt(params.get("p1") || "1");
  const initP2 = parseInt(params.get("p2") || "2");

  const [p1Id, setP1Id] = useState(initP1);
  const [p2Id, setP2Id] = useState(initP2);

  const p1 = allPlayers.find((p) => p.id === p1Id) || allPlayers[0];
  const p2 = allPlayers.find((p) => p.id === p2Id) || allPlayers[1];

  const radarData = [
    { subject: lang === "ar" ? "السرعة" : "Speed", p1: p1.speed, p2: p2.speed },
    { subject: lang === "ar" ? "المهارة" : "Skill", p1: p1.skill, p2: p2.skill },
    { subject: lang === "ar" ? "التكتيك" : "Tactics", p1: p1.tactical, p2: p2.tactical },
    { subject: lang === "ar" ? "اللياقة" : "Fitness", p1: p1.fitness, p2: p2.fitness },
    { subject: lang === "ar" ? "التمرير" : "Passing", p1: p1.passing, p2: p2.passing },
    { subject: lang === "ar" ? "التسديد" : "Shooting", p1: p1.shooting, p2: p2.shooting },
  ];

  const barData = [
    { name: lang === "ar" ? "التقييم" : "Score", p1: p1.score, p2: p2.score },
    { name: lang === "ar" ? "الإمكانية" : "Potential", p1: p1.potential, p2: p2.potential },
    { name: lang === "ar" ? "السرعة" : "Speed", p1: p1.speed, p2: p2.speed },
    { name: lang === "ar" ? "المهارة" : "Skill", p1: p1.skill, p2: p2.skill },
    { name: lang === "ar" ? "التمرير" : "Passing", p1: p1.passing, p2: p2.passing },
    { name: lang === "ar" ? "التسديد" : "Shooting", p1: p1.shooting, p2: p2.shooting },
  ];

  const winner = p1.score > p2.score ? p1 : p2.score > p1.score ? p2 : null;

  const PlayerSelector = ({ value, onChange, exclude }: { value: number; onChange: (id: number) => void; exclude: number }) => (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-3 py-2 text-[#EEEFEE] text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)] w-full"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      {allPlayers.filter((p) => p.id !== exclude).map((p) => (
        <option key={p.id} value={p.id}>{p.name} — {p.position} · {p.city}</option>
      ))}
    </select>
  );

  const StatRow = ({ label, v1, v2 }: { label: string; v1: number; v2: number }) => {
    const better = v1 > v2 ? "p1" : v2 > v1 ? "p2" : "tie";
    return (
      <div className="grid grid-cols-7 items-center gap-2 py-2 border-b border-white/5">
        <div className="col-span-2 text-left">
          <span className={`text-sm font-bold ${better === "p1" ? "text-[oklch(0.65_0.2_145)]" : "text-[#EEEFEE]/50"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{v1}</span>
        </div>
        <div className="col-span-3 text-center text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{label}</div>
        <div className="col-span-2 text-right">
          <span className={`text-sm font-bold ${better === "p2" ? "text-[oklch(0.65_0.22_25)]" : "text-[#EEEFEE]/50"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{v2}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />

      {/* Header */}
      <section className="pt-24 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="tag-green mb-4">{t("compare.title")}</span>
          <h1 className="text-4xl md:text-5xl font-black text-[#EEEFEE] mb-3 mt-4" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
            {t("compare.title")}
          </h1>
          <p className="text-[#EEEFEE]/50 text-lg" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {t("compare.sub")}
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">

          {/* Player selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
            <div>
              <label className="text-[oklch(0.65_0.2_145)] text-xs font-bold mb-2 block flex items-center gap-1" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.2_145)]" /> {t("compare.select1")}
              </label>
              <PlayerSelector value={p1Id} onChange={setP1Id} exclude={p2Id} />
            </div>
            <div>
              <label className="text-[oklch(0.65_0.22_25)] text-xs font-bold mb-2 block flex items-center gap-1" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.22_25)]" /> {t("compare.select2")}
              </label>
              <PlayerSelector value={p2Id} onChange={setP2Id} exclude={p1Id} />
            </div>
          </div>

          {/* Player cards header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
            {[p1, p2].map((player, idx) => (
              <div
                key={player.id}
                className="card-dark rounded-xl p-5"
                style={{ borderTop: `3px solid ${idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)"}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
                    style={{
                      background: idx === 0 ? "oklch(0.65 0.2 145 / 0.15)" : "oklch(0.65 0.22 25 / 0.15)",
                      color: idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {player.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-[#EEEFEE] font-bold flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      {player.name}
                      {winner?.id === player.id && <span className="text-yellow-400 text-xs">🏆 {t("compare.winner")}</span>}
                    </div>
                    <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      {player.position} · {player.age} سنة · {player.city}
                    </div>
                  </div>
                  <div
                    className="mr-auto text-3xl font-black"
                    style={{ color: idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {player.score}
                  </div>
                </div>
                <div className="text-[#EEEFEE]/35 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{player.academy}</div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="card-dark rounded-2xl p-6 mb-5 max-w-3xl mx-auto">
            <h3 className="text-[#EEEFEE] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              <GitCompare size={16} className="neon-text" /> {lang === "ar" ? "خريطة المهارات المقارنة" : "Skills Comparison Map"}
            </h3>
            <div className="flex gap-4 mb-2">
              {[p1, p2].map((p, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: i === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)" }} />
                  <span className="text-[#EEEFEE]/50 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{p.name}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "'Tajawal', sans-serif" }}
                />
                <Radar name={p1.name} dataKey="p1" stroke="oklch(0.65 0.2 145)" fill="oklch(0.65 0.2 145)" fillOpacity={0.15} strokeWidth={2} />
                <Radar name={p2.name} dataKey="p2" stroke="oklch(0.65 0.22 25)" fill="oklch(0.65 0.22 25)" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.12 0.02 240)", border: "1px solid oklch(0.65 0.2 145 / 0.3)", borderRadius: "8px", color: "white", fontFamily: "'Tajawal', sans-serif", fontSize: "12px" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar comparison */}
          <div className="card-dark rounded-2xl p-6 mb-5 max-w-3xl mx-auto">
            <h3 className="text-[#EEEFEE] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              <Target size={16} className="neon-text" /> {lang === "ar" ? "مقارنة الإحصائيات" : "Statistics Comparison"}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'Tajawal', sans-serif" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.12 0.02 240)", border: "1px solid oklch(0.65 0.2 145 / 0.3)", borderRadius: "8px", color: "white", fontFamily: "'Tajawal', sans-serif", fontSize: "12px" }}
                />
                <Bar dataKey="p1" name={p1.name} fill="oklch(0.65 0.2 145)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p2" name={p2.name} fill="oklch(0.65 0.22 25)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stat rows */}
          <div className="card-dark rounded-2xl p-6 mb-5 max-w-3xl mx-auto">
            <div className="grid grid-cols-7 mb-3">
              <div className="col-span-2 text-left">
                <span className="text-[oklch(0.65_0.2_145)] text-xs font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{p1.name}</span>
              </div>
              <div className="col-span-3 text-center text-[#EEEFEE]/30 text-xs" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{t("compare.metrics")}</div>
              <div className="col-span-2 text-right">
                <span className="text-[oklch(0.65_0.22_25)] text-xs font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{p2.name}</span>
              </div>
            </div>
            <StatRow label={lang === "ar" ? "التقييم الكلي" : "Overall Score"} v1={p1.score} v2={p2.score} />
            <StatRow label={lang === "ar" ? "الإمكانية" : "Potential"} v1={p1.potential} v2={p2.potential} />
            <StatRow label={lang === "ar" ? "السرعة" : "Speed"} v1={p1.speed} v2={p2.speed} />
            <StatRow label={lang === "ar" ? "المهارة" : "Skill"} v1={p1.skill} v2={p2.skill} />
            <StatRow label={lang === "ar" ? "التكتيك" : "Tactics"} v1={p1.tactical} v2={p2.tactical} />
            <StatRow label={lang === "ar" ? "اللياقة" : "Fitness"} v1={p1.fitness} v2={p2.fitness} />
            <StatRow label={lang === "ar" ? "التمرير" : "Passing"} v1={p1.passing} v2={p2.passing} />
            <StatRow label={lang === "ar" ? "التسديد" : "Shooting"} v1={p1.shooting} v2={p2.shooting} />
            <StatRow label={lang === "ar" ? "الأهداف" : "Goals"} v1={p1.goals} v2={p2.goals} />
            <StatRow label={lang === "ar" ? "التمريرات الحاسمة" : "Assists"} v1={p1.assists} v2={p2.assists} />
            <StatRow label={lang === "ar" ? "المباريات" : "Matches"} v1={p1.matches} v2={p2.matches} />
          </div>

          {/* Strengths comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
            {[p1, p2].map((player, idx) => (
              <div key={player.id} className="card-dark rounded-xl p-5" style={{ borderRight: `3px solid ${idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)"}` }}>
                <h4 className="font-bold mb-3 text-sm" style={{ color: idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  ✅ {lang === "ar" ? "نقاط قوة" : "Strengths of"} {player.name}
                </h4>
                <ul className="space-y-1.5">
                  {player.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#EEEFEE]/60 text-xs" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                      <ChevronRight size={12} style={{ color: idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)" }} className="mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="card-dark rounded-2xl p-6" style={{ border: "1px solid oklch(0.65 0.2 145 / 0.2)" }}>
              <p className="text-[#EEEFEE]/60 mb-4" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {lang === "ar" ? "هل تريد تقارير تفصيلية لكلا اللاعبين؟ تواصل معنا عبر واتساب" : "Want detailed reports for both athletes? Contact us via WhatsApp"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/966500000000?text=أريد تقارير مقارنة للاعبين: ${p1.name} و ${p2.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-6 py-2.5 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  <MessageCircle size={16} /> {lang === "ar" ? "احصل على التقارير" : "Get Reports"}
                </a>
                <button
                  onClick={() => navigate("/scouts")}
                  className="btn-outline-green px-6 py-2.5 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  <Users size={16} /> {t("nav.scoutDashboard")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}
