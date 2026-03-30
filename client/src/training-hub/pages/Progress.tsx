import { TrendingUp, TrendingDown, Minus, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ProgressProps {
  lang?: "ar" | "en";
}

const weeklyDataAr = [
  { week: "الأسبوع 1", performance: 68, fitness: 72, tactics: 65 },
  { week: "الأسبوع 2", performance: 71, fitness: 74, tactics: 68 },
  { week: "الأسبوع 3", performance: 74, fitness: 78, tactics: 72 },
  { week: "الأسبوع 4", performance: 78, fitness: 80, tactics: 76 },
  { week: "الأسبوع 5", performance: 82, fitness: 83, tactics: 80 },
  { week: "الأسبوع 6", performance: 85, fitness: 86, tactics: 84 },
];

const weeklyDataEn = [
  { week: "Week 1", performance: 68, fitness: 72, tactics: 65 },
  { week: "Week 2", performance: 71, fitness: 74, tactics: 68 },
  { week: "Week 3", performance: 74, fitness: 78, tactics: 72 },
  { week: "Week 4", performance: 78, fitness: 80, tactics: 76 },
  { week: "Week 5", performance: 82, fitness: 83, tactics: 80 },
  { week: "Week 6", performance: 85, fitness: 86, tactics: 84 },
];

const playerProgressAr = [
  { nameAr: "أحمد الزهراني", nameEn: "Ahmed Al-Zahrani", prev: 83, curr: 87, change: +4 },
  { nameAr: "خالد العتيبي", nameEn: "Khalid Al-Otaibi", prev: 80, curr: 82, change: +2 },
  { nameAr: "فيصل المطيري", nameEn: "Faisal Al-Mutairi", prev: 73, curr: 79, change: +6 },
  { nameAr: "عمر الشهري", nameEn: "Omar Al-Shahri", prev: 74, curr: 75, change: +1 },
  { nameAr: "يوسف القحطاني", nameEn: "Yousef Al-Qahtani", prev: 75, curr: 73, change: -2 },
];

export default function Progress({ lang = "ar" }: ProgressProps) {
  const isRTL = lang === "ar";
  const weeklyData = isRTL ? weeklyDataAr : weeklyDataEn;

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1"
          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "تتبع التقدم" : "Progress Tracking"}
        </h1>
        <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "تحليل أداء الفريق خلال الأسابيع الستة الماضية" : "Team performance analysis over the past 6 weeks"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { labelAr: "متوسط الأداء", labelEn: "Avg Performance", value: "85", change: "+17", color: "#00DCC8" },
          { labelAr: "اللياقة البدنية", labelEn: "Physical Fitness", value: "86", change: "+14", color: "#007ABA" },
          { labelAr: "التكتيكات", labelEn: "Tactics", value: "84", change: "+19", color: "#F59E0B" },
        ].map((c, i) => (
          <div key={i} className="p-4 rounded-2xl text-center"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-2xl font-black mb-1" style={{ color: c.color, fontFamily: "'Space Grotesk', sans-serif" }}>{c.value}</div>
            <div className="text-xs mb-1" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {isRTL ? c.labelAr : c.labelEn}
            </div>
            <div className="text-xs font-semibold" style={{ color: "#22c55e" }}>↑ {c.change}%</div>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="font-bold text-white text-sm mb-4"
          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "منحنى التقدم الأسبوعي" : "Weekly Progress Curve"}
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: "rgba(238,239,238,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fill: "rgba(238,239,238,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0D1220", border: "1px solid rgba(0,220,200,0.2)", borderRadius: 8, color: "#fff" }}
            />
            <Line type="monotone" dataKey="performance" stroke="#00DCC8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="fitness" stroke="#007ABA" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="tactics" stroke="#F59E0B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-3 justify-center">
          {[
            { colorHex: "#00DCC8", labelAr: "الأداء", labelEn: "Performance" },
            { colorHex: "#007ABA", labelAr: "اللياقة", labelEn: "Fitness" },
            { colorHex: "#F59E0B", labelAr: "التكتيك", labelEn: "Tactics" },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded" style={{ background: l.colorHex }} />
              <span className="text-xs" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {isRTL ? l.labelAr : l.labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Player Progress Table */}
      <div className="rounded-2xl p-5"
        style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="font-bold text-white text-sm mb-4"
          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "تقدم اللاعبين" : "Player Progress"}
        </h2>
        <div className="space-y-3">
          {playerProgressAr.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                {p.nameEn.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate"
                  style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  {isRTL ? p.nameAr : p.nameEn}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${p.curr}%`, background: "linear-gradient(90deg, #007ABA, #00DCC8)" }} />
                  </div>
                  <span className="text-xs font-bold text-white flex-shrink-0" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {p.curr}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {p.change > 0
                  ? <TrendingUp size={14} style={{ color: "#22c55e" }} />
                  : p.change < 0
                  ? <TrendingDown size={14} style={{ color: "#ef4444" }} />
                  : <Minus size={14} style={{ color: "rgba(238,239,238,0.3)" }} />
                }
                <span className="text-xs font-bold"
                  style={{ color: p.change > 0 ? "#22c55e" : p.change < 0 ? "#ef4444" : "rgba(238,239,238,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {p.change > 0 ? "+" : ""}{p.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
