import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ── Auth helper (shared) ─────────────────────────────
function verifyAuth(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return false;

  const pilotToken = process.env.PILOT_TOKEN || '';
  if (pilotToken && token === pilotToken) return true;

  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  if (anonKey && token === anonKey) return true;

  return false;
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return Response.json({ success: false, data: null, error: "Authentication required" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const playerId = url.searchParams.get("playerId");

    // /api/sportid/players
    if (path.endsWith('/players') || path === '/api/sportid') {
      const page = Number(url.searchParams.get("page") || 0);
      const limit = 20;
      const offset = page * limit;

      const { data, error, count } = await supabase
        .from('players')
        .select('id, name, name_ar, age, position, rating, sport, region, badge, badge_color, photo_url, is_active', { count: 'exact' })
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('rating', { ascending: false });

      if (error) {
        return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
      }

      return Response.json({
        success: true,
        data: data,
        pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || data.length) / limit) },
        error: null
      });
    }

    // /api/sportid/matches
    if (path.endsWith('/matches')) {
      const page = Number(url.searchParams.get("page") || 0);
      const limit = 20;
      const offset = page * limit;

      const { data, error, count } = await supabase
        .from('matches')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) {
        return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
      }

      return Response.json({
        success: true,
        data: data,
        pagination: { page, limit, total: count || 0 },
        error: null
      });
    }

    // /api/sportid/player/:id/analyses
    if (path.includes('/analyses') && playerId) {
      const { data, error } = await supabase
        .from('analysis')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) {
        return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
      }

      return Response.json({ success: true, data: { analyses: data }, error: null });
    }

    return Response.json({ success: false, data: null, error: 'Unknown endpoint' }, { status: 404 });
  } catch (e: any) {
    return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}