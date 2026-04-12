import { useState } from 'react'
import { Zap, Film, ArrowRight, ChevronLeft, Sparkles, Clock, BarChart3 } from 'lucide-react'
import VideoUpload from '../components/PlayerAnalysis/VideoUpload'
import FastAnalysis from '../components/PlayerAnalysis/FastAnalysis'
import DetailedAnalysis from '../components/PlayerAnalysis/DetailedAnalysis'
import AnalysisReport from '../components/PlayerAnalysis/AnalysisReport'

type AnalysisMode = 'none' | 'fast' | 'detailed'
type AnalysisState = 'select-mode' | 'upload' | 'processing' | 'complete'

export interface PlayerAnalysisResult {
  playerName: string
  jerseyNumber?: string
  position?: string
  overallRating: number
  metrics: {
    speed: number
    acceleration: number
    agility: number
    technique: number
    passing: number
    vision: number
    physical: number
    stamina: number
  }
  highlights: {
    timestamp: string
    description: string
    type: 'strength' | 'improvement' | 'notable'
  }[]
  heatmapData?: string
  movementData?: { x: number; y: number; speed: number }[]
  aiInsights: string[]
  extractedFrames?: string[]
}

function PlayerAnalysis() {
  const [mode, setMode] = useState<AnalysisMode>('none')
  const [state, setState] = useState<AnalysisState>('select-mode')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<PlayerAnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)

  const handleModeSelect = (selectedMode: AnalysisMode) => {
    setMode(selectedMode)
    setState('upload')
  }

  const handleUploadComplete = (uploadedFile: File) => {
    setFile(uploadedFile)
    setState('processing')
  }

  const handleProcessingComplete = (analysisResult: PlayerAnalysisResult) => {
    setResult(analysisResult)
    setState('complete')
  }

  const handleReset = () => {
    setMode('none')
    setState('select-mode')
    setFile(null)
    setResult(null)
    setProgress(0)
  }

  const renderModeSelection = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#00d4ff]/20 border border-[#00d4ff]/30 flex items-center justify-center">
          <BarChart3 className="w-10 h-10 text-[#00d4ff]" />
        </div>
        <h2 className="text-2xl font-bold text-white">تحليل أداء اللاعب</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          اختر وضع التحليل المناسب لاحتياجاتك. التحليل السريع يستخدم الذكاء الاصطناعي للرؤية، بينما التفصيلي يستخرج الإطارات لتحليل أعمق
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fast Mode */}
        <button
          onClick={() => handleModeSelect('fast')}
          className="group relative bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/20 rounded-2xl p-8 text-right hover:border-[#00d4ff]/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-4 left-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-[#00d4ff]/5 border border-[#00d4ff]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-[#00d4ff]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs text-[#d4af37] font-medium">موصى به</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-[#00d4ff] transition-colors">تحليل سريع</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              تحليل فوري باستخدام ذكاء اصطناعي متقدم للرؤية. مثالي للحصول على رؤى سريعة أثناء المباراة أو التدريب.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>1-2 دقيقة</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#00d4ff]">
                <ArrowRight className="w-3 h-3" />
                <span>ابدأ الآن</span>
              </div>
            </div>
          </div>
        </button>

        {/* Detailed Mode */}
        <button
          onClick={() => handleModeSelect('detailed')}
          className="group relative bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#d4af37]/20 rounded-2xl p-8 text-right hover:border-[#d4af37]/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-4 left-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 border border-[#d4af37]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6 text-[#d4af37]" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs text-[#00d4ff] font-medium">احترافي</span>
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-[#d4af37] transition-colors">تحليل تفصيلي</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              استخراج إطارات الفيديو وتحليلها إطار بإطار. يوخرائط حرارية وتحليل حركة مفصل للاعبين.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>5-10 دقائق</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#d4af37]">
                <ArrowRight className="w-3 h-3" />
                <span>ابدأ الآن</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">
            {state === 'select-mode' && 'تحليل أداء اللاعب'}
            {state === 'upload' && 'رفع الفيديو'}
            {state === 'processing' && 'جاري التحليل...'}
            {state === 'complete' && 'نتائج التحليل'}
          </span>
        </h1>
        {state !== 'select-mode' && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>رجوع</span>
          </button>
        )}
      </div>

      {/* Content */}
      {state === 'select-mode' && renderModeSelection()}

      {state === 'upload' && (
        <VideoUpload
          mode={mode}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {state === 'processing' && mode === 'fast' && (
        <FastAnalysis
          file={file}
          onProgress={setProgress}
          onComplete={handleProcessingComplete}
        />
      )}

      {state === 'processing' && mode === 'detailed' && (
        <DetailedAnalysis
          file={file}
          onProgress={setProgress}
          onComplete={handleProcessingComplete}
        />
      )}

      {state === 'complete' && result && (
        <AnalysisReport
          result={result}
          mode={mode}
          onNewAnalysis={handleReset}
        />
      )}
    </div>
  )
}

export default PlayerAnalysis
