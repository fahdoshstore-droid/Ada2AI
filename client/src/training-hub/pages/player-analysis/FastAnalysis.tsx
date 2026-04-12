import { useState, useEffect, useCallback } from 'react'
import {
  Zap,
  Brain,
  Eye,
  Activity,
  Target,
  BarChart3,
  User,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import type { PlayerAnalysisResult } from './index'

interface FastAnalysisProps {
  file: File | null
  onProgress: (progress: number) => void
  onComplete: (result: PlayerAnalysisResult) => void
}

interface AnalysisStep {
  id: string
  label: string
  icon: typeof Zap
  status: 'pending' | 'processing' | 'complete'
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 'extract', label: 'استخراج الفيديو', icon: Eye, status: 'pending' },
  { id: 'detect', label: 'كشف اللاعب والموقع', icon: User, status: 'pending' },
  { id: 'track', label: 'تتبع الحركة', icon: Activity, status: 'pending' },
  { id: 'analyze', label: 'تحليل الأداء', icon: Brain, status: 'pending' },
  { id: 'generate', label: 'إنشاء التقرير', icon: BarChart3, status: 'pending' },
]

const generateMockResult = (fileName: string): PlayerAnalysisResult => ({
  playerName: 'أحمد الشمراني',
  jerseyNumber: '10',
  position: 'وسط',
  overallRating: 87,
  metrics: {
    speed: 88,
    acceleration: 85,
    agility: 82,
    technique: 90,
    passing: 86,
    vision: 89,
    physical: 84,
    stamina: 87,
  },
  highlights: [
    {
      timestamp: '02:15',
      description: 'تمريرة طولية ممتازة لمهاجم في موقف هجومي',
      type: 'strength',
    },
    {
      timestamp: '05:30',
      description: 'استعادة كرة ناجحة في منطقة الوسط',
      type: 'strength',
    },
    {
      timestamp: '08:45',
      description: 'فرصة تحسين: يمكن الضغط بشكل أسرع على حامل الكرة',
      type: 'improvement',
    },
    {
      timestamp: '12:20',
      description: 'تسديدة قوية من خارج المنطقة مع محاولة تسديد مباشرة',
      type: 'notable',
    },
    {
      timestamp: '15:10',
      description: 'مراوغة ناجحة واختراق من الجنب الأيمن',
      type: 'strength',
    },
  ],
  aiInsights: [
    'اللاعب يظهر أداءً متميزاً في التمريرات القصيرة والمتوسطة مع دقة 89%',
    'سرعة استجابة اللاعب ممتازة في التحول من الدفاع للهجوم',
    'يحتاج اللاعب لتحسين التغطية الدفاعية في آخر 15 دقيقة من الشوط',
    'تمركز اللاعب ممتاز في منطقة الوسط مع القدرة على اختراق الخطوط',
  ],
})

function FastAnalysis({ file, onProgress, onComplete }: FastAnalysisProps) {
  const [steps, setSteps] = useState<AnalysisStep[]>(ANALYSIS_STEPS)
  const [currentStep, setCurrentStep] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!file) return

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    const processSteps = async () => {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: 'processing' } : step
          )
        )
        setCurrentStep(i)

        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 2000)
        )

        setSteps((prev) =>
          prev.map((step, idx) =>
            idx === i ? { ...step, status: 'complete' } : step
          )
        )

        onProgress(((i + 1) / ANALYSIS_STEPS.length) * 100)
      }

      setTimeout(() => {
        const result = generateMockResult(file.name)
        onComplete(result)
      }, 500)
    }

    processSteps()

    return () => clearInterval(interval)
  }, [file, onComplete, onProgress])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Main Processing Card */}
      <div className="rounded-2xl p-8 border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.15)' }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#00DCC8]/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-2xl flex items-center justify-center border"
              style={{ background: 'rgba(0,220,200,0.15)', borderColor: 'rgba(0,220,200,0.3)' }}
            >
              <Brain className="w-12 h-12 text-[#00DCC8] animate-pulse" />
            </div>
            <div className="absolute -inset-2 border border-dashed border-[#00DCC8]/20 rounded-3xl animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            الذكاء الاصطناعي يحلل الفيديو
          </h2>
          <p className="text-gray-400 mb-4">
            يتم استخدام نموذج الذكاء الاصطناعي للرؤية لتحليل أداء اللاعب
          </p>

          {file && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Zap className="w-4 h-4 text-[#00DCC8]" />
              <span className="text-gray-400 text-sm">{file.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-6 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Analysis Steps */}
      <div className="rounded-2xl p-6 border"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
      >
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#00DCC8]" />
          مراحل التحليل
        </h3>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300"
              style={{
                background: step.status === 'processing'
                  ? 'rgba(0,220,200,0.1)'
                  : step.status === 'complete'
                  ? 'rgba(0,220,200,0.05)'
                  : 'rgba(255,255,255,0.03)',
                border: step.status === 'processing'
                  ? '1px solid rgba(0,220,200,0.3)'
                  : step.status === 'complete'
                  ? '1px solid rgba(0,220,200,0.2)'
                  : '1px solid transparent',
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: step.status === 'processing'
                    ? 'rgba(0,220,200,0.2)'
                    : step.status === 'complete'
                    ? 'rgba(0,220,200,0.2)'
                    : 'rgba(0,220,200,0.05)',
                }}
              >
                {step.status === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-[#00DCC8]" />
                ) : step.status === 'processing' ? (
                  <Loader2 className="w-5 h-5 text-[#00DCC8] animate-spin" />
                ) : (
                  <step.icon className="w-5 h-5 text-gray-500" />
                )}
              </div>

              <div className="flex-1">
                <p className={`font-medium ${step.status === 'pending' ? 'text-gray-500' : 'text-white'}`}>
                  {step.label}
                </p>
              </div>

              <div className="text-sm">
                {step.status === 'complete' ? (
                  <span className="text-[#00DCC8]">مكتمل</span>
                ) : step.status === 'processing' ? (
                  <span className="text-[#00DCC8]">جاري...</span>
                ) : (
                  <span className="text-gray-600">انتظار</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'كشف اللاعب', icon: User, desc: 'YOLO + DeepSort' },
          { label: 'تتبع الحركة', icon: Activity, desc: 'Optical Flow' },
          { label: 'تحليل المهارات', icon: Target, desc: 'Pose Estimation' },
          { label: 'تقييم الأداء', icon: BarChart3, desc: 'Neural Network' },
        ].map((feature, i) => (
          <div key={i} className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <feature.icon className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(0,220,200,0.6)' }} />
            <p className="text-white font-medium text-sm mb-1">{feature.label}</p>
            <p className="text-gray-500 text-xs">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FastAnalysis
