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
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  BarChart3,
} from 'lucide-react'
import type { PlayerAnalysisResult } from './index'

interface AnalysisReportProps {
  result: PlayerAnalysisResult
  mode: 'fast' | 'detailed'
  onNewAnalysis: () => void
}

function AnalysisReport({ result, mode, onNewAnalysis }: AnalysisReportProps) {
  const [expandedInsights, setExpandedInsights] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'technical'>('overview')

  const getRatingColor = (rating: number): string => {
    if (rating >= 90) return '#00DCC8'
    if (rating >= 80) return '#007ABA'
    if (rating >= 70) return '#FFA500'
    return '#FFD700'
  }

  const getRatingBg = (rating: number): string => {
    if (rating >= 90) return 'linear-gradient(135deg, #00DCC8 0%, #007ABA 100%)'
    if (rating >= 80) return 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)'
    if (rating >= 70) return 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)'
    return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
  }

  const metrics = Object.entries(result.metrics)
  const primaryColor = mode === 'fast' ? '#00DCC8' : '#FFA500'

  return (
    <div className="space-y-6" dir="rtl">
      {/* Success Banner */}
      <div className="rounded-2xl p-6 border"
        style={{ background: 'rgba(0,220,200,0.1)', borderColor: 'rgba(0,220,200,0.3)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,220,200,0.2)' }}
          >
            <CheckCircle className="w-8 h-8 text-[#00DCC8]" />
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Share2 className="w-4 h-4 text-gray-300" />
              <span className="text-gray-300">مشاركة</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'rgba(0,220,200,0.2)', border: '1px solid rgba(0,220,200,0.3)' }}
            >
              <Download className="w-4 h-4 text-[#00DCC8]" />
              <span className="text-[#00DCC8]">تحميل PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        {[
          { id: 'overview', label: 'نظرة عامة', icon: User },
          { id: 'highlights', label: 'اللحظات المميزة', icon: Star },
          { id: 'technical', label: 'التحليل التقني', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(0,220,200,0.15)' : 'transparent',
              color: activeTab === tab.id ? '#00DCC8' : 'rgba(238,239,238,0.5)',
              border: activeTab === tab.id ? '1px solid rgba(0,220,200,0.3)' : '1px solid transparent',
            }}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-8 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.15)' }}
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-2xl"
                  style={{ background: getRatingBg(result.overallRating) }}
                >
                  <span className="text-5xl font-black text-[#041329]">{result.overallRating}</span>
                </div>
                <p className="text-gray-400 mt-4 text-sm">التقييم العام</p>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{result.playerName}</h2>
                  <div className="flex items-center gap-3">
                    {result.jerseyNumber && (
                      <span className="px-3 py-1 rounded-full font-bold"
                        style={{ background: 'rgba(0,220,200,0.15)', color: '#00DCC8', border: '1px solid rgba(0,220,200,0.3)' }}
                      >
                        #{result.jerseyNumber}
                      </span>
                    )}
                    {result.position && (
                      <span className="px-3 py-1 rounded-full"
                        style={{ background: 'rgba(0,220,200,0.15)', color: '#00DCC8', border: '1px solid rgba(0,220,200,0.3)' }}
                      >
                        {result.position}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      {mode === 'fast' ? (
                        <>
                          <Zap className="w-4 h-4 text-[#00DCC8]" />
                          تحليل سريع
                        </>
                      ) : (
                        <>
                          <Film className="w-4 h-4 text-[#FFA500]" />
                          تحليل تفصيلي
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>التطور</span>
                    </div>
                    <div className="text-2xl font-bold text-[#00DCC8]">+5%</div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Trophy className="w-4 h-4" />
                      <span>اللحظات</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                      {result.highlights.filter((h) => h.type === 'strength').length}
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <Target className="w-4 h-4" />
                      <span>الدقة</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: '#00DCC8' }}>87%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="rounded-2xl p-6 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00DCC8]" />
              المؤشرات التقنية
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map(([key, value]) => (
                <div key={key} className="rounded-xl p-4 border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(0,220,200,0.05)' }}
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
                    <span className="font-bold" style={{ color: getRatingColor(value) }}>{value}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: getRatingBg(value) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-2xl p-6 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#00DCC8]" />
              رؤى الذكاء الاصطناعي
            </h3>
            <div className="space-y-3">
              {(expandedInsights ? result.aiInsights : result.aiInsights.slice(0, 3)).map(
                (insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,220,200,0.15)' }}
                    >
                      <span className="text-[#00DCC8] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{insight}</p>
                  </div>
                )
              )}
            </div>
            {result.aiInsights.length > 3 && (
              <button
                onClick={() => setExpandedInsights(!expandedInsights)}
                className="w-full mt-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                style={{ color: '#00DCC8' }}
              >
                {expandedInsights ? (
                  <> عرض أقل <ChevronUp className="w-4 h-4" /> </>
                ) : (
                  <> عرض المزيد <ChevronDown className="w-4 h-4" /> </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Highlights Tab */}
      {activeTab === 'highlights' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-6 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
          >
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5" style={{ color: primaryColor }} />
              لحظات مميزة من التحليل
            </h3>
            <div className="space-y-4">
              {result.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl border"
                  style={{
                    background: highlight.type === 'strength'
                      ? 'rgba(0,220,200,0.05)'
                      : highlight.type === 'improvement'
                      ? 'rgba(255,165,0,0.05)'
                      : 'rgba(0,122,186,0.05)',
                    borderColor: highlight.type === 'strength'
                      ? 'rgba(0,220,200,0.2)'
                      : highlight.type === 'improvement'
                      ? 'rgba(255,165,0,0.2)'
                      : 'rgba(0,122,186,0.2)',
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: highlight.type === 'strength'
                        ? 'rgba(0,220,200,0.15)'
                        : highlight.type === 'improvement'
                        ? 'rgba(255,165,0,0.15)'
                        : 'rgba(0,122,186,0.15)',
                    }}
                  >
                    {highlight.type === 'strength' ? (
                      <Trophy className="w-6 h-6 text-[#00DCC8]" />
                    ) : highlight.type === 'improvement' ? (
                      <Target className="w-6 h-6 text-[#FFA500]" />
                    ) : (
                      <Eye className="w-6 h-6 text-[#007ABA]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-gray-400 text-sm font-mono">{highlight.timestamp}</span>
                      <span className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: highlight.type === 'strength'
                            ? 'rgba(0,220,200,0.15)'
                            : highlight.type === 'improvement'
                            ? 'rgba(255,165,0,0.15)'
                            : 'rgba(0,122,186,0.15)',
                          color: highlight.type === 'strength'
                            ? '#00DCC8'
                            : highlight.type === 'improvement'
                            ? '#FFA500'
                            : '#007ABA',
                        }}
                      >
                        {highlight.type === 'strength' && 'نقطة قوة'}
                        {highlight.type === 'improvement' && 'فرصة تطوير'}
                        {highlight.type === 'notable' && 'لقطة ملحوظة'}
                      </span>
                    </div>
                    <p className="text-white">{highlight.description}</p>
                  </div>
                  {mode === 'detailed' && result.extractedFrames && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
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
          {mode === 'detailed' && result.heatmapData && (
            <div className="rounded-2xl p-6 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FFA500]" />
                خريطة الحرارة
              </h3>
              <div className="relative aspect-[3/2] rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <img
                  src={result.heatmapData}
                  alt="Heatmap"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: '#00DCC8' }} />
                  <span className="text-gray-400">مناطق كثيفة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: '#007ABA' }} />
                  <span className="text-gray-400">حركة متوسطة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <span className="text-gray-400">مناطق قليلة</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'detailed' && result.extractedFrames && (
            <div className="rounded-2xl p-6 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-[#00DCC8]" />
                الإطارات المستخرجة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.extractedFrames.map((frame, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden group cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <img
                      src={frame}
                      alt={`Frame ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-6 border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(0,220,200,0.1)' }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              معلومات التحليل
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-gray-400 text-sm mb-1">وضع التحليل</p>
                <p className="text-white font-medium">{mode === 'fast' ? 'تحليل سريع' : 'تحليل تفصيلي'}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-gray-400 text-sm mb-1">نموذج الذكاء</p>
                <p className="text-white font-medium">Ada2AI V4</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-gray-400 text-sm mb-1">دقة التحليل</p>
                <p className="text-white font-medium">{mode === 'fast' ? 'عالية' : 'عالية جداً'}</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-gray-400 text-sm mb-1">الإطارات</p>
                <p className="text-white font-medium">{mode === 'fast' ? 'فيديو مباشر' : '500+ إطار'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNewAnalysis}
          className="flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #00DCC8 0%, #007ABA 100%)',
            color: '#041329',
          }}
        >
          <RefreshCw className="w-5 h-5" />
          تحليل جديد
        </button>
        <button className="flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
            color: '#041329',
          }}
        >
          <Download className="w-5 h-5" />
          تحميل التقرير
        </button>
      </div>
    </div>
  )
}

export default AnalysisReport
