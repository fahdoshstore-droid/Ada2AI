import { useState } from 'react'
import { Zap, Film, ArrowRight, ChevronLeft, Sparkles, Clock, BarChart3 } from 'lucide-react'
import VideoUpload from './VideoUpload'
import FastAnalysis from './FastAnalysis'
import DetailedAnalysis from './DetailedAnalysis'
import AnalysisReport from './AnalysisReport'

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

interface PlayerAnalysisPageProps {
  lang?: 'ar' | 'en'
}

function PlayerAnalysisPage({ lang = 'ar' }: PlayerAnalysisPageProps) {
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
        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center border"
          style={{ background: 'rgba(0,220,200,0.15)', borderColor: 'rgba(0,220,200,0.3)' }}
        >
          <BarChart3 className="w-10 h-10 text-[#00DCC8]" />
        </div>

        <h2 className="text-2xl font-bold text-white">تحليل أداء اللاعب</h2>

        <p className="text-gray-400 max-w-md mx-auto" style={{ fontFamily: "'Cairo', sans-serif" }}>
          اختر وضع التحليل المناسب لاحتياجاتك. التحليل السريع يستخدم الذكاء الاصطناعي للرؤية، بينما التفصيلي يستخرج الإطارات لتحليل أعمق
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fast Mode */}
        <button
          onClick={() => handleModeSelect('fast')}
          className="group relative rounded-2xl p-8 text-right transition-all duration-300 hover:scale-[1.02] border"
          style={{
            background: 'rgba(0,220,200,0.05)',
            borderColor: 'rgba(0,220,200,0.2)',
          }}
        >
          <div className="absolute top-4 left-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 border"
              style={{ background: 'rgba(0,220,200,0.15)', borderColor: 'rgba(0,220,200,0.3)' }}
            >
              <Zap className="w-6 h-6 text-[#00DCC8]" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFA500]" />
              <span className="text-xs text-[#FFA500] font-medium">موصى به</span>
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-[#00DCC8] transition-colors">تحليل سريع</h3>

            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Cairo', sans-serif" }}>
              تحليل فوري باستخدام ذكاء اصطناعي متقدم للرؤية. مثالي للحصول على رؤى سريعة أثناء المباراة أو التدريب.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>1-2 دقيقة</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#00DCC8]">
                <ArrowRight className="w-3 h-3" />
                <span>ابدأ الآن</span>
              </div>
            </div>
          </div>
        </button>

        {/* Detailed Mode */}
        <button
          onClick={() => handleModeSelect('detailed')}
          className="group relative rounded-2xl p-8 text-right transition-all duration-300 hover:scale-[1.02] border"
          style={{
            background: 'rgba(255,165,0,0.05)',
            borderColor: 'rgba(255,165,0,0.2)',
          }}
        >
          <div className="absolute top-4 left-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 border"
              style={{ background: 'rgba(255,165,0,0.15)', borderColor: 'rgba(255,165,0,0.3)' }}
            >
              <Film className="w-6 h-6 text-[#FFA500]" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#007ABA]" />
              <span className="text-xs text-[#007ABA] font-medium">احترافي</span>
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-[#FFA500] transition-colors">تحليل تفصيلي</h3>

            <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Cairo', sans-serif" }}>
              استخراج إطارات الفيديو وتحليلها إطار بإطار. يوفر خرائط حرارية وتحليل حركة مفصل للاعبين.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>5-10 دقائق</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#FFA500]">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-[#00DCC8] to-[#007ABA] bg-clip-text text-transparent">
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

export default PlayerAnalysisPage
