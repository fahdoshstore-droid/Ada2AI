import { useState, useEffect } from 'react'
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
import type { PlayerAnalysisResult } from './index'

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
  { id: 'filter', label: 'ترشيح الإطارات', subLabel: 'Key frame detection', icon: Scan, status: 'pending', progress: 0 },
  { id: 'process', label: 'معالجة الإطارات', subLabel: 'Enhancement & normalization', icon: Image, status: 'pending', progress: 0 },
  { id: 'analyze', label: 'التحليل العميق', subLabel: 'Multi-layer neural network', icon: Activity, status: 'pending', progress: 0 },
]

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

  useEffect(() => {
    if (file) {
      const estimatedFrames = Math.floor(file.size / 1024 / 50)
      setTotalFrames(Math.min(estimatedFrames, 500))
    }
  }, [file])

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
  const primaryColor = '#FFA500'

  return (
    <div className="space-y-6" dir="rtl">
      {/* Main Processing Card */}
      <div className="rounded-2xl p-8 border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,165,0,0.15)' }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-right">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full blur-xl animate-pulse" style={{ background: 'rgba(255,165,0,0.2)' }} />
              <div className="relative w-24 h-24 rounded-2xl flex items-center justify-center border"
                style={{ background: 'rgba(255,165,0,0.15)', borderColor: 'rgba(255,165,0,0.3)' }}
              >
                <Film className="w-12 h-12" style={{ color: primaryColor }} />
              </div>
              <div className="absolute -inset-2 border border-dashed rounded-3xl animate-spin" style={{ borderColor: 'rgba(255,165,0,0.2)', animationDuration: '4s' }} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              استخراج وتحليل الإطارات
            </h2>
            <p className="text-gray-400 mb-4">
              يتم استخراج الإطارات الرئيسية وتحليلها إطار بإطار
            </p>

            {file && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Video className="w-4 h-4" style={{ color: primaryColor }} />
                <span className="text-gray-400 text-sm">{file.name}</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {currentStepData && (
              <div className="rounded-xl p-6 mb-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: primaryColor }} />
                    <span className="font-medium text-white">{currentStepData.label}</span>
                  </div>
                  <span className="font-mono" style={{ color: primaryColor }}>{currentStepData.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${currentStepData.progress}%`, background: `linear-gradient(135deg, ${primaryColor} 0%, #FFD700 100%)` }}
                  />
                </div>
                <p className="text-gray-500 text-sm mt-2">{currentStepData.subLabel}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Layers className="w-4 h-4" />
                  <span>الإطارات المستخرجة</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {framesExtracted}
                  <span className="text-gray-500 text-sm font-normal mr-1">/ {totalFrames}</span>
                </div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
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
      <div className="rounded-2xl p-6 border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,165,0,0.1)' }}
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5" style={{ color: primaryColor }} />
          مراحل الاستخراج والتحليل
        </h3>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
              style={{
                background: step.status === 'processing'
                  ? 'rgba(255,165,0,0.1)'
                  : step.status === 'complete'
                  ? 'rgba(255,165,0,0.05)'
                  : 'rgba(255,255,255,0.03)',
                border: step.status === 'processing'
                  ? '1px solid rgba(255,165,0,0.3)'
                  : step.status === 'complete'
                  ? '1px solid rgba(255,165,0,0.2)'
                  : '1px solid transparent',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: step.status === 'processing'
                    ? 'rgba(255,165,0,0.2)'
                    : step.status === 'complete'
                    ? 'rgba(255,165,0,0.2)'
                    : 'rgba(255,165,0,0.05)',
                }}
              >
                {step.status === 'complete' ? (
                  <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
                ) : step.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: primaryColor }} />
                ) : (
                  <step.icon className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <div className="flex-1">
                <p className={`font-medium ${step.status === 'pending' ? 'text-gray-500' : 'text-white'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-500">{step.subLabel}</p>
              </div>

              {step.status === 'processing' && step.progress > 0 && (
                <div className="w-24">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${step.progress}%`, background: `linear-gradient(135deg, ${primaryColor} 0%, #FFD700 100%)` }}
                    />
                  </div>
                </div>
              )}

              <div className="text-sm">
                {step.status === 'complete' ? (
                  <span style={{ color: primaryColor }}>مكتمل</span>
                ) : step.status === 'processing' ? (
                  <span style={{ color: primaryColor }}>جاري...</span>
                ) : (
                  <span className="text-gray-600">انتظار</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frame Preview */}
      {framesExtracted > 0 && (
        <div className="rounded-2xl p-6 border"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-[#00DCC8]" />
            معاينة الإطارات المستخرجة
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Array.from({ length: Math.min(8, Math.ceil(framesExtracted / (totalFrames / 8))) }, (_, i) => (
              <div key={i} className="aspect-video rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-full h-full rounded-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(0,220,200,0.1) 0%, rgba(255,165,0,0.1) 100%)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DetailedAnalysis
