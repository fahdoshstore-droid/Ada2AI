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

  // Accept pilot token
  const pilotToken = process.env.PILOT_TOKEN || '';
  if (pilotToken && token === pilotToken) return true;

  // Accept Supabase anon key during transition
  const anonKey = process.env.SUPABASE_ANON_KEY || '';
  if (anonKey && token === anonKey) return true;

  return false;
}

export async function GET(req: Request) {
  if (!verifyAuth(req)) {
    return Response.json({ success: false, data: null, error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 0);
    const limit = 20;
    const offset = page * limit;

    const { data, error, count } = await supabase
      .from('players')
      .select('id, name, name_ar, age, position, rating, sport, region, badge, badge_color, photo_url, is_active', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('rating', { ascending: false });

    if (error) {
      console.error("[SportID players] GET error:", error.message);
      return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: data,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || data.length) / limit) },
      error: null
    });
  } catch (e: any) {
    console.error("[SportID players] Unhandled error:", e);
    return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!verifyAuth(req)) {
    return Response.json({ success: false, data: null, error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, age, position, sport, region } = body;

    if (!name || !age || !position) {
      return Response.json({ success: false, data: null, error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('players')
      .insert({ name, age, position, sport, region, rating: 50, is_active: true })
      .select()
      .single();

    if (error) {
      console.error("[SportID players] POST error:", error.message);
      return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
    }

    return Response.json({ success: true, data, error: null }, { status: 201 });
  } catch (e: any) {
    console.error("[SportID players] Unhandled error:", e);
    return Response.json({ success: false, data: null, error: "Internal server error" }, { status: 500 });
  }
}