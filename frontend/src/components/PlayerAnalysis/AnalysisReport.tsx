import { useState } from 'react'
import {
  CheckCircle,
  Download,
  Share2,
  Zap,
  Film,
  Star,
  TrendingUp,
  User,
  Trophy,
  Target,
  Activity,
  Eye,
  Clock,
  ChevronDown,
  ChevronUp,
  Play,
  RefreshCw,
  FileText,
} from 'lucide-react'
import type { PlayerAnalysisResult } from '../../pages/PlayerAnalysis'

interface AnalysisReportProps {
  result: PlayerAnalysisResult
  mode: 'fast' | 'detailed'
  onNewAnalysis: () => void
}

function AnalysisReport({ result, mode, onNewAnalysis }: AnalysisReportProps) {
  const [expandedInsights, setExpandedInsights] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'technical'>('overview')

  const getRatingColor = (rating: number): string => {
    if (rating >= 90) return 'text-[#d4af37]'
    if (rating >= 80) return 'text-[#00d4ff]'
    if (rating >= 70) return 'text-emerald-400'
    return 'text-yellow-400'
  }

  const getRatingBg = (rating: number): string => {
    if (rating >= 90) return 'bg-gradient-to-br from-[#d4af37] to-[#e8c84a]'
    if (rating >= 80) return 'bg-gradient-to-br from-[#00d4ff] to-[#00a8cc]'
    if (rating >= 70) return 'bg-gradient-to-br from-emerald-400 to-emerald-600'
    return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
  }

  const metrics = Object.entries(result.metrics)

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">تم التحليل بنجاح!</h2>
            <p className="text-gray-400">
              {mode === 'fast'
                ? 'تم تحليل الفيديو باستخدام الذكاء الاصطناعي للرؤية'
                : 'تم استخراج وتحليل الإطارات بشكل كامل'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-colors">
              <Download className="w-4 h-4" />
              <span>تحميل PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#0a1f3d]/50 rounded-xl">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: User },
          { id: 'highlights', label: 'اللحظات المميزة', icon: Star },
          { id: 'technical', label: 'التحليل التقني', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Player Header Card */}
          <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/20 rounded-2xl p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Overall Rating */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className={`w-32 h-32 rounded-2xl ${getRatingBg(
                    result.overallRating
                  )} flex items-center justify-center shadow-2xl`}
                >
                  <span className="text-5xl font-black text-[#041329]">
                    {result.overallRating}
                  </span>
                </div>
                <p className="text-gray-400 mt-4 text-sm">التقييم العام</p>
              </div>

              {/* Player Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {result.playerName}
                  </h2>
                  <div className="flex items-center gap-3">
                    {result.jerseyNumber && (
                      <span className="px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-full text-[#d4af37] font-bold">
                        #{result.jerseyNumber}
                      </span>
                    )}
                    {result.position && (
                      <span className="px-3 py-1 bg-[#00d4ff]/20 border border-[#00d4ff]/30 rounded-full text-[#00d4ff]">
                        {result.position}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      {mode === 'fast' ? (
                        <>
                          <Zap className="w-4 h-4 text-[#00d4ff]" />
                          تحليل سريع
                        </>
                      ) : (
                        <>
                          <Film className="w-4 h-4 text-[#d4af37]" />
                          تحليل تفصيلي
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#041329]/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>التطور</span>
                    </div>
                    <div className="text-2xl font-bold text-[#00d4ff]">+5%</div>
                  </div>
                  <div className="bg-[#041329]/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Trophy className="w-4 h-4" />
                      <span>اللحظات</span>
                    </div>
                    <div className="text-2xl font-bold text-[#d4af37]">
                      {result.highlights.filter((h) => h.type === 'strength').length}
                    </div>
                  </div>
                  <div className="bg-[#041329]/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Target className="w-4 h-4" />
                      <span>الدقة</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">87%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00d4ff]" />
              المؤشرات التقنية
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map(([key, value]) => (
                <div
                  key={key}
                  className="bg-[#041329]/50 rounded-xl p-4 border border-[#00d4ff]/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">
                      {key === 'speed' && 'السرعة'}
                      {key === 'acceleration' && 'الانطلاقة'}
                      {key === 'agility' && 'الرشاقة'}
                      {key === 'technique' && 'التقنية'}
                      {key === 'passing' && 'التمرير'}
                      {key === 'vision' && 'الرؤية'}
                      {key === 'physical' && 'القوة البدنية'}
                      {key === 'stamina' && 'التحمل'}
                    </span>
                    <span className={`font-bold ${getRatingColor(value)}`}>
                      {value}
                    </span>
                  </div>
                  <div className="h-2 bg-[#041329] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getRatingBg(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#d4af37]" />
              رؤى الذكاء الاصطناعي
            </h3>
            <div className="space-y-3">
              {(expandedInsights ? result.aiInsights : result.aiInsights.slice(0, 3)).map(
                (insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-[#041329]/50 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#d4af37] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{insight}</p>
                  </div>
                )
              )}
            </div>
            {result.aiInsights.length > 3 && (
              <button
                onClick={() => setExpandedInsights(!expandedInsights)}
                className="w-full mt-4 py-3 text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {expandedInsights ? (
                  <>
                    عرض أقل <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    عرض المزيد <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Highlights Tab */}
      {activeTab === 'highlights' && (
        <div className="space-y-6">
          <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#d4af37]" />
              لحظات مميزة من التحليل
            </h3>
            <div className="space-y-4">
              {result.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    highlight.type === 'strength'
                      ? 'bg-[#d4af37]/10 border-[#d4af37]/30'
                      : highlight.type === 'improvement'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-[#00d4ff]/10 border-[#00d4ff]/30'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      highlight.type === 'strength'
                        ? 'bg-[#d4af37]/20'
                        : highlight.type === 'improvement'
                        ? 'bg-yellow-500/20'
                        : 'bg-[#00d4ff]/20'
                    }`}
                  >
                    {highlight.type === 'strength' ? (
                      <Trophy className="w-6 h-6 text-[#d4af37]" />
                    ) : highlight.type === 'improvement' ? (
                      <Target className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <Eye className="w-6 h-6 text-[#00d4ff]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-gray-400 text-sm font-mono">
                        {highlight.timestamp}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          highlight.type === 'strength'
                            ? 'bg-[#d4af37]/20 text-[#d4af37]'
                            : highlight.type === 'improvement'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-[#00d4ff]/20 text-[#00d4ff]'
                        }`}
                      >
                        {highlight.type === 'strength' && 'نقطة قوة'}
                        {highlight.type === 'improvement' && 'فرصة تطوير'}
                        {highlight.type === 'notable' && 'لقطة ملحوظة'}
                      </span>
                    </div>
                    <p className="text-white">{highlight.description}</p>
                  </div>
                  {mode === 'detailed' && result.extractedFrames && (
                    <div className="w-24 h-16 bg-[#041329] rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={result.extractedFrames[i % result.extractedFrames.length]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technical Tab */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Heatmap Visualization */}
          {mode === 'detailed' && result.heatmapData && (
            <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#d4af37]" />
                خريطة الحرارة
              </h3>
              <div className="relative aspect-[3/2] bg-[#041329] rounded-xl overflow-hidden">
                <img
                  src={result.heatmapData}
                  alt="Heatmap"
                  className="w-full h-full object-contain"
                />
                {/* Mock pitch lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white/20 rounded-xl" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#d4af37]" />
                  <span className="text-gray-400">مناطق كثيفة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#00d4ff]" />
                  <span className="text-gray-400">حركة متوسطة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#041329]" />
                  <span className="text-gray-400">مناطق قليلة</span>
                </div>
              </div>
            </div>
          )}

          {/* Extracted Frames Grid */}
          {mode === 'detailed' && result.extractedFrames && (
            <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-[#00d4ff]" />
                الإطارات المستخرجة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.extractedFrames.map((frame, i) => (
                  <div
                    key={i}
                    className="aspect-video bg-[#041329] rounded-xl overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={frame}
                      alt={`Frame ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Mode Info */}
          <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              معلومات التحليل
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#041329]/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">وضع التحليل</p>
                <p className="text-white font-medium">
                  {mode === 'fast' ? 'تحليل سريع' : 'تحليل تفصيلي'}
                </p>
              </div>
              <div className="p-4 bg-[#041329]/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">نموذج الذكاء</p>
                <p className="text-white font-medium">Dheeb V4</p>
              </div>
              <div className="p-4 bg-[#041329]/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">دقة التحليل</p>
                <p className="text-white font-medium">
                  {mode === 'fast' ? 'عالية' : 'عالية جداً'}
                </p>
              </div>
              <div className="p-4 bg-[#041329]/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">الإطارات</p>
                <p className="text-white font-medium">
                  {mode === 'fast' ? 'فيديو مباشر' : '500+ إطار'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNewAnalysis}
          className="flex-1 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] rounded-xl text-white font-bold hover:shadow-lg hover:shadow-[#00d4ff]/30 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          تحليل جديد
        </button>
        <button className="flex-1 py-4 bg-gradient-to-r from-[#d4af37] to-[#e8c84a] rounded-xl text-[#041329] font-bold hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          تحميل التقرير
        </button>
      </div>
    </div>
  )
}

export default AnalysisReport
