import { useState, useCallback, useRef } from 'react'
import { Upload, Video, FileVideo, AlertCircle, CheckCircle, X, Activity } from 'lucide-react'

interface VideoUploadProps {
  mode: 'fast' | 'detailed'
  onUploadComplete: (file: File) => void
}

function VideoUpload({ mode, onUploadComplete }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 500 * 1024 * 1024
  const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'صيغة الملف غير مدعومة. يرجى استخدام MP4، MOV، أو AVI'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'حجم الملف كبير جداً. الحد الأقصى 500 ميجابايت'
    }
    return null
  }

  const handleFile = useCallback((selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }, [handleFile])

  const handleRemoveFile = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (file) {
      onUploadComplete(file)
    }
  }, [file, onUploadComplete])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const primaryColor = mode === 'fast' ? '#00DCC8' : '#FFA500'
  const secondaryColor = mode === 'fast' ? '#007ABA' : '#007ABA'

  return (
    <div className="space-y-6" dir="rtl">
      {/* Mode Info */}
      <div className="rounded-xl p-4 border"
        style={{
          background: `${primaryColor}10`,
          borderColor: `${primaryColor}30`,
        }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${primaryColor}20` }}
          >
            <Activity className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">
              {mode === 'fast' ? 'التحليل السريع' : 'التحليل التفصيلي'}
            </h3>
            <p className="text-gray-400 text-sm">
              {mode === 'fast'
                ? 'سيتم تحليل الفيديو باستخدام الذكاء الاصطناعي للرؤية. المدة المتوقعة: 1-2 دقيقة.'
                : 'سيتم استخراج الإطارات الرئيسية وتحليلها. المدة المتوقعة: 5-10 دقائق.'}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer"
          style={{
            background: isDragging ? `${primaryColor}10` : 'rgba(255,255,255,0.03)',
            borderColor: isDragging ? primaryColor : 'rgba(255,255,255,0.1)',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: `${primaryColor}15`, border: `1px solid ${primaryColor}30` }}
          >
            <FileVideo className="w-10 h-10" style={{ color: primaryColor }} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">ارفع فيديو اللاعب</h3>
          <p className="text-gray-400 mb-4">اسحب وأفلت أو اضغط لاختيار الفيديو</p>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>MP4</span>
            <span className="text-gray-600">•</span>
            <span>MOV</span>
            <span className="text-gray-600">•</span>
            <span>AVI</span>
            <span className="text-gray-600">•</span>
            <span>WebM</span>
          </div>

          <p className="text-gray-500 text-sm mt-4">الحد الأقصى: 500 ميجابايت</p>
        </div>
      ) : (
        <div className="rounded-2xl p-6 border"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: `${primaryColor}20` }}
        >
          <div className="flex items-start gap-4">
            {previewUrl && (
              <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  controls={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5" style={{ color: '#00DCC8' }} />
                <span className="font-semibold text-white truncate">{file.name}</span>
              </div>
              <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
            </div>

            <button
              onClick={handleRemoveFile}
              className="p-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <X className="w-5 h-5 text-gray-400 hover:text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Submit Button */}
      {file && (
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            color: mode === 'fast' ? '#041329' : '#fff',
          }}
        >
          {mode === 'fast' ? 'بدء التحليل السريع' : 'بدء التحليل التفصيلي'}
        </button>
      )}
    </div>
  )
}

export default VideoUpload
