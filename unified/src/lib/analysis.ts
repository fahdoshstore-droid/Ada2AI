import { supabase } from './supabase'

export async function uploadVideoForAnalysis(
  file: File,
  title: string,
  playerId?: string
): Promise<{ analysisId: string }> {
  // 1. رفع الفيديو لـ Supabase Storage
  const fileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw new Error(`فشل رفع الفيديو: ${uploadError.message}`)

  // 2. الحصول على URL
  const { data: urlData } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName)

  // 3. إنشاء سجل في video_analyses
  const { data: analysisData, error: analysisError } = await supabase
    .from('video_analyses')
    .insert({
      title,
      video_url: urlData.publicUrl,
      player_id: playerId || null,
      status: 'queued',
      analysis_data: {},
    })
    .select('id')
    .single()

  if (analysisError) throw new Error(`فشل إنشاء التحليل: ${analysisError.message}`)

  return { analysisId: analysisData.id }
}

export async function getRecentAnalyses(limit = 10) {
  const { data, error } = await supabase
    .from('video_analyses')
    .select('id, title, status, analysis_data, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}