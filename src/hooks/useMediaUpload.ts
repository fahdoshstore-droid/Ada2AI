/**
 * useMediaUpload — Ada2AI
 *
 * Upload pipeline for player videos.
 * hook → service → supabase
 *
 * State machine: idle → uploading → success | error
 * Uses useMutation from React Query.
 * Invalidates ['players'] and ['scout-players'] on success.
 */
import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { updatePlayerVideoUrl } from '../services/players'
import { trackEvent } from '../lib/analytics'

// ── Types ──────────────────────────────────────
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface UploadState {
  status: UploadStatus
  progress: number
  error: string | null
}

// ── Constraints ──────────────────────────────────────
const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB

const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',  // MOV
  'video/x-msvideo',  // AVI
  'video/webm',
  'video/ogg',
]

const BLOCKED_EXTENSIONS = [
  '.exe', '.php', '.js', '.html', '.htm',
  '.svg', '.sh', '.py', '.rb', '.bat',
]

/** Sanitize filename — remove unsafe chars, prevent path traversal, limit length */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // remove all unsafe chars
    .replace(/\.{2,}/g, '.')             // prevent ../
    .substring(0, 100)                  // max 100 chars
}

/** Get file extension in lowercase */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.substring(lastDot).toLowerCase()
}

// ── Hook ──────────────────────────────────────
export function useMediaUpload() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({ file, playerId }: { file: File; playerId: string }) => {
      // 1. Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. الصيغ المدعومة: MP4, MOV, AVI, WebM, OGG')
      }

      // 2. Validate extension — block dangerous file types
      const ext = getExtension(file.name)
      if (BLOCKED_EXTENSIONS.includes(ext)) {
        throw new Error('نوع الملف غير مسموح')
      }

      // 3. Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 200MB')
      }

      const sanitized = sanitizeFilename(file.name)
      const path = `${playerId}/${Date.now()}_${sanitized}`

      trackEvent('upload_started', { playerId, fileSize: file.size })

      // 60s timeout — prevents indefinite hang on slow/stalled networks
      const UPLOAD_TIMEOUT_MS = 60_000
      let timeoutId: ReturnType<typeof setTimeout> | undefined

      const uploadPromise = supabase.storage
        .from('player-media')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('الاتصال بطيء. حاول مجدداً')), UPLOAD_TIMEOUT_MS)
      })

      const result = await Promise.race([
        uploadPromise,
        timeoutPromise,
      ])

      // Upload won the race — clear the timeout to prevent unhandled rejection // verified
      if (timeoutId) clearTimeout(timeoutId)

      const { data: uploadData, error: uploadError } = result

      if (uploadError) {
        throw new Error('فشل رفع الملف. حاول مجدداً')
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('player-media')
        .getPublicUrl(uploadData.path)

      const publicUrl = urlData.publicUrl

      // Update player record
      try {
        await updatePlayerVideoUrl(playerId, publicUrl)
      } catch (dbError: any) {
        // Storage upload succeeded but DB update failed — rollback storage // verified
        await supabase.storage
          .from('player-media')
          .remove([uploadData.path])
          .catch(() => null) // best-effort cleanup, don't mask original error
        throw new Error('فشل حفظ البيانات. حاول مجدداً')
      }

      trackEvent('upload_success', { playerId })
      return { publicUrl, path: uploadData.path }
    },

    onSuccess: () => {
      // Invalidate player queries so they refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['scout-players'] })
    },
    onError: (error) => {
      trackEvent('upload_failed', { reason: error.message })
    },
  })

  const resetWithTracking = useCallback(() => {
    if (mutation.isError) {
      trackEvent('upload_retried')
    }
    mutation.reset()
  }, [mutation])
 
  return {
    upload: mutation.mutate,
    status: mutation.isIdle
      ? 'idle'
      : mutation.isPending
        ? 'uploading'
        : mutation.isSuccess
          ? 'success'
          : 'error',
    progress: mutation.isPending ? 0 : mutation.isSuccess ? 100 : 0,
    error: mutation.error?.message ?? null,
    reset: resetWithTracking,
  }
}