/**
 * Admin Service — Ada2AI
 *
 * Service layer for Al Rawdha Club admin operations.
 * hook → service → supabase (always)
 *
 * All queries are scoped to CLUB_NAME = 'الروضة' for security.
 */
import { supabase, type Player } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'
import type { VideoAnalysis } from './analysis'

const CLUB_NAME = 'الروضة'

/** جلب كل لاعبي النادي */
export async function getClubPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('club', CLUB_NAME)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return (data as Player[]) ?? []
}

/** بحث في لاعبي النادي */
export async function searchClubPlayers(query: string): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('club', CLUB_NAME)
    .ilike('name', `%${query}%`)
    .limit(20)

  if (error) throw new Error(error.message)
  return (data as Player[]) ?? []
}

/** تحديث بيانات لاعب (فقط لاعبي النادي) */
export async function updateClubPlayer(
  playerId: string,
  updates: Partial<Pick<Player,
    'name' | 'position' | 'sport' | 'age' |
    'height_cm' | 'weight_kg' | 'dominant_foot' |
    'jersey_number' | 'achievements'
  >>
): Promise<Player> {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .eq('club', CLUB_NAME) // security: only club players
    .select()
    .single()

  if (error) throw new Error(error.message)
  trackEvent('admin_player_updated', { playerId })
  return data as Player
}

/** جلب كل تحليلات النادي */
export async function getClubAnalyses(): Promise<VideoAnalysis[]> {
  // جلب user_ids لاعبي النادي أولاً
  const { data: players, error: pErr } = await supabase
    .from('players')
    .select('user_id')
    .eq('club', CLUB_NAME)
    .not('user_id', 'is', null)

  if (pErr) throw new Error(pErr.message)

  const userIds = players?.map(p => p.user_id).filter(Boolean) as string[] ?? []
  if (userIds.length === 0) return []

  const { data, error } = await supabase
    .from('video_analyses')
    .select('*')
    .in('uploaded_by', userIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return (data as VideoAnalysis[]) ?? []
}

/** إعادة محاولة تحليل فاشل */
export async function retryFailedAnalysis(analysisId: string): Promise<void> {
  const { error } = await supabase
    .from('video_analyses')
    .update({ status: 'queued', analysis_data: null })
    .eq('id', analysisId)

  if (error) throw new Error(error.message)
  trackEvent('admin_analysis_retried', { analysisId })
}

/** Statistics counts for admin dashboard */
export async function getClubStats(): Promise<{
  playersCount: number
  videosCount: number
  completedCount: number
  failedCount: number
  ratingsCount: number
}> {
  const [playersRes, analysesRes, reportsRes] = await Promise.all([
    supabase.from('players').select('id', { count: 'exact', head: true }).eq('club', CLUB_NAME),
    supabase.from('video_analyses').select('id, status', { count: 'exact' })
      .in('uploaded_by',
        ((await supabase.from('players').select('user_id').eq('club', CLUB_NAME).not('user_id', 'is', null)).data ?? [])
          .map((p: { user_id: string }) => p.user_id)
          .filter(Boolean)
      ),
    supabase.from('reports').select('id', { count: 'exact', head: true }),
  ])

  const analyses = analysesRes.data ?? []
  return {
    playersCount: playersRes.count ?? 0,
    videosCount: analyses.length,
    completedCount: analyses.filter((a: { status: string }) => a.status === 'completed').length,
    failedCount: analyses.filter((a: { status: string }) => a.status === 'failed').length,
    ratingsCount: reportsRes.count ?? 0,
  }
}

/** Create a player account via Supabase Edge Function (admin-only).
 *  The Edge Function handles auth user creation + profile + player record server-side.
 *  No service_role key is ever exposed to the frontend.
 */
export async function createPlayerViaEdgeFunction(data: {
  firstName: string
  email: string
  position?: string
  age?: string
  dominantFoot?: string
  jerseyNumber?: string
}): Promise<{ userId: string; email: string; tempPassword: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('غير مسجل دخول')

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-player`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(data),
    }
  )

  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'فشل إنشاء الحساب')

  trackEvent('admin_player_created', { email: data.email })
  return result
}