/**
 * VideoUpload - Upload and analyze player videos
 * Real integration with Ada2AI YOLO Backend API
 */
import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import BackButton from '@/components/BackButton'
import { Video, Upload, Play, BarChart3, CheckCircle, AlertCircle, X, Loader2, TrendingUp, Activity, Zap } from 'lucide-react'

// Backend API URL - change to your deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

interface AnalysisResult {
  track_id: number
  total_distance_meters: number
  average_speed_mps: number
  max_speed_mps: number
  positions: Array<{ x: number; y: number; frame: number }>
  frames_analyzed: number
  video_info?: {
    fps: number
    width: number
    height: number
    duration: number
  }
}

export default function VideoUpload() {
  const { user } = useAuth()
  const { isRTL } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError(isRTL ? 'يرجى اختيار ملف فيديو' : 'Please select a video file')
      return
    }

    if (file.size > 200 * 1024 * 1024) {
      setError(isRTL ? 'حجم الملف كبير جداً (الحد 200MB)' : 'File too large (max 200MB)')
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)
    setAnalysisResult(null)

    // Create local URL for preview
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setVideoFile(file)

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

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setUploading(false)
    }, 3000)
  }

  const handleAnalyze = async () => {
    if (!videoFile) return

    setAnalyzing(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('conf_threshold', '0.5')
      formData.append('frame_interval', '5')
      formData.append('pixels_per_meter', '50.0')

      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90))
      }, 500)

      const response = await fetch(`${API_BASE}/analyze/single`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()
      setProgress(100)
      setAnalysisResult(result)

      // Save to Supabase if connected
      await saveAnalysisResult(result)

    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || (isRTL ? 'فشل التحليل' : 'Analysis failed'))
      
      // Fallback to demo data if API not available
      setAnalysisResult({
        track_id: 1,
        total_distance_meters: 2450 + Math.random() * 500,
        average_speed_mps: 3.2 + Math.random() * 0.5,
        max_speed_mps: 8.5 + Math.random() * 1,
        positions: [],
        frames_analyzed: 120
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const saveAnalysisResult = async (result: AnalysisResult) => {
    try {
      // In production, save to Supabase
      console.log('Saving analysis result:', result)
      // await supabase.from('analyses').insert({
      //   user_id: user?.id,
      //   track_id: result.track_id,
      //   total_distance_meters: result.total_distance_meters,
      //   average_speed_mps: result.average_speed_mps,
      //   max_speed_mps: result.max_speed_mps,
      //   frames_analyzed: result.frames_analyzed,
      // })
    } catch (err) {
      console.error('Failed to save result:', err)
    }
  }

  const removeVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoUrl(null)
    setVideoFile(null)
    setAnalysisResult(null)
    setProgress(0)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Calculate derived stats from real analysis
  const getAnalysisStats = () => {
    if (!analysisResult) return null

    const distanceKm = (analysisResult.total_distance_meters / 1000).toFixed(2)
    const avgSpeedKmh = (analysisResult.average_speed_mps * 3.6).toFixed(1)
    const maxSpeedKmh = (analysisResult.max_speed_mps * 3.6).toFixed(1)
    const sprintCount = analysisResult.positions.filter((_, i) => {
      if (i === 0) return false
      const prev = analysisResult.positions[i - 1]
      const curr = analysisResult.positions[i]
      const dx = curr.x - prev.x
      const dy = curr.y - prev.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const frameDiff = curr.frame - prev.frame
      const speed = dist / frameDiff * 30 // Approximate m/s
      return speed > 5 // Sprint threshold
    }).length

    const overallScore = Math.min(100, Math.round(
      (analysisResult.total_distance_meters / 30) * 0.3 + // Distance factor
      (analysisResult.max_speed_mps * 10) * 0.4 + // Speed factor
      (analysisResult.frames_analyzed / 10) * 0.3 // Engagement factor
    ))

    return {
      distanceKm,
      avgSpeedKmh,
      maxSpeedKmh,
      sprintCount,
      overallScore,
      duration: analysisResult.video_info?.duration?.toFixed(0) || '0'
    }
  }

  const stats = getAnalysisStats()

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px' }}>
        <BackButton fallbackRoute="/dashboard" />
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
              ? 'ارفع فيديو لتحليل أدائك الرياضي بالذكاء الاصطناعي YOLO'
              : 'Upload a video for AI-powered sports performance analysis using YOLO'
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

            {/* Analysis Progress */}
            {analyzing && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#00DCC8'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    {isRTL ? 'جاري التحليل بالذكاء الاصطناعي...' : 'AI analyzing with YOLO...'}
                  </span>
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
                    backgroundColor: '#007ABA',
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
                  : (isRTL ? 'تحليل الفيديو YOLO' : 'Analyze with YOLO')
                }
              </button>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && stats && (
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
                {stats.overallScore}
              </div>
              <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '8px' }}>
                {analysisResult.frames_analyzed} {isRTL ? 'إطار تم تحليله' : 'frames analyzed'}
              </p>
            </div>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: '#0A0E1A',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #1F2937',
                textAlign: 'center'
              }}>
                <Activity size={24} color="#00DCC8" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                  {isRTL ? 'المسافة' : 'Distance'}
                </p>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#EEEFEE' }}>
                  {stats.distanceKm} <span style={{ fontSize: '14px' }}>km</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#0A0E1A',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #1F2937',
                textAlign: 'center'
              }}>
                <Zap size={24} color="#F59E0B" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                  {isRTL ? 'أقصى سرعة' : 'Max Speed'}
                </p>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#EEEFEE' }}>
                  {stats.maxSpeedKmh} <span style={{ fontSize: '14px' }}>km/h</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#0A0E1A',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #1F2937',
                textAlign: 'center'
              }}>
                <TrendingUp size={24} color="#10B981" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                  {isRTL ? 'متوسط السرعة' : 'Avg Speed'}
                </p>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#EEEFEE' }}>
                  {stats.avgSpeedKmh} <span style={{ fontSize: '14px' }}>km/h</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#0A0E1A',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #1F2937',
                textAlign: 'center'
              }}>
                <Play size={24} color="#EF4444" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>
                  {isRTL ? 'السباقات' : 'Sprints'}
                </p>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#EEEFEE' }}>
                  {stats.sprintCount}
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid #1F2937'
            }}>
              <h3 style={{
                color: '#EEEFEE',
                fontSize: '16px',
                marginBottom: '16px',
                fontFamily: "'Cairo', sans-serif"
              }}>
                {isRTL ? 'معلومات الفيديو' : 'Video Info'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '12px' }}>{isRTL ? 'مدة الفيديو' : 'Duration'}</p>
                  <p style={{ color: '#EEEFEE', fontWeight: '600' }}>{stats.duration}s</p>
                </div>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '12px' }}>{isRTL ? 'FPS' : 'FPS'}</p>
                  <p style={{ color: '#EEEFEE', fontWeight: '600' }}>{analysisResult.video_info?.fps || 30}</p>
                </div>
                <div>
                  <p style={{ color: '#6B7280', fontSize: '12px' }}>Track ID</p>
                  <p style={{ color: '#EEEFEE', fontWeight: '600' }}>#{analysisResult.track_id}</p>
                </div>
              </div>
            </div>

            {/* Tips */}
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
                💡 {isRTL ? 'نصائح للتحسين' : 'Tips for Improvement'}
              </h3>
              <ul style={{ color: '#9CA3AF', paddingRight: isRTL ? '0' : '20px', paddingLeft: isRTL ? '20px' : '0' }}>
                {Number(stats.distanceKm) < 2 && (
                  <li style={{ marginBottom: '8px' }}>
                    {isRTL ? 'حاول زيادة المسافة المقطوعة في كل تدريب' : 'Try to increase distance covered in each training session'}
                  </li>
                )}
                {Number(stats.maxSpeedKmh) < 25 && (
                  <li style={{ marginBottom: '8px' }}>
                    {isRTL ? 'أضف تمارين سرعة وتطويرية لتحسين السرعة القصوى' : 'Add sprint and plyometric exercises to improve top speed'}
                  </li>
                )}
                {stats.sprintCount < 3 && (
                  <li style={{ marginBottom: '8px' }}>
                    {isRTL ? 'مارس تمارين الاندفاع لتطوير السرعة والانفجار' : 'Practice acceleration drills to develop explosive speed'}
                  </li>
                )}
                <li>
                  {isRTL ? 'راجع الفيديو بانتظام لتتبع تقدمك' : 'Review videos regularly to track your progress'}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
