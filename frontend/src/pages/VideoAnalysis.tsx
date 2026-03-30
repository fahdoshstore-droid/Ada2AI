import { useState, useCallback } from 'react'
import { Upload, Play, Users, Zap, Activity, Target, CheckCircle, Loader2 } from 'lucide-react'

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'done'

const mockResults = {
  playersDetected: 22,
  topSpeed: '32.5 km/h',
  totalDistance: '10.2 km',
  sprints: 15,
  passes: 47,
  accuracy: '89%',
  insights: [
    { title: 'لاعب مميز', desc: 'اللاعب #10 أظهر أداء استثنائي في التمرير القصير', icon: Zap },
    { title: 'نمط حركي', desc: 'حركة جماعية متناسقة في الهجمات المرتدة', icon: Activity },
    { title: 'فرصة تطوير', desc: 'الجناح الأيسر يحتاج تحسين في التغطية الدفاعية', icon: Target },
  ]
}

function VideoAnalysis() {
  const [state, setState] = useState<AnalysisState>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')

  const simulateAnalysis = useCallback(() => {
    setState('uploading')
    setProgress(0)
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setState('analyzing')
          setTimeout(() => setState('done'), 3000)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) { setFileName(file.name); simulateAnalysis() }
  }, [simulateAnalysis])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setFileName(file.name); simulateAnalysis() }
  }, [simulateAnalysis])

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">تحليل الفيديو بالذكاء الاصطناعي</span>
      </h1>

      {/* Upload Area */}
      {state === 'idle' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="bg-[#0a1f3d]/50 backdrop-blur-xl border-2 border-dashed border-[#00d4ff]/30 rounded-2xl p-12 text-center cursor-pointer hover:border-[#00d4ff]/60 hover:bg-[#0a1f3d]/70 transition-all group"
        >
          <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" id="video-upload" />
          <label htmlFor="video-upload" className="cursor-pointer">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-[#00d4ff]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">ارفع فيديو المباراة</h3>
            <p className="text-gray-400">اسحب وأفلت أو اضغط لاختيار الفيديو</p>
            <p className="text-gray-500 text-sm mt-2">MP4, MOV, AVI — حتى 500MB</p>
          </label>
        </div>
      )}

      {/* Upload Progress */}
      {state === 'uploading' && (
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/15 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 text-[#00d4ff] animate-spin" />
            <span className="text-white font-semibold">جاري رفع: {fileName}</span>
          </div>
          <div className="w-full h-3 bg-[#041329] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#e8c84a] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-gray-400 text-sm mt-2 text-left">{progress}%</p>
        </div>
      )}

      {/* Analyzing */}
      {state === 'analyzing' && (
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/15 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-[#00d4ff]/30 border-t-[#00d4ff] animate-spin" />
          <h3 className="text-xl font-bold text-white mb-2">🐺 Dheeb V4 يحلل...</h3>
          <p className="text-gray-400">كشف اللاعبين • تتبع الحركة • تحليل الأداء</p>
        </div>
      )}

      {/* Results */}
      {state === 'done' && (
        <div className="space-y-6">
          {/* Success Header */}
          <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#d4af37]/30 rounded-2xl p-6 flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-[#d4af37]" />
            <div>
              <h3 className="text-lg font-bold text-white">اكتمل التحليل!</h3>
              <p className="text-gray-400 text-sm">{fileName}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'لاعبين مكتشفين', value: mockResults.playersDetected, icon: Users, color: '#00d4ff' },
              { label: 'أعلى سرعة', value: mockResults.topSpeed, icon: Zap, color: '#d4af37' },
              { label: 'المسافة الكلية', value: mockResults.totalDistance, icon: Activity, color: '#00d4ff' },
              { label: 'عدد السبرنتات', value: mockResults.sprints, icon: Play, color: '#d4af37' },
              { label: 'التمريرات', value: mockResults.passes, icon: Target, color: '#00d4ff' },
              { label: 'دقة التمرير', value: mockResults.accuracy, icon: CheckCircle, color: '#d4af37' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#d4af37]" /> رؤى الذكاء الاصطناعي
            </h3>
            <div className="space-y-3">
              {mockResults.insights.map((insight, i) => (
                <div key={i} className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0">
                    <insight.icon className="w-5 h-5 text-[#00d4ff]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{insight.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Analysis */}
          <button onClick={() => { setState('idle'); setFileName('') }} className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#e8c84a] rounded-xl text-[#041329] font-bold hover:opacity-90 transition">
            تحليل فيديو جديد
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoAnalysis
