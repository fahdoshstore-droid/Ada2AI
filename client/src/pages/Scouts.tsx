import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Search, Filter, Star, TrendingUp, MapPin, Users, Eye,
  GitCompare, ChevronUp, ChevronDown, Award, Zap, Target,
  ArrowLeft,
} from "lucide-react";

// Bilingual player data
const allPlayers = [
  { id: 1, nameAr: "محمد العمري", nameEn: "Mohammed Al-Omari", age: 16, positionAr: "مهاجم", positionEn: "Forward", cityAr: "الدمام", cityEn: "Dammam", sport: "Football", score: 87, potential: 94, speed: 92, skill: 88, goals: 23, assists: 12, matches: 31, rating: 8.4, statusAr: "نشط", statusEn: "Active", flag: "⭐" },
  { id: 2, nameAr: "عبدالله الشهري", nameEn: "Abdullah Al-Shahri", age: 14, positionAr: "وسط", positionEn: "Midfielder", cityAr: "الخبر", cityEn: "Khobar", sport: "Football", score: 82, potential: 91, speed: 78, skill: 85, goals: 8, assists: 27, matches: 28, rating: 8.1, statusAr: "نشط", statusEn: "Active", flag: "🔥" },
  { id: 3, nameAr: "فيصل القحطاني", nameEn: "Faisal Al-Qahtani", age: 17, positionAr: "حارس مرمى", positionEn: "Goalkeeper", cityAr: "الظهران", cityEn: "Dhahran", sport: "Football", score: 85, potential: 89, speed: 74, skill: 87, goals: 0, assists: 3, matches: 25, rating: 7.9, statusAr: "نشط", statusEn: "Active", flag: "" },
  { id: 4, nameAr: "خالد المطيري", nameEn: "Khalid Al-Mutairi", age: 15, positionAr: "مدافع", positionEn: "Defender", cityAr: "الدمام", cityEn: "Dammam", sport: "Football", score: 79, potential: 86, speed: 80, skill: 76, goals: 4, assists: 8, matches: 22, rating: 7.6, statusAr: "نشط", statusEn: "Active", flag: "" },
  { id: 5, nameAr: "سلطان الغامدي", nameEn: "Sultan Al-Ghamdi", age: 18, positionAr: "مهاجم", positionEn: "Forward", cityAr: "الخبر", cityEn: "Khobar", sport: "Basketball", score: 83, potential: 85, speed: 88, skill: 82, goals: 19, assists: 7, matches: 30, rating: 7.8, statusAr: "نشط", statusEn: "Active", flag: "" },
  { id: 6, nameAr: "عمر الدوسري", nameEn: "Omar Al-Dosari", age: 13, positionAr: "وسط", positionEn: "Midfielder", cityAr: "الظهران", cityEn: "Dhahran", sport: "Football", score: 76, potential: 93, speed: 72, skill: 79, goals: 5, assists: 14, matches: 18, rating: 7.4, statusAr: "موهبة ناشئة", statusEn: "Rising Talent", flag: "🌟" },
  { id: 7, nameAr: "يوسف العتيبي", nameEn: "Yousuf Al-Otaibi", age: 16, positionAr: "جناح", positionEn: "Winger", cityAr: "الدمام", cityEn: "Dammam", sport: "Football", score: 81, potential: 88, speed: 90, skill: 80, goals: 14, assists: 18, matches: 27, rating: 7.7, statusAr: "نشط", statusEn: "Active", flag: "" },
  { id: 8, nameAr: "تركي الزهراني", nameEn: "Turki Al-Zahrani", age: 17, positionAr: "مدافع", positionEn: "Defender", cityAr: "الخبر", cityEn: "Khobar", sport: "Swimming", score: 78, potential: 82, speed: 76, skill: 74, goals: 2, assists: 5, matches: 24, rating: 7.3, statusAr: "نشط", statusEn: "Active", flag: "" },
  { id: 9, nameAr: "بدر الحربي", nameEn: "Badr Al-Harbi", age: 15, positionAr: "مهاجم", positionEn: "Forward", cityAr: "الظهران", cityEn: "Dhahran", sport: "Boxing", score: 80, potential: 90, speed: 85, skill: 78, goals: 16, assists: 6, matches: 26, rating: 7.5, statusAr: "نشط", statusEn: "Active", flag: "🔥" },
  { id: 10, nameAr: "ماجد السبيعي", nameEn: "Majed Al-Subaie", age: 14, positionAr: "وسط", positionEn: "Midfielder", cityAr: "الدمام", cityEn: "Dammam", sport: "Football", score: 77, potential: 89, speed: 74, skill: 81, goals: 6, assists: 19, matches: 21, rating: 7.6, statusAr: "موهبة ناشئة", statusEn: "Rising Talent", flag: "🌟" },
  { id: 11, nameAr: "راشد العنزي", nameEn: "Rashed Al-Anzi", age: 18, positionAr: "جناح", positionEn: "Winger", cityAr: "الخبر", cityEn: "Khobar", sport: "Basketball", score: 84, potential: 84, speed: 91, skill: 83, goals: 21, assists: 11, matches: 32, rating: 8.0, statusAr: "نشط", statusEn: "Active", flag: "" },
  { id: 12, nameAr: "حمد البقمي", nameEn: "Hamad Al-Baqami", age: 16, positionAr: "حارس مرمى", positionEn: "Goalkeeper", cityAr: "الظهران", cityEn: "Dhahran", sport: "Football", score: 80, potential: 86, speed: 70, skill: 82, goals: 0, assists: 2, matches: 20, rating: 7.5, statusAr: "نشط", statusEn: "Active", flag: "" },
];

