/**
 * Upload & AI Analysis — Ada2ai
 * Direct image upload → Claude Vision SAFF+FIFA analysis → SportID card
 * No player form, no disclaimers, real analysis only.
 */

import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import FifaCard, { FifaCardPlayer } from "@/components/FifaCard";
import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileImage, FileVideo, CheckCircle, Loader2,
  Zap, Target, Shield, Brain, Activity, Star, Award, BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = "upload" | "analyzing" | "done";

// معايير SAFF للمقارنة حسب الفئة العمرية
const SAFF_BENCHMARKS: Record<string, Record<string, number>> = {
  U15:    { التقنية: 65, البدنية: 60, السرعة: 62, التكتيك: 58, الذهنية: 60, التسديد: 55 },
  U17:    { التقنية: 72, البدنية: 68, السرعة: 70, التكتيك: 65, الذهنية: 67, التسديد: 63 },
  U20:    { التقنية: 78, البدنية: 75, السرعة: 77, التكتيك: 73, الذهنية: 74, التسديد: 70 },
  Senior: { التقنية: 82, البدنية: 80, السرعة: 81, التكتيك: 79, الذهنية: 80, التسديد: 76 },
};

type SAFFReport = {
  reportId: string;
  analysisDate: string;
  playerName: string;
  jerseyNumber: number;
  ageCategory: { label: string; code: string; note: string };
  physicalProfile: {
    bodyType: string; heightCategory: string;
    posture: string; fitnessIndex: string; balance: number;
  };
  athleticIndicators: Record<string, { score: number; label: string; note: string }>;
  technicalIndicators: Record<string, { score: number; label: string; note: string }>;
  mentalIndicators: Record<string, { score: number; label: string; note: string }>;
  sportDNA: Record<string, number>;
  saffBenchmark: {
    meetsStandard: string; technicalLevel: string;
    physicalLevel: string; benchmarkScore: number; note: string;
  };
  recommendation: {
    bestPosition: string; bestPositionCode: string;
    secondPosition: string; secondPositionCode: string;
    suitableAcademies: string[];
    developmentPlan: string; scoutNote: string;
  };
  overallRating: number;
  confidence: { percentage: number; reason: string };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 85) return "#22c55e";
  if (score >= 72) return "#00DCC8";
  if (score >= 60) return "#F59E0B";
  return "#ef4444";
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[#EEEFEE]/60 text-xs w-36 text-right shrink-0" style={{ fontFamily: "'Cairo', sans-serif" }}>{label}</div>
      <div className="flex-1 h-2 rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: getScoreColor(score) }}
        />
      </div>
      <div className="text-sm font-black w-8 text-center" style={{ color: getScoreColor(score), fontFamily: "'Space Grotesk', sans-serif" }}>{score}</div>
    </div>
  );
}

