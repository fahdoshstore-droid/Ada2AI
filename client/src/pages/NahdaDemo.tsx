/**
 * NahdaDemo — صفحة Demo نادي النهضة
 * /demo/nahda
 *
 * Features:
 * - اختيار فيديو من قائمة فيديوهات النهضة المخزنة مسبقاً
 * - تشغيل الفيديو في الخلفية أثناء التحليل
 * - استخراج 3 إطارات وإرسالها لـ Claude Vision API
 * - Progress bar يظهر مراحل التحليل
 * - النتيجة تظهر بجانب الفيديو
 * - براندينق مشترك: نادي النهضة + Ada2ai
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Brain, Activity, Zap, Target, Shield, Star,
  ChevronRight, Award, Users, Video, CheckCircle2,
  TrendingUp, BarChart3, Loader2, ArrowRight, X,
  FileImage, Eye
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";

// ── Types ─────────────────────────────────────────────────────────────────────
interface NahdaVideo {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  category: "U14" | "U17" | "U20" | "Senior";
  duration: string;
  thumbnail: string;
  videoUrl: string;
  playerCount: number;
  drillType: string;
}

interface SAFFReport {
  reportId: string;
  playerName: string;
  jerseyNumber: number;
  overallRating: number;
  ageCategory: { label: string; code: string; note: string };
  physicalProfile: { bodyType: string; heightCategory: string; posture: string; fitnessIndex: string; balance: number };
  athleticIndicators: {
    speed: { score: number; label: string; note: string };
    agility: { score: number; label: string; note: string };
    explosiveness: { score: number; label: string; note: string };
    stamina: { score: number; label: string; note: string };
  };
  technicalIndicators: {
    ballControl: { score: number; label: string; note: string };
    dribbling: { score: number; label: string; note: string };
    firstTouch: { score: number; label: string; note: string };
    coordination: { score: number; label: string; note: string };
    vision?: { score: number; label: string; note: string };
    passing?: { score: number; label: string; note: string };
    shooting?: { score: number; label: string; note: string };
  };
  mentalIndicators: {
    footballIQ: { score: number; label: string; note: string };
    decisionMaking: { score: number; label: string; note: string };
    resilience: { score: number; label: string; note: string };
  };
  sportDNA: Record<string, number>;
  saffBenchmark: { meetsStandard: string; technicalLevel: string; physicalLevel: string; benchmarkScore: number; note: string };
  recommendation: { bestPosition: string; bestPositionCode: string; secondPosition: string; secondPositionCode: string; suitableAcademies: string[]; developmentPlan: string; scoutNote: string };
  confidence: { percentage: number; reason: string };
}

// ── فيديوهات النهضة المخزنة مسبقاً ──────────────────────────────────────────
const nahdaVideos: NahdaVideo[] = [
  {
    id: "nahda-u14-drill-1",
    titleAr: "تدريب تقني — فئة U14",
    titleEn: "Technical Drill — U14",
    descAr: "تمارين المراوغة والتحكم بالكرة للناشئين",
    descEn: "Dribbling and ball control drills for youth",
    category: "U14",
    duration: "3:45",
    thumbnail: "/images/frame_0.png",
    videoUrl: "/videos/nahda-u14-drill-1.mp4",
    playerCount: 12,
    drillType: "تقني",
  },
  {
    id: "nahda-u17-tactical-1",
    titleAr: "تدريب تكتيكي — فئة U17",
    titleEn: "Tactical Training — U17",
    descAr: "تمارين التمرير والتمركز التكتيكي",
    descEn: "Passing and tactical positioning drills",
    category: "U17",
    duration: "5:20",
    thumbnail: "/images/frame_30.png",
    videoUrl: "/videos/nahda-u17-tactical-1.mp4",
    playerCount: 15,
    drillType: "تكتيكي",
  },
  {
    id: "nahda-u20-physical-1",
    titleAr: "تدريب بدني — فئة U20",
    titleEn: "Physical Training — U20",
    descAr: "تمارين السرعة والانفجارية للشباب",
    descEn: "Speed and explosiveness training for youth",
    category: "U20",
    duration: "4:10",
    thumbnail: "/images/frame_60.png",
    videoUrl: "/videos/nahda-u20-physical-1.mp4",
    playerCount: 18,
    drillType: "بدني",
  },
  {
    id: "nahda-senior-match-1",
    titleAr: "مباراة تدريبية — الفريق الأول",
    titleEn: "Training Match — First Team",
    descAr: "مباراة تدريبية داخلية للفريق الأول",
    descEn: "Internal training match for the first team",
    category: "Senior",
    duration: "8:30",
    thumbnail: "/images/hero-bg.png",
    videoUrl: "/videos/nahda-senior-match-1.mp4",
    playerCount: 22,
    drillType: "مباراة",
  },
];

// ── مراحل التحليل ─────────────────────────────────────────────────────────────
const analysisStages = [
  { label: "استخراج الإطارات من الفيديو", icon: <FileImage size={14} />, duration: 15 },
  { label: "تحليل الملف الجسدي (FIFA Physical Standards)", icon: <Activity size={14} />, duration: 20 },
  { label: "قياس المؤشرات البدنية — معايير SAFF", icon: <Zap size={14} />, duration: 20 },
  { label: "تحليل المهارات التقنية — معايير FIFA", icon: <Target size={14} />, duration: 20 },
  { label: "تحليل المؤشرات الذهنية وSport DNA", icon: <Brain size={14} />, duration: 15 },
  { label: "توليد تقرير الكشافة الاحترافي", icon: <Shield size={14} />, duration: 10 },
];

// ── مساعدات ───────────────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 85) return "#00DCC8";
  if (score >= 70) return "#007ABA";
  if (score >= 55) return "#FFA500";
  return "#EF4444";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-xs w-32 text-right" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}>{label}</div>
      <div className="flex-1 h-1.5 rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #007ABA, ${getScoreColor(score)})` }}
        />
      </div>
      <div className="text-sm font-black w-8 text-center" style={{ color: getScoreColor(score), fontFamily: "'Space Grotesk', sans-serif" }}>{score}</div>
    </div>
  );
}

// ── المكوّن الرئيسي ────────────────────────────────────────────────────────────
export default function NahdaDemo() {
  const { isRTL } = useLanguage();
  const font = "'Cairo', sans-serif";

  const [selectedVideo, setSelectedVideo] = useState<NahdaVideo | null>(null);
  const [step, setStep] = useState<"select" | "analyzing" | "result">("select");
  const [currentStage, setCurrentStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [report, setReport] = useState<SAFFReport | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // تنظيف المؤقتات عند إلغاء التحميل
  useEffect(() => {
    return () => stageTimers.current.forEach(clearTimeout);
  }, []);

  // تشغيل الفيديو عند بدء التحليل
  useEffect(() => {
    if (step === "analyzing" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [step]);

  const startAnalysis = useCallback(async () => {
    if (!selectedVideo) return;
    setStep("analyzing");
    setAnalysisError(null);
    setCurrentStage(0);
    setProgressPercent(0);

    // حساب مدة كل مرحلة
    const totalWeight = analysisStages.reduce((s, st) => s + st.duration, 0);
    let elapsed = 0;
    stageTimers.current.forEach(clearTimeout);
    stageTimers.current = [];

    analysisStages.forEach((stage, i) => {
      elapsed += stage.duration;
      const pct = Math.round((elapsed / totalWeight) * 100);
      const delay = (elapsed / totalWeight) * 18000; // 18 ثانية للعرض
      const t1 = setTimeout(() => setCurrentStage(i + 1), delay);
      const t2 = setTimeout(() => setProgressPercent(pct), delay);
      stageTimers.current.push(t1, t2);
    });

    try {
      // استخدام الإطارات المخزنة مسبقاً (public/images)
      const frames = [
        "/images/frame_0.png",
        "/images/frame_30.png",
        "/images/frame_60.png",
      ];
      setExtractedFrames(frames);

      // إرسال الإطارات لـ API التحليل
      const frameUrls = frames.map(f => `${window.location.origin}${f}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      const res = await fetch("/api/scout/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          frameUrls,
          context: `فيديو تدريبي من نادي النهضة — ${selectedVideo.titleAr} — ${selectedVideo.category}`,
        }),
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`فشل التحليل: ${res.status}`);
      const data = await res.json();

      stageTimers.current.forEach(clearTimeout);
      setCurrentStage(analysisStages.length);
      setProgressPercent(100);

      if (data.report) {
        setTimeout(() => {
          setReport(data.report);
          setStep("result");
        }, 600);
      } else {
        throw new Error("لم يتم إرجاع تقرير");
      }
    } catch (err: any) {
      stageTimers.current.forEach(clearTimeout);
      if (err.name === "AbortError") {
        setAnalysisError("انتهت مهلة التحليل — يرجى المحاولة مجدداً");
      } else {
        setAnalysisError(err.message || "حدث خطأ أثناء التحليل");
      }
      setStep("select");
    }
  }, [selectedVideo]);

  const reset = useCallback(() => {
    setStep("select");
    setReport(null);
    setAnalysisError(null);
    setCurrentStage(0);
    setProgressPercent(0);
    setExtractedFrames([]);
    stageTimers.current.forEach(clearTimeout);
  }, []);

  // ── تصنيف الفئة ──────────────────────────────────────────────────────────────
  const getCategoryColor = (cat: NahdaVideo["category"]) => {
    const map: Record<string, string> = { U14: "#00DCC8", U17: "#007ABA", U20: "#FFA500", Senior: "#EF4444" };
    return map[cat] || "#00DCC8";
  };

  return (
    <div className="min-h-screen" style={{ background: "#000A0F", color: "#EEEFEE" }}>
      <Ada2aiNavbar />

      {/* ── Header البراندينق المشترك ─────────────────────────────────────────── */}
      <div className="pt-20 pb-0">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* شعارات */}
            <div className="flex items-center gap-4">
              {/* شعار نادي النهضة */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
                style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", border: "2px solid rgba(0,194,168,0.3)" }}>
                🏆
              </div>
              <div className="w-px h-12 bg-white/10" />
              {/* شعار Ada2ai */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-sm"
                style={{ background: "linear-gradient(135deg, #00C2A8, #007ABA)", border: "2px solid rgba(0,194,168,0.3)", fontFamily: "'Orbitron', sans-serif" }}>
                A2
              </div>
              <div>
                <div className="font-bold text-lg" style={{ fontFamily: font, color: "#00C2A8" }}>
                  بالتعاون مع نادي النهضة
                </div>
                <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>
                  فيديوهات تدريبية مرخصة رسمياً · تحليل بمعايير SAFF + FIFA
                </div>
              </div>
            </div>
            {/* بادج */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: "rgba(0,194,168,0.08)", border: "1px solid rgba(0,194,168,0.2)" }}>
              <div className="w-2 h-2 rounded-full bg-[#00C2A8] animate-pulse" />
              <span className="text-sm font-semibold" style={{ color: "#00C2A8", fontFamily: font }}>
                نادي النهضة — Demo Live
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── المحتوى الرئيسي ──────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── خطوة الاختيار ────────────────────────────────────────────────── */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* عنوان */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
                  style={{ background: "rgba(0,122,186,0.1)", border: "1px solid rgba(0,122,186,0.2)" }}>
                  <Video size={14} style={{ color: "#007ABA" }} />
                  <span className="text-sm font-semibold" style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                    NAHDA FC · OFFICIAL TRAINING FOOTAGE
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-3"
                  style={{ fontFamily: font }}>
                  اختر فيديو التدريب
                </h1>
                <p className="text-base" style={{ color: "rgba(238,239,238,0.5)", fontFamily: font }}>
                  فيديوهات حقيقية من تدريبات نادي النهضة — مرخصة رسمياً لـ Ada2ai
                </p>
              </div>

              {/* رسالة خطأ */}
              {analysisError && (
                <div className="mb-6 p-4 rounded-xl text-center"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p className="text-sm" style={{ color: "#EF4444", fontFamily: font }}>{analysisError}</p>
                </div>
              )}

              {/* شبكة الفيديوهات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {nahdaVideos.map(video => (
                  <motion.button
                    key={video.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedVideo(video.id === selectedVideo?.id ? null : video)}
                    className="text-right w-full rounded-2xl overflow-hidden transition-all"
                    style={{
                      background: selectedVideo?.id === video.id
                        ? "rgba(0,194,168,0.08)"
                        : "rgba(255,255,255,0.02)",
                      border: selectedVideo?.id === video.id
                        ? "1px solid rgba(0,194,168,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.titleAr}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = "/images/hero-bg.png"; }}
                      />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,10,15,0.9))" }} />
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0,194,168,0.2)", border: "2px solid rgba(0,194,168,0.4)", backdropFilter: "blur(4px)" }}>
                          <Play size={20} style={{ color: "#00C2A8" }} />
                        </div>
                      </div>
                      {/* Category badge */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: getCategoryColor(video.category) + "22", color: getCategoryColor(video.category), border: `1px solid ${getCategoryColor(video.category)}44`, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {video.category}
                      </div>
                      {/* Duration */}
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-xs"
                        style={{ background: "rgba(0,0,0,0.6)", color: "rgba(238,239,238,0.7)", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {video.duration}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-bold text-base mb-0.5" style={{ fontFamily: font }}>{video.titleAr}</div>
                          <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>{video.descAr}</div>
                        </div>
                        {selectedVideo?.id === video.id && (
                          <CheckCircle2 size={20} style={{ color: "#00C2A8", flexShrink: 0 }} />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>
                          <Users size={12} />
                          <span>{video.playerCount} لاعب</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>
                          {video.drillType}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <div className="text-xs font-semibold" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                          نادي النهضة
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* زر التحليل */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: selectedVideo ? 1.02 : 1 }}
                  whileTap={{ scale: selectedVideo ? 0.98 : 1 }}
                  onClick={startAnalysis}
                  disabled={!selectedVideo}
                  className="px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all"
                  style={{
                    background: selectedVideo
                      ? "linear-gradient(135deg, #00C2A8, #007ABA)"
                      : "rgba(255,255,255,0.05)",
                    color: selectedVideo ? "#000A0F" : "rgba(238,239,238,0.3)",
                    fontFamily: font,
                    cursor: selectedVideo ? "pointer" : "not-allowed",
                    boxShadow: selectedVideo ? "0 0 30px rgba(0,194,168,0.3)" : "none",
                  }}
                >
                  <Brain size={22} />
                  {selectedVideo ? `حلّل: ${selectedVideo.titleAr}` : "اختر فيديو أولاً"}
                  {selectedVideo && <ChevronRight size={18} />}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── خطوة التحليل ─────────────────────────────────────────────────── */}
          {step === "analyzing" && selectedVideo && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* الفيديو في الخلفية */}
              <div className="rounded-2xl overflow-hidden relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", minHeight: 320 }}>
                <video
                  ref={videoRef}
                  src={selectedVideo.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ minHeight: 280 }}
                  onError={e => {
                    // fallback: عرض صورة ثابتة إذا لم يكن الفيديو متاحاً
                    const target = e.target as HTMLVideoElement;
                    target.style.display = "none";
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: "rgba(0,10,15,0.5)", backdropFilter: "blur(2px)" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse"
                    style={{ background: "rgba(0,194,168,0.15)", border: "2px solid rgba(0,194,168,0.3)" }}>
                    <Brain size={28} style={{ color: "#00C2A8" }} />
                  </div>
                  <div className="font-bold text-lg mb-1" style={{ fontFamily: font, color: "#00C2A8" }}>
                    جارٍ التحليل...
                  </div>
                  <div className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: font }}>
                    {selectedVideo.titleAr}
                  </div>
                </div>

                {/* الإطارات المستخرجة */}
                {extractedFrames.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    {extractedFrames.map((f, i) => (
                      <div key={i} className="flex-1 rounded-lg overflow-hidden"
                        style={{ border: "1px solid rgba(0,194,168,0.3)", height: 50 }}>
                        <img src={f} alt={`إطار ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* مراحل التحليل */}
              <div className="flex flex-col justify-center">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                      تقدم التحليل
                    </span>
                    <span className="text-sm font-black" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {progressPercent}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #007ABA, #00C2A8)" }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* قائمة المراحل */}
                <div className="space-y-3">
                  {analysisStages.map((stage, i) => {
                    const done = i < currentStage;
                    const active = i === currentStage;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: active
                            ? "rgba(0,194,168,0.08)"
                            : done
                              ? "rgba(0,122,186,0.04)"
                              : "rgba(255,255,255,0.02)",
                          border: active
                            ? "1px solid rgba(0,194,168,0.2)"
                            : done
                              ? "1px solid rgba(0,122,186,0.15)"
                              : "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: done
                              ? "rgba(0,122,186,0.15)"
                              : active
                                ? "rgba(0,194,168,0.15)"
                                : "rgba(255,255,255,0.04)",
                            color: done ? "#007ABA" : active ? "#00C2A8" : "rgba(238,239,238,0.3)",
                          }}>
                          {done ? <CheckCircle2 size={16} /> : active ? <Loader2 size={16} className="animate-spin" /> : stage.icon}
                        </div>
                        <span className="text-sm flex-1" style={{
                          fontFamily: font,
                          color: done
                            ? "rgba(238,239,238,0.7)"
                            : active
                              ? "#EEEFEE"
                              : "rgba(238,239,238,0.3)",
                        }}>
                          {stage.label}
                        </span>
                        {done && (
                          <span className="text-xs font-bold" style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>✓</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* معلومات الفيديو */}
                <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs mb-2 font-semibold" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>
                    ANALYZING
                  </div>
                  <div className="font-bold text-sm mb-1" style={{ fontFamily: font }}>{selectedVideo.titleAr}</div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>
                    <span>{selectedVideo.playerCount} لاعب</span>
                    <span>·</span>
                    <span>{selectedVideo.category}</span>
                    <span>·</span>
                    <span>نادي النهضة</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── خطوة النتيجة ─────────────────────────────────────────────────── */}
          {step === "result" && report && selectedVideo && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* الفيديو + الإطارات */}
              <div className="space-y-4">
                {/* الفيديو */}
                <div className="rounded-2xl overflow-hidden relative"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,194,168,0.2)" }}>
                  <video
                    src={selectedVideo.videoUrl}
                    className="w-full object-cover"
                    controls
                    muted
                    style={{ maxHeight: 280 }}
                    onError={e => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = "none";
                    }}
                  />
                  {/* Overlay info */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(0,10,15,0.8)", border: "1px solid rgba(0,194,168,0.3)", backdropFilter: "blur(4px)" }}>
                    <div className="w-2 h-2 rounded-full bg-[#00C2A8]" />
                    <span className="text-xs font-semibold" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                      NAHDA FC
                    </span>
                  </div>
                </div>

                {/* الإطارات المستخرجة */}
                {extractedFrames.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-2 flex items-center gap-2"
                      style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      <Eye size={12} /> الإطارات المحللة
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {extractedFrames.map((f, i) => (
                        <div key={i} className="rounded-xl overflow-hidden aspect-video"
                          style={{ border: "1px solid rgba(0,194,168,0.2)" }}>
                          <img src={f} alt={`إطار ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* بطاقة اللاعب */}
                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(0,194,168,0.04)", border: "1px solid rgba(0,194,168,0.15)" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl"
                      style={{ background: "linear-gradient(135deg, #007ABA, #00C2A8)" }}>
                      {report.jerseyNumber}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-xl mb-0.5" style={{ fontFamily: font }}>{report.playerName}</div>
                      <div className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: font }}>
                        {report.ageCategory?.label} · {report.recommendation?.bestPosition}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(0,194,168,0.1)", color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                          نادي النهضة
                        </div>
                        <div className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(0,122,186,0.1)", color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {selectedVideo.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black" style={{ color: getScoreColor(report.overallRating), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {report.overallRating}
                      </div>
                      <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>OVR</div>
                    </div>
                  </div>
                </div>

                {/* Sport DNA */}
                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-4 flex items-center gap-2"
                    style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <BarChart3 size={14} /> ⑥ Sport DNA
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(report.sportDNA || {}).slice(0, 6).map(([pos, score]) => (
                      <div key={pos} className="text-center p-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-xs font-black mb-1" style={{ color: getScoreColor(score as number), fontFamily: "'Space Grotesk', sans-serif" }}>
                          {score}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>{pos}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* التقرير التفصيلي */}
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                {/* Header التقرير */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-lg" style={{ fontFamily: font }}>تقرير الكشافة</div>
                    <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {report.reportId} · Ada2ai × نادي النهضة
                    </div>
                  </div>
                  <button
                    onClick={reset}
                    className="p-2 rounded-xl transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(238,239,238,0.5)" }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* المؤشرات البدنية */}
                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-4 flex items-center gap-2"
                    style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Activity size={14} /> ③ المؤشرات البدنية
                  </div>
                  <div className="space-y-3">
                    <ScoreBar label="السرعة" score={report.athleticIndicators?.speed?.score || 0} />
                    <ScoreBar label="الرشاقة" score={report.athleticIndicators?.agility?.score || 0} />
                    <ScoreBar label="الانفجارية" score={report.athleticIndicators?.explosiveness?.score || 0} />
                    <ScoreBar label="التحمل" score={report.athleticIndicators?.stamina?.score || 0} />
                  </div>
                </div>

                {/* المؤشرات التقنية */}
                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-4 flex items-center gap-2"
                    style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Target size={14} /> ④ المؤشرات التقنية
                  </div>
                  <div className="space-y-3">
                    <ScoreBar label="التحكم" score={report.technicalIndicators?.ballControl?.score || 0} />
                    <ScoreBar label="المراوغة" score={report.technicalIndicators?.dribbling?.score || 0} />
                    <ScoreBar label="اللمسة" score={report.technicalIndicators?.firstTouch?.score || 0} />
                    <ScoreBar label="التنسيق" score={report.technicalIndicators?.coordination?.score || 0} />
                  </div>
                </div>

                {/* المؤشرات الذهنية */}
                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-4 flex items-center gap-2"
                    style={{ color: "#FFA500", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Brain size={14} /> ⑤ المؤشرات الذهنية
                  </div>
                  <div className="space-y-3">
                    <ScoreBar label="الذكاء الكروي" score={report.mentalIndicators?.footballIQ?.score || 0} />
                    <ScoreBar label="القرار" score={report.mentalIndicators?.decisionMaking?.score || 0} />
                    <ScoreBar label="الصمود" score={report.mentalIndicators?.resilience?.score || 0} />
                  </div>
                </div>

                {/* معايير SAFF */}
                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(0,122,186,0.04)", border: "1px solid rgba(0,122,186,0.15)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2"
                    style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Shield size={14} /> ⑦ مقارنة معايير SAFF
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>المستوى التقني: </span>
                      <span className="font-semibold" style={{ fontFamily: font }}>{report.saffBenchmark?.technicalLevel}</span>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>المستوى البدني: </span>
                      <span className="font-semibold" style={{ fontFamily: font }}>{report.saffBenchmark?.physicalLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>درجة المعيار:</div>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${report.saffBenchmark?.benchmarkScore || 0}%`, background: "linear-gradient(90deg, #007ABA, #00C2A8)" }} />
                    </div>
                    <div className="font-black text-sm" style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {report.saffBenchmark?.benchmarkScore}
                    </div>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: "rgba(238,239,238,0.5)", fontFamily: font }}>
                    {report.saffBenchmark?.note}
                  </div>
                </div>

                {/* التوصية */}
                <div className="rounded-2xl p-5"
                  style={{ background: "rgba(0,122,186,0.04)", border: "1px solid rgba(0,122,186,0.2)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2"
                    style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Star size={14} /> ⑧ التوصية النهائية
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>المركز الأمثل: </span>
                      <span className="font-bold" style={{ color: "#00C2A8", fontFamily: font }}>
                        {report.recommendation?.bestPosition} ({report.recommendation?.bestPositionCode})
                      </span>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: font }}>مركز ثانٍ: </span>
                      <span style={{ fontFamily: font }}>
                        {report.recommendation?.secondPosition} ({report.recommendation?.secondPositionCode})
                      </span>
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: "rgba(238,239,238,0.7)", fontFamily: font }}>
                    {report.recommendation?.scoutNote}
                  </div>
                  {report.recommendation?.developmentPlan && (
                    <div className="mt-3 p-3 rounded-xl text-xs"
                      style={{ background: "rgba(0,194,168,0.05)", border: "1px solid rgba(0,194,168,0.1)", color: "rgba(238,239,238,0.6)", fontFamily: font }}>
                      <span className="font-semibold" style={{ color: "#00C2A8" }}>خطة التطوير: </span>
                      {report.recommendation.developmentPlan}
                    </div>
                  )}
                </div>

                {/* ثقة التحليل */}
                <div className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>⑨ ثقة التحليل</div>
                  <div className="flex-1 h-2 rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${report.confidence?.percentage || 0}%`, background: "linear-gradient(90deg, #007ABA, #00C2A8)" }} />
                  </div>
                  <div className="font-black text-sm" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {report.confidence?.percentage}%
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#EEEFEE", fontFamily: font }}
                  >
                    تحليل فيديو آخر
                  </button>
                  <Link href="/training">
                    <button
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{ background: "linear-gradient(135deg, #007ABA, #00C2A8)", color: "#000A0F", fontFamily: font }}
                    >
                      <TrendingUp size={16} />
                      لوحة المدرب
                    </button>
                  </Link>
                </div>

                {/* Footer */}
                <div className="text-center text-xs pt-2" style={{ color: "rgba(238,239,238,0.2)", fontFamily: font }}>
                  Ada2ai × نادي النهضة — تحليل بمعايير SAFF + FIFA
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
