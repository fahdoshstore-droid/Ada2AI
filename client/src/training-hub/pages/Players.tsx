import { useState } from "react";
import { Search, Star, TrendingUp, Users, Plus, Filter } from "lucide-react";

interface PlayersProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

const playersData = [
  { id: 1, nameAr: "أحمد الزهراني", nameEn: "Ahmed Al-Zahrani", posAr: "مهاجم", posEn: "Forward", age: 19, score: 87, speed: 88, dribble: 82, shoot: 91, pass: 75, endurance: 84, avatar: "AZ", level: "Gold" },
  { id: 2, nameAr: "خالد العتيبي", nameEn: "Khalid Al-Otaibi", posAr: "وسط", posEn: "Midfielder", age: 21, score: 82, speed: 80, dribble: 85, shoot: 74, pass: 90, endurance: 83, avatar: "KA", level: "Silver" },
  { id: 3, nameAr: "فيصل المطيري", nameEn: "Faisal Al-Mutairi", posAr: "مدافع", posEn: "Defender", age: 22, score: 79, speed: 76, dribble: 70, shoot: 65, pass: 82, endurance: 88, avatar: "FM", level: "Silver" },
  { id: 4, nameAr: "عمر الشهري", nameEn: "Omar Al-Shahri", posAr: "حارس مرمى", posEn: "Goalkeeper", age: 20, score: 75, speed: 72, dribble: 60, shoot: 55, pass: 78, endurance: 85, avatar: "OS", level: "Bronze" },
  { id: 5, nameAr: "يوسف القحطاني", nameEn: "Yousef Al-Qahtani", posAr: "مهاجم", posEn: "Forward", age: 18, score: 73, speed: 90, dribble: 78, shoot: 80, pass: 68, endurance: 76, avatar: "YQ", level: "Bronze" },
  { id: 6, nameAr: "سلطان الدوسري", nameEn: "Sultan Al-Dosari", posAr: "ظهير أيمن", posEn: "Right Back", age: 23, score: 71, speed: 85, dribble: 72, shoot: 62, pass: 79, endurance: 80, avatar: "SD", level: "Bronze" },
];

const levelColors: Record<string, string> = {
  Platinum: "#00DCC8", Gold: "#F59E0B", Silver: "#9CA3AF", Bronze: "#CD7F32"
};

export default function Players({ onNavigate, lang = "ar" }: PlayersProps) {
  const isRTL = lang === "ar";
  const [search, setSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<typeof playersData[0] | null>(null);

  const filtered = playersData.filter(p =>
    (isRTL ? p.nameAr : p.nameEn).toLowerCase().includes(search.toLowerCase())
  );

  const skills = selectedPlayer ? [
    { labelAr: "السرعة", labelEn: "Speed", value: selectedPlayer.speed },
    { labelAr: "المراوغة", labelEn: "Dribbling", value: selectedPlayer.dribble },
    { labelAr: "التسديد", labelEn: "Shooting", value: selectedPlayer.shoot },
    { labelAr: "التمرير", labelEn: "Passing", value: selectedPlayer.pass },
    { labelAr: "التحمل", labelEn: "Endurance", value: selectedPlayer.endurance },
  ] : [];

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
              {lang === "ar" ? `${playersData.length} لاعب مسجل` : `${playersData.length} registered players`}
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
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlayer(p)}
              className="p-4 rounded-2xl text-right transition-all"
              style={{
                background: selectedPlayer?.id === p.id ? "rgba(0,220,200,0.08)" : "#0D1220",
                border: selectedPlayer?.id === p.id ? "1.5px solid rgba(0,220,200,0.4)" : "1px solid rgba(255,255,255,0.06)",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate"
                    style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {isRTL ? p.nameAr : p.nameEn}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {isRTL ? p.posAr : p.posEn} · {lang === "ar" ? `${p.age} سنة` : `${p.age} yrs`}
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                  style={{ background: `${levelColors[p.level]}18`, color: levelColors[p.level], fontFamily: "'Space Grotesk', sans-serif" }}>
                  {p.level}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star size={12} style={{ color: "#F59E0B" }} />
                  <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.score}</span>
                </div>
                <div className="flex gap-1.5">
                  {[p.speed, p.dribble, p.shoot].map((v, i) => (
                    <div key={i} className="h-1.5 w-8 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: "linear-gradient(90deg, #007ABA, #00DCC8)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Player Detail Panel */}
      {selectedPlayer && (
        <div className="w-72 flex-shrink-0 overflow-y-auto p-5"
          style={{ background: "#0D1220", borderLeft: isRTL ? "none" : "1px solid rgba(255,255,255,0.06)", borderRight: isRTL ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-3"
              style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
              {selectedPlayer.avatar}
            </div>
            <div className="font-bold text-white text-base mb-1"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {isRTL ? selectedPlayer.nameAr : selectedPlayer.nameEn}
            </div>
            <div className="text-sm mb-2" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {isRTL ? selectedPlayer.posAr : selectedPlayer.posEn}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: `${levelColors[selectedPlayer.level]}18`, border: `1px solid ${levelColors[selectedPlayer.level]}40` }}>
              <Star size={12} style={{ color: levelColors[selectedPlayer.level] }} />
              <span className="text-sm font-black" style={{ color: levelColors[selectedPlayer.level], fontFamily: "'Space Grotesk', sans-serif" }}>
                {selectedPlayer.score}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold mb-2" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "المهارات" : "Skills"}
            </div>
            {skills.map((s, i) => (
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
            ))}
          </div>

          <button
            onClick={() => onNavigate("ai-chat", { prompt: lang === "ar" ? `حلل أداء ${selectedPlayer.nameAr} وقدم توصيات` : `Analyze ${selectedPlayer.nameEn}'s performance and give recommendations` })}
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
