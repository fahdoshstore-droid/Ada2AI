import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  MapPin,
  Users,
  Eye,
  GitCompare,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  Award,
  Zap,
  Target,
} from "lucide-react";

const allPlayers = [
  { id: 1, name: "محمد العمري", age: 16, position: "مهاجم", city: "دمام", academy: "أكاديمية كابتن", score: 87, potential: 94, speed: 92, skill: 88, goals: 23, assists: 12, matches: 31, rating: 8.4, status: "نشط", flag: "⭐" },
  { id: 2, name: "عبدالله الشهري", age: 14, position: "وسط", city: "خبر", academy: "أكاديمية الموهبة الكروية", score: 82, potential: 91, speed: 78, skill: 85, goals: 8, assists: 27, matches: 28, rating: 8.1, status: "نشط", flag: "🔥" },
  { id: 3, name: "فيصل القحطاني", age: 17, position: "حارس مرمى", city: "ظهران", academy: "أكاديمية الظهران الرياضية", score: 85, potential: 89, speed: 74, skill: 87, goals: 0, assists: 3, matches: 25, rating: 7.9, status: "نشط", flag: "" },
  { id: 4, name: "خالد المطيري", age: 15, position: "مدافع", city: "دمام", academy: "مدرسة الأبطال الرياضية", score: 79, potential: 86, speed: 80, skill: 76, goals: 4, assists: 8, matches: 22, rating: 7.6, status: "نشط", flag: "" },
  { id: 5, name: "سلطان الغامدي", age: 18, position: "مهاجم", city: "خبر", academy: "أكاديمية النجوم الصاعدة", score: 83, potential: 85, speed: 88, skill: 82, goals: 19, assists: 7, matches: 30, rating: 7.8, status: "نشط", flag: "" },
  { id: 6, name: "عمر الدوسري", age: 13, position: "وسط", city: "ظهران", academy: "أكاديمية الخليج للرياضة", score: 76, potential: 93, speed: 72, skill: 79, goals: 5, assists: 14, matches: 18, rating: 7.4, status: "موهبة ناشئة", flag: "🌟" },
  { id: 7, name: "يوسف العتيبي", age: 16, position: "جناح", city: "دمام", academy: "أكاديمية كابتن", score: 81, potential: 88, speed: 90, skill: 80, goals: 14, assists: 18, matches: 27, rating: 7.7, status: "نشط", flag: "" },
  { id: 8, name: "تركي الزهراني", age: 17, position: "مدافع", city: "خبر", academy: "أكاديمية الشرقية للكرة", score: 78, potential: 82, speed: 76, skill: 74, goals: 2, assists: 5, matches: 24, rating: 7.3, status: "نشط", flag: "" },
  { id: 9, name: "بدر الحربي", age: 15, position: "مهاجم", city: "ظهران", academy: "أكاديمية الرياضة والتميز", score: 80, potential: 90, speed: 85, skill: 78, goals: 16, assists: 6, matches: 26, rating: 7.5, status: "نشط", flag: "🔥" },
  { id: 10, name: "ماجد السبيعي", age: 14, position: "وسط", city: "دمام", academy: "نادي الاتحاد الرياضي", score: 77, potential: 89, speed: 74, skill: 81, goals: 6, assists: 19, matches: 21, rating: 7.6, status: "موهبة ناشئة", flag: "🌟" },
  { id: 11, name: "راشد العنزي", age: 18, position: "جناح", city: "خبر", academy: "أكاديمية النجوم الصاعدة", score: 84, potential: 84, speed: 91, skill: 83, goals: 21, assists: 11, matches: 32, rating: 8.0, status: "نشط", flag: "" },
  { id: 12, name: "حمد البقمي", age: 16, position: "حارس مرمى", city: "ظهران", academy: "أكاديمية الخليج للرياضة", score: 80, potential: 86, speed: 70, skill: 82, goals: 0, assists: 2, matches: 20, rating: 7.5, status: "نشط", flag: "" },
];

const positions = ["الكل", "مهاجم", "وسط", "مدافع", "جناح", "حارس مرمى"];
const cities = ["الكل", "دمام", "خبر", "ظهران"];
const ageRanges = ["الكل", "13-14", "15-16", "17-18"];

type SortKey = "score" | "potential" | "speed" | "skill" | "goals" | "rating" | "age";
type SortDir = "asc" | "desc";

