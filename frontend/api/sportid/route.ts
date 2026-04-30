/**
 * GET /api/sportid/players     — list players with sport passports
 * GET /api/sportid/players/:id — single player with passport + analyses
 * GET /api/sportid/matches     — list matches
 * GET /api/sportid/passport/:player_id — get sport passport for player
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  // path: api, sportid, [resource], [id?]
  const resource = pathParts[2] ?? 'players'
  const id = pathParts[3]

  try {
    // GET /api/sportid/passport/:player_id
    if (resource === 'passport' && id) {
      const { data, error } = await supabase
        .from('sport_passports')
        .select('*, players(id, name, age, team, position, photo_url)')
        .eq('player_id', Number(id))
        .single()

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }
      return Response.json({ success: true, data })
    }

    // GET /api/sportid/players/:id
    if (resource === 'players' && id) {
      const { data: player, error: playerErr } = await supabase
        .from('players')
        .select('*')
        .eq('id', Number(id))
        .single()

      if (playerErr) {
        return Response.json({ success: false, error: playerErr.message }, { status: 500 })
      }

      const { data: passport } = await supabase
        .from('sport_passports')
        .select('*')
        .eq('player_id', Number(id))
        .single()

      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('player_id', Number(id))
        .order('created_at', { ascending: false })
        .limit(10)

      return Response.json({ success: true, data: { player, passport, analyses } })
    }

    // GET /api/sportid/matches
    if (resource === 'matches') {
      const page = Number(url.searchParams.get('page') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 20)
      const { data, error, count } = await supabase
        .from('matches')
        .select('*', { count: 'exact' })
        .order('match_date', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1)

      if (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 })
      }
      return Response.json({
        success: true, data,
        pagination: { page, limit, total: count ?? 0 }
      })
    }

    // GET /api/sportid/players (default)
    const page = Number(url.searchParams.get('page') ?? 0)
    const limit = Number(url.searchParams.get('limit') ?? 20)
    const search = url.searchParams.get('search') ?? ''

    let query = supabase
      .from('players')
      .select('id, name, age, team, position, photo_url, nationality, created_at', { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({
      success: true, data,
      pagination: { page, limit, total: count ?? 0 }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
