/**
 * VideoUpload - Upload and analyze player videos
 */
import React, { useState, useRef } from 'react'
import { useDemoAuth } from '@/contexts/DemoAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Video, Upload, Play, BarChart3, CheckCircle, AlertCircle, X } from 'lucide-react'

export default function VideoUpload() {
  const { user } = useDemoAuth()
  const { isRTL } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError(isRTL ? 'يرجى اختيار ملف فيديو' : 'Please select a video file')
      return
    }

    if (file.size > 200 * 1024 * 1024) { // 200MB
      setError(isRTL ? 'حجم الملف كبير جداً (الحد 200MB)' : 'File too large (max 200MB)')
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + 10
      })
    }, 300)

    // Create local URL for preview
    const url = URL.createObjectURL(file)
    setVideoUrl(url)

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setUploading(false)
    }, 3000)
  }

  const handleAnalyze = async () => {
    if (!videoUrl) return

    setAnalyzing(true)
    setAnalysisResult(null)

    // Simulate AI analysis
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysisResult({
        overall_score: 78,
        speed: 82,
        technique: 75,
        positioning: 80,
        stamina: 72,
        strengths: [
          isRTL ? 'سرعة ممتازة في الجري' : 'Excellent sprint speed',
          isRTL ? 'تمركز جيد في الملعب' : 'Good field positioning',
          isRTL ? 'تمريرات دقيقة' : 'Accurate passes',
        ],
        improvements: [
          isRTL ? 'تحتاج تطوير اللياقة' : 'Needs stamina development',
          isRTL ? 'دقة التسديد تحتاج تحسين' : 'Shooting accuracy needs work',
        ],
        recommendations: isRTL
          ? 'يوصى بتدريب مكثف على التسديد والتحمل'
          : 'Recommended intensive training on shooting and endurance',
      })
    }, 5000)
  }

  const removeVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoUrl(null)
    setThumbnail(null)
    setAnalysisResult(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            color: '#EEEFEE',
            fontSize: '28px',
            fontWeight: 'bold',
            fontFamily: "'Cairo', sans-serif",
            marginBottom: '8px'
          }}>
            {isRTL ? 'رفع وتحليل الفيديو' : 'Video Upload & Analysis'}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            {isRTL
              ? 'ارفع فيديو لتحليل أدائك الرياضي بالذكاء الاصطناعي'
              : 'Upload a video for AI-powered sports performance analysis'
            }
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#EF4444'
          }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Upload Area */}
        {!videoUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '16px',
              padding: '48px',
              border: '2px dashed #374151',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              marginBottom: '24px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00DCC8'
              e.currentTarget.style.backgroundColor = 'rgba(0,220,200,0.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#374151'
              e.currentTarget.style.backgroundColor = '#0A0E1A'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload size={48} color="#00DCC8" style={{ marginBottom: '16px' }} />
            <h3 style={{
              color: '#EEEFEE',
              fontSize: '18px',
              marginBottom: '8px',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRTL ? 'اسحب الفيديو هنا' : 'Drag & drop your video here'}
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>
              {isRTL
                ? 'أو اضغط لاختيار ملف (MP4, MOV - حتى 200MB)'
                : 'Or click to browse (MP4, MOV - up to 200MB)'
              }
            </p>
            <button style={{
              backgroundColor: '#00DCC8',
              color: '#000A0F',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRTL ? 'اختر ملف' : 'Choose File'}
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #1F2937'
          }}>
            {/* Video Preview */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <video
                src={videoUrl}
                controls
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  maxHeight: '400px',
                  backgroundColor: '#000'
                }}
              />
              <button
                onClick={removeVideo}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: isRTL ? 'auto' : '12px',
                  left: isRTL ? '12px' : 'auto',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} color="#EF4444" />
              </button>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#9CA3AF'
                }}>
                  <span>{isRTL ? 'جاري الرفع...' : 'Uploading...'}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#1F2937',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#00DCC8',
                    width: `${progress}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            )}

            {/* Analyze Button */}
            {!uploading && !analysisResult && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: analyzing ? '#007ABA80' : '#00DCC8',
                  color: '#000A0F',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: "'Cairo', sans-serif"
                }}
              >
                <BarChart3 size={20} />
                {analyzing
                  ? (isRTL ? 'جاري التحليل...' : 'Analyzing...')
                  : (isRTL ? 'تحليل الفيديو' : 'Analyze Video')
                }
              </button>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div>
            <h2 style={{
              color: '#EEEFEE',
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '20px',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRTL ? 'نتائج التحليل' : 'Analysis Results'}
            </h2>

            {/* Overall Score */}
            <div style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #00DCC830',
              textAlign: 'center'
            }}>
              <p style={{ color: '#9CA3AF', marginBottom: '8px' }}>
                {isRTL ? 'التقييم العام' : 'Overall Score'}
              </p>
              <div style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#00DCC8',
                fontFamily: "'Orbitron', sans-serif"
              }}>
                {analysisResult.overall_score}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {['speed', 'technique', 'positioning', 'stamina'].map((stat) => (
                <div key={stat} style={{
                  backgroundColor: '#0A0E1A',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #1F2937',
                  textAlign: 'center'
                }}>
                  <p style={{
                    color: '#9CA3AF',
                    fontSize: '12px',
                    marginBottom: '8px',
                    textTransform: 'capitalize'
                  }}>
                    {isRTL ? stat === 'speed' ? 'السرعة' :
                      stat === 'technique' ? 'التقنية' :
                      stat === 'positioning' ? 'التتمركز' : 'التحمل' : stat}
                  </p>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#00DCC8',
                    fontFamily: "'Orbitron', sans-serif"
                  }}>
                    {analysisResult[stat]}
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              border: '1px solid #10B98130'
            }}>
              <h3 style={{
                color: '#10B981',
                fontSize: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Cairo', sans-serif"
              }}>
                <CheckCircle size={18} />
                {isRTL ? 'نقاط القوة' : 'Strengths'}
              </h3>
              <ul style={{ color: '#EEEFEE', paddingRight: isRTL ? '0' : '20px', paddingLeft: isRTL ? '20px' : '0' }}>
                {analysisResult.strengths.map((s: string, i: number) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '16px',
              border: '1px solid #F59E0B30'
            }}>
              <h3 style={{
                color: '#F59E0B',
                fontSize: '16px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Cairo', sans-serif"
              }}>
                <AlertCircle size={18} />
                {isRTL ? 'مجالات التحسين' : 'Areas to Improve'}
              </h3>
              <ul style={{ color: '#EEEFEE', paddingRight: isRTL ? '0' : '20px', paddingLeft: isRTL ? '20px' : '0' }}>
                {analysisResult.improvements.map((s: string, i: number) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #007ABA30'
            }}>
              <h3 style={{
                color: '#007ABA',
                fontSize: '16px',
                marginBottom: '12px',
                fontFamily: "'Cairo', sans-serif"
              }}>
                {isRTL ? 'التوصية' : 'Recommendation'}
              </h3>
              <p style={{ color: '#EEEFEE' }}>
                {analysisResult.recommendations}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