const positionColors: Record<string, string> = {
  "مهاجم": "oklch(0.65 0.22 25)",
  "وسط": "oklch(0.65 0.2 145)",
  "مدافع": "oklch(0.65 0.2 200)",
  "جناح": "oklch(0.85 0.18 85)",
  "حارس مرمى": "oklch(0.65 0.18 290)",
};

export default function Scouts() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("الكل");
  const [city, setCity] = useState("الكل");
  const [ageRange, setAgeRange] = useState("الكل");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const filtered = useMemo(() => {
    return allPlayers
      .filter((p) => {
        const searchMatch =
          search === "" || p.name.includes(search) || p.academy.includes(search) || p.city.includes(search);
        const posMatch = position === "الكل" || p.position === position;
        const cityMatch = city === "الكل" || p.city === city;
        const ageMatch =
          ageRange === "الكل" ||
          (ageRange === "13-14" && p.age >= 13 && p.age <= 14) ||
          (ageRange === "15-16" && p.age >= 15 && p.age <= 16) ||
          (ageRange === "17-18" && p.age >= 17 && p.age <= 18);
        return searchMatch && posMatch && cityMatch && ageMatch;
      })
      .sort((a, b) => {
        const av = a[sortKey] as number;
        const bv = b[sortKey] as number;
        return sortDir === "desc" ? bv - av : av - bv;
      });
  }, [search, position, city, ageRange, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleCompare = (id: number) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "desc" ? <ChevronDown size={13} className="neon-text" /> : <ChevronUp size={13} className="neon-text" />
    ) : (
      <ChevronDown size={13} className="opacity-20" />
    );

  const kpis = [
    { label: "إجمالي اللاعبين", value: allPlayers.length, icon: <Users size={18} />, color: "oklch(0.65 0.2 145)" },
    { label: "متوسط التقييم", value: (allPlayers.reduce((a, b) => a + b.score, 0) / allPlayers.length).toFixed(1), icon: <Star size={18} />, color: "oklch(0.85 0.18 85)" },
    { label: "أعلى إمكانية", value: Math.max(...allPlayers.map((p) => p.potential)), icon: <TrendingUp size={18} />, color: "oklch(0.65 0.2 200)" },
    { label: "مدن مُغطاة", value: 3, icon: <MapPin size={18} />, color: "oklch(0.65 0.22 25)" },
  ];

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_240)] text-white" dir="rtl">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <span className="tag-green mb-4">لوحة الكشافين</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 mt-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              اكتشف المواهب المحلية
            </h1>
            <p className="text-white/50 text-lg" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
              {allPlayers.length} لاعب موثق في المنطقة الشرقية — محلل بالذكاء الاصطناعي
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="card-dark rounded-xl p-4 text-center">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${kpi.color.replace(")", " / 0.12)")}`, color: kpi.color }}>
                  {kpi.icon}
                </div>
                <div className="text-2xl font-black mb-0.5" style={{ color: kpi.color, fontFamily: "'Space Grotesk', sans-serif" }}>{kpi.value}</div>
                <div className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Table */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          {/* Search + filter bar */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="ابحث باسم اللاعب أو الأكاديمية..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[oklch(0.12_0.02_240)] border border-white/10 rounded-lg pr-9 pl-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${showFilters ? "bg-[oklch(0.65_0.2_145/0.15)] border-[oklch(0.65_0.2_145/0.5)] text-[oklch(0.65_0.2_145)]" : "bg-[oklch(0.12_0.02_240)] border-white/10 text-white/60"}`}
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              <Filter size={14} /> فلاتر
            </button>
            <div className="flex items-center gap-1 bg-[oklch(0.12_0.02_240)] border border-white/10 rounded-lg p-1">
              <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "table" ? "bg-[oklch(0.65_0.2_145/0.2)] text-[oklch(0.65_0.2_145)]" : "text-white/40"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>جدول</button>
              <button onClick={() => setViewMode("cards")} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "cards" ? "bg-[oklch(0.65_0.2_145/0.2)] text-[oklch(0.65_0.2_145)]" : "text-white/40"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>بطاقات</button>
            </div>
            {compareList.length === 2 && (
              <button
                onClick={() => navigate(`/compare?p1=${compareList[0]}&p2=${compareList[1]}`)}
                className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                <GitCompare size={15} /> مقارنة ({compareList.length})
              </button>
            )}
          </div>

          {showFilters && (
            <div className="card-dark rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-white/40 text-xs mb-2 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>المركز</label>
                <div className="flex flex-wrap gap-1.5">
                  {positions.map((p) => (
                    <button key={p} onClick={() => setPosition(p)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${position === p ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.08_0.02_240)]" : "bg-white/5 text-white/50 hover:bg-white/10"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-2 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>المدينة</label>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map((c) => (
                    <button key={c} onClick={() => setCity(c)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${city === c ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.08_0.02_240)]" : "bg-white/5 text-white/50 hover:bg-white/10"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-2 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>الفئة العمرية</label>
                <div className="flex flex-wrap gap-1.5">
                  {ageRanges.map((a) => (
                    <button key={a} onClick={() => setAgeRange(a)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${ageRange === a ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.08_0.02_240)]" : "bg-white/5 text-white/50 hover:bg-white/10"}`} style={{ fontFamily: "'Tajawal', sans-serif", direction: "ltr" }}>{a}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="text-white/35 text-xs mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {filtered.length} لاعب · {compareList.length > 0 && <span className="neon-text">اختر {2 - compareList.length} لاعب للمقارنة</span>}
          </div>

          {/* TABLE VIEW */}
          {viewMode === "table" && (
            <div className="card-dark rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8" style={{ background: "oklch(0.11 0.02 240)" }}>
                      <th className="text-right px-4 py-3 text-white/40 font-medium" style={{ fontFamily: "'Tajawal', sans-serif" }}>اللاعب</th>
                      <th className="text-center px-3 py-3 text-white/40 font-medium" style={{ fontFamily: "'Tajawal', sans-serif" }}>المركز</th>
                      <th className="text-center px-3 py-3 text-white/40 font-medium cursor-pointer hover:text-white/70" onClick={() => toggleSort("age")} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        <span className="flex items-center justify-center gap-1">العمر <SortIcon k="age" /></span>
                      </th>
                      <th className="text-center px-3 py-3 text-white/40 font-medium cursor-pointer hover:text-white/70" onClick={() => toggleSort("score")} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        <span className="flex items-center justify-center gap-1">التقييم <SortIcon k="score" /></span>
                      </th>
                      <th className="text-center px-3 py-3 text-white/40 font-medium cursor-pointer hover:text-white/70" onClick={() => toggleSort("potential")} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        <span className="flex items-center justify-center gap-1">الإمكانية <SortIcon k="potential" /></span>
                      </th>
                      <th className="text-center px-3 py-3 text-white/40 font-medium cursor-pointer hover:text-white/70" onClick={() => toggleSort("speed")} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        <span className="flex items-center justify-center gap-1">السرعة <SortIcon k="speed" /></span>
                      </th>
                      <th className="text-center px-3 py-3 text-white/40 font-medium cursor-pointer hover:text-white/70" onClick={() => toggleSort("goals")} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        <span className="flex items-center justify-center gap-1">أهداف <SortIcon k="goals" /></span>
                      </th>
                      <th className="text-center px-3 py-3 text-white/40 font-medium" style={{ fontFamily: "'Tajawal', sans-serif" }}>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((player, idx) => {
                      const isSelected = compareList.includes(player.id);
                      return (
                        <tr
                          key={player.id}
                          className={`border-b border-white/5 transition-all hover:bg-white/3 ${isSelected ? "bg-[oklch(0.65_0.2_145/0.05)]" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0" style={{ background: "oklch(0.65 0.2 145 / 0.12)", color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}>
                                {player.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-white font-medium flex items-center gap-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                                  {player.name} {player.flag && <span>{player.flag}</span>}
                                </div>
                                <div className="text-white/35 text-xs flex items-center gap-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                                  <MapPin size={10} /> {player.city} · {player.academy.replace("أكاديمية ", "").replace("مدرسة ", "")}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${(positionColors[player.position] || "oklch(0.65 0.2 145)").replace(")", " / 0.12)")}`, color: positionColors[player.position] || "oklch(0.65 0.2 145)", fontFamily: "'Tajawal', sans-serif" }}>
                              {player.position}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center text-white/60 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{player.age}</td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-bold text-base" style={{ color: player.score >= 85 ? "oklch(0.65 0.2 145)" : player.score >= 80 ? "oklch(0.85 0.18 85)" : "white", fontFamily: "'Space Grotesk', sans-serif" }}>
                              {player.score}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="font-bold text-sm" style={{ color: "oklch(0.65 0.2 200)", fontFamily: "'Space Grotesk', sans-serif" }}>{player.potential}</span>
                          </td>
                          <td className="px-3 py-3 text-center text-white/60 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{player.speed}</td>
                          <td className="px-3 py-3 text-center text-white/60 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{player.goals}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => navigate(`/demo`)}
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[oklch(0.65_0.2_145/0.15)] text-white/40 hover:text-[oklch(0.65_0.2_145)] transition-all flex items-center justify-center"
                                title="عرض التقرير"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => toggleCompare(player.id)}
                                className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center ${isSelected ? "bg-[oklch(0.65_0.2_145/0.2)] text-[oklch(0.65_0.2_145)]" : "bg-white/5 text-white/40 hover:text-[oklch(0.65_0.2_145)] hover:bg-[oklch(0.65_0.2_145/0.1)]"}`}
                                title="مقارنة"
                                disabled={!isSelected && compareList.length >= 2}
                              >
                                <GitCompare size={13} />
                              </button>
                              <a
                                href={`https://wa.me/966500000000?text=أريد معلومات عن اللاعب ${player.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-[oklch(0.65_0.2_145/0.15)] text-white/40 hover:text-[oklch(0.65_0.2_145)] transition-all flex items-center justify-center"
                                title="واتساب"
                              >
                                <MessageCircle size={13} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-white/30" style={{ fontFamily: "'Tajawal', sans-serif" }}>لا توجد نتائج</div>
                )}
              </div>
            </div>
          )}

          {/* CARDS VIEW */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((player) => {
                const isSelected = compareList.includes(player.id);
                return (
                  <div
                    key={player.id}
                    className={`card-dark rounded-xl p-5 transition-all duration-300 ${isSelected ? "neon-border" : "hover:border-white/20"}`}
                    style={{ borderRight: `3px solid ${positionColors[player.position] || "oklch(0.65 0.2 145)"}` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black" style={{ background: "oklch(0.65 0.2 145 / 0.12)", color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {player.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{player.name} {player.flag}</div>
                          <div className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{player.position} · {player.age} سنة</div>
                        </div>
                      </div>
                      <div className="text-2xl font-black" style={{ color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}>{player.score}</div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={11} className="text-white/30" />
                      <span className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{player.city} · {player.academy.replace("أكاديمية ", "")}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: "إمكانية", value: player.potential, icon: <TrendingUp size={11} />, color: "oklch(0.65 0.2 200)" },
                        { label: "سرعة", value: player.speed, icon: <Zap size={11} />, color: "oklch(0.85 0.18 85)" },
                        { label: "أهداف", value: player.goals, icon: <Target size={11} />, color: "oklch(0.65 0.22 25)" },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white/4 rounded-lg p-2 text-center">
                          <div style={{ color: stat.color }} className="flex justify-center mb-0.5">{stat.icon}</div>
                          <div className="font-bold text-sm" style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</div>
                          <div className="text-white/30 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => navigate("/demo")} className="flex-1 btn-outline-green text-xs py-2 flex items-center justify-center gap-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        <Eye size={12} /> تقرير AI
                      </button>
                      <button
                        onClick={() => toggleCompare(player.id)}
                        className={`flex-1 text-xs py-2 rounded-lg border transition-all flex items-center justify-center gap-1 ${isSelected ? "bg-[oklch(0.65_0.2_145/0.2)] border-[oklch(0.65_0.2_145/0.5)] text-[oklch(0.65_0.2_145)]" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                        disabled={!isSelected && compareList.length >= 2}
                      >
                        <GitCompare size={12} /> مقارنة
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-12 text-white/30" style={{ fontFamily: "'Tajawal', sans-serif" }}>لا توجد نتائج</div>
              )}
            </div>
          )}

          {/* Compare banner */}
          {compareList.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <div className="card-dark neon-border rounded-2xl px-6 py-3 flex items-center gap-4 shadow-2xl">
                <div className="flex items-center gap-2">
                  <GitCompare size={16} className="neon-text" />
                  <span className="text-white text-sm font-medium" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    {compareList.length === 1 ? "اختر لاعباً ثانياً للمقارنة" : "جاهز للمقارنة"}
                  </span>
                </div>
                {compareList.length === 2 && (
                  <button
                    onClick={() => navigate(`/compare?p1=${compareList[0]}&p2=${compareList[1]}`)}
                    className="btn-primary text-sm px-4 py-1.5"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    قارن الآن
                  </button>
                )}
                <button onClick={() => setCompareList([])} className="text-white/40 hover:text-white text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>إلغاء</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
