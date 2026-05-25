/**
 * Upload Page — Ada2AI (Elite Cinematic Redesign)
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
      setValidationError('يُقبل فيديو فقط. الصيغ المدعومة: MP4, MOV, AVI')
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      setValidationError('حجم الملف كبير جداً. الحد الأقصى 200MB')
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
      <div dir="rtl" className="min-h-screen bg-[#060d18] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-teal-prime border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-teal-prime/20 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#060d18] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />
      <div className="absolute inset-0 grid-pattern-fine opacity-[0.03]" />

      <div className="relative max-w-xl mx-auto px-4 pt-6 pb-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost-interactive flex items-center gap-1.5 text-ice-muted text-sm mb-6 arabic-text"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium rounded-3xl p-8 md:p-10 depth-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-prime to-scout-blue flex items-center justify-center shadow-lg shadow-teal-prime/20">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ice-white arabic-text font-display tracking-tight">رفع فيديو</h1>
              <p className="text-ice-muted text-xs arabic-text mt-0.5">
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
                transition-all duration-300 ease-out
                ${dragOver
                  ? 'border-teal-prime bg-teal-prime/5 glow-teal scale-[1.02]'
                  : 'border-white/10 hover:border-teal-prime/40 bg-white/[0.02] hover:bg-teal-prime/[0.03]'
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
                    <p className="text-ice-white font-bold text-lg arabic-text mb-2 font-display tracking-tight">جارٍ الرفع...</p>
                    {/* Glass progress bar with shimmer */}
                    <div className="w-full max-w-xs h-2.5 rounded-full bg-white/[0.06] overflow-hidden mt-2 border border-white/[0.04]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-teal-prime via-teal-glow to-teal-prime rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_linear_infinite]" />
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <>
                    <FileVideo className="w-16 h-16 text-teal-prime/30 mb-4" />
                    <p className="text-ice-white font-bold text-xl arabic-text mb-1 font-display tracking-tight">
                      اسحب الفيديو هنا
                    </p>
                    <p className="text-ice-muted text-sm arabic-text">
                      أو انقر للاختيار من جهازك
                    </p>
                    <p className="text-ice-muted/40 text-[11px] mt-3 arabic-text">
                      MP4, MOV, AVI — بحد أقصى 200 ميجابايت
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Upload consent wording */}
          {status !== 'success' && (
            <p className="text-xs text-ice-muted/60 arabic-text text-center mb-3 mt-4 leading-relaxed">
              برفع الفيديو توافق على عرضه للكشافين والمدربين المسجلين في المنصة.
              إذا كنت دون 18 سنة، تأكد من موافقة ولي أمرك.
            </p>
          )}

          {/* Validation error */}
          {validationError && (
            <div className="mt-4 glass-card rounded-xl p-3 flex items-center gap-2 border border-red-500/20 text-red-400 text-sm arabic-text">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* Upload error */}
          {error && (
            <div className="mt-4">
              <div className="glass-card rounded-xl p-3 flex items-center gap-2 border border-red-500/20 text-red-400 text-sm arabic-text mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
              <button
                onClick={() => { reset(); setValidationError(null) }}
                className="btn-ghost text-sm arabic-text"
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
              className="text-center py-8"
            >
              {/* Confetti-like glow background */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-teal-prime/20 blur-xl" />
                <CheckCircle className="w-20 h-20 text-teal-prime relative mx-auto" />
              </div>
              <p className="text-ice-white font-bold text-2xl arabic-text mb-2 font-display tracking-tight">
                <span className="text-gradient-shimmer">تم رفع الفيديو بنجاح!</span>
              </p>
              <p className="text-ice-muted text-sm arabic-text mb-8">
                سيظهر الفيديو في ملفك الشخصي ويمكن للكشافين مشاهدته
              </p>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/player/dashboard')}
                  className="btn-primary flex items-center gap-2 arabic-text"
                >
                  عرض ملفي
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={() => { reset(); setValidationError(null) }}
                  className="btn-ghost flex items-center gap-2 arabic-text"
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