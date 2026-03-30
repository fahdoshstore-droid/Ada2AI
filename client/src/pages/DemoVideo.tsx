import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Brain, Play, CheckCircle2, Video, Loader2, ArrowRight
} from "lucide-react";
import { Link } from "wouter";

const demoResult = {
  sessionInfo: {
    title: "حصة تدريبية - الفئة U14",
    date: "30 مارس 2026",
    duration: "45 دقيقة",
    playersDetected: 12,
    drillType: "تمارين تقنية + تكتيكية",
  },
  teamOverview: {
    teamName: "فريق U14",
    overallRating: 79,
    attendance: "12/15 لاعب",
    avgAge: "14.2 سنة",
  },
  players: [
    {
      id: 1,
      name: "أحمد محمد",
      number: 8,
      position: "جناح أيسر",
      rating: 85,
      metrics: { technical: 88, speed: 82, agility: 90, tactical: 78, strength: 75, endurance: 82 },
      highlights: ["مراوغة ممتازة", "سرعة في التغيير", "تمريرات دقيقة"],
      improvement: ["يحتاج تطوير التسديد", "القوة الجسدية"],
    },
    {
      id: 2,
      name: "خالد سعود",
      number: 6,
      position: "لاعب وسط",
      rating: 82,
      metrics: { technical: 85, speed: 78, agility: 80, tactical: 85, strength: 80, endurance: 85 },
      highlights: ["وعي تكتيكي عالي", "تنظيم اللعب", "تحكم بالكرة"],
      improvement: ["القدم الضعيفة", "سرعة الاستحواذ"],
    },
    {
      id: 3,
      name: "عبدالله",
      number: 10,
      position: "مهاجم",
      rating: 80,
      metrics: { technical: 82, speed: 85, agility: 78, tactical: 75, strength: 78, endurance: 80 },
      highlights: ["سرعة عالية", "تسديد قوي", "حركة بدون كرة"],
      improvement: ["التسديد من زاوية", "الصبر في الهجوم"],
    },
  ],
  drillAnalysis: [
    { name: "المراوغة بين الأقماع", quality: 88, duration: "15 دقيقة" },
    { name: "التمرير الموجز", quality: 75, duration: "10 دقائق" },
    { name: "القتال 1v1", quality: 72, duration: "12 دقيقة" },
    { name: "السيطرة على الكرة", quality: 85, duration: "8 دقائق" },
  ],
};

export default function DemoVideo() {
  const { isRTL, lang } = useLanguage();
  const [showReport, setShowReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsAnalyzing(false);
    setShowReport(true);
  };

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#000A0F]/90 border-b border-[#00DCC8]/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="font-bold text-xl text-[#00DCC8]">ada2ai</div>
          </Link>
          <Link href="/">
            <button className="text-sm px-4 py-2 bg-white/5 rounded-lg">العودة</button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="pt-32 pb-16 px-4 text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[#00DCC8]/10 text-[#00DCC8] text-sm">
          DEMO
        </div>
        <h1 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-[#00DCC8] to-[#007ABA] bg-clip-text text-transparent">
            {lang === "ar" ? "عرض توضيحي" : "Live Demo"}
          </span>
        </h1>
        <p className="text-gray-400 mb-8">تحليل فيديو حقيقي لفئة U14</p>

        {/* Video */}
        <div className="max-w-3xl mx-auto mb-8 rounded-2xl overflow-hidden border border-[#00DCC8]/20">
          <div className="aspect-video bg-black relative">
            <img src="/images/frame_0.png" alt="U14 Training" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#00DCC8]/20 border-2 border-[#00DCC8] flex items-center justify-center cursor-pointer">
                <Play size={32} fill="#00DCC8" color="#00DCC8" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Video size={16} color="#00DCC8" />
                IMG_3365.mp4
              </span>
              <span className="px-2 py-1 bg-[#00DCC8]/20 text-[#00DCC8] text-xs rounded">U14 • Football</span>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        {!showReport && (
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-12 py-4 bg-[#00DCC8] text-black font-bold rounded-xl flex items-center gap-3 mx-auto hover:bg-[#00DCC8]/90 transition"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Brain size={20} />
                تحليل الفيديو
              </>
            )}
          </button>
        )}
      </div>

      {/* Report */}
      {showReport && (
        <div className="px-4 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00DCC8]/10 text-[#00DCC8] mb-4">
                <CheckCircle2 size={18} />
                اكتمل التحليل
              </div>
              <h2 className="text-3xl font-bold mb-2">{demoResult.sessionInfo.title}</h2>
              <p className="text-gray-500">{demoResult.sessionInfo.drillType} • {demoResult.sessionInfo.playersDetected} لاعب</p>
            </div>

            {/* Team Overview */}
            <div className="bg-[#0A1520] rounded-2xl p-6 mb-8 border border-[#00DCC8]/10">
              <h3 className="font-bold mb-4 text-center">ملخص الفريق</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-black text-[#00DCC8]">{demoResult.teamOverview.overallRating}</div>
                  <div className="text-gray-500 text-sm">التقييم العام</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#007ABA]">{demoResult.teamOverview.attendance}</div>
                  <div className="text-gray-500 text-sm">الحضور</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#FFA500]">{demoResult.sessionInfo.duration}</div>
                  <div className="text-gray-500 text-sm">مدة الحصة</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">{demoResult.sessionInfo.playersDetected}</div>
                  <div className="text-gray-500 text-sm">لاعب تم اكتشافه</div>
                </div>
              </div>
            </div>

            {/* Players Grid */}
            <h3 className="text-xl font-bold mb-4">ابطال اللاعبين</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {demoResult.players.map((player) => (
                <div key={player.id} className="bg-[#0A1520] rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-[#007ABA]/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{player.name}</div>
                        <div className="text-sm text-gray-400">#{player.number} - {player.position}</div>
                      </div>
                      <div className="text-3xl font-black text-[#00DCC8]">{player.rating}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(player.metrics).slice(0, 4).map(([key, val]) => (
                        <div key={key} className="text-center">
                          <div className="text-lg font-bold text-[#00DCC8]">{val}</div>
                          <div className="text-xs text-gray-500 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-3">
                      <div className="text-xs text-[#00DCC8] mb-1">نقاط القوة:</div>
                      {player.highlights.slice(0, 2).map((h, i) => (
                        <div key={i} className="text-xs text-gray-400 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-[#00DCC8]" /> {h}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drill Analysis */}
            <h3 className="text-xl font-bold mb-4">تحليل التمارين</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {demoResult.drillAnalysis.map((drill, i) => (
                <div key={i} className="bg-[#0A1520] rounded-xl p-4 border border-white/5 text-center">
                  <div className="text-2xl font-black text-[#00DCC8] mb-1">{drill.quality}%</div>
                  <div className="text-sm font-medium mb-1">{drill.name}</div>
                  <div className="text-xs text-gray-500">{drill.duration}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link href="/scouts">
                <button className="px-8 py-3 bg-[#00DCC8] text-black font-bold rounded-xl flex items-center gap-2 mx-auto">
                  اكتشف المزيد من اللاعبين
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
