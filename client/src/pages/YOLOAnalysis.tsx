/**
 * Ada2AI Vision Analysis — Unified Sports Intelligence Frontend
 * Connects to /analyze/full for complete: detect → track → pose → events → graph
 * Also supports /analyze/single and /analyze/team (backward-compatible)
 */

import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import {
  Upload, FileVideo, CheckCircle, Loader2, Users, Zap, Activity,
  Target, Play, RotateCcw, AlertCircle, BarChart3, Navigation,
  TrendingUp, Shield, Swords, Timer,
} from "lucide-react";
import { toast } from "sonner";

type Step = "idle" | "uploading" | "analyzing" | "done" | "error";
type Mode = "single" | "team" | "full";

interface VideoInfo { fps: number; width: number; height: number; frame_count: number; duration: number }

interface SingleResult {
  track_id: number; total_distance_meters: number; average_speed_mps: number;
  max_speed_mps: number; positions: { x: number; y: number; frame: number }[]; frames_analyzed: number;
  video_info: VideoInfo;
}

interface FullResult {
  status: string; video_info: VideoInfo; analysis_info: {
    frames_processed: number; device: string; model: string; tracking: string;
    pose_enabled: boolean; processing_time_seconds: number;
  };
  players: Record<string, {
    track_id: number; team: number | null; frames_visible: number;
    total_distance_meters: number; average_speed_mps: number; max_speed_mps: number;
  }>;
  formation: { team1: any[]; team2: any[]; team1_count: number; team2_count: number };
  events: { event_type: string; timestamp: number; frame: number; confidence: number; actors: any[]; location: any; metadata: any }[];
  event_counts: Record<string, number>;
  graph: { metadata: { total_players: number; total_events: number; tactical_zones: string[] } };
}

