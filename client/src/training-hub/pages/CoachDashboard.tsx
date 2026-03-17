import { useState } from "react";
import { Brain, Users, Move, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";

interface CoachDashboardProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

type Formation = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1";

const formations: Formation[] = ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"];

const formationPositions: Record<Formation, { x: number; y: number; labelAr: string; labelEn: string }[]> = {
  "4-3-3": [
    { x: 50, y: 88, labelAr: "حارس", labelEn: "GK" },
    { x: 15, y: 68, labelAr: "مدافع", labelEn: "LB" },
    { x: 35, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 65, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 85, y: 68, labelAr: "مدافع", labelEn: "RB" },
    { x: 25, y: 45, labelAr: "وسط", labelEn: "CM" },
    { x: 50, y: 42, labelAr: "وسط", labelEn: "CM" },
    { x: 75, y: 45, labelAr: "وسط", labelEn: "CM" },
    { x: 18, y: 18, labelAr: "جناح", labelEn: "LW" },
    { x: 50, y: 12, labelAr: "مهاجم", labelEn: "ST" },
    { x: 82, y: 18, labelAr: "جناح", labelEn: "RW" },
  ],
  "4-4-2": [
    { x: 50, y: 88, labelAr: "حارس", labelEn: "GK" },
    { x: 15, y: 68, labelAr: "مدافع", labelEn: "LB" },
    { x: 35, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 65, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 85, y: 68, labelAr: "مدافع", labelEn: "RB" },
    { x: 15, y: 45, labelAr: "وسط", labelEn: "LM" },
    { x: 35, y: 45, labelAr: "وسط", labelEn: "CM" },
    { x: 65, y: 45, labelAr: "وسط", labelEn: "CM" },
    { x: 85, y: 45, labelAr: "وسط", labelEn: "RM" },
    { x: 35, y: 15, labelAr: "مهاجم", labelEn: "ST" },
    { x: 65, y: 15, labelAr: "مهاجم", labelEn: "ST" },
  ],
  "3-5-2": [
    { x: 50, y: 88, labelAr: "حارس", labelEn: "GK" },
    { x: 25, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 50, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 75, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 10, y: 45, labelAr: "ظهير", labelEn: "LWB" },
    { x: 30, y: 45, labelAr: "وسط", labelEn: "CM" },
    { x: 50, y: 42, labelAr: "وسط", labelEn: "CM" },
    { x: 70, y: 45, labelAr: "وسط", labelEn: "CM" },
    { x: 90, y: 45, labelAr: "ظهير", labelEn: "RWB" },
    { x: 35, y: 15, labelAr: "مهاجم", labelEn: "ST" },
    { x: 65, y: 15, labelAr: "مهاجم", labelEn: "ST" },
  ],
  "4-2-3-1": [
    { x: 50, y: 88, labelAr: "حارس", labelEn: "GK" },
    { x: 15, y: 68, labelAr: "مدافع", labelEn: "LB" },
    { x: 35, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 65, y: 68, labelAr: "مدافع", labelEn: "CB" },
    { x: 85, y: 68, labelAr: "مدافع", labelEn: "RB" },
    { x: 35, y: 52, labelAr: "وسط", labelEn: "CDM" },
    { x: 65, y: 52, labelAr: "وسط", labelEn: "CDM" },
    { x: 18, y: 32, labelAr: "جناح", labelEn: "LM" },
    { x: 50, y: 30, labelAr: "مهاجم", labelEn: "CAM" },
    { x: 82, y: 32, labelAr: "جناح", labelEn: "RM" },
    { x: 50, y: 12, labelAr: "مهاجم", labelEn: "ST" },
  ],
};

export default function CoachDashboard({ onNavigate, lang = "ar" }: CoachDashboardProps) {
  const isRTL = lang === "ar";
  const [formation, setFormation] = useState<Formation>("4-3-3");
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const positions = formationPositions[formation];

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "لوحة المدرب" : "Coach Dashboard"}
          </h1>
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "التكتيكات والتشكيلات والتخطيط" : "Tactics, formations and planning"}
          </p>
        </div>
        <button
          onClick={() => onNavigate("ai-chat", { prompt: lang === "ar" ? "اقترح أفضل تشكيل للمباراة القادمة" : "Suggest the best formation for the next match" })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.2)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
        >
          <Brain size={15} />
          {lang === "ar" ? "استشر AI" : "Ask AI"} <ArrowIcon size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tactical Board */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Formation Selector */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "التشكيل:" : "Formation:"}
            </span>
            {formations.map(f => (
              <button
                key={f}
                onClick={() => setFormation(f)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: formation === f ? "rgba(0,220,200,0.15)" : "rgba(255,255,255,0.04)",
                  color: formation === f ? "#00DCC8" : "rgba(238,239,238,0.5)",
                  border: formation === f ? "1px solid rgba(0,220,200,0.3)" : "1px solid transparent",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Pitch */}
          <div className="relative rounded-xl overflow-hidden" style={{ paddingTop: "60%", background: "#1a3a2a" }}>
            {/* Pitch markings */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Outer border */}
              <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              {/* Center line */}
              <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              {/* Center circle */}
              <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.3)" />
              {/* Penalty areas */}
              <rect x="25" y="2" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <rect x="25" y="80" width="50" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              {/* Goal areas */}
              <rect x="37" y="2" width="26" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <rect x="37" y="90" width="26" height="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            </svg>

            {/* Players */}
            {positions.map((pos, i) => (
              <div
                key={i}
                className="absolute flex flex-col items-center"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2"
                  style={{
                    background: i === 0 ? "#F59E0B" : "linear-gradient(135deg, #007ABA, #00DCC8)",
                    borderColor: i === 0 ? "#F59E0B" : "#00DCC8",
                    color: "#fff",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "9px",
                  }}>
                  {i + 1}
                </div>
                <div className="text-center mt-0.5 px-1 rounded text-white"
                  style={{ fontSize: "7px", background: "rgba(0,0,0,0.6)", fontFamily: isRTL ? "'Cairo', sans-serif" : "'Space Grotesk', sans-serif", whiteSpace: "nowrap" }}>
                  {isRTL ? pos.labelAr : pos.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactics Notes */}
        <div className="space-y-4">
          <div className="rounded-2xl p-4"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-bold text-white text-sm mb-3"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "ملاحظات تكتيكية" : "Tactical Notes"}
            </h3>
            <textarea
              rows={5}
              placeholder={lang === "ar" ? "اكتب ملاحظاتك التكتيكية هنا..." : "Write your tactical notes here..."}
              className="w-full text-sm text-white placeholder-white/30 resize-none focus:outline-none rounded-lg p-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit",
                direction: isRTL ? "rtl" : "ltr",
              }}
            />
          </div>

          <div className="rounded-2xl p-4"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="font-bold text-white text-sm mb-3"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "إحصائيات التشكيل" : "Formation Stats"}
            </h3>
            {[
              { labelAr: "الهجوم", labelEn: "Attack", value: formation === "4-3-3" ? 85 : formation === "4-4-2" ? 78 : formation === "3-5-2" ? 72 : 80 },
              { labelAr: "الدفاع", labelEn: "Defense", value: formation === "4-3-3" ? 70 : formation === "4-4-2" ? 78 : formation === "3-5-2" ? 88 : 75 },
              { labelAr: "السيطرة", labelEn: "Control", value: formation === "4-3-3" ? 75 : formation === "4-4-2" ? 72 : formation === "3-5-2" ? 80 : 85 },
            ].map((s, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "rgba(238,239,238,0.6)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {isRTL ? s.labelAr : s.labelEn}
                  </span>
                  <span className="text-xs font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.value}%`, background: "linear-gradient(90deg, #007ABA, #00DCC8)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
