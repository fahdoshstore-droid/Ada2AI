import { useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import {
  Upload,
  Video,
  User,
  MapPin,
  ChevronRight,
  CheckCircle,
  Loader2,
  Play,
  FileVideo,
  X,
  MessageCircle,
  Zap,
  Target,
  TrendingUp,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const positions = ["مهاجم", "وسط", "مدافع", "جناح أيمن", "جناح أيسر", "حارس مرمى"];
const cities = ["دمام", "خبر", "ظهران", "القطيف", "الأحساء"];
const academies = [
  "أكاديمية كابتن",
  "أكاديمية الظهران الرياضية",
  "أكاديمية الموهبة الكروية",
  "نادي الاتحاد الرياضي",
  "أكاديمية النجوم الصاعدة",
  "مدرسة الأبطال الرياضية",
  "أكاديمية الخليج للرياضة",
  "أكاديمية الشرقية للكرة",
  "نادي الفتح الرياضي",
  "أكاديمية الرياضة والتميز",
  "أخرى",
];

type Step = "form" | "upload" | "analyzing" | "done";

const analysisStages = [
  { label: "استخراج الإطارات من الفيديو", duration: 2000 },
  { label: "تتبع حركة اللاعب بالذكاء الاصطناعي", duration: 2500 },
  { label: "قياس السرعة والتسارع والمسافة", duration: 2000 },
  { label: "تحليل المهارات الفنية والتكتيكية", duration: 2500 },
  { label: "مقارنة بمعايير FIFA الدولية", duration: 1500 },
  { label: "توليد تقرير الأداء الشامل", duration: 2000 },
];

export default function UploadPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    playerName: "",
    age: "",
    position: "",
    city: "",
    academy: "",
    guardianPhone: "",
    notes: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName || !form.age || !form.position || !form.city) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setStep("upload");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    } else {
      toast.error("يرجى رفع ملف فيديو صالح (MP4, MOV, AVI)");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const startAnalysis = async () => {
    if (!videoFile) {
      toast.error("يرجى رفع فيديو أولاً");
      return;
    }
    setStep("analyzing");
    setAnalysisProgress(0);
    setCurrentStage(0);
    setCompletedStages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    let totalTime = 0;
    for (let i = 0; i < analysisStages.length; i++) {
      await new Promise((res) => setTimeout(res, totalTime === 0 ? 300 : 0));
      setCurrentStage(i);

      // Animate progress within stage
      const stageProgress = ((i + 1) / analysisStages.length) * 100;
      const prevProgress = (i / analysisStages.length) * 100;
      const steps = 20;
      for (let j = 1; j <= steps; j++) {
        await new Promise((res) => setTimeout(res, analysisStages[i].duration / steps));
        setAnalysisProgress(prevProgress + (stageProgress - prevProgress) * (j / steps));
      }
      setCompletedStages((prev) => [...prev, i]);
    }

    await new Promise((res) => setTimeout(res, 500));
    setStep("done");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const progressPercent = Math.round(analysisProgress);

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_240)] text-white" dir="rtl">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="tag-green mb-4">تحليل AI</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 mt-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            ارفع فيديو اللاعب
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
            احصل على تقرير أداء شامل مدعوم بالذكاء الاصطناعي خلال دقائق
          </p>
        </div>
      </section>

      {/* Steps indicator */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center gap-0 max-w-md mx-auto">
          {[
            { label: "بيانات اللاعب", s: "form" },
            { label: "رفع الفيديو", s: "upload" },
            { label: "التحليل", s: "analyzing" },
            { label: "النتيجة", s: "done" },
          ].map((item, i) => {
            const steps: Step[] = ["form", "upload", "analyzing", "done"];
            const currentIdx = steps.indexOf(step);
            const itemIdx = steps.indexOf(item.s as Step);
            const isActive = item.s === step;
            const isDone = itemIdx < currentIdx;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.08_0.02_240)]"
                        : isActive
                        ? "bg-[oklch(0.65_0.2_145/0.2)] border-2 border-[oklch(0.65_0.2_145)] text-[oklch(0.65_0.2_145)]"
                        : "bg-white/5 border border-white/15 text-white/30"
                    }`}
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {isDone ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 ${isActive ? "text-[oklch(0.65_0.2_145)]" : isDone ? "text-white/50" : "text-white/25"}`}
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {item.label}
                  </span>
                </div>
                {i < 3 && (
                  <div className={`w-12 h-px mx-1 mb-4 transition-all ${isDone ? "bg-[oklch(0.65_0.2_145)]" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">

            {/* STEP 1: Form */}
            {step === "form" && (
              <form onSubmit={handleFormSubmit} className="card-dark neon-border rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-bold text-xl mb-2 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  <User size={18} className="neon-text" /> بيانات اللاعب
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>اسم اللاعب *</label>
                    <input type="text" name="playerName" value={form.playerName} onChange={handleFormChange} placeholder="محمد العمري" required className="w-full bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]" style={{ fontFamily: "'Tajawal', sans-serif" }} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>العمر *</label>
                    <input type="number" name="age" value={form.age} onChange={handleFormChange} placeholder="16" min="5" max="25" required className="w-full bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>المركز *</label>
                    <select name="position" value={form.position} onChange={handleFormChange} required className="w-full bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      <option value="">اختر المركز</option>
                      {positions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>المدينة *</label>
                    <select name="city" value={form.city} onChange={handleFormChange} required className="w-full bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      <option value="">اختر المدينة</option>
                      {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>الأكاديمية</label>
                    <select name="academy" value={form.academy} onChange={handleFormChange} className="w-full bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      <option value="">اختر الأكاديمية</option>
                      {academies.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>جوال ولي الأمر</label>
                    <input type="tel" name="guardianPhone" value={form.guardianPhone} onChange={handleFormChange} placeholder="+966 5X XXX XXXX" className="w-full bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]" style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }} />
                  </div>
                </div>

                <div>
                  <label className="text-white/50 text-xs mb-1.5 block" style={{ fontFamily: "'Tajawal', sans-serif" }}>ملاحظات إضافية</label>
                  <textarea name="notes" value={form.notes} onChange={handleFormChange} rows={3} placeholder="أي معلومات إضافية عن اللاعب..." className="w-full bg-[oklch(0.10_0.02_240)] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)] resize-none" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }} />
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  التالي — رفع الفيديو <ChevronRight size={16} />
                </button>
              </form>
            )}

            {/* STEP 2: Upload */}
            {step === "upload" && (
              <div className="space-y-5">
                <div className="card-dark rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[oklch(0.65_0.2_145/0.15)] flex items-center justify-center text-[oklch(0.65_0.2_145)] font-black" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {form.playerName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>{form.playerName}</div>
                    <div className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{form.position} · {form.age} سنة · {form.city}</div>
                  </div>
                  <button onClick={() => setStep("form")} className="mr-auto text-white/30 hover:text-white text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>تعديل</button>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`card-dark rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
                    dragOver
                      ? "border-[oklch(0.65_0.2_145)] bg-[oklch(0.65_0.2_145/0.05)]"
                      : videoFile
                      ? "border-[oklch(0.65_0.2_145/0.5)] bg-[oklch(0.65_0.2_145/0.03)]"
                      : "border-white/15 hover:border-white/30"
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

                  {videoFile ? (
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-[oklch(0.65_0.2_145/0.15)] flex items-center justify-center mx-auto mb-4">
                        <FileVideo size={28} className="text-[oklch(0.65_0.2_145)]" />
                      </div>
                      <p className="text-white font-bold mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{videoFile.name}</p>
                      <p className="text-white/40 text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{formatFileSize(videoFile.size)}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                        className="flex items-center gap-1 text-white/30 hover:text-white text-xs mx-auto transition-colors"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        <X size={13} /> تغيير الملف
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Upload size={28} className="text-white/30" />
                      </div>
                      <p className="text-white font-bold mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>اسحب الفيديو هنا أو انقر للاختيار</p>
                      <p className="text-white/35 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>MP4, MOV, AVI · حتى 500 MB · مدة 1-10 دقائق</p>
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="card-dark rounded-xl p-4">
                  <h3 className="text-white/60 text-sm font-bold mb-3 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    <Video size={14} className="neon-text" /> نصائح للحصول على أفضل تحليل
                  </h3>
                  <ul className="space-y-1.5">
                    {[
                      "صوّر من زاوية جانبية أو علوية تُظهر حركة اللاعب كاملاً",
                      "تأكد من وضوح الفيديو وإضاءة كافية",
                      "اختر مقطع يُظهر مهارات متنوعة (تسديد، تمرير، سرعة)",
                      "مدة 2-5 دقائق تعطي أفضل النتائج",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-white/45 text-xs" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                        <ChevronRight size={12} className="neon-text mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={startAnalysis}
                  disabled={!videoFile}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  <Zap size={18} /> ابدأ تحليل AI
                </button>
              </div>
            )}

            {/* STEP 3: Analyzing */}
            {step === "analyzing" && (
              <div className="card-dark neon-border rounded-2xl p-8 text-center">
                {/* Circular progress */}
                <div className="relative w-36 h-36 mx-auto mb-8">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.65 0.2 145 / 0.1)" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="oklch(0.65 0.2 145)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black neon-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{progressPercent}%</span>
                    <span className="text-white/30 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>مكتمل</span>
                  </div>
                </div>

                <h3 className="text-white font-bold text-xl mb-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  جاري تحليل فيديو {form.playerName}...
                </h3>

                <div className="space-y-3 text-right max-w-sm mx-auto">
                  {analysisStages.map((stage, i) => {
                    const isDone = completedStages.includes(i);
                    const isActive = currentStage === i && !isDone;
                    return (
                      <div key={i} className={`flex items-center gap-3 transition-all ${isDone ? "text-[oklch(0.65_0.2_145)]" : isActive ? "text-white" : "text-white/25"}`}>
                        {isDone ? (
                          <CheckCircle size={16} className="flex-shrink-0" />
                        ) : isActive ? (
                          <Loader2 size={16} className="animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                        )}
                        <span className="text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{stage.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Done */}
            {step === "done" && (
              <div className="space-y-5">
                {/* Success */}
                <div className="card-dark neon-border rounded-2xl p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-[oklch(0.65_0.2_145/0.15)] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={36} className="text-[oklch(0.65_0.2_145)]" />
                  </div>
                  <h2 className="text-white font-black text-2xl mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    اكتمل التحليل!
                  </h2>
                  <p className="text-white/50 text-sm mb-6" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                    تم تحليل فيديو {form.playerName} بنجاح — التقرير الكامل جاهز
                  </p>

                  {/* Quick scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                      { label: "التقييم الكلي", value: "84", icon: <Star size={16} />, color: "oklch(0.85 0.18 85)" },
                      { label: "الإمكانية", value: "91", icon: <TrendingUp size={16} />, color: "oklch(0.65 0.2 145)" },
                      { label: "السرعة", value: "88", icon: <Zap size={16} />, color: "oklch(0.65 0.2 200)" },
                      { label: "المهارة", value: "82", icon: <Target size={16} />, color: "oklch(0.65 0.22 25)" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/4 rounded-xl p-3 text-center">
                        <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                        <div className="text-2xl font-black mb-0.5" style={{ color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                        <div className="text-white/35 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate("/demo")}
                      className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      <Play size={16} /> عرض التقرير الكامل
                    </button>
                    <a
                      href={`https://wa.me/966500000000?text=مرحباً، تم تحليل فيديو اللاعب ${form.playerName} وأريد الحصول على التقرير الكامل`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-green flex-1 py-3 flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      <MessageCircle size={16} /> احصل على التقرير عبر واتساب
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => { setStep("form"); setVideoFile(null); setForm({ playerName: "", age: "", position: "", city: "", academy: "", guardianPhone: "", notes: "" }); }}
                  className="w-full text-white/40 hover:text-white text-sm text-center transition-colors"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  تحليل لاعب آخر
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
