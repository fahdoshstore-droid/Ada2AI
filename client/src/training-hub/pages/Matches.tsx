import { useState, useMemo } from "react";
import { Trophy, Brain, Calendar, MapPin, Clock, ChevronRight, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { useMatches } from "@/hooks/useMatches";

interface MatchesProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

const resultColors: Record<string, string> = { win: "#22c55e", loss: "#ef4444", draw: "#F59E0B" };
const resultLabelsAr: Record<string, string> = { win: "فوز", loss: "خسارة", draw: "تعادل" };
const resultLabelsEn: Record<string, string> = { win: "Win", loss: "Loss", draw: "Draw" };

function getResult(home: number | null | undefined, away: number | null | undefined): string | null {
  if (home == null || away == null) return null;
  if (home > away) return "win";
  if (home < away) return "loss";
  return "draw";
}

function formatDate(dateStr: string | undefined, lang: "ar" | "en"): string {
  if (!dateStr) return lang === "ar" ? "—" : "—";
  const d = new Date(dateStr);
  return lang === "ar"
    ? d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function Matches({ onNavigate, lang = "ar" }: MatchesProps) {
  const isRTL = lang === "ar";
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;
  const { matches, isLoading, isError } = useMatches();

  // Compute W/D/L counts
  const counts = useMemo(() => {
    let wins = 0, losses = 0, draws = 0;
    for (const m of matches) {
      const r = getResult(m.score_home, m.score_away);
      if (r === "win") wins++;
      else if (r === "loss") losses++;
      else if (r === "draw") draws++;
    }
    return { wins, losses, draws };
  }, [matches]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#00DCC8" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "جاري تحميل المباريات..." : "Loading matches..."}
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
            {lang === "ar" ? "حدث خطأ في تحميل المباريات" : "Failed to load matches"}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (matches.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <Trophy size={32} className="mx-auto mb-3" style={{ color: "rgba(238,239,238,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "لا توجد مباريات مسجلة بعد" : "No matches recorded yet"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "المباريات" : "Matches"}
          </h1>
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "سجل المباريات والتحليلات" : "Match records and analysis"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm"
          style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {counts.wins > 0 && <><span style={{ color: "#22c55e" }}>●</span> {lang === "ar" ? `${counts.wins} فوز` : `${counts.wins} Wins`}</>}
          {counts.losses > 0 && <><span style={{ color: "#ef4444" }}>●</span> {lang === "ar" ? `${counts.losses} خسارة` : `${counts.losses} Loss`}</>}
          {counts.draws > 0 && <><span style={{ color: "#F59E0B" }}>●</span> {lang === "ar" ? `${counts.draws} تعادل` : `${counts.draws} Draw`}</>}
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((m, i) => {
          const result = getResult(m.score_home, m.score_away);
          const isUpcoming = m.status === "upcoming" || (m.score_home == null && m.score_away == null);
          const homeName = lang === "ar" ? (m as any).home_name_ar || m.opponent || "الفريق الأول" : (m as any).home_name_en || m.opponent || "First Team";
          const awayName = lang === "ar" ? (m as any).away_name_ar || m.opponent || "الخصم" : (m as any).away_name_en || m.opponent || "Opponent";
          return (
            <div key={m.id} className="p-5 rounded-2xl"
              style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{
                    background: isUpcoming ? "rgba(0,220,200,0.1)" : "rgba(255,255,255,0.05)",
                    color: isUpcoming ? "#00DCC8" : "rgba(238,239,238,0.4)",
                    fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
                  }}>
                  {isUpcoming ? (lang === "ar" ? "قادمة" : "Upcoming") : (lang === "ar" ? "منتهية" : "Completed")}
                </span>
                {result && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{ background: `${resultColors[result]}18`, color: resultColors[result], fontFamily: isRTL ? "'Cairo', sans-serif" : "'Space Grotesk', sans-serif" }}>
                    {isRTL ? resultLabelsAr[result] : resultLabelsEn[result]}
                  </span>
                )}
              </div>

              {/* Score */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center flex-1">
                  <div className="font-bold text-white text-sm mb-1"
                    style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {homeName}
                  </div>
                </div>
                <div className="text-center px-4">
                  {m.score_home != null && m.score_away != null ? (
                    <div className="text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {m.score_home} <span style={{ color: "rgba(238,239,238,0.3)" }}>—</span> {m.score_away}
                    </div>
                  ) : (
                    <div className="text-lg font-bold" style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>vs</div>
                  )}
                </div>
                <div className="text-center flex-1">
                  <div className="font-bold text-white text-sm mb-1"
                    style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {awayName}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "rgba(238,239,238,0.4)" }}>
                <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(m.match_date, lang)}</span>
                {m.venue && <span className="flex items-center gap-1"><MapPin size={11} /> {m.venue}</span>}
              </div>

              {/* AI Analysis Button */}
              {!isUpcoming && (
                <button
                  onClick={() => onNavigate("ai-chat", { prompt: lang === "ar" ? `حلل مباراة ${homeName} ضد ${awayName}` : `Analyze the match: ${homeName} vs ${awayName}` })}
                  className="w-full mt-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "rgba(0,122,186,0.08)", color: "#007ABA", border: "1px solid rgba(0,122,186,0.2)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
                >
                  <Brain size={13} />
                  {lang === "ar" ? "تحليل المباراة بالذكاء الاصطناعي" : "AI Match Analysis"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}