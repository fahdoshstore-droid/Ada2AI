import { Trophy, Brain, Calendar, MapPin, Clock, ChevronRight, ChevronLeft } from "lucide-react";

interface MatchesProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

const matchesAr = [
  { id: 1, homeAr: "الفريق الأول", homeEn: "First Team", awayAr: "أكاديمية الظهران", awayEn: "Dhahran Academy", homeScore: 3, awayScore: 1, dateAr: "15 مارس 2025", dateEn: "Mar 15, 2025", locationAr: "ملعب الدمام", locationEn: "Dammam Stadium", status: "done", result: "win" },
  { id: 2, homeAr: "الفريق الأول", homeEn: "First Team", awayAr: "نادي الاتحاد", awayEn: "Al-Ittihad Club", homeScore: 1, awayScore: 2, dateAr: "8 مارس 2025", dateEn: "Mar 8, 2025", locationAr: "ملعب الخبر", locationEn: "Khobar Stadium", status: "done", result: "loss" },
  { id: 3, homeAr: "أكاديمية النجوم", homeEn: "Stars Academy", awayAr: "الفريق الأول", awayEn: "First Team", homeScore: 0, awayScore: 0, dateAr: "1 مارس 2025", dateEn: "Mar 1, 2025", locationAr: "ملعب الخبر", locationEn: "Khobar Stadium", status: "done", result: "draw" },
  { id: 4, homeAr: "الفريق الأول", homeEn: "First Team", awayAr: "أكاديمية كابتن", awayEn: "Captain Academy", homeScore: null, awayScore: null, dateAr: "22 مارس 2025", dateEn: "Mar 22, 2025", locationAr: "ملعب الدمام", locationEn: "Dammam Stadium", status: "upcoming", result: null },
];

const resultColors: Record<string, string> = { win: "#22c55e", loss: "#ef4444", draw: "#F59E0B" };
const resultLabelsAr: Record<string, string> = { win: "فوز", loss: "خسارة", draw: "تعادل" };
const resultLabelsEn: Record<string, string> = { win: "Win", loss: "Loss", draw: "Draw" };

export default function Matches({ onNavigate, lang = "ar" }: MatchesProps) {
  const isRTL = lang === "ar";
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

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
          <span style={{ color: "#22c55e" }}>●</span> {lang === "ar" ? "2 فوز" : "2 Wins"}
          <span style={{ color: "#ef4444" }}>●</span> {lang === "ar" ? "1 خسارة" : "1 Loss"}
          <span style={{ color: "#F59E0B" }}>●</span> {lang === "ar" ? "1 تعادل" : "1 Draw"}
        </div>
      </div>

      <div className="space-y-4">
        {matchesAr.map((m, i) => (
          <div key={m.id} className="p-5 rounded-2xl"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: m.status === "upcoming" ? "rgba(0,220,200,0.1)" : "rgba(255,255,255,0.05)",
                  color: m.status === "upcoming" ? "#00DCC8" : "rgba(238,239,238,0.4)",
                  fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
                }}>
                {m.status === "upcoming" ? (lang === "ar" ? "قادمة" : "Upcoming") : (lang === "ar" ? "منتهية" : "Completed")}
              </span>
              {m.result && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                  style={{ background: `${resultColors[m.result]}18`, color: resultColors[m.result], fontFamily: isRTL ? "'Cairo', sans-serif" : "'Space Grotesk', sans-serif" }}>
                  {isRTL ? resultLabelsAr[m.result] : resultLabelsEn[m.result]}
                </span>
              )}
            </div>

            {/* Score */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center flex-1">
                <div className="font-bold text-white text-sm mb-1"
                  style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  {isRTL ? m.homeAr : m.homeEn}
                </div>
              </div>
              <div className="text-center px-4">
                {m.homeScore !== null ? (
                  <div className="text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {m.homeScore} <span style={{ color: "rgba(238,239,238,0.3)" }}>—</span> {m.awayScore}
                  </div>
                ) : (
                  <div className="text-lg font-bold" style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>vs</div>
                )}
              </div>
              <div className="text-center flex-1">
                <div className="font-bold text-white text-sm mb-1"
                  style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  {isRTL ? m.awayAr : m.awayEn}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "rgba(238,239,238,0.4)" }}>
              <span className="flex items-center gap-1"><Calendar size={11} /> {isRTL ? m.dateAr : m.dateEn}</span>
              <span className="flex items-center gap-1"><MapPin size={11} /> {isRTL ? m.locationAr : m.locationEn}</span>
            </div>

            {/* AI Analysis Button */}
            {m.status === "done" && (
              <button
                onClick={() => onNavigate("ai-chat", { prompt: lang === "ar" ? `حلل مباراة ${m.homeAr} ضد ${m.awayAr}` : `Analyze the match: ${m.homeEn} vs ${m.awayEn}` })}
                className="w-full mt-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: "rgba(0,122,186,0.08)", color: "#007ABA", border: "1px solid rgba(0,122,186,0.2)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
              >
                <Brain size={13} />
                {lang === "ar" ? "تحليل المباراة بالذكاء الاصطناعي" : "AI Match Analysis"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
