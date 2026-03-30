import { useState } from "react";
import { Dumbbell, Plus, Brain, Clock, Users, CheckCircle, Circle } from "lucide-react";

interface TrainingProps {
  lang?: "ar" | "en";
}

const sessionsAr = [
  { id: 1, title: "تدريب اللياقة البدنية", type: "لياقة", duration: "60 دقيقة", players: 18, date: "اليوم، 9:00 ص", status: "قادم", color: "#00DCC8" },
  { id: 2, title: "تكتيكات الهجوم", type: "تكتيك", duration: "90 دقيقة", players: 22, date: "غداً، 4:00 م", status: "قادم", color: "#007ABA" },
  { id: 3, title: "تدريب الكرات الثابتة", type: "مهارات", duration: "45 دقيقة", players: 15, date: "أمس", status: "منتهي", color: "#22c55e" },
  { id: 4, title: "التدريب الدفاعي", type: "تكتيك", duration: "75 دقيقة", players: 20, date: "الخميس الماضي", status: "منتهي", color: "#F59E0B" },
];

const sessionsEn = [
  { id: 1, title: "Physical Fitness Training", type: "Fitness", duration: "60 min", players: 18, date: "Today, 9:00 AM", status: "upcoming", color: "#00DCC8" },
  { id: 2, title: "Attack Tactics", type: "Tactics", duration: "90 min", players: 22, date: "Tomorrow, 4:00 PM", status: "upcoming", color: "#007ABA" },
  { id: 3, title: "Set Piece Training", type: "Skills", duration: "45 min", players: 15, date: "Yesterday", status: "done", color: "#22c55e" },
  { id: 4, title: "Defensive Training", type: "Tactics", duration: "75 min", players: 20, date: "Last Thursday", status: "done", color: "#F59E0B" },
];

export default function Training({ lang = "ar" }: TrainingProps) {
  const isRTL = lang === "ar";
  const sessions = isRTL ? sessionsAr : sessionsEn;
  const [generating, setGenerating] = useState(false);
  const [aiPlan, setAiPlan] = useState<string | null>(null);

  const generatePlan = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setAiPlan(lang === "ar"
      ? "**خطة التدريب الأسبوعية المقترحة:**\n\n• الاثنين: لياقة بدنية + تمارين سرعة (60 دقيقة)\n• الثلاثاء: تكتيكات هجومية + تمرير (90 دقيقة)\n• الأربعاء: راحة نشطة + تمددات\n• الخميس: تدريب مهاري + كرات ثابتة (75 دقيقة)\n• الجمعة: مباراة تجريبية كاملة (90 دقيقة)"
      : "**Suggested Weekly Training Plan:**\n\n• Monday: Physical fitness + speed drills (60 min)\n• Tuesday: Offensive tactics + passing (90 min)\n• Wednesday: Active rest + stretching\n• Thursday: Skills training + set pieces (75 min)\n• Friday: Full practice match (90 min)"
    );
    setGenerating(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0A0E1A", direction: isRTL ? "rtl" : "ltr" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-1"
            style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "إدارة التدريبات" : "Training Management"}
          </h1>
          <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {lang === "ar" ? "جدول جلسات التدريب والخطط" : "Training sessions schedule and plans"}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#fff", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
        >
          <Plus size={16} />
          {lang === "ar" ? "جلسة جديدة" : "New Session"}
        </button>
      </div>

      {/* AI Plan Generator */}
      <div className="rounded-2xl p-5 mb-6"
        style={{ background: "linear-gradient(135deg, rgba(0,122,186,0.12), rgba(0,220,200,0.06))", border: "1px solid rgba(0,220,200,0.2)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)" }}>
            <Brain size={18} color="#fff" />
          </div>
          <div>
            <div className="font-bold text-white text-sm"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "توليد خطة تدريب بالذكاء الاصطناعي" : "Generate AI Training Plan"}
            </div>
            <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? "خطة مخصصة بناءً على أداء الفريق" : "Custom plan based on team performance"}
            </div>
          </div>
        </div>
        {aiPlan ? (
          <div className="p-4 rounded-xl whitespace-pre-wrap text-sm"
            style={{ background: "rgba(0,0,0,0.3)", color: "rgba(238,239,238,0.8)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit", lineHeight: 1.8 }}>
            {aiPlan}
          </div>
        ) : (
          <button
            onClick={generatePlan}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: generating ? "rgba(0,220,200,0.1)" : "rgba(0,220,200,0.15)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.3)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
          >
            {generating ? (
              <><span className="animate-spin">⏳</span> {lang === "ar" ? "جاري التوليد..." : "Generating..."}</>
            ) : (
              <><Brain size={15} /> {lang === "ar" ? "توليد خطة أسبوعية" : "Generate Weekly Plan"}</>
            )}
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="p-4 rounded-2xl flex items-center gap-4"
            style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.06)", borderRight: isRTL ? `3px solid ${s.color}` : "none", borderLeft: !isRTL ? `3px solid ${s.color}` : "none" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}18`, color: s.color }}>
              <Dumbbell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white text-sm mb-1"
                style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{s.title}</div>
              <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(238,239,238,0.4)" }}>
                <span className="flex items-center gap-1"><Clock size={11} /> {s.duration}</span>
                <span className="flex items-center gap-1"><Users size={11} /> {s.players} {lang === "ar" ? "لاعب" : "players"}</span>
                <span>{s.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: `${s.color}18`, color: s.color, fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                {s.type}
              </span>
              {s.status === "منتهي" || s.status === "done"
                ? <CheckCircle size={16} style={{ color: "#22c55e" }} />
                : <Circle size={16} style={{ color: "rgba(238,239,238,0.2)" }} />
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
