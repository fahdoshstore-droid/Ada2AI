import { useState, useEffect, useCallback } from 'react'
import {
  Film,
  Layers,
  Scan,
  Image,
  Activity,
  Clock,
  CheckCircle,
  Loader2,
  BarChart3,
  Target,
  Zap,
  Video,
} from 'lucide-react'
import type { PlayerAnalysisResult } from '../../pages/PlayerAnalysis'

interface DetailedAnalysisProps {
  file: File | null
  onProgress: (progress: number) => void
  onComplete: (result: PlayerAnalysisResult) => void
}

interface ExtractionStep {
  id: string
  label: string
  subLabel: string
  icon: typeof Film
  status: 'pending' | 'processing' | 'complete'
  progress: number
}

const EXTRACTION_STEPS: ExtractionStep[] = [
  { id: 'decode', label: 'فك ترميز الفيديو', subLabel: 'H.264/H.265 Decoder', icon: Film, status: 'pending', progress: 0 },
  { id: 'extract', label: 'استخراج الإطارات', subLabel: '30 FPS sampling', icon: Layers, status: 'pending', progress: 0 },
  { id: 'filter', label: 'ترشيح الإطارات', subLabel: 'Key frame detection', icon: Scan, icon: Scan, status: 'pending', progress: 0 },
  { id: 'process', label: 'معالجة الإطارات', subLabel: 'Enhancement & normalization', icon: Image, status: 'pending', progress: 0 },
  { id: 'analyze', label: 'التحليل العميق', subLabel: 'Multi-layer neural network', icon: Activity, status: 'pending', progress: 0 },
]

// Mock detailed analysis with frame extraction
const generateDetailedResult = (fileName: string): PlayerAnalysisResult => ({
  playerName: 'محمد العتيبي',
  jerseyNumber: '7',
  position: 'مهاجم',
  overallRating: 89,
  metrics: {
    speed: 92,
    acceleration: 90,
    agility: 88,
    technique: 87,
    passing: 84,
    vision: 85,
    physical: 86,
    stamina: 88,
  },
  highlights: [
    {
      timestamp: '03:22',
      description: 'سجل هدفاً رائعاً بعد مراوغة مذهلة لـ3 لاعبين',
      type: 'strength',
    },
    {
      timestamp: '07:15',
      description: 'تسديدة قوية من خارج المنطقة تلامس العارضة',
      type: 'notable',
    },
    {
      timestamp: '11:30',
      description: 'استلام ممتاز للكرة بظهر القدم وتحويل اتجاه اللعب',
      type: 'strength',
    },
    {
      timestamp: '18:45',
      description: 'فرصة تحسين: التمريرة كانت متأخرة بـ0.5 ثانية',
      type: 'improvement',
    },
    {
      timestamp: '24:10',
      description: 'انطلاقة سريعة 30 متر بسرعة 32.5 كم/س',
      type: 'strength',
    },
    {
      timestamp: '31:20',
      description: 'تمريرة حاسمة للزميل في موقف انفراد تام',
      type: 'strength',
    },
  ],
  heatmapData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImgiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDA4OGZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDBkNGZmIi8+PC9saW5ZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDQxMzI5Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSIxNTAiIHI9IjMwIiBmaWxsPSJ1cmwoI2gpIiBvcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9InVybCgjaCkiIG9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNTAiIGZpbGw9InVybCgjaCkiIG9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==',
  movementData: Array.from({ length: 50 }, (_, i) => ({
    x: Math.sin(i * 0.2) * 40 + 50,
    y: Math.cos(i * 0.15) * 30 + 50,
    speed: 15 + Math.random() * 20,
  })),
  aiInsights: [
    'اللاعب يمتاز بسرعة انفجارية عالية تصل إلى 32.5 كم/س في أول 5 أمتار',
    'حركة اللاعب على الملعب تظهر تمركزاً ذكياً بين خطي الدفاع والوسط',
    'نسبة التحولات الناجحة من الدفاع للهجوم: 78% - ممتاز',
    'اللاعب يحتاج لتحسين التمرير تحت الضغط في الثلث الأخير من الملعب',
    'قدرة اللاعب على الفوز بالكرات الهوائية: 68% - جيد',
    'التحرك بدون كرة ممتاز مع إيجاد مساحات في مناطق الخطر',
  ],
  extractedFrames: Array.from({ length: 8 }, (_, i) =>
    `https://picsum.photos/300/200?random=${i + 100}`
  ),
})

