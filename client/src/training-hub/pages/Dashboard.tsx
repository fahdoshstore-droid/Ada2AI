import { Users, TrendingUp, Trophy, Calendar, Brain, Activity, ArrowRight, ArrowLeft, Star } from "lucide-react";

interface DashboardProps {
  onNavigate: (page: string, context?: unknown) => void;
  lang?: "ar" | "en";
}

const statsAr = [
  { label: "إجمالي اللاعبين", value: "24", icon: <Users size={20} />, color: "#00DCC8", change: "+3 هذا الشهر" },
  { label: "جلسات التدريب", value: "48", icon: <Activity size={20} />, color: "#007ABA", change: "+8 هذا الأسبوع" },
  { label: "المباريات المنتهية", value: "12", icon: <Trophy size={20} />, color: "#F59E0B", change: "4 انتصارات" },
  { label: "متوسط التقدم", value: "78%", icon: <TrendingUp size={20} />, color: "#22c55e", change: "+5% هذا الشهر" },
];

const statsEn = [
  { label: "Total Players", value: "24", icon: <Users size={20} />, color: "#00DCC8", change: "+3 this month" },
  { label: "Training Sessions", value: "48", icon: <Activity size={20} />, color: "#007ABA", change: "+8 this week" },
  { label: "Matches Completed", value: "12", icon: <Trophy size={20} />, color: "#F59E0B", change: "4 wins" },
  { label: "Avg Progress", value: "78%", icon: <TrendingUp size={20} />, color: "#22c55e", change: "+5% this month" },
];

const playersAr = [
  { name: "أحمد الزهراني", pos: "مهاجم", score: 87, trend: "+4", avatar: "AZ" },
  { name: "خالد العتيبي", pos: "وسط", score: 82, trend: "+2", avatar: "KA" },
  { name: "فيصل المطيري", pos: "مدافع", score: 79, trend: "+6", avatar: "FM" },
  { name: "عمر الشهري", pos: "حارس", score: 75, trend: "+1", avatar: "OS" },
];

const playersEn = [
  { name: "Ahmed Al-Zahrani", pos: "Forward", score: 87, trend: "+4", avatar: "AZ" },
  { name: "Khalid Al-Otaibi", pos: "Midfielder", score: 82, trend: "+2", avatar: "KA" },
  { name: "Faisal Al-Mutairi", pos: "Defender", score: 79, trend: "+6", avatar: "FM" },
  { name: "Omar Al-Shahri", pos: "Goalkeeper", score: 75, trend: "+1", avatar: "OS" },
];

const sessionsAr = [
  { title: "تدريب اللياقة البدنية", time: "اليوم، 9:00 ص", type: "لياقة", color: "#00DCC8" },
  { title: "تكتيكات الهجوم", time: "غداً، 4:00 م", type: "تكتيك", color: "#007ABA" },
  { title: "مباراة تجريبية", time: "الجمعة، 6:00 م", type: "مباراة", color: "#F59E0B" },
];

const sessionsEn = [
  { title: "Fitness Training", time: "Today, 9:00 AM", type: "Fitness", color: "#00DCC8" },
  { title: "Attack Tactics", time: "Tomorrow, 4:00 PM", type: "Tactics", color: "#007ABA" },
  { title: "Practice Match", time: "Friday, 6:00 PM", type: "Match", color: "#F59E0B" },
];

export default function Dashboard({ onNavigate, lang = "ar" }: DashboardProps) {
  const isRTL = lang === "ar";
  const stats = isRTL ? statsAr : statsEn;
  const players = isRTL ? playersAr : playersEn;
  const sessions = isRTL ? sessionsAr : sessionsEn;
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1"
          style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
        </h1>
        <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
          {lang === "ar" ? "مرحباً بك، المدرب محمد — إليك نظرة عامة على الفريق" : "Welcome back, Coach — here's your team overview"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-2xl p-4"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}18`, color: stat.color }}>
                {stat.icon}
              </div>
              <span className="text-xs font-semibold" style={{ color: "#22c55e", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-black text-white mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {stat.value}
            </div>
            <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Players */}
        <div className="lg:col-span-2 rounded-2xl p-5"
          style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-base"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "أفضل اللاعبين" : "Top Players"}
            </h2>
            <button
              onClick={() => onNavigate("players")}
              className="flex items-center gap-1 text-xs transition-all"
              style={{ color: "#00DCC8", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
            >
              {lang === "ar" ? "عرض الكل" : "View All"} <ArrowIcon size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {players.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate"
                    style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{p.name}</div>
                  <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{p.pos}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={12} style={{ color: "#F59E0B" }} />
                    <span className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{p.score}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "#22c55e" }}>{p.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="rounded-2xl p-5"
          style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white text-base"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "الجلسات القادمة" : "Upcoming Sessions"}
            </h2>
            <Calendar size={16} style={{ color: "rgba(238,239,238,0.3)" }} />
          </div>
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <div key={i} className="p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", borderRight: isRTL ? `3px solid ${s.color}` : "none", borderLeft: !isRTL ? `3px solid ${s.color}` : "none" }}>
                <div className="text-sm font-semibold text-white mb-1"
                  style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{s.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{s.time}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${s.color}18`, color: s.color, fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                    {s.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate("training")}
            className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.2)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
          >
            {lang === "ar" ? "+ إضافة جلسة" : "+ Add Session"}
          </button>
        </div>

        {/* AI Suggestion Banner */}
        <div className="lg:col-span-3 rounded-2xl p-5 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, rgba(0,122,186,0.15) 0%, rgba(0,220,200,0.08) 100%)", border: "1px solid rgba(0,220,200,0.2)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)" }}>
            <Brain size={22} color="#fff" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white mb-1"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "توصية الذكاء الاصطناعي" : "AI Recommendation"}
            </div>
            <div className="text-sm" style={{ color: "rgba(238,239,238,0.6)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar"
                ? "بناءً على أداء الأسبوع الماضي، يُنصح بزيادة تدريبات التحمل لـ 3 لاعبين. انقر للتفاصيل."
                : "Based on last week's performance, it's recommended to increase endurance training for 3 players. Click for details."}
            </div>
          </div>
          <button
            onClick={() => onNavigate("ai-chat", { prompt: lang === "ar" ? "اقترح خطة تدريب للأسبوع القادم" : "Suggest a training plan for next week" })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all"
            style={{ background: "rgba(0,220,200,0.15)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.3)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
          >
            {lang === "ar" ? "استشر AI" : "Ask AI"} <ArrowIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
