import { useState, useCallback, useRef } from 'react'
import { Upload, Video, FileVideo, AlertCircle, CheckCircle, X } from 'lucide-react'

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

  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
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

  return (
    <div className="space-y-6">
      {/* Mode Info */}
      <div className={`rounded-xl p-4 border ${
        mode === 'fast'
          ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30'
          : 'bg-[#d4af37]/10 border-[#d4af37]/30'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            mode === 'fast' ? 'bg-[#00d4ff]/20' : 'bg-[#d4af37]/20'
          }`}>
            {mode === 'fast' ? (
              <Upload className="w-5 h-5 text-[#00d4ff]" />
            ) : (
              <Video className="w-5 h-5 text-[#d4af37]" />
            )}
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
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-[#00d4ff] bg-[#00d4ff]/10'
              : 'border-[#00d4ff]/30 bg-[#0a1f3d]/50 hover:border-[#00d4ff]/60 hover:bg-[#0a1f3d]/70'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-[#d4af37]/20 border border-[#00d4ff]/30 flex items-center justify-center">
            <FileVideo className="w-10 h-10 text-[#00d4ff]" />
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
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {/* Preview */}
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

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-[#d4af37]" />
                <span className="font-semibold text-white truncate">{file.name}</span>
              </div>
              <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemoveFile}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
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
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            mode === 'fast'
              ? 'bg-gradient-to-r from-[#00d4ff] to-[#00a8cc] text-white hover:shadow-lg hover:shadow-[#00d4ff]/30'
              : 'bg-gradient-to-r from-[#d4af37] to-[#e8c84a] text-[#041329] hover:shadow-lg hover:shadow-[#d4af37]/30'
          }`}
        >
          {mode === 'fast' ? 'بدء التحليل السريع' : 'بدء التحليل التفصيلي'}
        </button>
      )}
    </div>
  )
}

export default VideoUpload