function DetailedAnalysis({ file, onProgress, onComplete }: DetailedAnalysisProps) {
  const [steps, setSteps] = useState<ExtractionStep[]>(EXTRACTION_STEPS)
  const [currentStep, setCurrentStep] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [framesExtracted, setFramesExtracted] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)

  // Calculate estimated total frames based on file size (mock)
  useEffect(() => {
    if (file) {
      const estimatedFrames = Math.floor(file.size / 1024 / 50)
      setTotalFrames(Math.min(estimatedFrames, 500))
    }
  }, [file])

  // Simulate analysis progress with frame extraction
  useEffect(() => {
    if (!file) return

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    const processSteps = async () => {
      for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
        setCurrentStep(i)
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: 'processing' } : step
          )
        )

        // Simulate variable processing time based on step
        const stepDuration = 3000 + Math.random() * 4000
        const updateInterval = 100
        const progressPerUpdate = 100 / (stepDuration / updateInterval)

        let currentProgress = 0
        while (currentProgress < 100) {
          await new Promise((resolve) => setTimeout(resolve, updateInterval))
          currentProgress = Math.min(currentProgress + progressPerUpdate, 100)

          setSteps((prev) =>
            prev.map((step, idx) =>
              idx === i ? { ...step, progress: Math.floor(currentProgress) } : step
            )
          )

          // Update frames extracted during extraction step
          if (i === 1) {
            setFramesExtracted(Math.floor((currentProgress / 100) * totalFrames))
          }

          onProgress(((i * 100 + currentProgress) / EXTRACTION_STEPS.length))
        }

        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: 'complete', progress: 100 } : step
          )
        )
      }

      setTimeout(() => {
        const result = generateDetailedResult(file.name)
        onComplete(result)
      }, 1000)
    }

    processSteps()

    return () => clearInterval(interval)
  }, [file, onComplete, onProgress, totalFrames])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="space-y-6">
      {/* Main Processing Card */}
      <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#d4af37]/20 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Animation & Status */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-right">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#d4af37]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-[#d4af37]/30 to-[#d4af37]/5 border border-[#d4af37]/40 flex items-center justify-center">
                <Film className="w-12 h-12 text-[#d4af37]" />
              </div>
              <div className="absolute -inset-2 border-2 border-dashed border-[#d4af37]/30 rounded-3xl animate-spin" style={{ animationDuration: '4s' }} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              استخراج وتحليل الإطارات
            </h2>
            <p className="text-gray-400 mb-4">
              يتم استخراج الإطارات الرئيسية وتحليلها إطار بإطار
            </p>

            {file && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#041329]/50 rounded-full">
                <Video className="w-4 h-4 text-[#d4af37]" />
                <span className="text-gray-400 text-sm">{file.name}</span>
              </div>
            )}
          </div>

          {/* Right: Progress Stats */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Current Step Progress */}
            {currentStepData && (
              <div className="bg-[#041329]/50 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin" />
                    <span className="font-medium text-white">{currentStepData.label}</span>
                  </div>
                  <span className="text-[#d4af37] font-mono">{currentStepData.progress}%</span>
                </div>
                <div className="h-2 bg-[#041329] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#e8c84a] rounded-full transition-all duration-300"
                    style={{ width: `${currentStepData.progress}%` }}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2">{currentStepData.subLabel}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#041329]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Layers className="w-4 h-4" />
                  <span>الإطارات المستخرجة</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {framesExtracted}
                  <span className="text-gray-500 text-sm font-normal mr-1">/ {totalFrames}</span>
                </div>
              </div>
              <div className="bg-[#041329]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>الوقت المنقضي</span>
                </div>
                <div className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Extraction Steps */}
      <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#d4af37]/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#d4af37]" />
          مراحل الاستخراج والتحليل
        </h3>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                step.status === 'processing'
                  ? 'bg-[#d4af37]/10 border border-[#d4af37]/30'
                  : step.status === 'complete'
                  ? 'bg-[#d4af37]/5 border border-[#d4af37]/20'
                  : 'bg-[#041329]/30 border border-transparent'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  step.status === 'processing'
                    ? 'bg-[#d4af37]/20'
                    : step.status === 'complete'
                    ? 'bg-[#d4af37]/20'
                    : 'bg-[#d4af37]/5'
                }`}
              >
                {step.status === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                ) : step.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin" />
                ) : (
                  <step.icon className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`font-medium ${
                    step.status === 'pending' ? 'text-gray-500' : 'text-white'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">{step.subLabel}</p>
              </div>

              {step.status === 'processing' && step.progress > 0 && (
                <div className="w-24">
                  <div className="h-1.5 bg-[#041329] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#e8c84a] rounded-full"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="text-sm">
                {step.status === 'complete' ? (
                  <span className="text-[#d4af37]">مكتمل</span>
                ) : step.status === 'processing' ? (
                  <span className="text-[#d4af37]">جاري...</span>
                ) : (
                  <span className="text-gray-600">انتظار</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'فك ترميز 4K', icon: Film, desc: 'H.264/H.265/VP9' },
          { label: 'استخراج 60 FPS', icon: Layers, desc: 'High-res sampling' },
          { label: 'معالجة متقدمة', icon: Zap, desc: 'AI Enhancement' },
          { label: 'خرائط حرارية', icon: Target, desc: 'Heatmap + Tracking' },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-[#0a1f3d]/30 border border-[#d4af37]/10 rounded-xl p-4 text-center"
          >
            <feature.icon className="w-6 h-6 mx-auto mb-2 text-[#d4af37]/60" />
            <p className="text-white font-medium text-sm mb-1">{feature.label}</p>
            <p className="text-gray-500 text-xs">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Frame Preview (Simulated) */}
      {framesExtracted > 0 && (
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-[#00d4ff]" />
            معاينة الإطارات المستخرجة
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Array.from({ length: Math.min(8, Math.ceil(framesExtracted / (totalFrames / 8))) }, (_, i) => (
              <div
                key={i}
                className="aspect-video bg-[#041329] rounded-lg animate-pulse"
              >
                <div className="w-full h-full bg-gradient-to-br from-[#00d4ff]/10 to-[#d4af37]/10 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DetailedAnalysis
