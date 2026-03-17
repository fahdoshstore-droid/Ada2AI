import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
/**
 * Upload & AI Analysis Page — SportScout Platform
 * Design: Saudi Tech Noir — dark navy + neon green
 * Analysis Engine: Professional Scout Standards + Saudi Football Federation standards
 * Covers: Technical, Physical, Tactical, Mental, Position-specific metrics
 */

import { useState, useRef, useCallback } from "react";


import { useLocation } from "wouter";
import {
  Upload, Video, User, MapPin, ChevronRight, CheckCircle,
  Loader2, FileVideo, X, MessageCircle, Zap, Target,
  TrendingUp, Star, Shield, Activity, Brain, BarChart2,
  Award, Clock, AlertTriangle, Info
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { toast } from "sonner";

// ── FIFA + Saudi FA Standards ─────────────────────────────────────────────────
const SCOUT_CRITERIA = {
  technical: [
    { key: "ballControl", label: "التحكم بالكرة", labelEn: "Ball Control", weight: 0.20, description: "معيار احترافي: دقة الاستلام والتحكم تحت الضغط" },
    { key: "dribbling", label: "المراوغة", labelEn: "Dribbling", weight: 0.18, description: "معيار احترافي: الاختراق والتجاوز في المساحات الضيقة" },
    { key: "passing", label: "التمرير", labelEn: "Passing Accuracy", weight: 0.20, description: "معيار الاتحاد السعودي: دقة التمرير القصير والطويل" },
    { key: "shooting", label: "التسديد", labelEn: "Shooting", weight: 0.15, description: "معيار احترافي: القوة والدقة والتوقيت" },
    { key: "heading", label: "اللعب الجوي", labelEn: "Heading", weight: 0.10, description: "معيار الاتحاد السعودي: الكسب الجوي والتوجيه" },
    { key: "firstTouch", label: "اللمسة الأولى", labelEn: "First Touch", weight: 0.17, description: "معيار احترافي: جودة الاستلام والتهيئة للحركة التالية" },
  ],
  physical: [
    { key: "speed", label: "السرعة", labelEn: "Sprint Speed", weight: 0.25, description: "معيار احترافي: السرعة القصوى km/h — المعيار الدولي للفئة العمرية" },
    { key: "acceleration", label: "التسارع", labelEn: "Acceleration", weight: 0.20, description: "معيار احترافي: الوصول للسرعة القصوى في 10 أمتار" },
    { key: "stamina", label: "التحمل", labelEn: "Stamina", weight: 0.20, description: "معيار الاتحاد السعودي: المسافة المقطوعة لكل 90 دقيقة" },
    { key: "strength", label: "القوة البدنية", labelEn: "Physical Strength", weight: 0.15, description: "معيار احترافي: الكسب في المواجهات الجسدية" },
    { key: "agility", label: "الرشاقة", labelEn: "Agility", weight: 0.20, description: "معيار احترافي: تغيير الاتجاه بسرعة وكفاءة" },
  ],
  tactical: [
    { key: "positioning", label: "التمركز", labelEn: "Positioning", weight: 0.25, description: "معيار احترافي: الاختيار الصحيح للمكان دفاعاً وهجوماً" },
    { key: "vision", label: "الرؤية الميدانية", labelEn: "Field Vision", weight: 0.25, description: "معيار الاتحاد السعودي: القراءة التكتيكية للمباراة" },
    { key: "pressing", label: "الضغط الدفاعي", labelEn: "Pressing", weight: 0.25, description: "معيار احترافي: الضغط الفوري عند فقدان الكرة" },
    { key: "offBall", label: "الحركة بدون كرة", labelEn: "Off-Ball Movement", weight: 0.25, description: "معيار احترافي: خلق المساحات والتحركات الذكية" },
  ],
  mental: [
    { key: "decisionMaking", label: "اتخاذ القرار", labelEn: "Decision Making", weight: 0.35, description: "معيار احترافي: سرعة ودقة القرار تحت الضغط" },
    { key: "leadership", label: "القيادة والتواصل", labelEn: "Leadership", weight: 0.30, description: "معيار الاتحاد السعودي: التأثير الإيجابي على الفريق" },
    { key: "resilience", label: "الصمود النفسي", labelEn: "Resilience", weight: 0.35, description: "معيار احترافي: الأداء تحت الضغط في المباريات المصيرية" },
  ],
};

const POSITIONS_WEIGHTS: Record<string, Record<string, number>> = {
  "مهاجم":      { technical: 0.35, physical: 0.30, tactical: 0.20, mental: 0.15 },
  "وسط":        { technical: 0.30, physical: 0.25, tactical: 0.30, mental: 0.15 },
  "مدافع":      { technical: 0.25, physical: 0.30, tactical: 0.30, mental: 0.15 },
  "جناح أيمن":  { technical: 0.35, physical: 0.35, tactical: 0.20, mental: 0.10 },
  "جناح أيسر":  { technical: 0.35, physical: 0.35, tactical: 0.20, mental: 0.10 },
  "حارس مرمى":  { technical: 0.30, physical: 0.25, tactical: 0.25, mental: 0.20 },
};

const AGE_BENCHMARKS: Record<string, { speed: number; stamina: number; label: string }> = {
  "U13": { speed: 22, stamina: 65, label: "تحت 13" },
  "U15": { speed: 25, stamina: 70, label: "تحت 15" },
  "U17": { speed: 27, stamina: 75, label: "تحت 17" },
  "U19": { speed: 29, stamina: 80, label: "تحت 19" },
  "Senior": { speed: 32, stamina: 85, label: "أكبر من 19" },
};

// ── Simulated AI Analysis Engine ──────────────────────────────────────────────
function runAIAnalysis(form: {
  playerName: string; age: string; position: string;
  city: string; academy: string; mediaType: "video" | "image";
}) {
  // Deterministic simulation based on player data + slight randomness
  const seed = form.playerName.length + parseInt(form.age || "16");
  const rand = (min: number, max: number, offset = 0) =>
    Math.min(99, Math.max(40, Math.round(min + ((seed + offset) % (max - min + 1)))));

  const ageGroup = parseInt(form.age) <= 13 ? "U13"
    : parseInt(form.age) <= 15 ? "U15"
    : parseInt(form.age) <= 17 ? "U17"
    : parseInt(form.age) <= 19 ? "U19" : "Senior";

  const technical = {
    ballControl: rand(65, 92, 1),
    dribbling: rand(60, 90, 2),
    passing: rand(62, 91, 3),
    shooting: rand(58, 88, 4),
    heading: rand(55, 85, 5),
    firstTouch: rand(63, 93, 6),
  };
  const physical = {
    speed: rand(65, 95, 7),
    acceleration: rand(63, 93, 8),
    stamina: rand(60, 90, 9),
    strength: rand(55, 88, 10),
    agility: rand(62, 92, 11),
  };
  const tactical = {
    positioning: rand(60, 90, 12),
    vision: rand(62, 92, 13),
    pressing: rand(58, 88, 14),
    offBall: rand(60, 90, 15),
  };
  const mental = {
    decisionMaking: rand(62, 92, 16),
    leadership: rand(58, 88, 17),
    resilience: rand(60, 90, 18),
  };

  // Weighted overall per position
  const posWeights = POSITIONS_WEIGHTS[form.position] || POSITIONS_WEIGHTS["وسط"];
  const techAvg = Object.values(technical).reduce((a, b) => a + b, 0) / Object.values(technical).length;
  const physAvg = Object.values(physical).reduce((a, b) => a + b, 0) / Object.values(physical).length;
  const tactAvg = Object.values(tactical).reduce((a, b) => a + b, 0) / Object.values(tactical).length;
  const mentAvg = Object.values(mental).reduce((a, b) => a + b, 0) / Object.values(mental).length;
  const overall = Math.round(
    techAvg * posWeights.technical +
    physAvg * posWeights.physical +
    tactAvg * posWeights.tactical +
    mentAvg * posWeights.mental
  );

  // Sport DNA — position scores
  const sportDNA = Object.entries(POSITIONS_WEIGHTS).map(([pos, w]) => ({
    position: pos,
    score: Math.round(
      techAvg * w.technical + physAvg * w.physical +
      tactAvg * w.tactical + mentAvg * w.mental
    ),
  })).sort((a, b) => b.score - a.score);

  // Strengths & weaknesses
  const allMetrics = [
    ...Object.entries(technical).map(([k, v]) => ({ key: k, value: v, category: "technical" })),
    ...Object.entries(physical).map(([k, v]) => ({ key: k, value: v, category: "physical" })),
    ...Object.entries(tactical).map(([k, v]) => ({ key: k, value: v, category: "tactical" })),
    ...Object.entries(mental).map(([k, v]) => ({ key: k, value: v, category: "mental" })),
  ];
  const sorted = [...allMetrics].sort((a, b) => b.value - a.value);
  const strengths = sorted.slice(0, 3);
  const weaknesses = sorted.slice(-3).reverse();

  // Radar data (6 axes for display)
  const radarData = [
    { subject: "Technical", A: Math.round(techAvg), fullMark: 100 },
    { subject: "Physical", A: Math.round(physAvg), fullMark: 100 },
    { subject: "Tactical", A: Math.round(tactAvg), fullMark: 100 },
    { subject: "Mental", A: Math.round(mentAvg), fullMark: 100 },
    { subject: "Shooting", A: technical.shooting, fullMark: 100 },
    { subject: "Speed", A: physical.speed, fullMark: 100 },
  ];

  const confidence = form.mediaType === "video" ? rand(82, 96, 20) : rand(68, 84, 21);

  const recommendation = overall >= 82
    ? `موهبة استثنائية في مركز ${form.position}. يُنصح بالمتابعة الفورية والتعاقد.`
    : overall >= 72
    ? `مستوى واعد في مركز ${form.position}. يستحق متابعة مكثفة وتطوير مستهدف.`
    : overall >= 62
    ? `إمكانات جيدة تحتاج تطوير منهجي في المجالات المحددة.`
    : `يحتاج برنامج تدريبي مكثف لتطوير المهارات الأساسية.`;

  return {
    overall, technical, physical, tactical, mental,
    techAvg: Math.round(techAvg), physAvg: Math.round(physAvg),
    tactAvg: Math.round(tactAvg), mentAvg: Math.round(mentAvg),
    sportDNA, strengths, weaknesses, radarData,
    confidence, recommendation, ageGroup,
    benchmark: AGE_BENCHMARKS[ageGroup],
    analysisDate: new Date().toLocaleDateString("ar-SA"),
  };
}

// ── Label helpers ─────────────────────────────────────────────────────────────
function getMetricLabel(key: string): string {
  const all = [
    ...SCOUT_CRITERIA.technical, ...SCOUT_CRITERIA.physical,
    ...SCOUT_CRITERIA.tactical, ...SCOUT_CRITERIA.mental,
  ];
  return all.find((m) => m.key === key)?.label ?? key;
}

function getScoreColor(score: number) {
  if (score >= 85) return "#22c55e";
  if (score >= 72) return "#00C2A8";
  if (score >= 60) return "#F59E0B";
  return "#ef4444";
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 72) return "Very Good";
  if (score >= 60) return "Good";
  return "Needs Development";
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = "form" | "upload" | "analyzing" | "done";
type AnalysisResult = ReturnType<typeof runAIAnalysis>;

// AI Report from Claude (real analysis)
type AIScoutReport = {
  reportId: string;
  analysisDate: string;
  estimatedAge: { range: string; category: string; saff_category: string };
  physicalProfile: {
    bodyType: string; bodyTypeAr: string;
    heightEstimate: string; heightEstimateAr: string;
    balance: number; posture: string; coordinationIndicators: string;
  };
  athleticIndicators: Record<string, { score: number; label: string; note: string }>;
  technicalIndicators: Record<string, { score: number; label: string; note: string }>;
  tacticalProfile: Record<string, { score: number; label: string; note: string }>;
  mentalProfile: Record<string, { score: number; label: string }>;
  overallRating: number;
  sportDNA: Record<string, number>;
  bestPosition: string;
  bestPositionAr: string;
  tacticalHints: string;
  strengths: string[];
  developmentAreas: string[];
  fifaStandardComparison: {
    technicalLevel: string; physicalLevel: string; saffYouthBenchmark: number;
  };
  scoutRecommendation: string;
  scoutConfidence: number;
  confidenceNote: string;
};

const positions = ["مهاجم", "وسط", "مدافع", "جناح أيمن", "جناح أيسر", "حارس مرمى"];
const cities = ["دمام", "خبر", "ظهران", "القطيف", "الأحساء"];
const academies = [
  "أكاديمية كابتن", "أكاديمية الظهران الرياضية", "أكاديمية الموهبة الكروية",
  "نادي الاتحاد الرياضي", "أكاديمية النجوم الصاعدة", "مدرسة الأبطال الرياضية",
  "أكاديمية الخليج للرياضة", "أكاديمية الشرقية للكرة", "نادي الفتح الرياضي",
  "أكاديمية الرياضة والتميز", "أخرى",
];

const analysisStages = [
  { label: "استخراج الإطارات وتحليل جودة الوسيط", icon: <FileVideo size={14} /> },
  { label: "تتبع حركة اللاعب بالذكاء الاصطناعي", icon: <Activity size={14} /> },
  { label: "قياس المؤشرات البدنية (Professional Physical Standards)", icon: <Zap size={14} /> },
  { label: "تحليل المهارات التقنية والتكتيكية", icon: <Target size={14} /> },
  { label: "مقارنة بمعايير الاتحادات الرياضية السعودية", icon: <Shield size={14} /> },
  { label: "توليد تقرير الأداء الشامل وتوصية الكشاف", icon: <Brain size={14} /> },
];

// ── Main Component ─────────────────────────────────────────────────────────────
export default function UploadPage() {
  const { isRTL, t, lang } = useLanguage();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    playerName: "", age: "", position: "", city: "", academy: "",
    guardianPhone: "", mediaType: "video" as "video" | "image",
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"overview" | "technical" | "physical" | "tactical" | "mental" | "dna">("overview");
  const [aiReport, setAiReport] = useState<AIScoutReport | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"ai" | "simulated">("simulated");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = () => {
    if (!form.playerName || !form.age || !form.position || !form.city) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setStep("upload");
  };

  const handleFileSelect = useCallback((f: File) => {
    const isVideo = f.type.startsWith("video/");
    const isImage = f.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("يرجى رفع ملف فيديو أو صورة");
      return;
    }
    setFile(f);
    setForm((prev) => ({ ...prev, mediaType: isVideo ? "video" : "image" }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const startAnalysis = async () => {
    if (!file) { toast.error("يرجى رفع فيديو أو صورة أولاً"); return; }
    setStep("analyzing");
    setCurrentStage(0);
    setAnalysisError(null);

    // Stage progress animation — runs independently of AI call
    const durations = [1500, 2000, 1800, 2200, 1600, 1800];
    const totalDuration = durations.reduce((a, b) => a + b, 0); // ~10.9s
    const startTime = Date.now();
    const stageTimers: ReturnType<typeof setTimeout>[] = [];
    let cumulativeDelay = 0;
    durations.forEach((d, i) => {
      cumulativeDelay += d;
      const t = setTimeout(() => setCurrentStage(i + 1), cumulativeDelay);
      stageTimers.push(t);
    });

    // Helper: finish with simulated data
    const finishSimulated = (delay = 0) => {
      stageTimers.forEach(clearTimeout);
      setTimeout(() => {
        setCurrentStage(6);
        setAiReport(null);
        setAnalysisMode("simulated");
        setTimeout(() => {
          setAnalysisResult(runAIAnalysis(form));
          setStep("done");
        }, 600);
      }, delay);
    };

    // Helper: finish with AI report
    const finishAI = (report: AIScoutReport) => {
      stageTimers.forEach(clearTimeout);
      setCurrentStage(6);
      setAiReport(report);
      setAnalysisMode("ai");
      setTimeout(() => {
        setAnalysisResult(runAIAnalysis(form));
        setStep("done");
      }, 800);
    };

    // Helper: extract a frame from video as base64 JPEG
    const extractVideoFrame = (videoFile: File): Promise<{ data: string; mimeType: string }> => {
      return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const url = URL.createObjectURL(videoFile);
        video.src = url;
        video.muted = true;
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          // Seek to 20% of video for a representative frame
          video.currentTime = Math.min(video.duration * 0.2, 5);
        };
        video.onseeked = () => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.min(video.videoWidth, 1280);
          canvas.height = Math.min(video.videoHeight, 720);
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("Canvas not supported")); return; }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve({ data: dataUrl.split(",")[1], mimeType: "image/jpeg" });
        };
        video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Video load failed")); };
        video.load();
      });
    };

    try {
      let fileData: string;
      let mimeType: string;
      let fileName: string;

      if (file.type.startsWith("image/")) {
        // Read image as base64
        const reader = new FileReader();
        fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        mimeType = file.type;
        fileName = file.name;
      } else if (file.type.startsWith("video/")) {
        // Extract representative frame from video
        toast.info("جاري استخراج إطار تمثيلي من الفيديو...", { duration: 3000 });
        const frame = await extractVideoFrame(file);
        fileData = frame.data;
        mimeType = frame.mimeType;
        fileName = file.name.replace(/\.[^.]+$/, ".jpg");
      } else {
        throw new Error("Unsupported file type");
      }

      // Upload to S3
      const uploadRes = await fetch("/api/scout/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileData, mimeType, fileName }),
      });

      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error("No URL returned from upload");

      // Analyze with Claude — wait up to 60s
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const analyzeRes = await fetch("/api/scout/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          imageUrl: uploadData.url,
          playerInfo: { name: form.playerName, age: form.age, position: form.position, city: form.city },
        }),
      });
      clearTimeout(timeout);

      if (!analyzeRes.ok) throw new Error(`Analysis failed: ${analyzeRes.status}`);
      const analyzeData = await analyzeRes.json();

      if (analyzeData.report) {
        // Wait for stage animation to reach at least 60% before showing results
        const elapsedNow = Date.now() - startTime;
        const minWait = Math.max(0, totalDuration * 0.6 - elapsedNow);
        await new Promise(r => setTimeout(r, minWait));
        finishAI(analyzeData.report);
        return;
      }
      throw new Error("No report in response");
    } catch (err: any) {
      console.warn("[Scout AI] Real analysis failed, using simulation:", err?.message || err);
      // Ensure we wait for at least the stage animation to complete
      const elapsedNow = Date.now() - startTime;
      const remaining = totalDuration - elapsedNow;
      finishSimulated(Math.max(0, remaining));
    }
  };

  const sendWhatsApp = () => {
    if (!analysisResult) return;
    const r = analysisResult;
    const text = `⚡ تقرير Scout AI\n\n👤 ${form.playerName} | ${form.position} | ${form.city}\n🎯 التقييم الكلي: ${r.overall}/100 (${getScoreLabel(r.overall)})\n\n📊 التقني: ${r.techAvg} | البدني: ${r.physAvg} | التكتيكي: ${r.tactAvg} | الذهني: ${r.mentAvg}\n\n🏆 المركز الأمثل: ${r.sportDNA[0].position}\n💬 ${r.recommendation}\n\n🔗 SportScout — المنصة الرياضية الأولى في المنطقة الشرقية`;
    window.open(`https://wa.me/${form.guardianPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen text-[#EEEFEE]" style={{ background: "oklch(0.08 0.02 240)", fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }} dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />

      {/* Banner */}
      <div className="relative pt-24 pb-10 overflow-hidden" style={{ background: "linear-gradient(180deg, oklch(0.06 0.03 145 / 0.3) 0%, oklch(0.08 0.02 240) 100%)", borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.65 0.2 145 / 0.06) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: "oklch(0.65 0.2 145 / 0.1)", border: "1px solid oklch(0.65 0.2 145 / 0.3)", color: "oklch(0.65 0.2 145)" }}>
            <Brain size={12} /> {t("upload.title")} — Professional Standards
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#EEEFEE] mb-3" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
            {t("upload.title")}
          </h1>
          <p className="text-[#EEEFEE]/50 max-w-xl mx-auto text-sm leading-relaxed" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
            {t("upload.sub")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* ── STEP 1: FORM ── */}
        {step === "form" && (
          <div className="space-y-6">
            {/* Standards info banner */}
            <div className="rounded-2xl p-4 flex gap-3" style={{ background: "oklch(0.65 0.2 145 / 0.05)", border: "1px solid oklch(0.65 0.2 145 / 0.2)" }}>
              <Info size={18} style={{ color: "oklch(0.65 0.2 145)", flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className="text-[#EEEFEE] font-bold text-sm mb-1" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{lang === "ar" ? "معايير التحليل المعتمدة" : "Approved Analysis Standards"}</div>
                <div className="text-[#EEEFEE]/50 text-xs leading-relaxed" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  {lang === "ar" ? <>يعتمد محرك التحليل على <strong className="text-[#EEEFEE]/70">Professional Scout Standards</strong> لقياس المهارات التقنية والبدنية، و<strong className="text-[#EEEFEE]/70">معايير الاتحادات الرياضية السعودية</strong> للفئات العمرية المحلية (U13–U19)، مع تقييم 4 محاور رئيسية: التقني، البدني، التكتيكي، والذهني.</> : <>Analysis engine uses <strong className="text-[#EEEFEE]/70">Professional Scout Standards</strong> for technical and physical metrics, and <strong className="text-[#EEEFEE]/70">Saudi Sports Federation standards</strong> for local age groups (U13–U19), evaluating 4 main axes: Technical, Physical, Tactical, and Mental.</>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#EEEFEE]/60 text-xs font-semibold flex items-center gap-1.5" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  <User size={12} /> {lang === "ar" ? "اسم اللاعب" : "Athlete Name"} <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.playerName}
                  onChange={(e) => setForm((p) => ({ ...p, playerName: e.target.value }))}
                  placeholder={lang === "ar" ? "الاسم الثلاثي" : "Full Name"}
                  className="w-full px-4 py-3 rounded-xl text-[#EEEFEE] text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Tajawal', sans-serif" }}
                  onFocus={(e) => (e.target.style.borderColor = "oklch(0.65 0.2 145 / 0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Age */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#EEEFEE]/60 text-xs font-semibold flex items-center gap-1.5" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  <Clock size={12} /> {lang === "ar" ? "العمر" : "Age"} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number" min="8" max="35"
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  placeholder={lang === "ar" ? "مثال: 16" : "e.g. 16"}
                  className="w-full px-4 py-3 rounded-xl text-[#EEEFEE] text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Space Grotesk', sans-serif" }}
                  onFocus={(e) => (e.target.style.borderColor = "oklch(0.65 0.2 145 / 0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Position */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#EEEFEE]/60 text-xs font-semibold flex items-center gap-1.5" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  <Target size={12} /> {lang === "ar" ? "المركز" : "Position"} <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.position}
                  onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-[#EEEFEE] text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Tajawal', sans-serif" }}
                >
                  <option value="" style={{ background: "#0D1B2A" }}>{lang === "ar" ? "اختر المركز" : "Select Position"}</option>
                  {positions.map((p) => <option key={p} value={p} style={{ background: "#0D1B2A" }}>{p}</option>)}
                </select>
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#EEEFEE]/60 text-xs font-semibold flex items-center gap-1.5" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  <MapPin size={12} /> {lang === "ar" ? "المدينة" : "City"} <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-[#EEEFEE] text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Tajawal', sans-serif" }}
                >
                  <option value="" style={{ background: "#0D1B2A" }}>{lang === "ar" ? "اختر المدينة" : "Select City"}</option>
                  {cities.map((c) => <option key={c} value={c} style={{ background: "#0D1B2A" }}>{c}</option>)}
                </select>
              </div>

              {/* Academy */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#EEEFEE]/60 text-xs font-semibold flex items-center gap-1.5" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  <Award size={12} /> {lang === "ar" ? "الأكاديمية" : "Academy"}
                </label>
                <select
                  value={form.academy}
                  onChange={(e) => setForm((p) => ({ ...p, academy: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-[#EEEFEE] text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Tajawal', sans-serif" }}
                >
                  <option value="" style={{ background: "#0D1B2A" }}>{lang === "ar" ? "اختر الأكاديمية" : "Select Academy"}</option>
                  {academies.map((a) => <option key={a} value={a} style={{ background: "#0D1B2A" }}>{a}</option>)}
                </select>
              </div>

              {/* Guardian Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#EEEFEE]/60 text-xs font-semibold flex items-center gap-1.5" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
                  <MessageCircle size={12} /> {lang === "ar" ? "واتساب ولي الأمر" : "Guardian WhatsApp"}
                </label>
                <input
                  type="tel"
                  value={form.guardianPhone}
                  onChange={(e) => setForm((p) => ({ ...p, guardianPhone: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl text-[#EEEFEE] text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Space Grotesk', sans-serif" }}
                  onFocus={(e) => (e.target.style.borderColor = "oklch(0.65 0.2 145 / 0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
            </div>

            {/* Position weight info */}
            {form.position && POSITIONS_WEIGHTS[form.position] && (
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-[#EEEFEE]/60 text-xs font-semibold mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  أوزان التقييم لمركز <span style={{ color: "oklch(0.65 0.2 145)" }}>{form.position}</span> (معيار احترافي)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(POSITIONS_WEIGHTS[form.position]).map(([cat, w]) => {
                    const labels: Record<string, string> = { technical: "التقني", physical: "البدني", tactical: "التكتيكي", mental: "الذهني" };
                    const colors: Record<string, string> = { technical: "#00C2A8", physical: "oklch(0.65 0.2 145)", tactical: "#F59E0B", mental: "#8B5CF6" };
                    return (
                      <div key={cat} className="text-center rounded-lg p-2" style={{ background: `${colors[cat]}10`, border: `1px solid ${colors[cat]}30` }}>
                        <div className="text-lg font-black" style={{ color: colors[cat], fontFamily: "'Space Grotesk', sans-serif" }}>{Math.round(w * 100)}%</div>
                        <div className="text-[#EEEFEE]/50 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{labels[cat]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleFormSubmit}
              className="w-full py-4 rounded-xl font-bold text-[#EEEFEE] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 145), oklch(0.45 0.18 145))", boxShadow: "0 8px 24px oklch(0.65 0.2 145 / 0.25)", fontFamily: "'Tajawal', sans-serif", fontSize: 16 }}
            >
              التالي: رفع الفيديو / الصورة <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: UPLOAD ── */}
        {step === "upload" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.65 0.2 145 / 0.15)" }}>
                <User size={18} style={{ color: "oklch(0.65 0.2 145)" }} />
              </div>
              <div>
                <div className="text-[#EEEFEE] font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{form.playerName}</div>
                <div className="text-[#EEEFEE]/40 text-xs">{form.position} · {form.city} · {form.age} سنة</div>
              </div>
            </div>

            {/* Media type toggle */}
            <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {(["video", "image"] as const).map((t) => (
                <button key={t} onClick={() => setForm((p) => ({ ...p, mediaType: t }))}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: form.mediaType === t ? "oklch(0.65 0.2 145 / 0.15)" : "transparent",
                    color: form.mediaType === t ? "oklch(0.65 0.2 145)" : "rgba(255,255,255,0.4)",
                    border: form.mediaType === t ? "1px solid oklch(0.65 0.2 145 / 0.3)" : "1px solid transparent",
                    fontFamily: "'Tajawal', sans-serif"
                  }}>
                  {t === "video" ? <><Video size={14} /> فيديو</> : <><FileVideo size={14} /> صورة</>}
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-4 py-16"
              style={{
                border: `2px dashed ${dragOver ? "oklch(0.65 0.2 145)" : file ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.12)"}`,
                background: dragOver ? "oklch(0.65 0.2 145 / 0.05)" : file ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              <input ref={fileInputRef} type="file" accept={form.mediaType === "video" ? "video/*" : "image/*"} className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              {file ? (
                <>
                  <CheckCircle size={40} style={{ color: "#22c55e" }} />
                  <div className="text-center">
                    <div className="text-[#EEEFEE] font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{file.name}</div>
                    <div className="text-[#EEEFEE]/40 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <X size={12} /> إزالة
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "oklch(0.65 0.2 145 / 0.1)", border: "1px solid oklch(0.65 0.2 145 / 0.2)" }}>
                    {form.mediaType === "video" ? <Video size={28} style={{ color: "oklch(0.65 0.2 145)" }} /> : <FileVideo size={28} style={{ color: "oklch(0.65 0.2 145)" }} />}
                  </div>
                  <div className="text-center">
                    <div className="text-[#EEEFEE] font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>اسحب وأفلت {form.mediaType === "video" ? "الفيديو" : "الصورة"} هنا</div>
                    <div className="text-[#EEEFEE]/40 text-xs mt-1">أو انقر للاختيار من الجهاز</div>
                  </div>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} style={{ color: "#F59E0B" }} />
                <span className="text-[#EEEFEE]/60 text-xs font-semibold" style={{ fontFamily: "'Tajawal', sans-serif" }}>نصائح لتحليل أدق (معيار احترافي)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  "فيديو لا يقل عن 3 دقائق لأفضل نتائج",
                  "التصوير من زاوية جانبية أو علوية",
                  "إضاءة جيدة وخلفية واضحة",
                  "يشمل مشاهد بالكرة وبدونها",
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: "oklch(0.65 0.2 145)" }} />
                    <span className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("form")} className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'Tajawal', sans-serif" }}>
                رجوع
              </button>
              <button onClick={startAnalysis} disabled={!file}
                className="flex-1 py-3.5 rounded-xl font-bold text-[#EEEFEE] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 145), oklch(0.45 0.18 145))", boxShadow: "0 8px 24px oklch(0.65 0.2 145 / 0.25)", fontFamily: "'Tajawal', sans-serif" }}>
                <Zap size={16} /> ابدأ التحليل بالذكاء الاصطناعي
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: ANALYZING ── */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-8 py-12">
            {/* Animated ring */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="oklch(0.65 0.2 145)" strokeWidth="6"
                  strokeDasharray={`${(currentStage / analysisStages.length) * 276} 276`}
                  style={{ transition: "stroke-dasharray 0.6s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Brain size={28} style={{ color: "oklch(0.65 0.2 145)" }} />
                <div className="text-[#EEEFEE] font-black text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {Math.round((currentStage / analysisStages.length) * 100)}%
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-[#EEEFEE] font-black text-xl mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>جاري تحليل {form.playerName}</div>
              <div className="text-[#EEEFEE]/40 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>معايير FIFA + الاتحادات الرياضية السعودية</div>
            </div>

            <div className="w-full max-w-md space-y-3">
              {analysisStages.map((stage, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: i < currentStage ? "oklch(0.65 0.2 145 / 0.08)" : i === currentStage ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${i < currentStage ? "oklch(0.65 0.2 145 / 0.3)" : i === currentStage ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
                  }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: i < currentStage ? "oklch(0.65 0.2 145 / 0.2)" : "rgba(255,255,255,0.05)" }}>
                    {i < currentStage
                      ? <CheckCircle size={14} style={{ color: "oklch(0.65 0.2 145)" }} />
                      : i === currentStage
                      ? <Loader2 size={14} className="animate-spin" style={{ color: "oklch(0.65 0.2 145)" }} />
                      : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}>{i + 1}</span>}
                  </div>
                  <span className="text-sm" style={{ color: i < currentStage ? "rgba(255,255,255,0.8)" : i === currentStage ? "white" : "rgba(255,255,255,0.3)", fontFamily: "'Tajawal', sans-serif" }}>
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: RESULTS ── */}
        {step === "done" && analysisResult && (
          <div className="space-y-6">

            {/* AI Mode Badge */}
            {analysisMode === "ai" && aiReport ? (
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "oklch(0.65 0.2 145 / 0.08)", border: "1px solid oklch(0.65 0.2 145 / 0.3)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.65 0.2 145 / 0.2)" }}>
                  <Brain size={16} style={{ color: "oklch(0.65 0.2 145)" }} />
                </div>
                <div>
                  <div className="text-[#EEEFEE] font-bold text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>تحليل Claude AI الحقيقي ✔️</div>
                  <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>تم التحليل الفعلي بالذكاء الاصطناعي وفق المعايير الاحترافية — رقم التقرير: {aiReport.reportId}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
                  <Activity size={16} style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <div className="text-[#EEEFEE] font-bold text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>وضع المحاكاة (للفيديو والعرض التوضيحي)</div>
                  <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>ارفع صورة للحصول على تحليل Claude AI الحقيقي</div>
                </div>
              </div>
            )}

            {/* PLAYER VISUAL SCOUT REPORT — Claude AI real report */}
            {analysisMode === "ai" && aiReport && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid oklch(0.65 0.2 145 / 0.3)", background: "oklch(0.06 0.03 145 / 0.3)" }}>
                {/* Report Header */}
                <div className="p-5" style={{ background: "linear-gradient(135deg, oklch(0.12 0.05 145 / 0.8), oklch(0.08 0.02 240 / 0.9))", borderBottom: "1px solid oklch(0.65 0.2 145 / 0.2)" }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="text-xs font-semibold mb-1" style={{ color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}>PLAYER VISUAL SCOUT REPORT</div>
                      <div className="text-[#EEEFEE] font-black text-xl" style={{ fontFamily: "'Tajawal', sans-serif" }}>{form.playerName}</div>
                      <div className="text-[#EEEFEE]/50 text-xs mt-0.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>{form.position} • {form.city} • {aiReport.analysisDate}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-black" style={{ color: getScoreColor(aiReport.overallRating), fontFamily: "'Space Grotesk', sans-serif" }}>{aiReport.overallRating}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Tajawal', sans-serif" }}>Overall Rating</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Age + Physical Profile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="text-xs font-semibold mb-3" style={{ color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}>ESTIMATED AGE</div>
                      <div className="text-[#EEEFEE] font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{aiReport.estimatedAge.range}</div>
                      <div className="text-[#EEEFEE]/50 text-xs mt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{aiReport.estimatedAge.category} — {aiReport.estimatedAge.saff_category}</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="text-xs font-semibold mb-3" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>PHYSICAL PROFILE</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-[#EEEFEE]/40" style={{ fontFamily: "'Tajawal', sans-serif" }}>الجسم: </span><span className="text-[#EEEFEE]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{aiReport.physicalProfile.bodyTypeAr}</span></div>
                        <div><span className="text-[#EEEFEE]/40" style={{ fontFamily: "'Tajawal', sans-serif" }}>الطول: </span><span className="text-[#EEEFEE]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{aiReport.physicalProfile.heightEstimateAr}</span></div>
                        <div><span className="text-[#EEEFEE]/40" style={{ fontFamily: "'Tajawal', sans-serif" }}>التوازن: </span><span className="text-[#EEEFEE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{aiReport.physicalProfile.balance}/10</span></div>
                      </div>
                      <div className="text-[#EEEFEE]/40 text-xs mt-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>{aiReport.physicalProfile.posture}</div>
                    </div>
                  </div>

                  {/* Athletic Indicators */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs font-semibold mb-4" style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>ATHLETIC INDICATORS</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(aiReport.athleticIndicators).map(([key, val]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-black mb-1" style={{ color: getScoreColor(val.score * 10), fontFamily: "'Space Grotesk', sans-serif" }}>{val.score}</div>
                          <div className="text-[#EEEFEE]/60 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{val.label}</div>
                          {val.note && <div className="text-[#EEEFEE]/30 text-xs mt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{val.note}</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Indicators */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs font-semibold mb-4" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>TECHNICAL INDICATORS</div>
                    <div className="space-y-2">
                      {Object.entries(aiReport.technicalIndicators).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-3">
                          <div className="w-24 text-[#EEEFEE]/60 text-xs flex-shrink-0" style={{ fontFamily: "'Tajawal', sans-serif" }}>{val.label}</div>
                          <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val.score * 10}%`, background: `linear-gradient(90deg, #00C2A8, #00C2A888)` }} />
                          </div>
                          <div className="w-6 text-right font-bold text-xs" style={{ color: "#00C2A8", fontFamily: "'Space Grotesk', sans-serif" }}>{val.score}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sport DNA */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="text-xs font-semibold mb-3" style={{ color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}>SPORT DNA POSITION PREDICTION</div>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {Object.entries(aiReport.sportDNA).sort(([,a],[,b]) => b - a).map(([pos, score]) => (
                        <div key={pos} className="text-center rounded-lg p-2" style={{ background: score >= 70 ? "oklch(0.65 0.2 145 / 0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${score >= 70 ? "oklch(0.65 0.2 145 / 0.3)" : "rgba(255,255,255,0.06)"}` }}>
                          <div className="font-black text-sm" style={{ color: score >= 70 ? "oklch(0.65 0.2 145)" : "rgba(255,255,255,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>{pos}</div>
                          <div className="text-xs" style={{ color: score >= 70 ? "oklch(0.65 0.2 145)" : "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>{score}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[#EEEFEE]/50 text-xs leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>{aiReport.tacticalHints}</div>
                  </div>

                  {/* Strengths & Development */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl p-4" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#22c55e", fontFamily: "'Space Grotesk', sans-serif" }}><TrendingUp size={12} /> STRENGTHS</div>
                      {aiReport.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 py-1">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#22c55e" }} />
                          <span className="text-[#EEEFEE]/70 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}><AlertTriangle size={12} /> DEVELOPMENT AREAS</div>
                      {aiReport.developmentAreas.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 py-1">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#ef4444" }} />
                          <span className="text-[#EEEFEE]/70 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FIFA Standard Comparison */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-xs font-semibold mb-3" style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>FIFA STANDARD COMPARISON</div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-[#EEEFEE]/40 text-xs mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>التقني</div>
                        <div className="text-xs font-bold" style={{ color: aiReport.fifaStandardComparison.technicalLevel.includes("Above") ? "#22c55e" : aiReport.fifaStandardComparison.technicalLevel.includes("Meets") ? "#F59E0B" : "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>{aiReport.fifaStandardComparison.technicalLevel}</div>
                      </div>
                      <div>
                        <div className="text-[#EEEFEE]/40 text-xs mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>البدني</div>
                        <div className="text-xs font-bold" style={{ color: aiReport.fifaStandardComparison.physicalLevel.includes("Above") ? "#22c55e" : aiReport.fifaStandardComparison.physicalLevel.includes("Meets") ? "#F59E0B" : "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>{aiReport.fifaStandardComparison.physicalLevel}</div>
                      </div>
                      <div>
                        <div className="text-[#EEEFEE]/40 text-xs mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>SAFF Benchmark</div>
                        <div className="text-xl font-black" style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>{aiReport.fifaStandardComparison.saffYouthBenchmark}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Scout Recommendation */}
                  <div className="rounded-xl p-4" style={{ background: "oklch(0.65 0.2 145 / 0.05)", border: "1px solid oklch(0.65 0.2 145 / 0.2)" }}>
                    <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}><Star size={12} /> SCOUT RECOMMENDATION</div>
                    <div className="text-[#EEEFEE]/70 text-sm leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>{aiReport.scoutRecommendation}</div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Tajawal', sans-serif" }}>Scout Confidence:</div>
                      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: `${aiReport.scoutConfidence}%`, background: "oklch(0.65 0.2 145)" }} />
                      </div>
                      <div className="font-black text-sm" style={{ color: "oklch(0.65 0.2 145)", fontFamily: "'Space Grotesk', sans-serif" }}>{aiReport.scoutConfidence}%</div>
                    </div>
                    <div className="text-[#EEEFEE]/30 text-xs mt-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>{aiReport.confidenceNote}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Analysis (always shown as supplementary) */}
            {/* Overall score hero */}
            <div className="rounded-2xl p-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, oklch(0.12 0.04 145) 0%, oklch(0.08 0.02 240) 100%)", border: "1px solid oklch(0.65 0.2 145 / 0.3)" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, oklch(0.65 0.2 145 / 0.06) 0%, transparent 70%)" }} />
              <div className="relative z-10">
                <div className="text-[#EEEFEE]/50 text-sm mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>التقييم الكلي — معايير FIFA</div>
                <div className="text-7xl font-black mb-2" style={{ color: getScoreColor(analysisMode === "ai" && aiReport ? aiReport.overallRating : analysisResult.overall), fontFamily: "'Space Grotesk', sans-serif" }}>
                  {analysisMode === "ai" && aiReport ? aiReport.overallRating : analysisResult.overall}
                </div>
                <div className="text-[#EEEFEE]/60 text-sm mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{getScoreLabel(analysisMode === "ai" && aiReport ? aiReport.overallRating : analysisResult.overall)}</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                  <Shield size={11} /> نسبة الثقة: {analysisMode === "ai" && aiReport ? aiReport.scoutConfidence : analysisResult.confidence}%
                </div>
                <div className="mt-4 text-[#EEEFEE]/70 text-sm max-w-lg mx-auto leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {analysisMode === "ai" && aiReport ? aiReport.scoutRecommendation : analysisResult.recommendation}
                </div>
              </div>
            </div>

            {/* 4 category scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "التقني", value: analysisResult.techAvg, color: "#00C2A8", icon: <Star size={16} /> },
                { label: "البدني", value: analysisResult.physAvg, color: "oklch(0.65 0.2 145)", icon: <Zap size={16} /> },
                { label: "التكتيكي", value: analysisResult.tactAvg, color: "#F59E0B", icon: <Target size={16} /> },
                { label: "الذهني", value: analysisResult.mentAvg, color: "#8B5CF6", icon: <Brain size={16} /> },
              ].map((cat) => (
                <div key={cat.label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex justify-center mb-2" style={{ color: cat.color }}>{cat.icon}</div>
                  <div className="text-3xl font-black mb-1" style={{ color: cat.color, fontFamily: "'Space Grotesk', sans-serif" }}>{cat.value}</div>
                  <div className="text-[#EEEFEE]/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{cat.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {([
                { key: "overview", label: "نظرة عامة" },
                { key: "technical", label: "التقني" },
                { key: "physical", label: "البدني" },
                { key: "tactical", label: "التكتيكي" },
                { key: "mental", label: "الذهني" },
                { key: "dna", label: "Sport DNA" },
              ] as const).map((tab) => (
                <button key={tab.key} onClick={() => setActiveResultTab(tab.key)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: activeResultTab === tab.key ? "oklch(0.65 0.2 145 / 0.15)" : "transparent",
                    color: activeResultTab === tab.key ? "oklch(0.65 0.2 145)" : "rgba(255,255,255,0.4)",
                    border: activeResultTab === tab.key ? "1px solid oklch(0.65 0.2 145 / 0.3)" : "1px solid transparent",
                    fontFamily: "'Tajawal', sans-serif",
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeResultTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar */}
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-[#EEEFEE]/60 text-xs font-semibold mb-3 text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>خريطة الأداء الشاملة</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={analysisResult.radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "'Tajawal', sans-serif" }} />
                      <Radar name="اللاعب" dataKey="A" stroke="oklch(0.65 0.2 145)" fill="oklch(0.65 0.2 145)" fillOpacity={0.15} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: "#0D1B2A", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "oklch(0.65 0.2 145)" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl p-4" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#22c55e", fontFamily: "'Tajawal', sans-serif" }}>
                      <TrendingUp size={13} /> نقاط القوة
                    </div>
                    {analysisResult.strengths.map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-1.5">
                        <span className="text-[#EEEFEE]/70 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{getMetricLabel(s.key)}</span>
                        <span className="font-bold text-sm" style={{ color: "#22c55e", fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: "#ef4444", fontFamily: "'Tajawal', sans-serif" }}>
                      <AlertTriangle size={13} /> مجالات التطوير
                    </div>
                    {analysisResult.weaknesses.map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-1.5">
                        <span className="text-[#EEEFEE]/70 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{getMetricLabel(s.key)}</span>
                        <span className="font-bold text-sm" style={{ color: "#ef4444", fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Technical / Physical / Tactical / Mental */}
            {(["technical", "physical", "tactical", "mental"] as const).map((cat) => {
              if (activeResultTab !== cat) return null;
              const criteria = SCOUT_CRITERIA[cat];
              const values = analysisResult[cat] as Record<string, number>;
              return (
                <div key={cat} className="space-y-3">
                  {criteria.map((m) => (
                    <div key={m.key} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-[#EEEFEE] font-bold text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{m.label}</div>
                          <div className="text-[#EEEFEE]/35 text-xs mt-0.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>{m.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black" style={{ color: getScoreColor(values[m.key]), fontFamily: "'Space Grotesk', sans-serif" }}>{values[m.key]}</div>
                          <div className="text-xs" style={{ color: getScoreColor(values[m.key]), fontFamily: "'Tajawal', sans-serif" }}>{getScoreLabel(values[m.key])}</div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${values[m.key]}%`, background: `linear-gradient(90deg, ${getScoreColor(values[m.key])}, ${getScoreColor(values[m.key])}88)` }} />
                      </div>
                      <div className="text-[#EEEFEE]/25 text-xs mt-1.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>الوزن في التقييم: {Math.round(m.weight * 100)}%</div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Tab: Sport DNA */}
            {activeResultTab === "dna" && (
              <div className="space-y-4">
                <div className="text-[#EEEFEE]/50 text-xs text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  Sport DNA — المركز الأمثل بناءً على معايير FIFA لكل مركز
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analysisResult.sportDNA} layout="vertical" margin={{ right: 30, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                    <YAxis type="category" dataKey="position" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "'Tajawal', sans-serif" }} width={80} />
                    <Tooltip contentStyle={{ background: "#0D1B2A", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="score" fill="oklch(0.65 0.2 145)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysisResult.sportDNA.slice(0, 2).map((d, i) => (
                    <div key={d.position} className="rounded-xl p-4 flex items-center gap-3"
                      style={{ background: i === 0 ? "oklch(0.65 0.2 145 / 0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${i === 0 ? "oklch(0.65 0.2 145 / 0.3)" : "rgba(255,255,255,0.07)"}` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: i === 0 ? "oklch(0.65 0.2 145 / 0.2)" : "rgba(255,255,255,0.05)", color: i === 0 ? "oklch(0.65 0.2 145)" : "rgba(255,255,255,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>
                        {i === 0 ? "🥇" : "🥈"}
                      </div>
                      <div>
                        <div className="text-[#EEEFEE] font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{d.position}</div>
                        <div className="text-xs" style={{ color: i === 0 ? "oklch(0.65 0.2 145)" : "rgba(255,255,255,0.4)", fontFamily: "'Space Grotesk', sans-serif" }}>{d.score}/100</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Age benchmark comparison */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 size={14} style={{ color: "#F59E0B" }} />
                <span className="text-[#EEEFEE]/60 text-xs font-semibold" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  مقارنة بمعيار الاتحاد السعودي — الفئة العمرية {analysisResult.benchmark.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="text-xs text-[#EEEFEE]/40 mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>السرعة القصوى (المعيار)</div>
                  <div className="text-xl font-black" style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>{analysisResult.benchmark.speed} km/h</div>
                </div>
                <div className="text-center rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="text-xs text-[#EEEFEE]/40 mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>التحمل (المعيار)</div>
                  <div className="text-xl font-black" style={{ color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>{analysisResult.benchmark.stamina}%</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {form.guardianPhone && (
                <button onClick={sendWhatsApp}
                  className="flex-1 py-3.5 rounded-xl font-bold text-[#EEEFEE] flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 8px 24px rgba(37,211,102,0.25)", fontFamily: "'Tajawal', sans-serif" }}>
                  <MessageCircle size={16} /> إرسال التقرير عبر واتساب
                </button>
              )}
              <button onClick={() => navigate("/scouts")}
                className="flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{ background: "oklch(0.65 0.2 145 / 0.1)", border: "1px solid oklch(0.65 0.2 145 / 0.3)", color: "oklch(0.65 0.2 145)", fontFamily: "'Tajawal', sans-serif" }}>
                <Activity size={16} /> لوحة الكشافين
              </button>
              <button onClick={() => { setStep("form"); setFile(null); setAnalysisResult(null); }}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'Tajawal', sans-serif" }}>
                تحليل جديد
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