type SortKey = "score" | "potential" | "speed" | "skill" | "goals" | "rating" | "age";
type SortDir = "asc" | "desc";

export default function Scouts() {
  const { t, isRTL, lang } = useLanguage();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("Football"); // Unified to Football
  const [cityFilter, setCityFilter] = useState("all");
  const [ageRange, setAgeRange] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);

  // Sport unified to Football only
  const sports = ["Football"];
  const cities = ["all", "Dammam", "Khobar", "Dhahran"];
  const ageRanges = ["all", "13-14", "15-16", "17-18"];

  const sportLabels: Record<string, string> = {
    Football: t("sports.football"),
  };

  // City labels with region (Eastern Province)
  const cityLabels: Record<string, string> = {
    all: t("scouts.filter.all"),
    Dammam: lang === "ar" ? "الدمام، المنطقة الشرقية" : "Dammam",
    Khobar: lang === "ar" ? "الخبر، الظهران" : "Khobar",
    Dhahran: lang === "ar" ? "الظهران" : "Dhahran",
  };

  // Filter to Football only (unified sport)
  const footballPlayers = useMemo(() => allPlayers.filter(p => p.sport === "Football"), []);

  const filtered = useMemo(() => {
    return footballPlayers
      .filter((p) => {
        const name = lang === "ar" ? p.nameAr : p.nameEn;
        const city = lang === "ar" ? p.cityAr : p.cityEn;
        const searchMatch = search === "" || name.toLowerCase().includes(search.toLowerCase()) || city.toLowerCase().includes(search.toLowerCase());
        const sportMatch = p.sport === "Football"; // Always Football
        const cityMatch = cityFilter === "all" || p.cityEn === cityFilter;
        const ageMatch =
          ageRange === "all" ||
          (ageRange === "13-14" && p.age >= 13 && p.age <= 14) ||
          (ageRange === "15-16" && p.age >= 15 && p.age <= 16) ||
          (ageRange === "17-18" && p.age >= 17 && p.age <= 18);
        return searchMatch && sportMatch && cityMatch && ageMatch;
      })
      .sort((a, b) => {
        const aVal = a[sortKey as keyof typeof a] as number;
        const bVal = b[sortKey as keyof typeof b] as number;
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      });
  }, [search, sportFilter, cityFilter, ageRange, sortKey, sortDir, lang]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleCompare = (id: number) => {
    setCompareList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const avgScore = filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.score, 0) / filtered.length) : 0;
  const uniqueSports = new Set(filtered.map(p => p.sport)).size;
  const uniqueCities = new Set(filtered.map(p => p.cityEn)).size;

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="inline-flex flex-col ml-1" style={{ opacity: sortKey === k ? 1 : 0.3 }}>
      {sortDir === "asc" && sortKey === k ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </span>
  );

  return (
    <div className="min-h-screen" style={{ background: "#000A0F", color: "#EEEFEE", direction: isRTL ? "rtl" : "ltr" }}>
      <Ada2aiNavbar />
      <div className="container mx-auto px-4 pt-28 pb-16">

        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/10"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#00DCC8" }}
          >
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            {isRTL ? "العودة للرئيسية" : "Back to Home"}
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4"
            style={{ background: "rgba(0,220,200,0.08)", border: "1px solid rgba(0,220,200,0.2)", color: "#00DCC8" }}>
            <Users size={12} /> {t("scouts.title")}
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Orbitron', sans-serif", color: "#EEEFEE" }}>
            {t("scouts.title")}
          </h1>
          <p style={{ color: "rgba(238,239,238,0.55)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {t("scouts.sub")}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Users size={18} />, val: filtered.length, label: t("scouts.total") },
            { icon: <Star size={18} />, val: avgScore, label: t("scouts.avgScore") },
            { icon: <Zap size={18} />, val: uniqueSports, label: t("scouts.sports") },
            { icon: <MapPin size={18} />, val: uniqueCities, label: t("scouts.regions") },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: "#00DCC8" }}>{s.icon}</div>
              <div className="text-2xl font-black" style={{ fontFamily: "'Orbitron', sans-serif", color: "#EEEFEE" }}>{s.val}</div>
              <div className="text-xs mt-1" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2" style={{ left: isRTL ? "auto" : "12px", right: isRTL ? "12px" : "auto", color: "rgba(238,239,238,0.35)" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("scouts.search")}
              className="w-full rounded-xl py-2.5 text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#EEEFEE",
                paddingLeft: isRTL ? "12px" : "36px",
                paddingRight: isRTL ? "36px" : "12px",
                fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            style={{ background: showFilters ? "rgba(0,220,200,0.12)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: showFilters ? "#00DCC8" : "rgba(238,239,238,0.7)" }}
          >
            <Filter size={15} /> {t("common.filter")}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              // Sport filter hidden (unified to Football)
              { label: t("scouts.filter.region"), val: cityFilter, set: setCityFilter, opts: cities, labels: cityLabels },
              { label: t("scouts.filter.age"), val: ageRange, set: setAgeRange, opts: ageRanges, labels: Object.fromEntries(ageRanges.map(a => [a, a === "all" ? t("scouts.filter.all") : a])) },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-xs mb-1.5" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{f.label}</label>
                <select
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#EEEFEE" }}
                >
                  {f.opts.map(o => <option key={o} value={o}>{f.labels[o] ?? o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Compare bar */}
        {compareList.length > 0 && (
          <div className="mb-4 flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(0,122,186,0.1)", border: "1px solid rgba(0,122,186,0.3)" }}>
            <GitCompare size={16} style={{ color: "#007ABA" }} />
            <span className="text-sm" style={{ color: "rgba(238,239,238,0.7)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {compareList.length}/2 {t("scouts.compare")}
            </span>
            {compareList.length === 2 && (
              <button
                onClick={() => navigate("/compare")}
                className="ml-auto px-4 py-1.5 rounded-lg text-sm font-semibold"
                style={{ background: "#007ABA", color: "#fff" }}
              >
                {t("scouts.compare")} →
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {[
                    { label: t("scouts.col.name"), key: null },
                    { label: t("scouts.col.sport"), key: null },
                    { label: t("scouts.col.age"), key: "age" as SortKey },
                    { label: t("scouts.col.region"), key: null },
                    { label: t("scouts.col.score"), key: "score" as SortKey },
                    { label: t("scouts.col.actions"), key: null },
                  ].map((col, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-left font-semibold ${col.key ? "cursor-pointer select-none" : ""}`}
                      style={{ color: "rgba(238,239,238,0.55)", textAlign: isRTL ? "right" : "left", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
                      onClick={() => col.key && toggleSort(col.key)}
                    >
                      {col.label}{col.key && <SortIcon k={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center" style={{ color: "rgba(238,239,238,0.35)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{t("scouts.noResults")}</td></tr>
                ) : filtered.map((p, idx) => {
                  const name = lang === "ar" ? p.nameAr : p.nameEn;
                  const position = lang === "ar" ? p.positionAr : p.positionEn;
                  const city = lang === "ar" ? p.cityAr : p.cityEn;
                  const status = lang === "ar" ? p.statusAr : p.statusEn;
                  const isSelected = compareList.includes(p.id);
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: isSelected ? "rgba(0,122,186,0.06)" : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff" }}>
                            {name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: "#EEEFEE", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                              {p.flag} {name}
                            </div>
                            <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{position}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "rgba(238,239,238,0.7)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                        {sportLabels[p.sport] ?? p.sport}
                      </td>
                      <td className="px-4 py-3" style={{ color: "rgba(238,239,238,0.7)" }}>{p.age}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(238,239,238,0.55)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                          <MapPin size={11} /> {city}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: p.score >= 85 ? "#00DCC8" : p.score >= 80 ? "#FFA500" : "#EEEFEE", fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem" }}>
                            {p.score}
                          </span>
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: p.score >= 85 ? "#00DCC8" : p.score >= 80 ? "#FFA500" : "#007ABA" }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/sport-id`)}
                            className="p-1.5 rounded-lg transition-all"
                            title={t("scouts.viewProfile")}
                            style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8" }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => toggleCompare(p.id)}
                            className="p-1.5 rounded-lg transition-all"
                            title={t("scouts.compare")}
                            style={{ background: isSelected ? "rgba(0,122,186,0.2)" : "rgba(0,122,186,0.08)", color: "#007ABA" }}
                          >
                            <GitCompare size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer count */}
        <div className="mt-4 text-xs" style={{ color: "rgba(238,239,238,0.35)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {filtered.length} {t("common.results")}
        </div>
      </div>
    </div>
  );
}
