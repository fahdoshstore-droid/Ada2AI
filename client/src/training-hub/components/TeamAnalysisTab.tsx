/**
 * TeamAnalysisTab — تحليل الفريق من فيديوهات نادي النهضة
 * يُعرض كـ Tab في لوحة المدرب
 *
 * Features:
 * - عرض جميع اللاعبين المحللين من فيديوهات النهضة
 * - مقارنة بين اللاعبين في جدول واحد
 * - Radar Chart لكل لاعب
 * - زر "تصدير التقرير" PDF
 */
import { useState, useCallback, useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from "recharts";
import {
  Users, BarChart3, Download, TrendingUp, Shield,
  Star, Brain, Activity, Target, Zap, Award,
  ChevronDown, ChevronUp, Eye, Filter, Loader2, AlertCircle
} from "lucide-react";
import { Link } from "wouter";
import { usePlayers } from "@/hooks/usePlayers";
import { useAllEvaluations, type EvaluationWithPlayer } from "@/hooks/useAllEvaluations";

// ── بيانات اللاعبين المحللين من فيديوهات النهضة ──────────────────────────────
export interface NahdaPlayer {
  id: string;
  name: string;
  number: number;
  position: string;
  positionCode: string;
  category: "U14" | "U17" | "U20" | "Senior";
  overallRating: number;
  videoTitle: string;
  analysisDate: string;
  // المؤشرات
  speed: number;
  agility: number;
  explosiveness: number;
  stamina: number;
  ballControl: number;
  dribbling: number;
  firstTouch: number;
  coordination: number;
  footballIQ: number;
  decisionMaking: number;
  resilience: number;
  // Sport DNA
  sportDNA: Record<string, number>;
  // التوصية
  bestPosition: string;
  scoutNote: string;
  saffScore: number;
  confidence: number;
}

// ── Map Player+Evaluation → NahdaPlayer ────────────────────────────────────────
function mapToNahdaPlayer(
  playerId: string,
  playerName: string,
  jerseyNumber: number | undefined,
  position: string | undefined,
  ev: EvaluationWithPlayer
): NahdaPlayer {
  // Derive positionCode from position string
  const posCodeMap: Record<string, string> = {
    "مهاجم": "ST", "مهاجم أيسر": "LW", "مهاجم أيمن": "RW",
    "لاعب وسط": "CM", "صانع ألعاب": "CAM", "محور": "CDM",
    "مدافع": "CB", "مدافع وسط": "CB", "ظهير أيمن": "RB", "ظهير أيسر": "LB",
    "حارس مرمى": "GK", "جناح أيمن": "RW", "جناح يسار": "LW",
    "Forward": "ST", "Midfielder": "CM", "Defender": "CB", "Goalkeeper": "GK",
    "Right Back": "RB", "Left Back": "LB", "Right Wing": "RW", "Left Wing": "LW",
  };
  const posCode = posCodeMap[position || ""] || "CM";

  // Derive category from age or position
  let category: NahdaPlayer["category"] = "U17";
  // We don't have exact age in evaluations; default to U17
  // This could be enhanced with player.age if available

  // Build sportDNA from evaluation dimensions
  const sportDNA: Record<string, number> = {};
  const posPriority: Record<string, string[]> = {
    ST: ["ST", "RW", "LW", "CAM", "CM", "CB"],
    RW: ["RW", "LW", "ST", "CAM", "CM", "CB"],
    LW: ["LW", "RW", "ST", "CAM", "CM", "CB"],
    CM: ["CM", "CAM", "CDM", "RW", "ST", "CB"],
    CAM: ["CAM", "CM", "RW", "LW", "ST", "CB"],
    CDM: ["CDM", "CM", "CB", "RB", "LB", "GK"],
    CB: ["CB", "CDM", "RB", "LB", "CM", "ST"],
    RB: ["RB", "RW", "CB", "CM", "CDM", "ST"],
    LB: ["LB", "LW", "CB", "CM", "CDM", "ST"],
    GK: ["GK", "CB", "CDM", "RB", "LB", "CM"],
  };
  const positions = posPriority[posCode] || ["CM", "CAM", "CDM", "ST", "CB", "RW"];
  for (const p of positions) {
    sportDNA[p] = Math.max(30, Math.min(95, ev.overall + (p === posCode ? 5 : -Math.random() * 15 | 0)));
  }

  return {
    id: playerId,
    name: playerName,
    number: jerseyNumber || 0,
    position: position || "لاعب وسط",
    positionCode: posCode,
    category,
    overallRating: ev.overall,
    videoTitle: ev.notes || "تقييم تدريبي",
    analysisDate: ev.evaluation_date
      ? new Date(ev.evaluation_date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
      : new Date(ev.created_at || "").toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }),
    speed: ev.physical,
    agility: Math.round((ev.physical + ev.technical) / 2),
    explosiveness: ev.physical,
    stamina: ev.physical,
    ballControl: ev.technical,
    dribbling: Math.round((ev.technical + ev.tactical) / 2),
    firstTouch: ev.technical,
    coordination: Math.round((ev.technical + ev.mental) / 2),
    footballIQ: ev.mental,
    decisionMaking: ev.tactical,
    resilience: ev.mental,
    sportDNA,
    bestPosition: position || "لاعب وسط",
    scoutNote: ev.notes || "",
    saffScore: ev.overall,
    confidence: Math.min(100, ev.overall + 5),
  };
}

