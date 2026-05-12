import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo } from "react";

import { useLocation, useSearch } from "wouter";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  GitCompare,
  Star,
  TrendingUp,
  Zap,
  Target,
  Award,
  MessageCircle,
  ArrowLeft,
  ChevronRight,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usePlayers } from "@/hooks/usePlayers";
import { useEvaluations } from "@/hooks/useEvaluations";
import type { Player } from "@/lib/supabase";

const playerColors = [
  { stroke: "oklch(0.65 0.2 145)", fill: "oklch(0.65 0.2 145)", label: "اللاعب الأول" },
  { stroke: "oklch(0.65 0.22 25)", fill: "oklch(0.65 0.22 25)", label: "اللاعب الثاني" },
];

// Helper to get display name from a Player (with joined profile)
function getPlayerName(p: Player, lang: "ar" | "en"): string {
  if (lang === "ar") return p.profile?.full_name || `لاعب ${p.id.slice(0, 6)}`;
  return p.profile?.full_name || `Player ${p.id.slice(0, 6)}`;
}

function getPlayerPosition(p: Player, lang: "ar" | "en"): string {
  return p.position || (lang === "ar" ? "غير محدد" : "Unspecified");
}

function getPlayerCity(p: Player, lang: "ar" | "en"): string {
  return p.profile?.city || (lang === "ar" ? "غير محدد" : "Unspecified");
}

