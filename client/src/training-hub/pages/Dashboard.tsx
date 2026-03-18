/**
 * Training Hub — Dashboard
 * Design: Dark Sports-Tech (#0A0E1A, #00D4FF, #00FF88)
 * Bilingual: Arabic / English
 */

import { Brain, Users, Dumbbell, Activity, Target, Zap } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
} from "recharts";
import { usePlayers } from "../hooks/usePlayers";

interface DashboardProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

export default function Dashboard({ onNavigate, lang = "ar" }: DashboardProps) {
  const { players } = usePlayers();
  const isRTL = lang === "ar";

  const avgProgress = players.length
    ? Math.round(players.reduce((a, p) => a + p.progress, 0) / players.length)
    : 0;

  const weeklyData = lang === "ar"
    ? [
        { day: "الأحد", performance: 72 },
        { day: "الاثنين", performance: 78 },
        { day: "الثلاثاء", performance: 75 },
        { day: "الأربعاء", performance: 82 },
        { day: "الخميس", performance: 85 },
        { day: "الجمعة", performance: 80 },
        { day: "السبت", performance: 88 },
      ]
    : [
        { day: "Sun", performance: 72 },
        { day: "Mon", performance: 78 },
        { day: "Tue", performance: 75 },
        { day: "Wed", performance: 82 },
        { day: "Thu", performance: 85 },
        { day: "Fri", performance: 80 },
        { day: "Sat", performance: 88 },
      ];

  const radarData = lang === "ar"
    ? [
        { subject: "السرعة", A: 84 },
        { subject: "القوة", A: 83 },
        { subject: "التقنية", A: 87 },
        { subject: "التحمل", A: 84 },
        { subject: "التعاون", A: 86 },
      ]
    : [
        { subject: "Speed", A: 84 },
        { subject: "Strength", A: 83 },
        { subject: "Technique", A: 87 },
        { subject: "Stamina", A: 84 },
        { subject: "Teamwork", A: 86 },
      ];

  const stats = [
    {
      label: lang === "ar" ? "إجمالي اللاعبين" : "Total Players",
      value: players.length,
      icon: Users,
      color: "#00D4FF",
      sub: lang === "ar" ? "+2 هذا الشهر" : "+2 this month",
    },
    {
      label: lang === "ar" ? "جلسات اليوم" : "Today's Sessions",
      value: 6,
      icon: Dumbbell,
      color: "#00FF88",
      sub: lang === "ar" ? "3 مكتملة" : "3 completed",
    },
    {
      label: lang === "ar" ? "متوسط الأداء" : "Avg Performance",
      value: "84%",
      icon: Activity,
      color: "#FF6B35",
      sub: lang === "ar" ? "+5% هذا الأسبوع" : "+5% this week",
    },
    {
      label: lang === "ar" ? "أهداف محققة" : "Goals Achieved",
      value: 12,
      icon: Target,
      color: "#A78BFA",
      sub: lang === "ar" ? "من 15 هدف" : "of 15 goals",
    },
  ];

  return (
    <div
      className="p-6 space-y-6 overflow-y-auto h-full"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#0A0E1A" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif",
              color: "#fff",
            }}
          >
            {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'Cairo', sans-serif" }}>
            {new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => onNavigate("ai-chat")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1))",
            border: "1px solid rgba(0,212,255,0.3)",
            color: "#00D4FF",
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          <Brain size={16} />
          {lang === "ar" ? "اسأل Ada2ai" : "Ask Ada2ai"}
        </button>
      </div>

      {/* Hero Banner — Video */}
      <div className="relative rounded-2xl overflow-hidden" style={{ height: "260px" }}>
        <video
          src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/3ugXcEu9eiZLS4S4PHoXCe/hero-video_e70d7041.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.75)" }}
        />
        <div
          className="absolute inset-0 flex flex-col justify-end p-6"
          style={{
            background:
              "linear-gradient(to top, rgba(10,14,26,0.97) 0%, rgba(10,14,26,0.55) 50%, rgba(10,14,26,0.1) 100%)",
          }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: "rgba(0,212,255,0.15)",
                border: "1px solid rgba(0,212,255,0.35)",
                color: "#00D4FF",
                backdropFilter: "blur(8px)",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00FF88" }} />
              {lang === "ar" ? "مباشر" : "Live"}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs mb-1" style={{ color: "rgba(0,212,255,0.9)", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar" ? "مرحباً بك في" : "Welcome to"}
              </p>
              <h2
                className="text-2xl font-black"
                style={{
                  fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif",
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                  background: "linear-gradient(135deg, #00D4FF, #00FF88)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {lang === "ar" ? "Ada2ai للتدريبات الرياضية" : "Ada2ai Training Platform"}
              </h2>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar"
                  ? "تحليل الأداء · خطط التدريب · الذكاء الاصطناعي"
                  : "Performance Analysis · Training Plans · AI"}
              </p>
            </div>
            <div className={isRTL ? "text-left" : "text-right"}>
              <p
                className="text-4xl font-black"
                style={{
                  color: "#00FF88",
                  textShadow: "0 0 20px rgba(0,255,136,0.5)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {avgProgress}%
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar" ? "متوسط التقدم" : "Avg Progress"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <p
                className="text-2xl font-black mb-0.5"
                style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Cairo', sans-serif" }}>
                {stat.label}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Cairo', sans-serif" }}>
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm" style={{ color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
              {lang === "ar" ? "الأداء الأسبوعي" : "Weekly Performance"}
            </h3>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: "rgba(0,255,136,0.1)", color: "#00FF88", fontFamily: "'Cairo', sans-serif" }}
            >
              {lang === "ar" ? "هذا الأسبوع" : "This Week"}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="thPerfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "Cairo" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "#0D1526",
                  border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "Cairo",
                }}
                labelStyle={{ color: "#00D4FF" }}
              />
              <Area
                type="monotone"
                dataKey="performance"
                stroke="#00D4FF"
                strokeWidth={2}
                fill="url(#thPerfGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h3 className="font-bold text-sm mb-4" style={{ color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
            {lang === "ar" ? "متوسط الفريق" : "Team Average"}
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 9, fontFamily: "Cairo" }}
              />
              <Radar
                name={lang === "ar" ? "الفريق" : "Team"}
                dataKey="A"
                stroke="#00D4FF"
                fill="#00D4FF"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Players Quick View */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm" style={{ color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
            {lang === "ar" ? "اللاعبون النشطون" : "Active Players"}
          </h3>
          <button
            onClick={() => onNavigate("players")}
            className="text-xs transition-colors hover:opacity-80"
            style={{ color: "#00D4FF", fontFamily: "'Cairo', sans-serif" }}
          >
            {lang === "ar" ? "عرض الكل" : "View All"}
          </button>
        </div>
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1))",
                  color: "#00D4FF",
                  border: "1px solid rgba(0,212,255,0.2)",
                }}
              >
                {player.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate" style={{ color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
                    {lang === "ar" ? player.nameAr : player.nameEn}
                  </span>
                  <span
                    className="text-xs font-bold ml-2 flex-shrink-0"
                    style={{ color: "#00FF88", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {player.progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${player.progress}%`,
                      background: "linear-gradient(90deg, #00D4FF, #00FF88)",
                      boxShadow: "0 0 6px rgba(0,212,255,0.4)",
                    }}
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                  {player.lastSession}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("ai-chat")}
          className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className={`flex items-center gap-3 ${isRTL ? "" : "flex-row-reverse"}`}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              <Brain size={20} style={{ color: "#00D4FF" }} />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="font-bold text-sm" style={{ color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar" ? "اسأل AI" : "Ask AI"}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar" ? "احصل على خطة تدريب" : "Get a training plan"}
              </p>
            </div>
          </div>
        </button>
        <button
          onClick={() => onNavigate("training")}
          className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className={`flex items-center gap-3 ${isRTL ? "" : "flex-row-reverse"}`}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)" }}
            >
              <Zap size={20} style={{ color: "#00FF88" }} />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="font-bold text-sm" style={{ color: "#fff", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar" ? "جلسة جديدة" : "New Session"}
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Cairo', sans-serif" }}>
                {lang === "ar" ? "ابدأ تدريباً الآن" : "Start training now"}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