// ── مساعدات ───────────────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 85) return "#00C2A8";
  if (score >= 70) return "#007ABA";
  if (score >= 55) return "#FFA500";
  return "#EF4444";
}

function getCategoryColor(cat: NahdaPlayer["category"]) {
  const map: Record<string, string> = { U14: "#00C2A8", U17: "#007ABA", U20: "#FFA500", Senior: "#EF4444" };
  return map[cat] || "#00C2A8";
}

// ── Radar Chart Data Builder ──────────────────────────────────────────────────
function buildRadarData(player: NahdaPlayer) {
  return [
    { subject: "السرعة", value: player.speed },
    { subject: "الرشاقة", value: player.agility },
    { subject: "التحكم", value: player.ballControl },
    { subject: "الذكاء", value: player.footballIQ },
    { subject: "الصمود", value: player.resilience },
    { subject: "التنسيق", value: player.coordination },
  ];
}

// ── تصدير PDF ─────────────────────────────────────────────────────────────────
function exportToPDF(players: NahdaPlayer[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير تحليل فريق نادي النهضة — Ada2ai</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Cairo', Arial, sans-serif; background: #fff; color: #1a1a2e; direction: rtl; }
    .header { background: linear-gradient(135deg, #007ABA, #00C2A8); color: white; padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header-title { font-size: 22px; font-weight: 900; }
    .header-sub { font-size: 13px; opacity: 0.8; margin-top: 4px; }
    .logos { display: flex; align-items: center; gap: 12px; }
    .logo-box { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .section { padding: 24px 32px; }
    .section-title { font-size: 16px; font-weight: 700; color: #007ABA; margin-bottom: 16px; border-bottom: 2px solid #007ABA; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #007ABA; color: white; padding: 8px 12px; text-align: center; font-weight: 700; }
    td { padding: 8px 12px; text-align: center; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f8fafc; }
    .score { font-weight: 900; font-size: 14px; }
    .score-high { color: #00C2A8; }
    .score-mid { color: #007ABA; }
    .score-low { color: #FFA500; }
    .player-card { background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
    .player-name { font-size: 16px; font-weight: 900; color: #1a1a2e; }
    .player-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
    .scout-note { font-size: 12px; color: #374151; margin-top: 8px; line-height: 1.6; }
    .footer { text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; margin-top: 24px; }
    @media print { body { -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="header-title">تقرير تحليل فريق نادي النهضة</div>
      <div class="header-sub">بالتعاون مع Ada2ai · معايير SAFF + FIFA · ${new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
    <div class="logos">
      <div class="logo-box">🏆</div>
      <div style="color:white;font-size:12px;">×</div>
      <div class="logo-box" style="font-family:monospace;font-size:14px;font-weight:900;">A2</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">ملخص أداء الفريق</div>
    <table>
      <thead>
        <tr>
          <th>اللاعب</th>
          <th>المركز</th>
          <th>الفئة</th>
          <th>التقييم الكلي</th>
          <th>السرعة</th>
          <th>التحكم</th>
          <th>الذكاء</th>
          <th>معيار SAFF</th>
          <th>الثقة</th>
        </tr>
      </thead>
      <tbody>
        ${players.map(p => `
        <tr>
          <td style="font-weight:700;text-align:right;">${p.name} #${p.number}</td>
          <td>${p.position}</td>
          <td>${p.category}</td>
          <td class="score ${p.overallRating >= 85 ? 'score-high' : p.overallRating >= 70 ? 'score-mid' : 'score-low'}">${p.overallRating}</td>
          <td>${p.speed}</td>
          <td>${p.ballControl}</td>
          <td>${p.footballIQ}</td>
          <td>${p.saffScore}</td>
          <td>${p.confidence}%</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">تقارير الكشافة التفصيلية</div>
    ${players.map(p => `
    <div class="player-card">
      <div class="player-name">${p.name} — #${p.number} — ${p.position}</div>
      <div class="player-meta">${p.category} · ${p.videoTitle} · تحليل: ${p.analysisDate}</div>
      <div class="scout-note">
        <strong>توصية الكشاف:</strong> ${p.scoutNote || "لا توجد ملاحظات"}
      </div>
      <div style="margin-top:8px;display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:#6b7280;">
        <span>السرعة: <strong style="color:#007ABA">${p.speed}</strong></span>
        <span>الرشاقة: <strong style="color:#007ABA">${p.agility}</strong></span>
        <span>الانفجارية: <strong style="color:#007ABA">${p.explosiveness}</strong></span>
        <span>التحمل: <strong style="color:#007ABA">${p.stamina}</strong></span>
        <span>التحكم: <strong style="color:#00C2A8">${p.ballControl}</strong></span>
        <span>المراوغة: <strong style="color:#00C2A8">${p.dribbling}</strong></span>
        <span>الذكاء: <strong style="color:#FFA500">${p.footballIQ}</strong></span>
        <span>القرار: <strong style="color:#FFA500">${p.decisionMaking}</strong></span>
      </div>
    </div>`).join("")}
  </div>

  <div class="footer">
    Ada2ai × نادي النهضة — تقرير تحليل الفريق · جميع الحقوق محفوظة 2026
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// ── المكوّن الرئيسي ────────────────────────────────────────────────────────────
interface TeamAnalysisTabProps {
  lang?: "ar" | "en";
  externalPlayers?: NahdaPlayer[];
}

export default function TeamAnalysisTab({ lang = "ar", externalPlayers }: TeamAnalysisTabProps) {
  const isRTL = lang === "ar";
  const font = "'Cairo', sans-serif";

  const { players, isLoading: playersLoading, isError: playersError } = usePlayers();
  const { evaluations, isLoading: evalLoading, isError: evalError } = useAllEvaluations();

  // Build NahdaPlayer[] from real data (or use external override)
  const nahdaPlayers = useMemo(() => {
    if (externalPlayers && externalPlayers.length > 0) return externalPlayers;

    // Map players + evaluations → NahdaPlayer[]
    const evalByPlayer: Record<string, EvaluationWithPlayer> = {};
    for (const ev of evaluations) {
      // Keep only the latest evaluation per player (already sorted desc)
      if (!evalByPlayer[ev.player_id]) evalByPlayer[ev.player_id] = ev;
    }

    return players
      .filter(p => evalByPlayer[p.id])
      .map(p => {
        const ev = evalByPlayer[p.id];
        return mapToNahdaPlayer(p.id, p.profile?.full_name || "", p.jersey_number, p.position, ev);
      });
  }, [externalPlayers, players, evaluations]);

  const [selectedPlayer, setSelectedPlayer] = useState<NahdaPlayer | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"overallRating" | "speed" | "ballControl" | "footballIQ">("overallRating");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [view, setView] = useState<"table" | "cards">("table");

  const isLoading = playersLoading || evalLoading;
  const isError = playersError || evalError;

  const filteredPlayers = nahdaPlayers
    .filter(p => filterCategory === "all" || p.category === filterCategory)
    .sort((a, b) => {
      const diff = a[sortBy] - b[sortBy];
      return sortDir === "desc" ? -diff : diff;
    });

  const toggleSort = useCallback((field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortDir("desc"); }
  }, [sortBy]);

  const teamAvg = nahdaPlayers.length > 0 ? {
    overall: Math.round(nahdaPlayers.reduce((s, p) => s + p.overallRating, 0) / nahdaPlayers.length),
    speed: Math.round(nahdaPlayers.reduce((s, p) => s + p.speed, 0) / nahdaPlayers.length),
    technical: Math.round(nahdaPlayers.reduce((s, p) => s + p.ballControl, 0) / nahdaPlayers.length),
    mental: Math.round(nahdaPlayers.reduce((s, p) => s + p.footballIQ, 0) / nahdaPlayers.length),
    saff: Math.round(nahdaPlayers.reduce((s, p) => s + p.saffScore, 0) / nahdaPlayers.length),
  } : { overall: 0, speed: 0, technical: 0, mental: 0, saff: 0 };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "#00C2A8" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: font }}>
            {isRTL ? "جاري تحميل بيانات الفريق..." : "Loading team data..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center py-20" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: "#ef4444" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: font }}>
            {isRTL ? "حدث خطأ في تحميل البيانات" : "Failed to load team data"}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (nahdaPlayers.length === 0) {
    return (
      <div className="flex items-center justify-center py-20" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <div className="text-center">
          <Users size={32} className="mx-auto mb-3" style={{ color: "rgba(238,239,238,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: font }}>
            {isRTL ? "لا يوجد لاعبون محللون بعد — ستظهر البيانات عند إجراء التقييمات" : "No analyzed players yet — data will appear when evaluations are made"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>

      {/* ── Header البراندينق ──────────────────────────────────────────────── */}
      <div className="rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, rgba(0,122,186,0.08), rgba(0,194,168,0.08))", border: "1px solid rgba(0,194,168,0.2)" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: "linear-gradient(135deg, #007ABA, #00C2A8)" }}>
            🏆
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: "linear-gradient(135deg, #00C2A8, #007ABA)", fontFamily: "'Orbitron', sans-serif", color: "#000A0F" }}>
            A2
          </div>
          <div>
            <div className="font-bold text-base" style={{ fontFamily: font, color: "#00C2A8" }}>
              تحليل فريق نادي النهضة
            </div>
            <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>
              {nahdaPlayers.length} لاعب محلل · معايير SAFF + FIFA · بالتعاون مع Ada2ai
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/demo/nahda">
            <button className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
              style={{ background: "rgba(0,194,168,0.1)", color: "#00C2A8", border: "1px solid rgba(0,194,168,0.2)", fontFamily: font }}>
              <Eye size={14} />
              تحليل فيديو جديد
            </button>
          </Link>
          <button
            onClick={() => exportToPDF(filteredPlayers)}
            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            style={{ background: "linear-gradient(135deg, #007ABA, #00C2A8)", color: "#000A0F", fontFamily: font }}>
            <Download size={14} />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* ── إحصائيات الفريق ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "التقييم الكلي", value: teamAvg.overall, icon: <Star size={16} />, color: "#00C2A8" },
          { label: "متوسط السرعة", value: teamAvg.speed, icon: <Zap size={16} />, color: "#007ABA" },
          { label: "المستوى التقني", value: teamAvg.technical, icon: <Target size={16} />, color: "#FFA500" },
          { label: "الذكاء الكروي", value: teamAvg.mental, icon: <Brain size={16} />, color: "#00C2A8" },
          { label: "معيار SAFF", value: teamAvg.saff, icon: <Shield size={16} />, color: "#007ABA" },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-center mb-2" style={{ color: stat.color }}>{stat.icon}</div>
            <div className="text-2xl font-black mb-0.5" style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── أدوات التصفية والعرض ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* تصفية الفئة */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {["all", "U14", "U17", "U20", "Senior"].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filterCategory === cat ? "rgba(0,194,168,0.15)" : "transparent",
                color: filterCategory === cat ? "#00C2A8" : "rgba(238,239,238,0.4)",
                fontFamily: font,
              }}>
              {cat === "all" ? "الكل" : cat}
            </button>
          ))}
        </div>
        {/* تبديل العرض */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setView("table")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: view === "table" ? "rgba(0,122,186,0.15)" : "transparent", color: view === "table" ? "#007ABA" : "rgba(238,239,238,0.4)", fontFamily: font }}>
            جدول
          </button>
          <button
            onClick={() => setView("cards")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: view === "cards" ? "rgba(0,122,186,0.15)" : "transparent", color: view === "cards" ? "#007ABA" : "rgba(238,239,238,0.4)", fontFamily: font }}>
            بطاقات
          </button>
        </div>
        <div className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>
          {filteredPlayers.length} لاعب
        </div>
      </div>

      {/* ── عرض الجدول ───────────────────────────────────────────────────────── */}
      {view === "table" && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(0,122,186,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-right p-3 font-semibold" style={{ fontFamily: font, color: "rgba(238,239,238,0.6)", minWidth: 160 }}>اللاعب</th>
                  <th className="text-center p-3 font-semibold" style={{ fontFamily: font, color: "rgba(238,239,238,0.6)" }}>الفئة</th>
                  <th
                    className="text-center p-3 font-semibold cursor-pointer select-none"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: sortBy === "overallRating" ? "#00C2A8" : "rgba(238,239,238,0.6)" }}
                    onClick={() => toggleSort("overallRating")}>
                    OVR {sortBy === "overallRating" && (sortDir === "desc" ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)}
                  </th>
                  <th
                    className="text-center p-3 font-semibold cursor-pointer select-none"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: sortBy === "speed" ? "#00C2A8" : "rgba(238,239,238,0.6)" }}
                    onClick={() => toggleSort("speed")}>
                    السرعة {sortBy === "speed" && (sortDir === "desc" ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)}
                  </th>
                  <th
                    className="text-center p-3 font-semibold cursor-pointer select-none"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: sortBy === "ballControl" ? "#00C2A8" : "rgba(238,239,238,0.6)" }}
                    onClick={() => toggleSort("ballControl")}>
                    التحكم {sortBy === "ballControl" && (sortDir === "desc" ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)}
                  </th>
                  <th
                    className="text-center p-3 font-semibold cursor-pointer select-none"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: sortBy === "footballIQ" ? "#00C2A8" : "rgba(238,239,238,0.6)" }}
                    onClick={() => toggleSort("footballIQ")}>
                    الذكاء {sortBy === "footballIQ" && (sortDir === "desc" ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />)}
                  </th>
                  <th className="text-center p-3 font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "rgba(238,239,238,0.6)" }}>SAFF</th>
                  <th className="text-center p-3 font-semibold" style={{ fontFamily: font, color: "rgba(238,239,238,0.6)" }}>الثقة</th>
                  <th className="text-center p-3 font-semibold" style={{ fontFamily: font, color: "rgba(238,239,238,0.6)" }}>Radar</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, i) => (
                  <tr
                    key={player.id}
                    className="cursor-pointer transition-all"
                    onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
                    style={{
                      background: selectedPlayer?.id === player.id
                        ? "rgba(0,194,168,0.06)"
                        : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                    {/* اللاعب */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, #007ABA, ${getScoreColor(player.overallRating)})`, color: "#000A0F" }}>
                          {player.number}
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ fontFamily: font }}>{player.name}</div>
                          <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>{player.position}</div>
                        </div>
                      </div>
                    </td>
                    {/* الفئة */}
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: getCategoryColor(player.category) + "22", color: getCategoryColor(player.category), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {player.category}
                      </span>
                    </td>
                    {/* OVR */}
                    <td className="p-3 text-center">
                      <span className="font-black text-base" style={{ color: getScoreColor(player.overallRating), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {player.overallRating}
                      </span>
                    </td>
                    {/* السرعة */}
                    <td className="p-3 text-center">
                      <span className="font-semibold text-sm" style={{ color: getScoreColor(player.speed), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {player.speed}
                      </span>
                    </td>
                    {/* التحكم */}
                    <td className="p-3 text-center">
                      <span className="font-semibold text-sm" style={{ color: getScoreColor(player.ballControl), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {player.ballControl}
                      </span>
                    </td>
                    {/* الذكاء */}
                    <td className="p-3 text-center">
                      <span className="font-semibold text-sm" style={{ color: getScoreColor(player.footballIQ), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {player.footballIQ}
                      </span>
                    </td>
                    {/* SAFF */}
                    <td className="p-3 text-center">
                      <span className="font-semibold text-sm" style={{ color: getScoreColor(player.saffScore), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {player.saffScore}
                      </span>
                    </td>
                    {/* الثقة */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-white/5">
                          <div className="h-full rounded-full" style={{ width: `${player.confidence}%`, background: "linear-gradient(90deg, #007ABA, #00C2A8)" }} />
                        </div>
                        <span className="text-xs" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Space Grotesk', sans-serif" }}>{player.confidence}%</span>
                      </div>
                    </td>
                    {/* Radar toggle */}
                    <td className="p-3 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedPlayer(selectedPlayer?.id === player.id ? null : player); }}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ background: selectedPlayer?.id === player.id ? "rgba(0,194,168,0.15)" : "rgba(255,255,255,0.04)", color: selectedPlayer?.id === player.id ? "#00C2A8" : "rgba(238,239,238,0.3)" }}>
                        <BarChart3 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Radar Chart للاعب المختار */}
          {selectedPlayer && (
            <div className="p-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,194,168,0.03)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar */}
                <div>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2"
                    style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <BarChart3 size={14} /> Radar Chart — {selectedPlayer.name}
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={buildRadarData(selectedPlayer)}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "rgba(238,239,238,0.5)", fontSize: 11, fontFamily: "'Cairo', sans-serif" }}
                      />
                      <Radar
                        name={selectedPlayer.name}
                        dataKey="value"
                        stroke="#00C2A8"
                        fill="#00C2A8"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{ background: "#0D1220", border: "1px solid rgba(0,194,168,0.2)", borderRadius: 8, fontFamily: "'Cairo', sans-serif" }}
                        labelStyle={{ color: "#00C2A8" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {/* تفاصيل */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold mb-2" style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                    توصية الكشاف
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: "rgba(238,239,238,0.7)", fontFamily: font }}>
                    {selectedPlayer.scoutNote || "لا توجد ملاحظات متاحة"}
                  </div>
                  <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="text-xs mb-2" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>Sport DNA</div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(selectedPlayer.sportDNA).slice(0, 6).map(([pos, score]) => (
                        <div key={pos} className="text-center p-2 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="text-xs font-black" style={{ color: getScoreColor(score as number), fontFamily: "'Space Grotesk', sans-serif" }}>{score}</div>
                          <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>{pos}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── عرض البطاقات ─────────────────────────────────────────────────────── */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlayers.map(player => (
            <div
              key={player.id}
              className="rounded-2xl p-5 cursor-pointer transition-all"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: selectedPlayer?.id === player.id ? "1px solid rgba(0,194,168,0.3)" : "1px solid rgba(255,255,255,0.06)",
              }}
              onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                  style={{ background: `linear-gradient(135deg, #007ABA, ${getScoreColor(player.overallRating)})`, color: "#000A0F" }}>
                  {player.number}
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ fontFamily: font }}>{player.name}</div>
                  <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>{player.position}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black" style={{ color: getScoreColor(player.overallRating), fontFamily: "'Space Grotesk', sans-serif" }}>
                    {player.overallRating}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>OVR</div>
                </div>
              </div>

              {/* Radar Chart */}
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={buildRadarData(player)}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(238,239,238,0.4)", fontSize: 10, fontFamily: "'Cairo', sans-serif" }}
                  />
                  <Radar
                    name={player.name}
                    dataKey="value"
                    stroke={getCategoryColor(player.category)}
                    fill={getCategoryColor(player.category)}
                    fillOpacity={0.12}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: getCategoryColor(player.category) + "22", color: getCategoryColor(player.category), fontFamily: "'Space Grotesk', sans-serif" }}>
                  {player.category}
                </span>
                <span className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: font }}>
                  SAFF: {player.saffScore}
                </span>
                <span className="text-xs" style={{ color: "rgba(238,239,238,0.3)", fontFamily: font }}>
                  {player.confidence}% ثقة
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── مقارنة الرادار لجميع اللاعبين ───────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="text-xs font-semibold mb-4 flex items-center gap-2"
          style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
          <TrendingUp size={14} /> مقارنة أداء الفريق
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredPlayers.slice(0, 5).map(player => (
            <div key={player.id} className="text-center">
              <div className="text-xs font-bold mb-1 truncate" style={{ fontFamily: font, color: "rgba(238,239,238,0.7)" }}>
                {player.name.split(" ")[0]}
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <RadarChart data={buildRadarData(player)}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={false} />
                  <Radar
                    dataKey="value"
                    stroke={getCategoryColor(player.category)}
                    fill={getCategoryColor(player.category)}
                    fillOpacity={0.2}
                    strokeWidth={1.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="font-black text-sm" style={{ color: getScoreColor(player.overallRating), fontFamily: "'Space Grotesk', sans-serif" }}>
                {player.overallRating}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="text-center text-xs py-2" style={{ color: "rgba(238,239,238,0.2)", fontFamily: font }}>
        Ada2ai × نادي النهضة — تحليل الفريق بمعايير SAFF + FIFA
      </div>
    </div>
  );
}