export default function Compare() {
  const { isRTL, t, lang } = useLanguage();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const { players, isLoading, isError } = usePlayers();

  const [p1Id, setP1Id] = useState<string | null>(null);
  const [p2Id, setP2Id] = useState<string | null>(null);

  // Set initial selections once players load
  useMemo(() => {
    if (players.length >= 2 && !p1Id && !p2Id) {
      const initP1 = params.get("p1") || players[0].id;
      const initP2 = params.get("p2") || players[1].id;
      setP1Id(initP1);
      setP2Id(initP2);
    }
  }, [players]);

  const p1 = players.find((p) => p.id === p1Id) || players[0] || null;
  const p2 = players.find((p) => p.id === p2Id) || players[1] || null;

  // Fetch evaluations for both selected players
  const { evaluations: p1Evals } = useEvaluations(p1?.id ?? null);
  const { evaluations: p2Evals } = useEvaluations(p2?.id ?? null);

  // Use latest evaluation for stats, fall back to defaults
  const p1LatestEval = p1Evals?.[0];
  const p2LatestEval = p2Evals?.[0];

  // Build radar data from evaluations (or defaults)
  const radarData = useMemo(() => {
    const makeMetric = (labelAr: string, labelEn: string, v1: number, v2: number) => ({
      subject: lang === "ar" ? labelAr : labelEn,
      p1: v1,
      p2: v2,
    });
    return [
      makeMetric("السرعة", "Speed", p1LatestEval?.physical ?? 0, p2LatestEval?.physical ?? 0),
      makeMetric("المهارة", "Skill", p1LatestEval?.technical ?? 0, p2LatestEval?.technical ?? 0),
      makeMetric("التكتيك", "Tactics", p1LatestEval?.tactical ?? 0, p2LatestEval?.tactical ?? 0),
      makeMetric("اللياقة", "Fitness", p1LatestEval?.physical ?? 0, p2LatestEval?.physical ?? 0),
      makeMetric("التمرير", "Passing", p1LatestEval?.technical ?? 0, p2LatestEval?.technical ?? 0),
      makeMetric("التسديد", "Shooting", p1LatestEval?.mental ?? 0, p2LatestEval?.mental ?? 0),
    ];
  }, [p1LatestEval, p2LatestEval, lang]);

  const barData = useMemo(() => {
    const makeBar = (nameAr: string, nameEn: string, v1: number, v2: number) => ({
      name: lang === "ar" ? nameAr : nameEn,
      p1: v1,
      p2: v2,
    });
    return [
      makeBar("التقييم", "Score", p1LatestEval?.overall ?? 0, p2LatestEval?.overall ?? 0),
      makeBar("السرعة", "Speed", p1LatestEval?.physical ?? 0, p2LatestEval?.physical ?? 0),
      makeBar("المهارة", "Skill", p1LatestEval?.technical ?? 0, p2LatestEval?.technical ?? 0),
      makeBar("التكتيك", "Tactics", p1LatestEval?.tactical ?? 0, p2LatestEval?.tactical ?? 0),
      makeBar("الذهنية", "Mental", p1LatestEval?.mental ?? 0, p2LatestEval?.mental ?? 0),
    ];
  }, [p1LatestEval, p2LatestEval, lang]);

  const winner = p1LatestEval && p2LatestEval
    ? p1LatestEval.overall > p2LatestEval.overall ? p1
    : p2LatestEval.overall > p1LatestEval.overall ? p2 : null
    : null;

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
        <Ada2aiNavbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <Loader2 className="w-10 h-10 text-[oklch(0.65_0.2_145)] animate-spin" />
          <p className="text-[#EEEFEE]/50 text-lg" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "جارٍ تحميل بيانات اللاعبين..." : "Loading player data..."}
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (isError) {
    return (
      <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
        <Ada2aiNavbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-red-400 text-lg" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "حدث خطأ أثناء تحميل البيانات" : "Error loading player data"}
          </p>
        </div>
      </div>
    );
  }

  // ── Empty state ──
  if (players.length === 0) {
    return (
      <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
        <Ada2aiNavbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <Users className="w-10 h-10 text-[#EEEFEE]/30" />
          <p className="text-[#EEEFEE]/50 text-lg" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "لا يوجد لاعبون بعد. أضف لاعبين لمقارنتهم." : "No players yet. Add players to compare them."}
          </p>
        </div>
      </div>
    );
  }

  const PlayerSelector = ({ value, onChange, exclude }: { value: string | null; onChange: (id: string) => void; exclude: string | null }) => (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-3 py-2 text-[#EEEFEE] text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)] w-full"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      {players.filter((p) => p.id !== exclude).map((p) => (
        <option key={p.id} value={p.id}>{getPlayerName(p, lang)} — {getPlayerPosition(p, lang)} · {getPlayerCity(p, lang)}</option>
      ))}
    </select>
  );

  const StatRow = ({ label, v1, v2 }: { label: string; v1: number; v2: number }) => {
    const better = v1 > v2 ? "p1" : v2 > v1 ? "p2" : "tie";
    return (
      <div className="grid grid-cols-7 items-center gap-2 py-2 border-b border-white/5">
        <div className="col-span-2 text-left">
          <span className={`text-sm font-bold ${better === "p1" ? "text-[oklch(0.65_0.2_145)]" : "text-[#EEEFEE]/50"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{v1}</span>
        </div>
        <div className="col-span-3 text-center text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{label}</div>
        <div className="col-span-2 text-right">
          <span className={`text-sm font-bold ${better === "p2" ? "text-[oklch(0.65_0.22_25)]" : "text-[#EEEFEE]/50"}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{v2}</span>
        </div>
      </div>
    );
  };

  // No players selected yet
  if (!p1 || !p2) {
    return (
      <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
        <Ada2aiNavbar />
        <div className="flex flex-col items-center justify-center pt-40 gap-4">
          <Users className="w-10 h-10 text-[#EEEFEE]/30" />
          <p className="text-[#EEEFEE]/50 text-lg" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "اختر لاعبين للمقارنة" : "Select players to compare"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />

      {/* Header */}
      <section className="pt-24 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="tag-green mb-4">{t("compare.title")}</span>
          <h1 className="text-4xl md:text-5xl font-black text-[#EEEFEE] mb-3 mt-4" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
            {t("compare.title")}
          </h1>
          <p className="text-[#EEEFEE]/50 text-lg" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {t("compare.sub")}
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">

          {/* Player selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
            <div>
              <label className="text-[oklch(0.65_0.2_145)] text-xs font-bold mb-2 block flex items-center gap-1" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.2_145)]" /> {t("compare.select1")}
              </label>
              <PlayerSelector value={p1Id} onChange={setP1Id} exclude={p2Id} />
            </div>
            <div>
              <label className="text-[oklch(0.65_0.22_25)] text-xs font-bold mb-2 block flex items-center gap-1" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.22_25)]" /> {t("compare.select2")}
              </label>
              <PlayerSelector value={p2Id} onChange={setP2Id} exclude={p1Id} />
            </div>
          </div>

          {/* Player cards header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
            {[p1, p2].map((player, idx) => (
              <div
                key={player.id}
                className="card-dark rounded-xl p-5"
                style={{ borderTop: `3px solid ${idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)"}` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0"
                    style={{
                      background: idx === 0 ? "oklch(0.65 0.2 145 / 0.15)" : "oklch(0.65 0.22 25 / 0.15)",
                      color: idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {getPlayerName(player, lang).charAt(0)}
                  </div>
                  <div>
                    <div className="text-[#EEEFEE] font-bold flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      {getPlayerName(player, lang)}
                      {winner?.id === player.id && <span className="text-yellow-400 text-xs">🏆 {t("compare.winner")}</span>}
                    </div>
                    <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      {getPlayerPosition(player, lang)} · {player.age || "?"} {lang === "ar" ? "سنة" : "y/o"} · {getPlayerCity(player, lang)}
                    </div>
                  </div>
                  <div
                    className="mr-auto text-3xl font-black"
                    style={{ color: idx === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {(idx === 0 ? p1LatestEval?.overall : p2LatestEval?.overall) ?? "—"}
                  </div>
                </div>
                <div className="text-[#EEEFEE]/35 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {player.profile?.city || player.achievements || ""}
                </div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          {p1LatestEval && p2LatestEval ? (
            <div className="card-dark rounded-2xl p-6 mb-5 max-w-3xl mx-auto">
              <h3 className="text-[#EEEFEE] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                <GitCompare size={16} className="neon-text" /> {lang === "ar" ? "خريطة المهارات المقارنة" : "Skills Comparison Map"}
              </h3>
              <div className="flex gap-4 mb-2">
                {[p1, p2].map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: i === 0 ? "oklch(0.65 0.2 145)" : "oklch(0.65 0.22 25)" }} />
                    <span className="text-[#EEEFEE]/50 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{getPlayerName(p, lang)}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "'Tajawal', sans-serif" }}
                  />
                  <Radar name={getPlayerName(p1, lang)} dataKey="p1" stroke="oklch(0.65 0.2 145)" fill="oklch(0.65 0.2 145)" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name={getPlayerName(p2, lang)} dataKey="p2" stroke="oklch(0.65 0.22 25)" fill="oklch(0.65 0.22 25)" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.12 0.02 240)", border: "1px solid oklch(0.65 0.2 145 / 0.3)", borderRadius: "8px", color: "white", fontFamily: "'Tajawal', sans-serif", fontSize: "12px" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card-dark rounded-2xl p-6 mb-5 max-w-3xl mx-auto text-center">
              <p className="text-[#EEEFEE]/40" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {lang === "ar" ? "لا توجد تقييمات متاحة لهذين اللاعبين بعد" : "No evaluations available for these players yet"}
              </p>
            </div>
          )}

          {/* Bar comparison */}
          {p1LatestEval && p2LatestEval ? (
            <div className="card-dark rounded-2xl p-6 mb-5 max-w-3xl mx-auto">
              <h3 className="text-[#EEEFEE] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                <Target size={16} className="neon-text" /> {lang === "ar" ? "مقارنة الإحصائيات" : "Statistics Comparison"}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'Tajawal', sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "oklch(0.12 0.02 240)", border: "1px solid oklch(0.65 0.2 145 / 0.3)", borderRadius: "8px", color: "white", fontFamily: "'Tajawal', sans-serif", fontSize: "12px" }}
                  />
                  <Bar dataKey="p1" name={getPlayerName(p1, lang)} fill="oklch(0.65 0.2 145)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="p2" name={getPlayerName(p2, lang)} fill="oklch(0.65 0.22 25)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {/* Stat rows */}
          {p1LatestEval && p2LatestEval ? (
            <div className="card-dark rounded-2xl p-6 mb-5 max-w-3xl mx-auto">
              <div className="grid grid-cols-7 mb-3">
                <div className="col-span-2 text-left">
                  <span className="text-[oklch(0.65_0.2_145)] text-xs font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{getPlayerName(p1, lang)}</span>
                </div>
                <div className="col-span-3 text-center text-[#EEEFEE]/30 text-xs" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{t("compare.metrics")}</div>
                <div className="col-span-2 text-right">
                  <span className="text-[oklch(0.65_0.22_25)] text-xs font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{getPlayerName(p2, lang)}</span>
                </div>
              </div>
              <StatRow label={lang === "ar" ? "التقييم الكلي" : "Overall"} v1={p1LatestEval.overall} v2={p2LatestEval.overall} />
              <StatRow label={lang === "ar" ? "السرعة" : "Speed"} v1={p1LatestEval.physical} v2={p2LatestEval.physical} />
              <StatRow label={lang === "ar" ? "المهارة" : "Skill"} v1={p1LatestEval.technical} v2={p2LatestEval.technical} />
              <StatRow label={lang === "ar" ? "التكتيك" : "Tactics"} v1={p1LatestEval.tactical} v2={p2LatestEval.tactical} />
              <StatRow label={lang === "ar" ? "الذهنية" : "Mental"} v1={p1LatestEval.mental} v2={p2LatestEval.mental} />
            </div>
          ) : null}

          {/* CTA */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="card-dark rounded-2xl p-6" style={{ border: "1px solid oklch(0.65 0.2 145 / 0.2)" }}>
              <p className="text-[#EEEFEE]/60 mb-4" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {lang === "ar" ? "هل تريد تقارير تفصيلية لكلا اللاعبين؟ تواصل معنا عبر واتساب" : "Want detailed reports for both athletes? Contact us via WhatsApp"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/966500000000?text=أريد تقارير مقارنة للاعبين: ${getPlayerName(p1, lang)} و ${getPlayerName(p2, lang)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-6 py-2.5 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  <MessageCircle size={16} /> {lang === "ar" ? "احصل على التقارير" : "Get Reports"}
                </a>
                <button
                  onClick={() => navigate("/scouts")}
                  className="btn-outline-green px-6 py-2.5 flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  <Users size={16} /> {t("nav.scoutDashboard")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}