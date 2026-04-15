import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Search, Filter, Star, TrendingUp, MapPin, Users, Eye,
  GitCompare, ChevronUp, ChevronDown, Award, Zap, Target,
  ArrowLeft,
} from "lucide-react";

interface Scout {
  id: number;
  name: string;
  name_ar: string;
  organization: string;
  organization_ar: string;
  sport: string;
  region: string;
  speciality: string;
  experience_years: number;
  verified: boolean;
  rating: number;
  reports_count: number;
}

type SortKey = "rating" | "experience_years" | "reports_count";
type SortDir = "asc" | "desc";

export default function Scouts() {
  const { t, isRTL, lang } = useLanguage();
  const [, navigate] = useLocation();
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<number[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sportFilter !== "all") params.set("sport", sportFilter);
    if (regionFilter !== "all") params.set("region", regionFilter);
    const qs = params.toString();
    const url = `/api/scouts${qs ? `?${qs}` : ""}`;

    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { setScouts(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [search, sportFilter, regionFilter]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "#00DCC8", borderTopColor: "transparent" }}></div>
      <span className="ml-3 text-sm" style={{ color: "rgba(238,239,238,0.6)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>Loading scouts...</span>
    </div>
  );
  if (error) return <div className="text-red-500 text-center p-8">Error: {error}</div>;

  const sports = ["all", ...Array.from(new Set(scouts.map(s => s.sport)))];
  const regionOptions = ["all", ...Array.from(new Set(scouts.map(s => s.region)))];

  const sportLabels: Record<string, string> = {
    Football: t("sports.football"),
  };
  // Build sport labels from API data
  sports.forEach(s => {
    if (!sportLabels[s] && s !== "all") sportLabels[s] = s;
  });

  const filtered = scouts
    .filter((s) => {
      const name = lang === "ar" && s.name_ar ? s.name_ar : s.name;
      const searchMatch = search === "" || name.toLowerCase().includes(search.toLowerCase()) || s.region.toLowerCase().includes(search.toLowerCase());
      const sportMatch = sportFilter === "all" || s.sport === sportFilter;
      const regionMatch = regionFilter === "all" || s.region === regionFilter;
      return searchMatch && sportMatch && regionMatch;
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleCompare = (id: number) => {
    setCompareList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const avgRating = filtered.length > 0 ? (filtered.reduce((s, p) => s + p.rating, 0) / filtered.length).toFixed(1) : 0;
  const uniqueSports = new Set(filtered.map(s => s.sport)).size;
  const uniqueRegions = new Set(filtered.map(s => s.region)).size;

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
            { icon: <Star size={18} />, val: avgRating, label: t("scouts.avgScore") },
            { icon: <Zap size={18} />, val: uniqueSports, label: t("scouts.sports") },
            { icon: <MapPin size={18} />, val: uniqueRegions, label: t("scouts.regions") },
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{t("scouts.filter.sport") || "Sport"}</label>
              <select
                value={sportFilter}
                onChange={e => setSportFilter(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#EEEFEE" }}
              >
                {sports.map(s => <option key={s} value={s}>{s === "all" ? (t("scouts.filter.all") || "All") : (sportLabels[s] ?? s)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{t("scouts.filter.region") || "Region"}</label>
              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#EEEFEE" }}
              >
                {regionOptions.map(r => <option key={r} value={r}>{r === "all" ? (t("scouts.filter.all") || "All") : r}</option>)}
              </select>
            </div>
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
                    { label: t("scouts.col.name") || "Name", key: null },
                    { label: t("scouts.col.sport") || "Sport", key: null },
                    { label: t("scouts.col.experience") || "Experience", key: "experience_years" as SortKey },
                    { label: t("scouts.col.region") || "Region", key: null },
                    { label: t("scouts.col.score") || "Rating", key: "rating" as SortKey },
                    { label: t("scouts.col.actions") || "Actions", key: null },
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
                ) : filtered.map((s, idx) => {
                  const name = lang === "ar" && s.name_ar ? s.name_ar : s.name;
                  const org = lang === "ar" && s.organization_ar ? s.organization_ar : s.organization;
                  const isSelected = compareList.includes(s.id);
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: isSelected ? "rgba(0,122,186,0.06)" : idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: s.verified ? "linear-gradient(135deg, #007ABA, #00DCC8)" : "rgba(255,255,255,0.1)", color: s.verified ? "#fff" : "rgba(238,239,238,0.5)" }}>
                            {name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: "#EEEFEE", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                              {name} {s.verified && <span style={{ color: "#00DCC8" }}>✓</span>}
                            </div>
                            <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{org} · {s.speciality}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: "rgba(238,239,238,0.7)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                        {sportLabels[s.sport] ?? s.sport}
                      </td>
                      <td className="px-4 py-3" style={{ color: "rgba(238,239,238,0.7)" }}>{s.experience_years} yrs · {s.reports_count} reports</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(238,239,238,0.55)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                          <MapPin size={11} /> {s.region}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: s.rating >= 85 ? "#00DCC8" : s.rating >= 80 ? "#FFA500" : "#EEEFEE", fontFamily: "'Orbitron', sans-serif", fontSize: "0.85rem" }}>
                            {s.rating}
                          </span>
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div className="h-full rounded-full" style={{ width: `${s.rating}%`, background: s.rating >= 85 ? "#00DCC8" : s.rating >= 80 ? "#FFA500" : "#007ABA" }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/profile`)}
                            className="p-1.5 rounded-lg transition-all"
                            title={t("scouts.viewProfile")}
                            style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8" }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => toggleCompare(s.id)}
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