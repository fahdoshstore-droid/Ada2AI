/**
 * GET  /api/players      — list players (paginated, active only)
 * POST /api/players      — create player (auth required)
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

  try {
    let query = supabase
      .from('players')
      .select(
        'id, name, name_ar, age, position, rating, sport, region, badge, badge_color, photo_url, speed, agility, technique, dominant_foot, is_active',
        { count: 'exact' }
      )
      .eq('is_active', true)

    if (search) {
      query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`)
    }
    if (position) query = query.eq('position', position)

    const { data, error, count } = await query
      .order('rating', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({
      success: true,
      data: data ?? [],
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
    const { name, name_ar, age, team, position, sport, region, photo_url, rating, speed, agility, technique, badge, badge_color } = body

    if (!name) {
      return Response.json({ success: false, error: 'name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('players')
      .insert({
        name, name_ar, age, team, position, sport, region, photo_url,
        rating: rating ?? 50, speed: speed ?? 0, agility: agility ?? 0, technique: technique ?? 0,
        badge, badge_color, is_active: true
      })
      .select()
      .single()

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({ success: true, data }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