function formatMeters(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${m.toFixed(1)} m`;
}

function formatSpeed(ms: number) {
  return `${(ms * 3.6).toFixed(1)} km/h`;
}

const EVENT_ICONS: Record<string, typeof Zap> = {
  pass: Swords, sprint: Zap, shot: Target, pressure: Shield, transition: Navigation, possession: Timer,
};

const EVENT_LABELS: Record<string, string> = {
  pass: "تمريرة", sprint: "ركض سريع", shot: "تسديدة", pressure: "ضغط دفاعي",
  transition: "انتقال", possession: "استحواذ",
};

export default function YOLOAnalysis() {
  const { isRTL } = useLanguage();
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("full");
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);
  const [fullResult, setFullResult] = useState<FullResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("video/")) { toast.error("يرجى اختيار ملف فيديو"); return; }
    if (f.size > 500 * 1024 * 1024) { toast.error("حجم الفيديو يجب أن يكون أقل من 500MB"); return; }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const startAnalysis = async () => {
    if (!file) return;
    setStep("uploading"); setProgress(0); setError(null); setSingleResult(null); setFullResult(null);

    const progressInterval = setInterval(() => setProgress(p => Math.min(p + 3, 85)), 500);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("conf_threshold", "0.4");
      formData.append("frame_stride", mode === "full" ? "3" : "10");

      const endpoint = mode === "full" ? "/yolo/analyze/full"
        : mode === "team" ? "/yolo/analyze/team"
        : "/yolo/analyze/single";

      const res = await fetch(endpoint, { method: "POST", body: formData });
      clearInterval(progressInterval); setProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `خطأ ${res.status}`);
      }

      const data = await res.json();
      setTimeout(() => {
        if (mode === "full" || mode === "team") {
          setFullResult(data);
        } else {
          setSingleResult(data);
        }
        setStep("done");
      }, 600);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err?.message || "فشل التحليل");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("idle"); setProgress(0); setFile(null); setPreviewUrl(null);
    setSingleResult(null); setFullResult(null); setError(null);
  };

  const result = fullResult || (singleResult ? { single: singleResult } : null);

  return (
    <div className="min-h-screen" style={{ background: "#000A0F", color: "#EEEFEE" }} dir="rtl">
      <Ada2aiNavbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(0,122,186,0.1)", border: "1px solid rgba(0,122,186,0.3)", color: "#007ABA", fontFamily: "'Space Grotesk', sans-serif" }}>
            <Zap size={12} /> Vision Core — Sports Intelligence
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
            تحليل ذكاء المباراة
          </h1>
          <p className="text-[#EEEFEE]/50 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
            كشف · تتبع · وضعية · أحداث ذكية · تحليل تكتيكي
          </p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* UPLOAD STEP */}
          {(step === "idle" || step === "uploading" || step === "analyzing") && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Mode selector */}
              {step === "idle" && !file && (
                <div className="flex justify-center gap-3 mb-4">
                  {([["full", "تحليل كامل", BarChart3], ["team", "تحليل الفريق", Users], ["single", "لاعب واحد", Target]] as const).map(([m, label, Icon]) => (
                    <button key={m} onClick={() => setMode(m as Mode)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
                      style={mode === m
                        ? { background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#000A0F" }
                        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              {!file && step === "idle" && (
                <div className="rounded-2xl border-2 border-dashed transition-all cursor-pointer"
                  style={{ borderColor: "rgba(0,122,186,0.3)", background: "rgba(0,122,186,0.03)", minHeight: 250 }}
                  onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}>
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

              {/* Preview + Controls */}
              {previewUrl && file && (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,122,186,0.2)" }}>
                  <video src={previewUrl} className="w-full max-h-72 object-contain bg-black" controls muted />
                  <div className="p-4 flex items-center justify-between" style={{ background: "rgba(0,122,186,0.05)" }}>
                    <div>
                      <div className="text-sm font-bold">{file.name}</div>
                      <div className="text-xs text-[#EEEFEE]/40">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
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
                    <span className="font-bold">جاري تحليل الفيديو...</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #007ABA, #00DCC8)" }} />
                  </div>
                  <div className="text-xs text-[#EEEFEE]/40 mt-2">{Math.round(progress)}%</div>
                  <div className="flex gap-4 mt-4 text-xs text-[#EEEFEE]/30">
                    <span className="flex items-center gap-1"><Users size={12} /> كشف وتتبع</span>
                    <span className="flex items-center gap-1"><Activity size={12} /> أحداث ذكية</span>
                    <span className="flex items-center gap-1"><Target size={12} /> تحليل تكتيكي</span>
                    {mode === "full" && <span className="flex items-center gap-1"><Navigation size={12} /> رسم بياني</span>}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ERROR */}
          {step === "error" && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl p-8 text-center" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={40} className="mx-auto mb-4" style={{ color: "#ef4444" }} />
              <div className="text-lg font-bold mb-2">فشل التحليل</div>
              <div className="text-sm text-[#EEEFEE]/50 mb-6">{error}</div>
              <button onClick={reset} className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 mx-auto"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <RotateCcw size={14} /> إعادة المحاولة
              </button>
            </motion.div>
          )}

          {/* DONE — Full Analysis */}
          {step === "done" && fullResult && (
            <motion.div key="full-done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

              {/* Success Header */}
              <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "rgba(0,220,200,0.05)", border: "1px solid rgba(0,220,200,0.2)" }}>
                <CheckCircle size={32} style={{ color: "#00DCC8" }} />
                <div>
                  <div className="font-bold text-lg">اكتمل التحليل الذكي!</div>
                  <div className="text-xs text-[#EEEFEE]/40">
                    {fullResult.analysis_info.frames_processed} إطار · {fullResult.analysis_info.processing_time_seconds}s · {fullResult.analysis_info.device} · {fullResult.analysis_info.model}
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "اللاعبون", value: fullResult.graph.metadata.total_players.toString(), icon: Users, color: "#00DCC8" },
                  { label: "الأحداث", value: fullResult.graph.metadata.total_events.toString(), icon: Zap, color: "#007ABA" },
                  { label: "الفريق أ", value: fullResult.formation.team1_count.toString(), icon: Shield, color: "#FFD700" },
                  { label: "الفريق ب", value: fullResult.formation.team2_count.toString(), icon: Swords, color: "#8B5CF6" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <stat.icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
                    <div className="text-xl font-black">{stat.value}</div>
                    <div className="text-xs text-[#EEEFEE]/40 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Event Timeline */}
              {fullResult.events.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: "#007ABA" }}>الأحداث الذكية</div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {fullResult.events.slice(0, 50).map((ev, i) => {
                      const Icon = EVENT_ICONS[ev.event_type] || Activity;
                      return (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <Icon size={14} style={{ color: "#00DCC8" }} />
                          <span className="text-xs font-bold">{EVENT_LABELS[ev.event_type] || ev.event_type}</span>
                          <span className="text-xs text-[#EEEFEE]/30 mr-auto">{ev.timestamp.toFixed(1)}s</span>
                          <span className="text-xs text-[#EEEFEE]/20">{Math.round(ev.confidence * 100)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Event Counts */}
              {Object.keys(fullResult.event_counts).length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: "#007ABA" }}>ملخص الأحداث</div>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(fullResult.event_counts).map(([type, count]) => {
                      const Icon = EVENT_ICONS[type] || Activity;
                      return (
                        <div key={type} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
                          style={{ background: "rgba(0,220,200,0.08)", border: "1px solid rgba(0,220,200,0.2)" }}>
                          <Icon size={12} style={{ color: "#00DCC8" }} />
                          <span className="font-bold">{count}</span>
                          <span className="text-[#EEEFEE]/40">{EVENT_LABELS[type] || type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Player Summaries */}
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs font-semibold mb-3" style={{ color: "#007ABA" }}>اللاعبون</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(fullResult.players).map(([tid, p]) => (
                    <div key={tid} className="flex items-center gap-4 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ background: p.team === 1 ? "rgba(0,122,186,0.2)" : "rgba(139,92,246,0.2)", color: p.team === 1 ? "#007ABA" : "#8B5CF6" }}>
                        #{tid}
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="text-[#EEEFEE]/40">المسافة:</span> <span className="font-bold">{formatMeters(p.total_distance_meters)}</span>
                        <span className="mx-2 text-[#EEEFEE]/20">|</span>
                        <span className="text-[#EEEFEE]/40">السرعة القصوى:</span> <span className="font-bold">{formatSpeed(p.max_speed_mps)}</span>
                        <span className="mx-2 text-[#EEEFEE]/20">|</span>
                        <span className="text-[#EEEFEE]/40">إطارات:</span> <span className="font-bold">{p.frames_visible}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Info */}
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs font-semibold mb-3" style={{ color: "#007ABA" }}>معلومات الفيديو</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-[#EEEFEE]/40">FPS: </span><span className="font-bold">{fullResult.video_info.fps}</span></div>
                  <div><span className="text-[#EEEFEE]/40">الأبعاد: </span><span className="font-bold">{fullResult.video_info.width}×{fullResult.video_info.height}</span></div>
                  <div><span className="text-[#EEEFEE]/40">المدة: </span><span className="font-bold">{fullResult.video_info.duration}s</span></div>
                  <div><span className="text-[#EEEFEE]/40">التتبع: </span><span className="font-bold">{fullResult.analysis_info.tracking}</span></div>
                </div>
              </div>

              <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #007ABA, #00DCC8)", color: "#000A0F" }}>
                <RotateCcw size={14} /> تحليل فيديو جديد
              </button>
            </motion.div>
          )}

          {/* DONE — Single Player (backward-compat) */}
          {step === "done" && singleResult && !fullResult && (
            <motion.div key="single-done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="rounded-2xl p-5 flex items-center gap-4"
                style={{ background: "rgba(0,220,200,0.05)", border: "1px solid rgba(0,220,200,0.2)" }}>
                <CheckCircle size={32} style={{ color: "#00DCC8" }} />
                <div>
                  <div className="font-bold text-lg">اكتمل التحليل!</div>
                  <div className="text-xs text-[#EEEFEE]/40">Track #{singleResult.track_id} • {singleResult.frames_analyzed} إطار</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "المسافة الكلية", value: formatMeters(singleResult.total_distance_meters), icon: Activity, color: "#00DCC8" },
                  { label: "متوسط السرعة", value: formatSpeed(singleResult.average_speed_mps), icon: Zap, color: "#007ABA" },
                  { label: "أعلى سرعة", value: formatSpeed(singleResult.max_speed_mps), icon: Play, color: "#FFD700" },
                  { label: "نقاط التتبع", value: singleResult.positions.length.toString(), icon: Target, color: "#8B5CF6" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl p-4 text-center"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <stat.icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
                    <div className="text-xl font-black">{stat.value}</div>
                    <div className="text-xs text-[#EEEFEE]/40 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
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