/**
 * YOLO Video Analysis — Real backend integration
 * Uploads video to YOLO backend (/api/analyze/single) and displays real results
 */

import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import {
  Upload, FileVideo, CheckCircle, Loader2, Users, Zap, Activity,
  Target, Play, RotateCcw, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Step = "idle" | "uploading" | "analyzing" | "done" | "error";

interface AnalysisResult {
  track_id: number;
  total_distance_meters: number;
  average_speed_mps: number;
  max_speed_mps: number;
  positions: { x: number; y: number; frame: number }[];
  frames_analyzed: number;
  video_info: { fps: number; width: number; height: number; frame_count: number; duration: number };
}

function formatMeters(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m.toFixed(1)} m`;
}

function formatSpeed(ms: number) {
  return `${(ms * 3.6).toFixed(1)} km/h`;
}

export default function YOLOAnalysis() {
  const { isRTL } = useLanguage();
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) {
      toast.error("يرجى اختيار ملف فيديو (MP4, MOV, AVI)");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      toast.error("حجم الفيديو يجب أن يكون أقل من 500MB");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const startAnalysis = async () => {
    if (!file) return;
    setStep("uploading");
    setProgress(0);
    setError(null);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 8, 90));
    }, 500);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("conf_threshold", "0.4");
      formData.append("frame_interval", "10");

      const res = await fetch("/yolo/analyze/single", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `خطأ ${res.status}`);
      }

      const data: AnalysisResult = await res.json();

      setTimeout(() => {
        setResult(data);
        setStep("done");
      }, 800);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err?.message || "فشل التحليل");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("idle");
    setProgress(0);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "#000A0F", color: "#EEEFEE" }} dir="rtl">
      <Ada2aiNavbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(0,122,186,0.1)", border: "1px solid rgba(0,122,186,0.3)", color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
            <Zap size={12} /> YOLO v8 — Real-time Detection
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            تحليل فيديو المباراة
          </h1>
          <p className="text-[#EEEFEE]/50 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
            كشف اللاعبين وتتبع الحركة وتحليل الأداء بالذكاء الاصطناعي
          </p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* STEP: IDLE / UPLOAD */}
          {(step === "idle" || (step === "uploading" || step === "analyzing")) && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Drop zone */}
              {!file && step === "idle" && (
                <div
                  className="rounded-2xl border-2 border-dashed transition-all cursor-pointer"
                  style={{ borderColor: "rgba(0,122,186,0.3)", background: "rgba(0,122,186,0.03)", minHeight: 280 }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept="video/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  <div className="flex flex-col items-center justify-center gap-4 p-12">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(0,122,186,0.15)", border: "1px solid rgba(0,122,186,0.3)" }}>
                      <FileVideo size={28} style={{ color: "#007ABA" }} />
                    </div>
                    <div className="text-center">
                      <div className="text-[#EEEFEE] font-bold mb-1">اسحب فيديو المباراة هنا</div>
                      <div className="text-[#EEEFEE]/40 text-sm">MP4, MOV, AVI — حتى 500MB</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {previewUrl && file && (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,122,186,0.2)" }}>
                  <video src={previewUrl} className="w-full max-h-72 object-contain bg-black" controls muted />
                  <div className="p-4 flex items-center justify-between" style={{ background: "rgba(0,122,186,0.05)" }}>
                    <div>
                      <div className="text-sm font-bold">{file.name}</div>
                      <div className="text-xs text-[#EEEFEE]/40">{((file.size) / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                    {step === "idle" && (
                      <div className="flex gap-2">
                        <button onClick={() => { setFile(null); setPreviewUrl(null); }}
                          className="px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          تغيير
                        </button>
                        <button onClick={startAnalysis}
                          className="px-6 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
                          style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#000A0F" }}>
                          <Zap size={14} /> تحليل
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress */}
              {(step === "uploading" || step === "analyzing") && (
                <div className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 size={24} className="animate-spin" style={{ color: "#007ABA" }} />
                    <span className="font-bold">{step === "uploading" ? "جاري رفع وتحليل الفيديو..." : "Dheeb V4 يحلل..."}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #007ABA, #00DCC8)" }} />
                  </div>
                  <div className="text-xs text-[#EEEFEE]/40 mt-2">{Math.round(progress)}%</div>
                  <div className="flex gap-4 mt-4 text-xs text-[#EEEFEE]/30">
                    <span className="flex items-center gap-1"><Users size={12} /> كشف اللاعبين</span>
                    <span className="flex items-center gap-1"><Activity size={12} /> تتبع الحركة</span>
                    <span className="flex items-center gap-1"><Target size={12} /> تحليل الأداء</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP: ERROR */}
          {step === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl p-8 text-center" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={40} className="mx-auto mb-4" style={{ color: "#ef4444" }} />
              <div className="text-lg font-bold mb-2">فشل التحليل</div>
              <div className="text-sm text-[#EEEFEE]/50 mb-6">{error}</div>
              <button onClick={reset}
                className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 mx-auto"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <RotateCcw size={14} /> إعادة المحاولة
              </button>
            </motion.div>
          )}

          {/* STEP: DONE */}
          {step === "done" && result && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Success Header */}
              <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "rgba(0,220,200,0.05)", border: "1px solid rgba(0,220,200,0.2)" }}>
                <CheckCircle size={32} style={{ color: "#00DCC8" }} />
                <div>
                  <div className="font-bold text-lg">اكتمل التحليل!</div>
                  <div className="text-xs text-[#EEEFEE]/40">
                    Track #{result.track_id} • {result.frames_analyzed} إطار • {result.video_info.duration.toFixed(1)} ثانية
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "المسافة الكلية", value: formatMeters(result.total_distance_meters), icon: Activity, color: "#00DCC8" },
                  { label: "متوسط السرعة", value: formatSpeed(result.average_speed_mps), icon: Zap, color: "#007ABA" },
                  { label: "أعلى سرعة", value: formatSpeed(result.max_speed_mps), icon: Play, color: "#FFD700" },
                  { label: "نقاط التتبع", value: result.positions.length.toString(), icon: Target, color: "#8B5CF6" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <stat.icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
                    <div className="text-xl font-black">{stat.value}</div>
                    <div className="text-xs text-[#EEEFEE]/40 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Video Info */}
              <div className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs font-semibold mb-3" style={{ color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
                  معلومات الفيديو
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-[#EEEFEE]/40">FPS: </span><span className="font-bold">{result.video_info.fps}</span></div>
                  <div><span className="text-[#EEEFEE]/40">الأبعاد: </span><span className="font-bold">{result.video_info.width}×{result.video_info.height}</span></div>
                  <div><span className="text-[#EEEFEE]/40">الإطارات: </span><span className="font-bold">{result.video_info.frame_count}</span></div>
                  <div><span className="text-[#EEEFEE]/40">المدة: </span><span className="font-bold">{result.video_info.duration.toFixed(1)}s</span></div>
                </div>
              </div>

              {/* Reset */}
              <button onClick={reset}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#000A0F" }}>
                <RotateCcw size={14} /> تحليل فيديو جديد
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