const analysisStages = [
  { label: "رفع الصورة وتحليل الجودة", icon: <FileImage size={14} /> },
  { label: "تحليل الملف الجسدي (FIFA Physical Standards)", icon: <Activity size={14} /> },
  { label: "قياس المؤشرات البدنية — معايير SAFF", icon: <Zap size={14} /> },
  { label: "تحليل المهارات التقنية — معايير FIFA", icon: <Target size={14} /> },
  { label: "تحليل المؤشرات الذهنية وSport DNA", icon: <Brain size={14} /> },
  { label: "توليد تقرير الكشافة الاحترافي", icon: <Shield size={14} /> },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function UploadPage() {
  const { isRTL } = useLanguage();
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [report, setReport] = useState<SAFFReport | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const ALLOWED_VIDEOS = ["video/mp4", "video/quicktime", "video/webm"];

  const handleFile = useCallback((f: File) => {
    const isImg = ALLOWED_IMAGES.includes(f.type);
    const isVid = ALLOWED_VIDEOS.includes(f.type);
    if (!isImg && !isVid) {
      toast.error("يرجى رفع صورة (JPEG, PNG, WebP) أو فيديو (MP4, MOV, WebM)");
      return;
    }
    const maxSize = isVid ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error(isVid ? "حجم الفيديو يجب أن يكون أقل من 50MB" : "حجم الصورة يجب أن يكون أقل من 10MB");
      return;
    }
    setFile(f);
    setIsVideo(isVid);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const startAnalysis = async () => {
    if (!file) return;
    setStep("analyzing");
    setAnalysisError(null);
    setCurrentStage(0);

    // Stage animation
      const totalDuration = isVideo ? 20000 : 12000;
      const stageInterval = totalDuration / analysisStages.length;
      stageTimers.current.forEach(clearTimeout);
      stageTimers.current = [];
      analysisStages.forEach((_, i) => {
        const t = setTimeout(() => setCurrentStage(i + 1), stageInterval * (i + 1));
        stageTimers.current.push(t);
      });

    try {
      // Convert to base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          const result = e.target?.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to scout analysis
      const uploadRes = await fetch("/api/scout/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fileData, mimeType: file.type, fileName: file.name }),
      });
      if (!uploadRes.ok) throw new Error(`فشل رفع الملف: ${uploadRes.status}`);
      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error("لم يتم إرجاع رابط الملف");
      setUploadedImageUrl(uploadData.url);

      // Handle video frames
      let analyzeBody: Record<string, unknown>;
      if (uploadData.isVideo && uploadData.frameUrls?.length > 0) {
        setExtractedFrames(uploadData.frameUrls);
        analyzeBody = { frameUrls: uploadData.frameUrls };
      } else {
        analyzeBody = { imageUrl: uploadData.url };
      }

      // Analyze with scout AI
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);
      const analyzeRes = await fetch("/api/scout/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify(analyzeBody),
      });
      clearTimeout(timeout);
      if (!analyzeRes.ok) throw new Error(`Analysis failed: ${analyzeRes.status}`);
      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error || "فشل التحليل");
      }

      if (analyzeData.report) {
        stageTimers.current.forEach(clearTimeout);
        setCurrentStage(analysisStages.length);
        await new Promise(r => setTimeout(r, 600));
        setReport(analyzeData.report);
        setStep("done");
        return;
      }
      throw new Error("No report in response");
    } catch (err: any) {
      stageTimers.current.forEach(clearTimeout);
      console.error("[Upload] Analysis error:", err?.message);
      setAnalysisError(err?.message || "حدث خطأ أثناء التحليل");
      setStep("upload");
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setPreviewUrl(null);
    setIsVideo(false);
    setReport(null);
    setUploadedImageUrl(null);
    setExtractedFrames([]);
    setAnalysisError(null);
    setCurrentStage(0);
    stageTimers.current.forEach(clearTimeout);
  };

  // Build Radar Chart data comparing player vs SAFF benchmark
  const buildRadarData = (r: SAFFReport) => {
    const bench = SAFF_BENCHMARKS[r.ageCategory.code] || SAFF_BENCHMARKS.U17;
    const tech = r.technicalIndicators;
    const ath = r.athleticIndicators;
    const mental = r.mentalIndicators;
    const avg = (...vals: (number | undefined)[]) => {
      const valid = vals.filter((v): v is number => typeof v === "number");
      return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 65;
    };
    return [
      { subject: "التقنية",  اللاعب: avg(tech?.ballControl?.score, tech?.dribbling?.score, tech?.firstTouch?.score), "معيار SAFF": bench["التقنية"] },
      { subject: "البدنية",  اللاعب: avg(ath?.speed?.score, ath?.agility?.score, ath?.explosiveness?.score), "معيار SAFF": bench["البدنية"] },
      { subject: "السرعة",   اللاعب: ath?.speed?.score ?? 70, "معيار SAFF": bench["السرعة"] },
      { subject: "التكتيك",  اللاعب: avg(tech?.vision?.score, mental?.footballIQ?.score), "معيار SAFF": bench["التكتيك"] },
      { subject: "الذهنية",  اللاعب: avg(mental?.footballIQ?.score, mental?.decisionMaking?.score, mental?.resilience?.score), "معيار SAFF": bench["الذهنية"] },
      { subject: "التسديد",  اللاعب: tech?.shooting?.score ?? 65, "معيار SAFF": bench["التسديد"] },
    ];
  };

  // Build FIFA card from report
  const buildCardPlayer = (r: SAFFReport): FifaCardPlayer => {
    const overall = r.overallRating;
    const level: FifaCardPlayer["level"] =
      overall >= 85 ? "Platinum" : overall >= 75 ? "Gold" : overall >= 65 ? "Silver" : "Bronze";
    const ath = r.athleticIndicators;
    const tech = r.technicalIndicators;
    const birthYear = new Date().getFullYear() - (r.ageCategory.code === "U15" ? 14 : r.ageCategory.code === "U17" ? 16 : r.ageCategory.code === "U20" ? 19 : 22);
    const initials = r.recommendation.bestPositionCode.substring(0, 2);
    return {
      name: r.playerName || "لاعب موهوب",
      jerseyNumber: r.jerseyNumber || overall,
      position: r.recommendation.bestPosition,
      sport: "كرة القدم",
      birthYear,
      sportId: `SA-${birthYear}-${initials}-${String(overall).padStart(4, "0")}`,
      avatar: uploadedImageUrl || undefined,
      level,
      stats: {
        speed:    ath?.speed?.score ?? 70,
        passing:  tech?.passing?.score ?? 68,
        shooting: tech?.shooting?.score ?? 66,
        defense:  r.sportDNA?.CB ?? 60,
        skill:    tech?.ballControl?.score ?? 72,
        strength: ath?.explosiveness?.score ?? 68,
      },
    };
  };

  return (
    <div className="min-h-screen" style={{ background: "#000A0F", color: "#EEEFEE" }} dir="rtl">
      <Ada2aiNavbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">

        {/* ── Header ── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(0,220,200,0.1)", border: "1px solid rgba(0,220,200,0.3)", color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
            <Shield size={12} /> معايير SAFF + FIFA
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Cairo', sans-serif", color: "#EEEFEE" }}>
            تحليل اللاعب بالذكاء الاصطناعي
          </h1>
          <p className="text-[#EEEFEE]/50 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
            ارفع صورة أو فيديو للاعب — يحلل الذكاء الاصطناعي وفق معايير SAFF وFIFA
          </p>
        </motion.div>

        {/* ── STEP: UPLOAD ── */}
        <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {analysisError && (
              <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontFamily: "'Cairo', sans-serif" }}>
                ⚠️ {analysisError}
              </div>
            )}

            {/* Drop zone */}
            <div
              className="rounded-2xl border-2 border-dashed transition-all cursor-pointer"
              style={{
                borderColor: dragOver ? "#00DCC8" : "rgba(255,255,255,0.12)",
                background: dragOver ? "rgba(0,220,200,0.05)" : "rgba(255,255,255,0.02)",
                minHeight: 280,
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {previewUrl ? (
                <div className="flex flex-col items-center justify-center p-6 gap-4">
                  {isVideo ? (
                    <video
                      src={previewUrl}
                      className="rounded-xl object-contain"
                      style={{ maxHeight: 280, maxWidth: "100%" }}
                      controls
                      muted
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="معاينة اللاعب"
                      className="rounded-xl object-contain"
                      style={{ maxHeight: 280, maxWidth: "100%" }}
                    />
                  )}
                  <div className="text-[#EEEFEE]/50 text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {file?.name} — {((file?.size || 0) / 1024).toFixed(0)} KB
                  </div>
                  {isVideo && (
                    <div className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,122,186,0.1)", color: "#007ABA", fontFamily: "'Cairo', sans-serif" }}>
                      سيتم استخراج 3 إطارات تلقائياً وتحليلها معاً
                    </div>
                  )}
                  <div className="text-[#00DCC8] text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    انقر لتغيير الملف
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-12">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(0,220,200,0.1)", border: "1px solid rgba(0,220,200,0.2)" }}>
                      <FileImage size={24} style={{ color: "#00DCC8" }} />
                    </div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(0,122,186,0.1)", border: "1px solid rgba(0,122,186,0.2)" }}>
                      <FileVideo size={24} style={{ color: "#007ABA" }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#EEEFEE] font-bold mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      اسحب صورة أو فيديو اللاعب هنا
                    </div>
                    <div className="text-[#EEEFEE]/40 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      صور: JPEG, PNG, WebP (حتى 10MB)
                    </div>
                    <div className="text-[#EEEFEE]/30 text-xs mt-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      فيديوهات: MP4, MOV, WebM (حتى 50MB)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze button */}
            {file && (
              <button
                onClick={startAnalysis}
                className="w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all"
                style={{
                  background: "linear-gradient(135deg, #007ABA, #00DCC8)",
                  color: "#000A0F",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <Zap size={20} />
                ابدأ التحليل — SAFF + FIFA
              </button>
            )}
          </motion.div>
        )}

        {/* ── STEP: ANALYZING ── */}
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
          <div className="rounded-2xl p-8 space-y-6"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-center">
              <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: "#00DCC8" }} />
              <div className="text-xl font-black mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                جاري التحليل...
              </div>
              <div className="text-[#EEEFEE]/40 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                Claude AI يحلل اللاعب وفق معايير SAFF + FIFA
              </div>
            </div>

            <div className="space-y-3">
              {analysisStages.map((stage, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: i < currentStage ? "rgba(0,220,200,0.15)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${i < currentStage ? "#00DCC8" : "rgba(255,255,255,0.1)"}`,
                      color: i < currentStage ? "#00DCC8" : "rgba(255,255,255,0.3)",
                    }}>
                    {i < currentStage ? <CheckCircle size={12} /> : stage.icon}
                  </div>
                  <span style={{
                    color: i < currentStage ? "#EEEFEE" : i === currentStage ? "#00DCC8" : "rgba(255,255,255,0.3)",
                    fontFamily: "'Cairo', sans-serif",
                  }}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(currentStage / analysisStages.length) * 100}%`,
                  background: "linear-gradient(90deg, #007ABA, #00DCC8)",
                }}
              />
            </div>
          </div>
          </motion.div>
        )}

        {/* ── STEP: DONE ── */}
        {step === "done" && report && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >

            {/* Report Header */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(0,220,200,0.25)", background: "rgba(0,220,200,0.03)" }}>
              <div className="p-5" style={{ background: "linear-gradient(135deg, rgba(0,122,186,0.2), rgba(0,220,200,0.1))", borderBottom: "1px solid rgba(0,220,200,0.15)" }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                      تقرير الكشافة الاحترافي — Ada2ai
                    </div>
                    <div className="font-black text-xl" style={{ fontFamily: "'Cairo', sans-serif", color: "#EEEFEE" }}>
                      {report.playerName || "لاعب موهوب"}
                    </div>
                    <div className="text-[#EEEFEE]/50 text-sm mt-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {report.ageCategory.label} · {report.recommendation.bestPosition}
                    </div>
                    <div className="text-[#EEEFEE]/30 text-xs mt-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {report.reportId} · {report.analysisDate}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-black" style={{ color: getScoreColor(report.overallRating), fontFamily: "'Space Grotesk', sans-serif" }}>
                      {report.overallRating}
                    </div>
                    <div className="text-xs text-[#EEEFEE]/40" style={{ fontFamily: "'Cairo', sans-serif" }}>التقييم الكلي</div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">

                {/* Age + Physical */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>① الفئة العمرية</div>
                    <div className="font-bold text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>{report.ageCategory.label}</div>
                    <div className="text-[#EEEFEE]/40 text-xs mt-1" style={{ fontFamily: "'Cairo', sans-serif" }}>{report.ageCategory.note}</div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>② الملف الجسدي</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div><span className="text-[#EEEFEE]/40" style={{ fontFamily: "'Cairo', sans-serif" }}>الجسم: </span><span style={{ fontFamily: "'Cairo', sans-serif" }}>{report.physicalProfile.bodyType}</span></div>
                      <div><span className="text-[#EEEFEE]/40" style={{ fontFamily: "'Cairo', sans-serif" }}>الطول: </span><span style={{ fontFamily: "'Cairo', sans-serif" }}>{report.physicalProfile.heightCategory}</span></div>
                      <div className="col-span-2"><span className="text-[#EEEFEE]/40" style={{ fontFamily: "'Cairo', sans-serif" }}>التوازن: </span><span style={{ color: getScoreColor(report.physicalProfile.balance), fontFamily: "'Space Grotesk', sans-serif" }}>{report.physicalProfile.balance}/100</span></div>
                    </div>
                    <div className="text-[#EEEFEE]/40 text-xs mt-2" style={{ fontFamily: "'Cairo', sans-serif" }}>{report.physicalProfile.posture}</div>
                  </div>
                </div>

                {/* Athletic Indicators */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Zap size={12} /> ③ المؤشرات البدنية — SAFF Standards
                  </div>
                  <div className="space-y-2">
                    {Object.values(report.athleticIndicators).map((ind) => (
                      <ScoreBar key={ind.label} label={ind.label} score={ind.score} />
                    ))}
                  </div>
                </div>

                {/* Technical Indicators */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Target size={12} /> ④ المؤشرات التقنية — FIFA Technical
                  </div>
                  <div className="space-y-2">
                    {Object.values(report.technicalIndicators).map((ind) => (
                      <ScoreBar key={ind.label} label={ind.label} score={ind.score} />
                    ))}
                  </div>
                </div>

                {/* Mental Indicators */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#8B5CF6", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Brain size={12} /> ⑤ المؤشرات الذهنية — FIFA Mental
                  </div>
                  <div className="space-y-2">
                    {Object.values(report.mentalIndicators).map((ind) => (
                      <ScoreBar key={ind.label} label={ind.label} score={ind.score} />
                    ))}
                  </div>
                </div>

                {/* Radar Chart — SAFF Benchmark */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-1 flex items-center gap-2" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Activity size={12} /> مقارنة بمعيار SAFF — {report.ageCategory.label}
                  </div>
                  <p className="text-[#EEEFEE]/30 text-xs mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    الخط الأخضر: اللاعب — الخط الرمادي: معيار SAFF للفئة العمرية
                  </p>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={buildRadarData(report)} cx="50%" cy="50%" outerRadius="70%">
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#EEEFEE", fontSize: 11, fontFamily: "'Cairo', sans-serif" }}
                        />
                        <Radar name="اللاعب" dataKey="اللاعب" stroke="#00DCC8" fill="#00DCC8" fillOpacity={0.2} strokeWidth={2} />
                        <Radar name="معيار SAFF" dataKey="معيار SAFF" stroke="#666" fill="#666" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                        <Legend wrapperStyle={{ fontFamily: "'Cairo', sans-serif", fontSize: 11, color: "#EEEFEE" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sport DNA */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <BarChart2 size={12} /> Sport DNA — تحليل المركز الأمثل
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(report.sportDNA)
                      .sort(([, a], [, b]) => b - a)
                      .map(([pos, score]) => (
                        <div key={pos} className="flex items-center gap-2">
                          <div className="text-xs font-bold w-10 text-center rounded px-1 py-0.5"
                            style={{ background: "rgba(0,220,200,0.1)", color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                            {pos}
                          </div>
                          <div className="flex-1 h-1.5 rounded-full bg-white/5">
                            <div className="h-full rounded-full" style={{ width: `${score}%`, background: getScoreColor(score) }} />
                          </div>
                          <div className="text-xs font-black w-6" style={{ color: getScoreColor(score), fontFamily: "'Space Grotesk', sans-serif" }}>{score}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* SAFF Benchmark */}
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Shield size={12} /> ⑦ مقارنة بمعايير SAFF العمرية
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="px-3 py-1.5 rounded-full text-sm font-bold"
                      style={{
                        background: report.saffBenchmark.meetsStandard === "نعم" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                        border: `1px solid ${report.saffBenchmark.meetsStandard === "نعم" ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                        color: report.saffBenchmark.meetsStandard === "نعم" ? "#22c55e" : "#F59E0B",
                        fontFamily: "'Cairo', sans-serif",
                      }}>
                      {report.saffBenchmark.meetsStandard}
                    </div>
                    <div className="text-xs text-[#EEEFEE]/40" style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {report.saffBenchmark.note}
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="rounded-xl p-4" style={{ background: "rgba(0,122,186,0.05)", border: "1px solid rgba(0,122,186,0.2)" }}>
                  <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Star size={12} /> ⑧ التوصية النهائية
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>المركز الأمثل: </span>
                      <span className="font-bold" style={{ color: "#00DCC8", fontFamily: "'Cairo', sans-serif" }}>
                        {report.recommendation.bestPosition} ({report.recommendation.bestPositionCode})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>مركز ثانٍ: </span>
                      <span style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {report.recommendation.secondPosition} ({report.recommendation.secondPositionCode})
                      </span>
                    </div>
                  </div>
                  {report.recommendation.suitableAcademies?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-[#EEEFEE]/40 mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>الأكاديميات المناسبة:</div>
                      <div className="flex flex-wrap gap-2">
                        {report.recommendation.suitableAcademies.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs"
                            style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", fontFamily: "'Cairo', sans-serif" }}>
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="text-[#EEEFEE]/70 text-sm leading-relaxed" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {report.recommendation.scoutNote}
                  </div>
                </div>

                {/* Confidence */}
                <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>⑨ ثقة التحليل</div>
                  <div className="flex-1 h-2 rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${report.confidence.percentage}%`, background: "linear-gradient(90deg, #007ABA, #00DCC8)" }} />
                  </div>
                  <div className="font-black text-sm" style={{ color: "#00DCC8", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {report.confidence.percentage}%
                  </div>
                </div>
                <div className="text-[#EEEFEE]/30 text-xs px-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {report.confidence.reason}
                </div>

              </div>
            </div>

            {/* FIFA SportID Card */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.15)" }}>
              <div className="text-xs font-semibold mb-4 flex items-center gap-2" style={{ color: "#FFD700", fontFamily: "'Space Grotesk', sans-serif" }}>
                <Award size={14} /> بطاقة SportID — FIFA Edition
              </div>
              <div className="flex justify-center">
                <FifaCard player={buildCardPlayer(report)} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#EEEFEE",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                تحليل لاعب آخر
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-[#EEEFEE]/20 text-xs pt-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
              Ada2ai — المنصة الرياضية الأولى بمعايير SAFF + FIFA
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
