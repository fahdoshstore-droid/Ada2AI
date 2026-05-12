import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Award, Loader2, AlertCircle, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useAllEvaluations } from "@/hooks/useAllEvaluations";
import { usePlayers } from "@/hooks/usePlayers";

interface ProgressProps {
  lang?: "ar" | "en";
}

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function Progress({ lang = "ar" }: ProgressProps) {
  const isRTL = lang === "ar";
  const { players, isLoading: playersLoading, isError: playersError } = usePlayers();
  const { evaluations, isLoading: evalLoading, isError: evalError } = useAllEvaluations();

  const isLoading = playersLoading || evalLoading;
  const isError = playersError || evalError;

  // Group evaluations by player to compute progress
  const playerProgressData = useMemo(() => {
    const evalsByPlayer: Record<string, typeof evaluations> = {};
    for (const ev of evaluations) {
      if (!evalsByPlayer[ev.player_id]) evalsByPlayer[ev.player_id] = [];
      evalsByPlayer[ev.player_id].push(ev);
    }

    return Object.entries(evalsByPlayer)
      .map(([playerId, evals]) => {
        // evals are sorted newest first from supabase
        const player = players.find(p => p.id === playerId);
        const latest = evals[0];
        const prev = evals.length > 1 ? evals[1] : null;
        return {
          playerId,
          name: player?.profile?.full_name || (lang === "ar" ? "بدون اسم" : "No Name"),
          prev: prev?.overall ?? latest.overall,
          curr: latest.overall,
          change: prev ? latest.overall - prev.overall : 0,
        };
      })
      .filter(p => p.curr > 0)
      .sort((a, b) => b.change - a.change);
  }, [evaluations, players, lang]);

  // Compute weekly chart data from evaluations grouped by evaluation_date
  const weeklyData = useMemo(() => {
    // Group by week based on evaluation_date
    const weekMap: Record<string, { performance: number[]; fitness: number[]; tactics: number[]; label: string; sortKey: string }> = {};

    for (const ev of evaluations) {
      if (!ev.evaluation_date) continue;
      const d = new Date(ev.evaluation_date);
      // get ISO week
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weekMap[key]) {
        weekMap[key] = {
          performance: [],
          fitness: [],
          tactics: [],
          label: isRTL ? `أسبوع ${weekStart.getDate()}/${weekStart.getMonth() + 1}` : `Wk ${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
          sortKey: key,
        };
      }
      weekMap[key].performance.push(ev.overall);
      weekMap[key].fitness.push(ev.physical);
      weekMap[key].tactics.push(ev.tactical);
    }

    return Object.values(weekMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
      .map(w => ({
        week: w.label,
        performance: Math.round(w.performance.reduce((s, v) => s + v, 0) / w.performance.length),
        fitness: Math.round(w.fitness.reduce((s, v) => s + v, 0) / w.fitness.length),
        tactics: Math.round(w.tactics.reduce((s, v) => s + v, 0) / w.tactics.length),
      }));
  }, [evaluations, isRTL]);

  // Summary cards computed from latest evaluations
  const summaryCards = useMemo(() => {
    if (weeklyData.length === 0) return [
      { labelAr: "متوسط الأداء", labelEn: "Avg Performance", value: "—", change: "—", color: "#00DCC8" },
      { labelAr: "اللياقة البدنية", labelEn: "Physical Fitness", value: "—", change: "—", color: "#007ABA" },
      { labelAr: "التكتيكات", labelEn: "Tactics", value: "—", change: "—", color: "#F59E0B" },
    ];
    const last = weeklyData[weeklyData.length - 1];
    const first = weeklyData[0];
    return [
      { labelAr: "متوسط الأداء", labelEn: "Avg Performance", value: String(last.performance), change: `+${last.performance - first.performance}`, color: "#00DCC8" },
      { labelAr: "اللياقة البدنية", labelEn: "Physical Fitness", value: String(last.fitness), change: `+${last.fitness - first.fitness}`, color: "#007ABA" },
      { labelAr: "التكتيكات", labelEn: "Tactics", value: String(last.tactics), change: `+${last.tactics - first.tactics}`, color: "#F59E0B" },
    ];
  }, [weeklyData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#00DCC8" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "جاري تحميل بيانات التقدم..." : "Loading progress data..."}
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
            {lang === "ar" ? "حدث خطأ في تحميل البيانات" : "Failed to load data"}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (evaluations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <BarChart3 size={32} className="mx-auto mb-3" style={{ color: "rgba(238,239,238,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "لا توجد تقييمات بعد — ستظهر بيانات التقدم هنا" : "No evaluations yet — progress data will appear here"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1"
          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "تتبع التقدم" : "Progress Tracking"}
        </h1>
        <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "تحليل أداء الفريق خلال الفترات الماضية" : "Team performance analysis over recent periods"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryCards.map((c, i) => (
          <div key={i} className="p-4 rounded-2xl text-center"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-2xl font-black mb-1" style={{ color: c.color, fontFamily: "'Space Grotesk', sans-serif" }}>{c.value}</div>
            <div className="text-xs mb-1" style={{ color: "rgba(238,239,238,0.5)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {isRTL ? c.labelAr : c.labelEn}
            </div>
            {c.change !== "—" && <div className="text-xs font-semibold" style={{ color: "#22c55e" }}>↑ {c.change}%</div>}
          </div>
        ))}
      </div>

      {/* Line Chart */}
      {weeklyData.length > 1 && (
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
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(238,239,238,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
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
      )}

      {/* Player Progress Table */}
      <div className="rounded-2xl p-5"
        style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="font-bold text-white text-sm mb-4"
          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "تقدم اللاعبين" : "Player Progress"}
        </h2>
        {playerProgressData.length > 0 ? (
          <div className="space-y-3">
            {playerProgressData.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate"
                    style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {p.name}
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
        ) : (
          <div className="text-xs text-center py-4" style={{ color: "rgba(238,239,238,0.3)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "لا توجد بيانات تقدم كافية" : "Not enough data for progress tracking"}
          </div>
        )}
      </div>
    </div>
  );
}