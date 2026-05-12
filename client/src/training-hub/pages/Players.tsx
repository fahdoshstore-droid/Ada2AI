import { useState, useMemo } from "react";
import { Search, Star, TrendingUp, Users, Plus, Filter, Brain, Loader2, AlertCircle } from "lucide-react";
import { useA2AAgent } from "../hooks/useA2AAgent";
import { usePlayers } from "@/hooks/usePlayers";
import { useEvaluations } from "@/hooks/useEvaluations";
import AgentTracePanel from "@/components/AgentTracePanel";

interface PlayersProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

const levelColors: Record<string, string> = {
  Platinum: "#00DCC8", Gold: "#F59E0B", Silver: "#9CA3AF", Bronze: "#CD7F32"
};

function getLevel(score: number): string {
  if (score >= 85) return "Gold";
  if (score >= 75) return "Silver";
  return "Bronze";
}

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function Players({ onNavigate, lang = "ar" }: PlayersProps) {
  const isRTL = lang === "ar";
  const [search, setSearch] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const a2a = useA2AAgent();
  const [playerQuestion, setPlayerQuestion] = useState("");
  const [playerAnswer, setPlayerAnswer] = useState("");

  const { players, isLoading, isError } = usePlayers();
  const { evaluations, isLoading: evalLoading } = useEvaluations(selectedPlayerId);

  // Build a map of latest evaluation per player
  const latestEvalMap = useMemo(() => {
    const map: Record<string, { technical: number; tactical: number; physical: number; mental: number; overall: number }> = {};
    for (const ev of evaluations) {
      if (!map[ev.player_id]) {
        map[ev.player_id] = { technical: ev.technical, tactical: ev.tactical, physical: ev.physical, mental: ev.mental, overall: ev.overall };
      }
    }
    return map;
  }, [evaluations]);

  const filtered = players.filter(p => {
    const name = p.profile?.full_name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const selectedPlayer = selectedPlayerId ? players.find(p => p.id === selectedPlayerId) ?? null : null;
  const selectedEval = selectedPlayerId ? latestEvalMap[selectedPlayerId] : undefined;

  const skills = selectedEval ? [
    { labelAr: "التقنية", labelEn: "Technical", value: selectedEval.technical },
    { labelAr: "التكتيك", labelEn: "Tactical", value: selectedEval.tactical },
    { labelAr: "البدنية", labelEn: "Physical", value: selectedEval.physical },
    { labelAr: "النفسية", labelEn: "Mental", value: selectedEval.mental },
  ] : [];

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#00DCC8" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "جاري تحميل اللاعبين..." : "Loading players..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: "#ef4444" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "حدث خطأ في تحميل اللاعبين" : "Failed to load players"}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (players.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <Users size={32} className="mx-auto mb-3" style={{ color: "rgba(238,239,238,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "لا يوجد لاعبون مسجلون بعد" : "No players registered yet"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white mb-1"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "اللاعبون" : "Players"}
            </h1>
            <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? `${players.length} لاعب مسجل` : `${players.length} registered players`}
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
          >
            <Plus size={16} />
            {lang === "ar" ? "إضافة لاعب" : "Add Player"}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 text-white/30"
            style={{ [isRTL ? "right" : "left"]: "12px" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "ابحث عن لاعب..." : "Search players..."}
            className="w-full py-2.5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
            style={{
              background: "#0D1220",
              border: "1px solid rgba(255,255,255,0.08)",
              paddingRight: isRTL ? "40px" : "16px",
              paddingLeft: isRTL ? "16px" : "40px",
              fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
              direction: isRTL ? "rtl" : "ltr",
            }}
          />
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(p => {
            const ev = latestEvalMap[p.id];
            const score = ev?.overall ?? 0;
            const level = score ? getLevel(score) : "Bronze";
            const avatar = getInitials(p.profile?.full_name || `P${p.jersey_number || ""}`);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlayerId(selectedPlayerId === p.id ? null : p.id)}
                className="p-4 rounded-2xl text-right transition-all"
                style={{
                  background: selectedPlayerId === p.id ? "rgba(0,220,200,0.08)" : "#0D1220",
                  border: selectedPlayerId === p.id ? "1.5px solid rgba(0,220,200,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  textAlign: isRTL ? "right" : "left",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate"
                      style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                      {p.profile?.full_name || (lang === "ar" ? "بدون اسم" : "No Name")}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                      {p.position || (lang === "ar" ? "غير محدد" : "Unspecified")} · {p.age ? (lang === "ar" ? `${p.age} سنة` : `${p.age} yrs`) : ""}
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                    style={{ background: `${levelColors[level]}18`, color: levelColors[level], fontFamily: "'Space Grotesk', sans-serif" }}>
                    {level}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={12} style={{ color: "#F59E0B" }} />
                    <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{score || "—"}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[ev?.technical ?? 0, ev?.physical ?? 0, ev?.mental ?? 0].map((v, i) => (
                      <div key={i} className="h-1.5 w-8 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${v}%`, background: "linear-gradient(90deg, #007ABA, #00DCC8)" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Player Detail Panel */}
      {selectedPlayer && (
        <div className="w-72 flex-shrink-0 overflow-y-auto p-5"
          style={{ background: "#0D1220", borderLeft: isRTL ? "none" : "1px solid rgba(255,255,255,0.06)", borderRight: isRTL ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-3"
              style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
              {getInitials(selectedPlayer.profile?.full_name || "")}
            </div>
            <div className="font-bold text-white text-base mb-1"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {selectedPlayer.profile?.full_name || (lang === "ar" ? "بدون اسم" : "No Name")}
            </div>
            <div className="text-sm mb-2" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {selectedPlayer.position || (lang === "ar" ? "غير محدد" : "Unspecified")}
            </div>
            {selectedEval && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: `${levelColors[getLevel(selectedEval.overall)]}18`, border: `1px solid ${levelColors[getLevel(selectedEval.overall)]}40` }}>
                <Star size={12} style={{ color: levelColors[getLevel(selectedEval.overall)] }} />
                <span className="text-sm font-black" style={{ color: levelColors[getLevel(selectedEval.overall)], fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedEval.overall}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold mb-2" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "المهارات" : "Skills"}
            </div>
            {skills.length > 0 ? skills.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "rgba(238,239,238,0.6)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {isRTL ? s.labelAr : s.labelEn}
                  </span>
                  <span className="text-xs font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${s.value}%`, background: s.value >= 85 ? "#00DCC8" : s.value >= 75 ? "#007ABA" : "#F59E0B" }} />
                </div>
              </div>
            )) : (
              <div className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {lang === "ar" ? "لا توجد تقييمات بعد" : "No evaluations yet"}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate("ai-chat", { prompt: lang === "ar" ? `حلل أداء ${selectedPlayer.profile?.full_name || ""} وقدم توصيات` : `Analyze ${selectedPlayer.profile?.full_name || ""}'s performance and give recommendations` })}
            className="w-full mt-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.2)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
          >
            <TrendingUp size={15} />
            {lang === "ar" ? "تحليل AI" : "AI Analysis"}
          </button>
        </div>
      )}
    </div>
  );
}