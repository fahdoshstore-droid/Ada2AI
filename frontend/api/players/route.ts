/**
 * GET  /api/players      — list players (paginated)
 * POST /api/players      — create player (auth required)
 * GET  /api/players/:id  — single player
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? 0)
  const limit = Number(searchParams.get('limit') ?? 20)
  const search = searchParams.get('search') ?? ''
  const position = searchParams.get('position') ?? ''
  const team = searchParams.get('team') ?? ''

  try {
    let query = supabase
      .from('players')
      .select('id, name, age, team, position, photo_url, jersey_number, nationality, dominant_foot, created_at', { count: 'exact' })

    if (search) {
      query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`)
    }
    if (position) query = query.eq('position', position)
    if (team) query = query.eq('team', team)

    query = query
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      data,
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, age, team, position, photo_url, jersey_number, nationality, dominant_foot } = body

    if (!name) {
      return Response.json({ success: false, error: 'name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('players')
      .insert({ name, age, team, position, photo_url, jersey_number, nationality, dominant_foot })
      .select()
      .single()

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
