/**
 * Upload Page — Ada2AI
 *
 * Player video upload with drag & drop.
 * Reads playerId from auth → players table.
 * Redirects to /player/onboarding if no player record.
 */
import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useMediaUpload } from '../../hooks/useMediaUpload'
import {
  Video, CheckCircle, AlertCircle,
  Loader2, ArrowRight, FileVideo
} from 'lucide-react'

export default function PlayerUpload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [playerId, setPlayerId] = useState<string | null>(null)
  const [loadingPlayer, setLoadingPlayer] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { upload, status, error, reset } = useMediaUpload()

  // Resolve playerId from auth
  useEffect(() => {
    if (!user) return
    supabase
      .from('players')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPlayerId(data.id)
        } else {
          navigate('/player/onboarding', { replace: true })
        }
        setLoadingPlayer(false)
      })
  }, [user, navigate])

  // Validate and upload
  const handleFile = useCallback((file: File) => {
    setValidationError(null)
    reset()

    if (!file.type.startsWith('video/')) {
      setValidationError('نوع الملف غير مدعوم. يُرجى رفع ملف فيديو فقط.')
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      setValidationError('حجم الملف يتجاوز 200 ميجابايت.')
      return
    }
    if (!playerId) return

    upload({ file, playerId })
  }, [playerId, upload, reset])

  // Drag & drop handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  // Loading player
  if (loadingPlayer) {
    return (
      <div dir="rtl" className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-prime animate-spin" />
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-navy pb-12">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-xl mx-auto px-4 pt-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-ice-muted text-sm mb-6 hover:text-ice-white transition-colors arabic-text"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-teal-prime/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-teal-prime" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ice-white arabic-text">رفع فيديو</h1>
              <p className="text-ice-muted text-xs arabic-text">
                ارفع مقطع فيديو لعرض أداءك
              </p>
            </div>
          </div>

          {/* Drag & Drop Zone — shown when idle or error */}
          {status !== 'success' && (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
                transition-all duration-200
                ${dragOver
                  ? 'border-teal-prime bg-teal-prime/5'
                  : 'border-white/10 hover:border-teal-prime/30 bg-white/[0.02]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={onFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                {status === 'uploading' ? (
                  <>
                    <Loader2 className="w-12 h-12 text-teal-prime animate-spin mb-4" />
                    <p className="text-ice-white font-bold arabic-text mb-2">جارٍ الرفع...</p>
                    <div className="w-full max-w-xs h-2 rounded-full bg-white/5 overflow-hidden mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: 'linear' }}
                        className="h-full bg-gradient-to-l from-teal-prime to-teal-prime/60 rounded-full"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <FileVideo className="w-12 h-12 text-ice-muted mb-4" />
                    <p className="text-ice-white font-bold arabic-text mb-1">
                      اسحب الفيديو هنا
                    </p>
                    <p className="text-ice-muted text-xs arabic-text">
                      أو انقر للاختيار من جهازك
                    </p>
                    <p className="text-ice-muted/60 text-[11px] mt-2 arabic-text">
                      MP4, MOV, AVI — بحد أقصى 200 ميجابايت
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm arabic-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* Upload error */}
          {error && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-red-400 text-sm arabic-text mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
              <button
                onClick={() => { reset(); setValidationError(null) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-prime/10 text-teal-prime text-sm font-medium hover:bg-teal-prime/20 transition-colors arabic-text"
              >
                حاول مجدداً
              </button>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <CheckCircle className="w-16 h-16 text-teal-prime mx-auto mb-4" />
              <p className="text-ice-white font-bold text-lg arabic-text mb-2">
                تم رفع الفيديو بنجاح!
              </p>
              <p className="text-ice-muted text-sm arabic-text mb-6">
                سيظهر الفيديو في ملفك الشخصي ويمكن للكشافين مشاهدته
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/player/dashboard')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark font-bold text-sm hover:shadow-xl hover:shadow-teal-prime/25 transition-all arabic-text"
                >
                  عرض ملفي
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={() => { reset(); setValidationError(null) }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-ice-muted text-sm hover:text-ice-white transition-colors arabic-text"
                >
                  رفع فيديو آخر
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}