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
import { useState, useCallback } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from "recharts";
import {
  Users, BarChart3, Download, TrendingUp, Shield,
  Star, Brain, Activity, Target, Zap, Award,
  ChevronDown, ChevronUp, Eye, Filter
} from "lucide-react";
import { Link } from "wouter";

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

// بيانات تجريبية للعرض (تُستبدل بالبيانات الحقيقية من التحليل)
const defaultNahdaPlayers: NahdaPlayer[] = [
  {
    id: "nahda-001",
    name: "أحمد المطيري",
    number: 10,
    position: "جناح أيمن",
    positionCode: "RW",
    category: "U17",
    overallRating: 82,
    videoTitle: "تدريب تقني — فئة U17",
    analysisDate: "30 مارس 2026",
    speed: 85, agility: 82, explosiveness: 78, stamina: 80,
    ballControl: 88, dribbling: 86, firstTouch: 84, coordination: 80,
    footballIQ: 78, decisionMaking: 75, resilience: 72,
    sportDNA: { RW: 88, LW: 75, ST: 70, CAM: 72, CM: 60, CB: 40 },
    bestPosition: "جناح أيمن",
    scoutNote: "موهبة واعدة بسرعة استثنائية ومراوغة متقدمة. يحتاج تطوير القدم الضعيفة.",
    saffScore: 79,
    confidence: 85,
  },
  {
    id: "nahda-002",
    name: "محمد الغامدي",
    number: 6,
    position: "لاعب وسط",
    positionCode: "CM",
    category: "U17",
    overallRating: 79,
    videoTitle: "تدريب تقني — فئة U17",
    analysisDate: "30 مارس 2026",
    speed: 74, agility: 80, explosiveness: 72, stamina: 88,
    ballControl: 82, dribbling: 76, firstTouch: 85, coordination: 84,
    footballIQ: 88, decisionMaking: 86, resilience: 82,
    sportDNA: { CM: 88, CAM: 82, CDM: 75, RW: 55, ST: 50, CB: 45 },
    bestPosition: "لاعب وسط",
    scoutNote: "ذكاء كروي عالٍ ورؤية ممتازة. يُعدّ من أفضل لاعبي الوسط في الفئة.",
    saffScore: 82,
    confidence: 88,
  },
  {
    id: "nahda-003",
    name: "خالد الزهراني",
    number: 9,
    position: "مهاجم",
    positionCode: "ST",
    category: "U20",
    overallRating: 85,
    videoTitle: "تدريب بدني — فئة U20",
    analysisDate: "30 مارس 2026",
    speed: 90, agility: 84, explosiveness: 88, stamina: 82,
    ballControl: 80, dribbling: 78, firstTouch: 82, coordination: 76,
    footballIQ: 80, decisionMaking: 82, resilience: 85,
    sportDNA: { ST: 90, RW: 80, LW: 75, CAM: 70, CM: 55, CB: 35 },
    bestPosition: "مهاجم",
    scoutNote: "انفجارية عالية وسرعة قصوى ممتازة. مؤهل للمشاركة في الفريق الأول.",
    saffScore: 86,
    confidence: 90,
  },
  {
    id: "nahda-004",
    name: "عبدالرحمن القرني",
    number: 4,
    position: "مدافع",
    positionCode: "CB",
    category: "U20",
    overallRating: 78,
    videoTitle: "تدريب بدني — فئة U20",
    analysisDate: "30 مارس 2026",
    speed: 76, agility: 78, explosiveness: 80, stamina: 85,
    ballControl: 72, dribbling: 68, firstTouch: 74, coordination: 78,
    footballIQ: 82, decisionMaking: 84, resilience: 88,
    sportDNA: { CB: 88, CDM: 80, RB: 72, LB: 70, CM: 60, ST: 30 },
    bestPosition: "مدافع وسط",
    scoutNote: "قيادة دفاعية قوية وصمود نفسي ممتاز. يحتاج تطوير التوزيع بالكرة.",
    saffScore: 80,
    confidence: 82,
  },
  {
    id: "nahda-005",
    name: "فيصل العسيري",
    number: 1,
    position: "حارس مرمى",
    positionCode: "GK",
    category: "Senior",
    overallRating: 83,
    videoTitle: "مباراة تدريبية — الفريق الأول",
    analysisDate: "30 مارس 2026",
    speed: 72, agility: 82, explosiveness: 78, stamina: 80,
    ballControl: 75, dribbling: 60, firstTouch: 78, coordination: 85,
    footballIQ: 86, decisionMaking: 88, resilience: 90,
    sportDNA: { GK: 92, CB: 55, CDM: 40, CM: 35, RB: 30, ST: 15 },
    bestPosition: "حارس مرمى",
    scoutNote: "ردود فعل استثنائية وقراءة ممتازة للعبة. من أفضل حراس الدوري السعودي.",
    saffScore: 85,
    confidence: 92,
  },
];

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
        <strong>توصية الكشاف:</strong> ${p.scoutNote}
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
  const players = externalPlayers && externalPlayers.length > 0 ? externalPlayers : defaultNahdaPlayers;

  const [selectedPlayer, setSelectedPlayer] = useState<NahdaPlayer | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"overallRating" | "speed" | "ballControl" | "footballIQ">("overallRating");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [view, setView] = useState<"table" | "cards">("table");

  const filteredPlayers = players
    .filter(p => filterCategory === "all" || p.category === filterCategory)
    .sort((a, b) => {
      const diff = a[sortBy] - b[sortBy];
      return sortDir === "desc" ? -diff : diff;
    });

  const toggleSort = useCallback((field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortDir("desc"); }
  }, [sortBy]);

  const teamAvg = {
    overall: Math.round(players.reduce((s, p) => s + p.overallRating, 0) / players.length),
    speed: Math.round(players.reduce((s, p) => s + p.speed, 0) / players.length),
    technical: Math.round(players.reduce((s, p) => s + p.ballControl, 0) / players.length),
    mental: Math.round(players.reduce((s, p) => s + p.footballIQ, 0) / players.length),
    saff: Math.round(players.reduce((s, p) => s + p.saffScore, 0) / players.length),
  };

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
              {players.length} لاعب محلل · معايير SAFF + FIFA · بالتعاون مع Ada2ai
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
                    {selectedPlayer.scoutNote}
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
